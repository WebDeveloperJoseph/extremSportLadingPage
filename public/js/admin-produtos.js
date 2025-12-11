// Gerenciamento de Produtos
const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || 'http://localhost:3333';
let products = window.PRODUCTS_DATA || [];
let editingProductId = null;

console.log(`📦 [ADMIN-PRODUTOS] API Base: ${API_BASE}`);
console.log(`📦 [ADMIN-PRODUTOS] Produtos iniciais:`, products);
console.log(`📦 [ADMIN-PRODUTOS] Arquivo carregado com sucesso`);

// 🚨 INTERCEPTADOR GLOBAL - Detectar tentativas de reload
window.addEventListener('beforeunload', function(e) {
    console.warn('⚠️ [RELOAD] Página tentando recarregar!');
    console.trace('Stack trace do reload:');
});

// Prevenir submit em QUALQUER form que possa existir
document.addEventListener('submit', function(e) {
    console.warn('⚠️ [SUBMIT] Form submit detectado e bloqueado!');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
}, true);

// Função para lidar com erro de imagem
function handleImageError(img) {
    img.onerror = null; // Previne loop infinito
    img.style.display = 'none'; // Esconde imagem quebrada
    // Adiciona placeholder em texto
    const parent = img.parentElement;
    if (parent && !parent.querySelector('.no-image-text')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'no-image-text';
        placeholder.textContent = '📷';
        placeholder.style.cssText = 'font-size: 30px; text-align: center; color: #ccc; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 4px;';
        parent.appendChild(placeholder);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ [DOMContentLoaded] Evento disparado');
    
    // Verificar autenticação
    checkAuth();

    // Carregar produtos
    console.log('📦 [DOMContentLoaded] Chamando loadProducts()');
    loadProducts();

    // Event Listeners básicos
    const btnAddProduct = document.getElementById('btnAddProduct');
    const logoutBtn = document.getElementById('logoutBtn');
    const btnSaveProduct = document.getElementById('btnSaveProduct');
    const fileInput = document.getElementById('productImageFile');
    
    console.log(`[DOMContentLoaded] btnAddProduct: ${btnAddProduct ? '✅' : '❌'}`);
    console.log(`[DOMContentLoaded] logoutBtn: ${logoutBtn ? '✅' : '❌'}`);
    console.log(`[DOMContentLoaded] btnSaveProduct: ${btnSaveProduct ? '✅' : '❌'}`);
    console.log(`[DOMContentLoaded] fileInput: ${fileInput ? '✅' : '❌'}`);
    
    if (btnAddProduct) {
        btnAddProduct.addEventListener('click', openAddModal);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // SALVAR PRODUTO - Botão direto, SEM FORM SUBMIT!
    if (btnSaveProduct) {
        btnSaveProduct.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            saveProduct();
            return false;
        });
    }
    
    // UPLOAD AUTOMÁTICO: Quando usuário seleciona arquivo
    if (fileInput) {
        fileInput.addEventListener('change', async function(e) {
            e.preventDefault(); // Prevenir reload
            e.stopPropagation(); // Evitar propagação
            e.stopImmediatePropagation(); // Parar TODOS os listeners
            
            console.log('📤 [Upload] Evento change disparado');
            console.log('📤 [Upload] Prevenindo comportamento padrão...');
            
            if (this.files && this.files.length > 0) {
                console.log('📤 [Upload] Arquivo selecionado, iniciando upload...');
                
                try {
                    await uploadImage();
                    console.log('✅ [Upload] Upload concluído sem reload');
                } catch (err) {
                    console.error('❌ [Upload] Erro:', err);
                }
            }
            return false;
        }, true); // Capture phase
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            return false;
        });
    });

    // Calcular desconto automaticamente
    const priceOldInput = document.getElementById('productPriceOld');
    const priceCurrentInput = document.getElementById('productPriceCurrent');
    
    if (priceOldInput) priceOldInput.addEventListener('input', calculateDiscount);
    if (priceCurrentInput) priceCurrentInput.addEventListener('input', calculateDiscount);

    // PREVENIR ENTER nos inputs do modal (evita reload acidental)
    document.querySelectorAll('#productModal input, #productModal textarea, #productModal select').forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                e.stopPropagation();
                console.log('⚠️ Enter bloqueado em:', e.target.id);
                return false;
            }
        });
    });

    // Busca e filtros
    const searchInput = document.getElementById('searchProduct');
    const filterSelect = document.getElementById('filterCategory');
    
    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (filterSelect) filterSelect.addEventListener('change', filterProducts);

    // Click fora do modal fecha
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.onclick = function(e) {
            if (e.target === this) closeModal();
        };
    }
    
    console.log('✅ [DOMContentLoaded] Todos os listeners registrados');
});

function checkAuth() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true' && 
        localStorage.getItem('adminRemember') !== 'true') {
        window.location.href = 'login.html';
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminRemember');
    window.location.href = 'login.html';
}

async function loadProducts() {
    console.log(`🔄 [LOAD] Iniciando carregamento de produtos`);
    
    try {
        // PRIMEIRO: verificar localStorage
        const cached = localStorage.getItem('allProducts');
        if (cached && products.length === 0) {
            console.log('📦 [LOAD] Usando produtos do localStorage');
            products = JSON.parse(cached);
            renderProducts(products);
            return;
        }
        
        // Já temos produtos em memória?
        if (products.length > 0) {
            console.log(`✅ [LOAD] ${products.length} produtos já em memória`);
            renderProducts(products);
            return;
        }
        
        // SEGUNDO: tentar carregar da API Node.js
        console.log(`🔌 [LOAD] Tentando conectar em: ${API_BASE}/api/products`);
        
        const resp = await fetch(`${API_BASE}/api/products`);
        
        console.log(`📡 [LOAD] Status da resposta: ${resp.status} ${resp.statusText}`);
        
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }
        
        products = await resp.json();
        
        // Salvar no localStorage para próximas vezes
        localStorage.setItem('allProducts', JSON.stringify(products));
        
        console.log(`✅ [LOAD] ${products.length} produto(s) carregado(s) da API`);
        console.log(`📦 [LOAD] Produtos:`, products);
        
        renderProducts(products);
        
    } catch (e) {
        console.error('❌ [LOAD] Erro ao carregar produtos:', e);
        console.error(`❌ [LOAD] Mensagem: ${e.message}`);
        
        // TERCEIRO: último fallback - localStorage
        const cached = localStorage.getItem('allProducts');
        if (cached) {
            console.warn('⚠️ [LOAD] Usando dados em cache do localStorage');
            products = JSON.parse(cached);
            renderProducts(products);
            return;
        }
        
        const tbody = document.getElementById('productsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="9" style="text-align: center; padding: 40px;">
                    <div style="color: #dc3545;">
                        <h3>❌ Erro ao carregar produtos</h3>
                        <p>${e.message}</p>
                        <p><strong>Dica:</strong> Abra o site público primeiro para carregar os produtos no localStorage</p>
                        <button onclick="loadProducts()" class="btn-primary" style="margin-top: 15px;">🔄 Tentar Novamente</button>
                    </div>
                </td></tr>
            `;
        }
    }
}

function renderProducts(productsToRender) {
    console.log(`🎨 [RENDER] Renderizando ${productsToRender.length} produtos`);
    
    const tbody = document.getElementById('productsTableBody');
    
    if (!tbody) {
        console.error('❌ [RENDER] tbody não encontrado no DOM');
        return;
    }

    if (productsToRender.length === 0) {
        console.warn('⚠️ [RENDER] Nenhum produto para renderizar');
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;">Nenhum produto encontrado</td></tr>';
        return;
    }

    console.log(`✅ [RENDER] Renderizando tabela com ${productsToRender.length} linhas`);
    
    tbody.innerHTML = productsToRender.map(product => {
        const imgSrc = product.image?.startsWith('http') ? product.image : `${API_BASE}${product.image}`;
        return `
        <tr>
            <td>#${product.id}</td>
            <td style="text-align: center;">
                ${product.image ? 
                    `<img src="${imgSrc}" alt="${product.name}" class="product-thumb-admin" onerror="handleImageError(this)" style="max-width: 60px; max-height: 60px; object-fit: cover; border-radius: 4px;">` 
                    : '<div style="font-size: 30px; color: #ccc;">📷</div>'}
            </td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryName(product.category)}</td>
            <td>R$ ${product.priceOld.toFixed(2)}</td>
            <td><strong style="color: #FF8C00;">R$ ${product.priceCurrent.toFixed(2)}</strong></td>
            <td><span style="color: #98D447; font-weight: 600;">-${product.discount}%</span></td>
            <td>
                <span class="status-badge ${product.active ? 'status-active' : 'status-inactive'}">
                    ${product.active ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️ Excluir</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
    
    console.log(`✅ [RENDER] Tabela renderizada com sucesso`);
}

function getCategoryName(category) {
    const categories = {
        'mochilas': 'Mochilas',
        'canetas': 'Canetas',
        'cadernos': 'Cadernos',
        'estojos': 'Estojos',
        'outros': 'Outros'
    };
    return categories[category] || category;
}

function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Produto';
    
    // Resetar todos os campos manualmente (não há mais form.reset())
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPriceOld').value = '';
    document.getElementById('productPriceCurrent').value = '';
    document.getElementById('productDiscount').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productStock').value = '0';
    document.getElementById('productActive').checked = true;
    document.getElementById('productImageFile').value = '';
    
    // Reset status de upload
    const status = document.getElementById('uploadStatus');
    if (status) {
        status.textContent = '💡 Selecione uma imagem para upload automático';
        status.style.color = '#666';
    }
    
    document.getElementById('productModal').classList.add('active');
}

function editProduct(id) {
    editingProductId = id;
    const product = products.find(p => p.id === id);
    
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Editar Produto';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPriceOld').value = product.priceOld;
    document.getElementById('productPriceCurrent').value = product.priceCurrent;
    document.getElementById('productDiscount').value = product.discount;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productActive').checked = product.active;
    
    // Atualizar status - produto já tem imagem
    const status = document.getElementById('uploadStatus');
    if (status && product.image) {
        status.textContent = '✅ Produto já possui imagem. Selecione nova para substituir.';
        status.style.color = '#28a745';
    }

    document.getElementById('productModal').classList.add('active');
}

function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' })
      .then(resp => { if (!resp.ok) throw new Error(); return resp.json(); })
      .then(() => { 
          loadProducts();
          // ✅ SINCRONIZAR COM SITE PÚBLICO
          syncWithPublicSite();
          notify.success('Produto excluído com sucesso!');
      })
      .catch(() => notify.error('Falha ao excluir produto', 6000));
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    
    // Resetar todos os campos manualmente
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPriceOld').value = '';
    document.getElementById('productPriceCurrent').value = '';
    document.getElementById('productDiscount').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productStock').value = '0';
    document.getElementById('productActive').checked = true;
    document.getElementById('productImageFile').value = '';
    
    editingProductId = null;
}

async function saveProduct() {
    console.log('💾 [SAVE] Iniciando salvamento...');
    
    const imageUrl = document.getElementById('productImage').value.trim();
    
    // Validação: Produto novo precisa de imagem
    if (!imageUrl && !editingProductId) {
        console.warn('⚠️ [SAVE] Imagem não foi enviada');
        notify.warning('Faça o upload da imagem antes de salvar!');
        const fileInput = document.getElementById('productImageFile');
        if (fileInput) fileInput.focus();
        return;
    }
    
    console.log('📦 [SAVE] Coletando dados do formulário...');
    
    const productData = {
        name: document.getElementById('productName').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        category: document.getElementById('productCategory').value,
        priceOld: parseFloat(document.getElementById('productPriceOld').value),
        priceCurrent: parseFloat(document.getElementById('productPriceCurrent').value),
        discount: parseInt(document.getElementById('productDiscount').value) || 0,
        image: imageUrl,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        active: document.getElementById('productActive').checked
    };
    
    console.log('✅ [SAVE] Dados coletados:', productData);

    // Botão de submit
    const submitBtn = document.getElementById('btnSaveProduct');
    
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Salvando...';
        
        console.log('🌐 [SAVE] Enviando para API...');

        try {
            let resp;
            if (editingProductId) {
                console.log(`🔄 [SAVE] Atualizando produto ID: ${editingProductId}`);
                resp = await fetch(`${API_BASE}/api/products/${editingProductId}`, {
                    method: 'PUT', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(productData)
                });
                if (!resp.ok) {
                    const error = await resp.text();
                    throw new Error(`Erro ao atualizar: ${error}`);
                }
                console.log('✅ [SAVE] Produto atualizado!');
                notify.success('Produto atualizado com sucesso!');
            } else {
                console.log('➕ [SAVE] Adicionando novo produto');
                resp = await fetch(`${API_BASE}/api/products`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(productData)
                });
                if (!resp.ok) {
                    const error = await resp.text();
                    throw new Error(`Erro ao adicionar: ${error}`);
                }
                console.log('✅ [SAVE] Produto adicionado!');
                notify.success('Produto adicionado com sucesso!');
            }
            
            console.log('🔄 [SAVE] Recarregando lista de produtos...');
            await loadProducts();
            
            // ✅ SINCRONIZAR COM SITE PÚBLICO
            console.log('🔄 [SYNC] Notificando site público sobre mudança...');
            syncWithPublicSite();
            
            console.log('❌ [SAVE] Fechando modal...');
            closeModal();
            
            console.log('🎉 [SAVE] Tudo concluído!');
        } catch (err) {
            console.error('❌ [SAVE] Erro:', err);
            notify.error(`Falha ao salvar produto. ${err.message}`, 6000);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            console.log('🏁 [SAVE] Função finalizada');
        }
    }
}

function calculateDiscount() {
    const priceOld = parseFloat(document.getElementById('productPriceOld').value) || 0;
    const priceCurrent = parseFloat(document.getElementById('productPriceCurrent').value) || 0;

    if (priceOld > 0 && priceCurrent > 0 && priceCurrent < priceOld) {
        const discount = Math.round(((priceOld - priceCurrent) / priceOld) * 100);
        document.getElementById('productDiscount').value = discount;
    } else {
        document.getElementById('productDiscount').value = 0;
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;

    let filtered = products;

    // Filtrar por busca
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    // Filtrar por categoria
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }

    renderProducts(filtered);
}

async function uploadImage() {
    console.log('📤 [UPLOAD] Iniciando...');
    
    // 🚨 PROTEÇÃO EXTRA: Prevenir qualquer propagação de eventos
    try {
        const fileInput = document.getElementById('productImageFile');
        const statusEl = document.getElementById('uploadStatus');
        
        if (!fileInput?.files?.length) {
            console.warn('⚠️ [UPLOAD] Nenhum arquivo');
            notify.warning('Nenhum arquivo selecionado');
            return;
        }
        
        const file = fileInput.files[0];
        console.log(`📦 [UPLOAD] Arquivo: ${file.name} (${(file.size/1024).toFixed(2)}KB)`);
        
        // Atualizar status visual
        if (statusEl) {
            statusEl.textContent = `⏳ Enviando ${file.name}...`;
            statusEl.style.color = '#ffc107';
        }
        
        // Preparar form data
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('🌐 [UPLOAD] Fazendo requisição...');
        
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        console.log(`📡 [UPLOAD] Status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ [UPLOAD] Sucesso: ${data.url}`);
        
        // Salvar URL no campo hidden
        document.getElementById('productImage').value = data.url;
        
        // Feedback visual
        if (statusEl) {
            statusEl.textContent = `✅ ${file.name} enviado!`;
            statusEl.style.color = '#28a745';
        }
        
        notify.success('Imagem enviada!', 2000);
        console.log('✅ [UPLOAD] Concluído com sucesso');
        
        // 🚨 NÃO RETORNAR NADA QUE POSSA CAUSAR RELOAD
        return true;
        
    } catch (error) {
        console.error('❌ [UPLOAD] Erro:', error);
        
        const statusEl = document.getElementById('uploadStatus');
        if (statusEl) {
            statusEl.textContent = '❌ Erro ao enviar. Tente novamente.';
            statusEl.style.color = '#dc3545';
        }
        
        notify.error('Falha no upload. Servidor rodando?', 5000);
        
        // Limpar input para permitir nova tentativa
        const fileInput = document.getElementById('productImageFile');
        if (fileInput) fileInput.value = '';
        
        return false;
    } finally {
        console.log('🏁 [UPLOAD] Função finalizada');
    }
}

// Expor função globalmente
window.handleImageError = handleImageError;
window.closeModal = closeModal;

/**
 * ✨ SINCRONIZAR COM SITE PÚBLICO
 * Notifica e força o site público a recarregar a lista de produtos
 */
function syncWithPublicSite() {
    console.log('🔄 [SYNC] Sincronizando com site público...');
    
    try {
        // 1. Atualizar localStorage com timestamp
        const syncTimestamp = new Date().toISOString();
        localStorage.setItem('lastProductsSync', syncTimestamp);
        localStorage.setItem('productsChanged', 'true');
        
        console.log(`✅ [SYNC] Timestamp de sincronização: ${syncTimestamp}`);
        
        // 2. Broadcast via localStorage (funciona entre abas)
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'productsChanged',
            newValue: 'true',
            oldValue: 'false',
            url: window.location.href
        }));
        
        console.log('✅ [SYNC] Evento broadcast enviado para outras abas');
        
        // 3. Se tiver localStorage key para notificações
        const notification = {
            type: 'products_updated',
            timestamp: syncTimestamp,
            action: 'reload_products',
            source: 'admin-produtos'
        };
        
        localStorage.setItem('adminNotification', JSON.stringify(notification));
        console.log('✅ [SYNC] Notificação armazenada:', notification);
        
        // 4. Feedback visual
        if (window.notify) {
            notify.info('✨ Dados sincronizados com o site!', 2000);
        }
        
        console.log('✅ [SYNC] Sincronização concluída!');
        
    } catch (error) {
        console.error('❌ [SYNC] Erro na sincronização:', error);
    }
}

// Listener para detectar mudanças via outras abas
window.addEventListener('storage', function(e) {
    if (e.key === 'productsChanged' && e.newValue === 'true') {
        console.log('🔔 [SYNC] Detectada mudança em outro lugar - recarregando produtos');
        loadProducts();
    }
});
