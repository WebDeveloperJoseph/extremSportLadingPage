// Carregar produtos dinamicamente na página pública
// API_BASE já definido globalmente

// Função para carregar produtos
async function loadPublicProducts() {
    const productsGrid = document.querySelector('.products-grid');
    
    try {
        // Mostrar loading
        if (productsGrid) {
            productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;"><div style="font-size: 48px; animation: pulse 1.5s ease-in-out infinite;">⏳</div><h3>Carregando produtos incríveis...</h3></div>';
        }

        const products = await getProducts();
        const activeProducts = products.filter(p => p.active);

        console.log(`📦 [LOAD] Produtos carregados: ${products.length} total, ${activeProducts.length} ativos`);

        if (activeProducts.length === 0) {
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">📦</div>
                        <h3>Nenhum produto disponível no momento</h3>
                        <p style="color: #666;">Novos produtos serão adicionados em breve!</p>
                        ${products.length > 0 ? '<p style="color: #999; font-size: 0.9em; margin-top: 10px;">💡 Há produtos cadastrados mas inativos</p>' : ''}
                    </div>
                `;
            }
            return;
        }

        renderPublicProducts(activeProducts);
    } catch (e) {
        console.error('❌ Erro ao carregar produtos:', e);
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                    <h3 style="color: #dc3545;">Erro ao carregar produtos</h3>
                    <p style="color: #666; margin: 15px 0;">Não foi possível conectar ao servidor</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px auto; max-width: 500px; text-align: left;">
                        <strong>🔧 Solução:</strong>
                        <ol style="margin: 10px 0; padding-left: 20px;">
                            <li>Verifique se o servidor está rodando</li>
                            <li>Execute <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">start-server.bat</code></li>
                            <li>Aguarde aparecer "✅ Servidor rodando"</li>
                            <li>Recarregue esta página (F5)</li>
                        </ol>
                    </div>
                    <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; margin-top: 15px;">🔄 Recarregar Página</button>
                </div>
            `;
        }
    }
}

// Disparar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPublicProducts);
} else {
    // DOM já está pronto
    console.log('✅ DOM já pronto, carregando produtos agora...');
    loadPublicProducts();
}

// Alternativa: também chamar após um pequeno delay
setTimeout(() => {
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid && productsGrid.innerHTML.includes('Carregando') === false && productsGrid.children.length === 0) {
        console.log('⏱️  Recarregando produtos após delay...');
        loadPublicProducts();
    }
}, 1000);

async function getProducts() {
    console.log(`🔌 Conectando ao servidor: ${API_BASE}/api/products`);
    
    // 🧹 LIMPAR CACHE ANTIGO SEMPRE (temporário para debug)
    console.log('🧹 Limpando cache antigo...');
    localStorage.removeItem('allProducts');
    
    try {
        const resp = await fetch(`${API_BASE}/api/products`, { 
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        console.log(`✅ Resposta CRUA da API (${data.length} produtos):`, data);
        console.log(`📊 Primeiro produto COMPLETO:`, data[0]);
        
        // ✅ SALVAR NO LOCALSTORAGE PARA FALLBACK
        localStorage.setItem('allProducts', JSON.stringify(data));
        console.log(`💾 Produtos salvos no localStorage`);
        
        return data;
    } catch (e) {
        console.warn(`⚠️ Servidor offline, tentando localStorage...`);
        
        // Fallback: tentar carregar do localStorage
        const cached = localStorage.getItem('allProducts');
        if (cached) {
            console.log(`✅ Usando dados em cache do localStorage`);
            return JSON.parse(cached);
        }
        
        // Última tentativa: dados hardcoded
        console.warn(`⚠️ Sem cache, usando dados de fallback`);
        throw e;
    }
}

function renderPublicProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) {
        // Silencioso - não há grid nesta página (provavelmente admin)
        return;
    }
    
    console.log(`✅ [RENDER] Renderizando ${products.length} produto(s)...`);
    console.log('📊 Primeiros 3 produtos COMPLETOS:', products.slice(0, 3)); // DEBUG
    
    productsGrid.innerHTML = products.map((product, index) => {
        const imageUrl = product.image?.startsWith('http') ? product.image : API_BASE + product.image;
        
        // 🔍 DEBUG DETALHADO - Mostrar TODOS os campos de preço
        console.log(`🔍 [${index}] ${product.name}:`, {
            priceCurrent: product.priceCurrent,
            priceOld: product.priceOld,
            discount: product.discount,
            active: product.active,
            objetoCompleto: product
        });
        
        // 🎯 Usa diretamente priceCurrent (campo correto do banco)
        const finalPrice = Number(product.priceCurrent || 0).toFixed(2);
        const originalPrice = product.priceOld ? Number(product.priceOld).toFixed(2) : null;
        
        return `
        <div class="product-card" style="animation-delay: ${index * 0.05}s;">
            <div class="product-image">
                ${product.discount ? `<div class="product-badge">-${product.discount}%</div>` : ''}
                <img src="${imageUrl}" 
                     alt="${product.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/250x250?text=Sem+Imagem'; this.style.opacity='0.5';"
                     style="width: 90%; height: 90%; object-fit: contain;">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'Produto de qualidade'}</p>
                <div class="product-pricing">
                    ${originalPrice ? `<span class="price-old">R$ ${Number(originalPrice).toFixed(2)}</span>` : ''}
                    <span class="price-current">R$ ${finalPrice}</span>
                </div>
                <button class="btn-add-cart" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${finalPrice}">
                    🛒 Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    // Adiciona event listener nos botões após renderizar
    setTimeout(() => {
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = parseInt(btn.getAttribute('data-product-id'));
                const name = btn.getAttribute('data-product-name');
                const price = parseFloat(btn.getAttribute('data-product-price'));
                
                if (window.addToCart) {
                    window.addToCart(id, name, price);
                    
                    // Feedback visual
                    const originalText = btn.textContent;
                    btn.textContent = '✅ Adicionado!';
                    btn.style.background = 'var(--cor-verde-agua)';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                    }, 2000);
                    
                    if (window.notify) window.notify.success('Produto adicionado ao carrinho!', 2500);
                } else {
                    alert('Função de carrinho não disponível!');
                }
            });
        });
    }, 100);
}

// Atualizar contador do carrinho
function updateCartCount() {
    const cartIcon = document.querySelector('.cart-count');
    if (cartIcon) {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIcon.textContent = totalItems;
    }
}

function getCart() {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
}

// Exportar funções globais
window.updateCartCount = updateCartCount;
window.renderPublicProducts = renderPublicProducts;
window.getProducts = getProducts;

// Inicializar
updateCartCount();

/**
 * 🔍 BUSCA GLOBAL DE PRODUTOS
 */
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.product-description')?.textContent.toLowerCase() || '';
            
            if (name.includes(query) || description.includes(query) || query === '') {
                card.style.display = '';
                card.style.animation = 'fadeIn 0.3s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Ativar busca quando carregar
document.addEventListener('DOMContentLoaded', setupGlobalSearch);

/**
 * ✨ LISTENER DE SINCRONIZAÇÃO COM ADMIN
 * Quando admin mudar produtos, recarrega automaticamente
 */
window.addEventListener('storage', function(e) {
    if (e.key === 'productsChanged' && e.newValue === 'true') {
        console.log('🔔 [SYNC PUBLIC] Detectada mudança no admin - recarregando produtos...');
        loadPublicProducts();
        updateCartCount();
        setTimeout(() => setupGlobalSearch(), 100); // Re-ativar busca após reload
        
        // Mostrar notificação se disponível
        if (window.notify) {
            window.notify.info('✨ Produtos atualizados!', 2000);
        }
    }
    
    if (e.key === 'adminNotification') {
        try {
            const notification = JSON.parse(e.newValue);
            if (notification.action === 'reload_products') {
                console.log('🔔 [SYNC PUBLIC] Notificação de reload recebida');
                loadPublicProducts();
                setTimeout(() => setupGlobalSearch(), 100);
            }
        } catch (err) {
            console.error('Erro ao processar notificação:', err);
        }
    }
});

// Verificar sincronização periodicamente (fallback)
setInterval(function() {
    const lastSync = localStorage.getItem('lastProductsSync');
    const lastPageSync = sessionStorage.getItem('lastProductsSync');
    
    if (lastSync && lastSync !== lastPageSync) {
        console.log('🔄 [SYNC PUBLIC] Sincronização periódica detectada');
        sessionStorage.setItem('lastProductsSync', lastSync);
        loadPublicProducts();
    }
}, 5000);
