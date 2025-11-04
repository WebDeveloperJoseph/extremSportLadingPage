// Gerenciamento de Produtos
let produtoEditando = null;
const STORAGE_BUCKET = 'produtos';

// Sistema de notificações Toast
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const titles = {
        success: title || 'Sucesso!',
        error: title || 'Erro!',
        warning: title || 'Atenção!',
        info: title || 'Informação'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto remover após 5 segundos
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

async function carregarProdutos() {
    try {
        showToast('Carregando produtos...', 'info');
        
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) {
            console.error('Erro Supabase:', error);
            throw new Error(`Erro ao buscar produtos: ${error.message}`);
        }
        
        console.log('Produtos carregados:', produtos);
        
        const container = document.getElementById('produtosLista');
        const countElement = document.getElementById('totalCount');
        
        countElement.textContent = `${produtos?.length || 0} produtos`;
        
        if (!produtos || produtos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📦</div>
                    <p>Nenhum produto cadastrado</p>
                    <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                        <button class="btn btn-primary" onclick="abrirModalProduto()">Adicionar Primeiro Produto</button>
                        <a class="btn" href="seed.html">Rodar Seed</a>
                    </div>
                </div>
            `;
            showToast('Nenhum produto encontrado no banco de dados', 'warning');
            return;
        }
        
        container.innerHTML = `
            <div class="produtos-grid">
                ${produtos.map(produto => {
                    const temImagem = Boolean(produto.imagem_url);
                    const emojiFallback = produto.emoji || '📦';
                    return `
                    <div class="produto-item">
                        ${produto.destaque ? '<div class="produto-badge-destaque">DESTAQUE</div>' : ''}
                        <div class="produto-item-img">
                            ${temImagem 
                                ? `<img src="${produto.imagem_url}" alt="${produto.nome}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                                : `<img alt="" style="display:none;">`
                            }
                            <div class="emoji-fallback" style="${temImagem ? 'display:none;' : 'display:flex;'}">${emojiFallback}</div>
                        </div>
                        <div class="produto-item-info">
                            <h4>${produto.nome}</h4>
                            <p>${produto.descricao}</p>
                            <div class="produto-item-price">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</div>
                            <div class="produto-item-stock">Estoque: <strong>${produto.estoque ?? 0}</strong></div>
                            <div class="produto-item-actions">
                                <button class="btn btn-primary btn-sm" onclick="editarProduto(${produto.id})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="deletarProduto(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}')">Excluir</button>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
        
        showToast(`${produtos.length} produto(s) carregado(s) com sucesso`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showToast(error.message || 'Erro ao carregar produtos', 'error');
        document.getElementById('produtosLista').innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <p>Erro ao carregar produtos</p>
                <p style="color: var(--danger-color); font-size: 0.9rem;">${error.message}</p>
                <button class="btn btn-primary" onclick="carregarProdutos()">Tentar Novamente</button>
            </div>
        `;
    }
}

// Diagnóstico: verifica sessão, admin, policies e contagem de produtos
async function diagnosticarProdutos() {
    try {
        showToast('Executando diagnóstico...', 'info');

        // Sessão
        const { data: { session }, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw new Error('Falha ao obter sessão');
        if (!session) {
            showToast('Sem sessão. Faça login novamente.', 'error');
            return;
        }

        // Admin
        const { data: admin, error: adminErr } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .single();
        if (adminErr || !admin) {
            showToast('Usuário não consta na tabela admins. Verifique permissões.', 'error');
        } else {
            showToast(`Admin OK (${admin.role})`, 'success');
        }

        // Contagem de produtos
        const { data: _, count, error: cntErr } = await supabase
            .from('produtos')
            .select('*', { count: 'exact', head: true });
        if (cntErr) {
            showToast(`Erro ao contar produtos: ${cntErr.message}`, 'error');
        } else {
            showToast(`Tabela produtos acessível. Quantidade: ${count ?? 0}`, count ? 'success' : 'warning');
        }

        // Teste de SELECT simples
        const { data: testData, error: testErr } = await supabase
            .from('produtos')
            .select('id, nome')
            .limit(3);
        if (testErr) {
            showToast(`Erro SELECT produtos: ${testErr.message}`, 'error');
        } else {
            console.log('Amostra de produtos:', testData);
            if ((testData?.length || 0) > 0) {
                showToast(`Amostra OK: ${testData.length} item(ns)`, 'success');
            }
        }

        // Dica: seed
        showToast('Se a contagem for 0, use o Seed em /admin/seed.html', 'info');
    } catch (e) {
        console.error('Diagnóstico falhou:', e);
        showToast(e.message || 'Diagnóstico falhou', 'error');
    }
}

function abrirModalProduto() {
    produtoEditando = null;
    document.getElementById('modalTitle').textContent = 'Novo Produto';
    document.getElementById('formProduto').reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('imagemPreview').classList.remove('show');
    document.getElementById('modalProduto').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

function fecharModalProduto() {
    document.getElementById('modalProduto').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('formProduto').reset();
    produtoEditando = null;
}

async function editarProduto(id) {
    try {
        showToast('Carregando dados do produto...', 'info');
        
        const { data: produto, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        produtoEditando = produto;
        
        document.getElementById('modalTitle').textContent = 'Editar Produto';
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('descricao').value = produto.descricao;
        document.getElementById('preco').value = produto.preco;
        document.getElementById('estoque').value = produto.estoque ?? 0;
        document.getElementById('emoji').value = produto.emoji || '';
        document.getElementById('destaque').checked = produto.destaque || false;
        
        // Mostrar preview da imagem atual
        if (produto.imagem_url) {
            const preview = document.getElementById('imagemPreview');
            preview.innerHTML = `<img src="${produto.imagem_url}" alt="Preview">`;
            preview.classList.add('show');
        }
        
        document.getElementById('modalProduto').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
        
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        showToast(error.message || 'Erro ao carregar produto para edição', 'error');
    }
}

async function deletarProduto(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
        return;
    }
    
    try {
        showToast('Excluindo produto...', 'info');
        
        // Buscar produto para pegar URL da imagem
        const { data: produto } = await supabase
            .from('produtos')
            .select('imagem_url')
            .eq('id', id)
            .single();
        
        // Deletar imagem do Storage se existir
        if (produto?.imagem_url) {
            const fileName = produto.imagem_url.split('/').pop();
            await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([fileName]);
        }
        
        // Deletar produto do banco
        const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showToast(`Produto "${nome}" excluído com sucesso!`, 'success');
        carregarProdutos();
        
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        showToast(error.message || 'Erro ao excluir produto', 'error');
    }
}

// Preview de imagem
document.getElementById('imagemFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Imagem muito grande! Tamanho máximo: 5MB', 'error');
            e.target.value = '';
            return;
        }
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
            showToast('Por favor, selecione apenas arquivos de imagem', 'error');
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('imagemPreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            preview.classList.add('show');
        };
        reader.readAsDataURL(file);
    }
});

// Submit do formulário
document.getElementById('formProduto').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';
    
    try {
        const id = document.getElementById('produtoId').value;
        const nome = document.getElementById('nome').value.trim();
        const descricao = document.getElementById('descricao').value.trim();
        const preco = parseFloat(document.getElementById('preco').value);
        const emoji = document.getElementById('emoji').value.trim();
        const estoque = parseInt(document.getElementById('estoque').value, 10);
        const destaque = document.getElementById('destaque').checked;
        const imagemFile = document.getElementById('imagemFile').files[0];
        
        // Validações
        if (isNaN(estoque) || estoque < 0) {
            throw new Error('Informe um valor de estoque válido (zero ou positivo).');
        }
        
        let imagem_url = produtoEditando?.imagem_url || null;
        
        // Upload de imagem se houver
        if (imagemFile) {
            showToast('Fazendo upload da imagem...', 'info');
            
            // Deletar imagem antiga se existir
            if (produtoEditando?.imagem_url) {
                const oldFileName = produtoEditando.imagem_url.split('/').pop();
                await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove([oldFileName]);
            }
            
            // Upload nova imagem
            const fileExt = imagemFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, imagemFile);
            
            if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);
            
            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);
            
            imagem_url = publicUrl;
        }
        
        // Dados do produto
        const produtoData = {
            nome,
            descricao,
            preco,
            emoji: emoji || null,
            imagem_url,
            destaque,
            estoque
        };
        
        console.log('Salvando produto:', produtoData);
        
        if (id) {
            // Atualizar produto existente
            const { error } = await supabase
                .from('produtos')
                .update(produtoData)
                .eq('id', id);
            
            if (error) throw error;
            showToast(`Produto "${nome}" atualizado com sucesso!`, 'success');
        } else {
            // Criar novo produto
            const { error } = await supabase
                .from('produtos')
                .insert([produtoData]);
            
            if (error) throw error;
            showToast(`Produto "${nome}" criado com sucesso!`, 'success');
        }
        
        fecharModalProduto();
        carregarProdutos();
        
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        showToast(error.message || 'Erro ao salvar produto', 'error');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar Produto';
    }
});

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', carregarProdutos);
