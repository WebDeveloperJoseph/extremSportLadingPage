// Gerenciamento de Produtos
let produtoEditando = null;
const STORAGE_BUCKET = 'produtos';

async function carregarProdutos() {
    try {
        const { data: produtos, error } = await supabase
            .from('produtos')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) throw error;
        
        const container = document.getElementById('produtosLista');
        const countElement = document.getElementById('totalCount');
        
        countElement.textContent = `${produtos?.length || 0} produtos`;
        
        if (!produtos || produtos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📦</div>
                    <p>Nenhum produto cadastrado</p>
                    <button class="btn btn-primary" onclick="abrirModalProduto()">Adicionar Primeiro Produto</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="produtos-grid">
                ${produtos.map(produto => `
                    <div class="produto-item">
                        ${produto.destaque ? '<div class="produto-badge-destaque">DESTAQUE</div>' : ''}
                        <div class="produto-item-img">
                            ${produto.imagem_url 
                                ? `<img src="${produto.imagem_url}" alt="${produto.nome}" onerror="this.parentElement.innerHTML='<div class=\\"emoji-fallback\\">${produto.emoji || '📦'}</div>'">` 
                                : `<div class="emoji-fallback">${produto.emoji || '📦'}</div>`
                            }
                        </div>
                        <div class="produto-item-info">
                            <h4>${produto.nome}</h4>
                            <p>${produto.descricao}</p>
                            <div class="produto-item-price">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</div>
                            <div class="produto-item-actions">
                                <button class="btn btn-primary btn-sm" onclick="editarProduto(${produto.id})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="deletarProduto(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}')">Excluir</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('produtosLista').innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar produtos: ${error.message}</p>
            </div>
        `;
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
        alert('Erro ao carregar produto para edição');
    }
}

async function deletarProduto(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
        return;
    }
    
    try {
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
        
        alert('Produto excluído com sucesso!');
        carregarProdutos();
        
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao excluir produto: ' + error.message);
    }
}

// Preview de imagem
document.getElementById('imagemFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Imagem muito grande! Máximo: 5MB');
            e.target.value = '';
            return;
        }
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas imagens');
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
        const destaque = document.getElementById('destaque').checked;
        const imagemFile = document.getElementById('imagemFile').files[0];
        
        let imagem_url = produtoEditando?.imagem_url || null;
        
        // Upload de imagem se houver
        if (imagemFile) {
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
            
            if (uploadError) throw uploadError;
            
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
            destaque
        };
        
        if (id) {
            // Atualizar produto existente
            const { error } = await supabase
                .from('produtos')
                .update(produtoData)
                .eq('id', id);
            
            if (error) throw error;
            alert('Produto atualizado com sucesso!');
        } else {
            // Criar novo produto
            const { error } = await supabase
                .from('produtos')
                .insert([produtoData]);
            
            if (error) throw error;
            alert('Produto criado com sucesso!');
        }
        
        fecharModalProduto();
        carregarProdutos();
        
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Erro ao salvar produto: ' + error.message);
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar Produto';
    }
});

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', carregarProdutos);
