// Produtos da loja (será carregado do Supabase)
let produtos = [];

// Carrinho de compras
let carrinho = [];

// Carrossel
let currentSlide = 0;
let carouselInterval;

// Carregar produtos do Supabase
async function carregarProdutosDoSupabase() {
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        // Mapear produtos do banco para o formato usado no frontend
        produtos = data.map(p => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            preco: parseFloat(p.preco),
            emoji: p.emoji,
            imagem: p.imagem_url,
            destaque: p.destaque,
            estoque: typeof p.estoque === 'number' ? p.estoque : 0
        }));
        
        // Renderizar produtos e carrossel
        renderizarProdutos();
        iniciarCarrossel();
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        // Fallback: usar produtos locais se o banco falhar
        console.warn('Usando produtos locais como fallback');
    }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutosDoSupabase();
    carregarCarrinho();

    // Animação apenas de bounce (removido efeito de giro)
    try {
        const logoWrap = document.querySelector('.hero-logo-anim');
        if (logoWrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            logoWrap.classList.add('anim-bounce');
        }
    } catch (e) {
        console.warn('Falha ao aplicar animação da logo:', e);
    }
});

// Renderizar produtos na grid
function renderizarProdutos() {
    const grid = document.getElementById('produtosGrid');
    
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        const temImagem = Boolean(produto.imagem);
        const emojiFallback = produto.emoji || '🏷️';
    const badgeDestaque = produto.destaque ? '<span class="badge-destaque">DESTAQUE</span>' : '';
    const badgeEsgotado = (produto.estoque === 0) ? '<span class="badge-esgotado">ESGOTADO</span>' : '';
        card.innerHTML = `
            ${badgeDestaque}
            ${badgeEsgotado}
            <div class="produto-img">
                ${temImagem ? `<img src="${produto.imagem}" alt="${produto.nome}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                <div class="produto-emoji-fallback" style="${temImagem ? 'display:none;' : 'display:flex;'}">${emojiFallback}</div>
            </div>
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="produto-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                <button class="add-to-cart" onclick="adicionarAoCarrinho(${produto.id})" ${produto.estoque === 0 ? 'disabled' : ''}>
                    Adicionar ao Carrinho
                </button>
                ${typeof produto.estoque === 'number' ? `<small style="display:block;margin-top:6px;color:#666;">Disponível: ${produto.estoque}</small>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Adicionar produto ao carrinho
function adicionarAoCarrinho(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    const itemExistente = carrinho.find(item => item.id === produtoId);
    const estoque = typeof produto.estoque === 'number' ? produto.estoque : Infinity;
    const quantidadeAtual = itemExistente ? itemExistente.quantidade : 0;
    if (quantidadeAtual + 1 > estoque) {
        mostrarToast('Estoque insuficiente para este produto.');
        return;
    }
    
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            emoji: produto.emoji,
            imagem: produto.imagem || null,
            quantidade: 1
        });
    }
    
    salvarCarrinho();
    atualizarCarrinho();
    
    // Mostrar toast de confirmação
    mostrarToast('Produto adicionado ao carrinho!');
    
    // Feedback visual no botão do carrinho
    const cartToggle = document.querySelector('.cart-toggle');
    cartToggle.classList.add('cart-pulse');
    setTimeout(() => {
        cartToggle.classList.remove('cart-pulse');
    }, 600);
}

// Remover produto do carrinho
function removerDoCarrinho(produtoId) {
    carrinho = carrinho.filter(item => item.id !== produtoId);
    salvarCarrinho();
    atualizarCarrinho();
}

// Aumentar quantidade
function aumentarQuantidade(produtoId) {
    const item = carrinho.find(item => item.id === produtoId);
    if (item) {
        const produto = produtos.find(p => p.id === produtoId);
        const estoque = typeof produto?.estoque === 'number' ? produto.estoque : Infinity;
        if (item.quantidade + 1 > estoque) {
            mostrarToast('Quantidade máxima disponível atingida.');
            return;
        }
        item.quantidade++;
        salvarCarrinho();
        atualizarCarrinho();
    }
}

// Diminuir quantidade
function diminuirQuantidade(produtoId) {
    const item = carrinho.find(item => item.id === produtoId);
    if (item) {
        if (item.quantidade > 1) {
            item.quantidade--;
        } else {
            removerDoCarrinho(produtoId);
            return;
        }
        salvarCarrinho();
        atualizarCarrinho();
    }
}

// Atualizar visualização do carrinho
function atualizarCarrinho() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cartTotal');
    
    // Atualizar contador
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    cartCount.textContent = totalItens;
    
    // Calcular total
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Renderizar itens
    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
    } else {
        cartItems.innerHTML = carrinho.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    ${item.imagem ? `<img src="${item.imagem}" alt="${item.nome}" onerror="this.style.display='none'; this.parentElement.textContent='${(item.emoji || '🛍️').replace(/'/g, "&#39;")}';">` : (item.emoji || '🛍️')}
                </div>
                <div class="cart-item-info">
                    <h4>${item.nome}</h4>
                    <div class="cart-item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="diminuirQuantidade(${item.id})">-</button>
                        <span class="qty-display">${item.quantidade}</span>
                        <button class="qty-btn" onclick="aumentarQuantidade(${item.id})">+</button>
                        <button class="remove-item" onclick="removerDoCarrinho(${item.id})">Remover</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Habilitar/desabilitar botão de checkout
    const checkoutBtn = document.querySelector('.checkout-button');
    checkoutBtn.disabled = carrinho.length === 0;
}

// Toggle carrinho
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Toggle menu mobile
function toggleMenu() {
    const nav = document.getElementById('mainNav');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.getElementById('menuOverlay');
    
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
    menuOverlay.classList.toggle('active');
}

// Fechar menu ao clicar em link
function closeMenu() {
    const nav = document.getElementById('mainNav');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.getElementById('menuOverlay');
    
    nav.classList.remove('active');
    menuToggle.classList.remove('active');
    menuOverlay.classList.remove('active');
}

// Mostrar toast de notificação
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = mensagem;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Botão voltar ao topo
window.addEventListener('scroll', () => {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Salvar carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem('carrinho_extreme_sport', JSON.stringify(carrinho));
}

// Carregar carrinho do localStorage
function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinho_extreme_sport');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
        atualizarCarrinho();
    }
}

// Finalizar compra no WhatsApp
function finalizarCompra() {
    if (carrinho.length === 0) {
        mostrarToast('Seu carrinho está vazio!');
        return;
    }
    
    toggleCart();
    abrirCheckout();
}

// Abrir modal de checkout
function abrirCheckout() {
    if (carrinho.length === 0) {
        mostrarToast('Adicione produtos ao carrinho primeiro!');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('active');
    
    // Preencher resumo do pedido
    preencherResumoCheckout();
    
    // Focar no primeiro campo
    setTimeout(() => {
        document.getElementById('nomeCompleto').focus();
    }, 300);
}

// Fechar modal de checkout
function fecharCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
    
    // Limpar formulário
    document.getElementById('checkoutForm').reset();
}

// Preencher resumo do pedido no checkout
function preencherResumoCheckout() {
    const resumoDiv = document.getElementById('checkoutResumo');
    const totalDiv = document.getElementById('checkoutTotal');
    
    resumoDiv.innerHTML = '';
    
    carrinho.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'resumo-item';
        itemDiv.innerHTML = `
            <div class="resumo-item-info">
                <div class="resumo-item-nome">${item.nome}</div>
                <div class="resumo-item-qtd">Quantidade: ${item.quantidade}</div>
            </div>
            <div class="resumo-item-preco">
                R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
            </div>
        `;
        resumoDiv.appendChild(itemDiv);
    });
    
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    totalDiv.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Buscar endereço por CEP (ViaCEP API)
async function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            mostrarToast('CEP não encontrado');
            return;
        }
        
        document.getElementById('endereco').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';
        
        // Focar no número
        document.getElementById('numero').focus();
        
        mostrarToast('Endereço preenchido automaticamente!');
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        mostrarToast('Erro ao buscar CEP');
    }
}

// Formatar telefone
function formatarTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 10) {
        valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
    
    input.value = valor;
}

// Formatar CEP
function formatarCEP(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
    input.value = valor;
}

// Enviar pedido via WhatsApp
async function enviarPedidoWhatsApp(event) {
    event.preventDefault();
    
    // Coletar dados do formulário
    const dados = {
        nome: document.getElementById('nomeCompleto').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cep: document.getElementById('cep').value,
        endereco: document.getElementById('endereco').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        pagamento: document.querySelector('input[name="pagamento"]:checked').value
    };
    
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    
    // Tentar criar/atualizar cliente via RPC (retorna cliente_id)
    let clienteId = null;
    try {
        const { data: clienteData, error: clienteErr } = await supabase.rpc('upsert_cliente', {
            p_nome: dados.nome,
            p_email: dados.email,
            p_telefone: dados.telefone
        });
        if (clienteErr) throw clienteErr;
        clienteId = clienteData || null;
    } catch (e) {
        console.warn('Falha no upsert de cliente (seguindo sem cliente_id):', e.message || e);
    }

    // Salvar pedido no Supabase
    try {
        // Monta payload base SEM cliente_id
        const pedidoBase = {
            cliente_nome: dados.nome,
            cliente_email: dados.email,
            cliente_telefone: dados.telefone,
            endereco_cep: dados.cep,
            endereco_rua: dados.endereco,
            endereco_numero: dados.numero,
            endereco_complemento: dados.complemento || null,
            endereco_bairro: dados.bairro,
            endereco_cidade: dados.cidade,
            endereco_estado: dados.estado,
            produtos_json: carrinho,
            total: total,
            forma_pagamento: dados.pagamento,
            status: 'pendente'
        };

        // Só adiciona cliente_id se veio válido do RPC
        const payloadTentativa = { ...pedidoBase };
        if (typeof clienteId === 'number' && !isNaN(clienteId)) {
            payloadTentativa.cliente_id = clienteId;
        }

        let { data, error } = await supabase
            .from('pedidos')
            .insert([payloadTentativa])
            .select();

        // Fallback: se der erro por coluna cliente_id inexistente, tenta sem a coluna
        if (error && String(error.message || '').toLowerCase().includes('cliente_id')) {
            console.warn('Re-tentando inserir pedido sem cliente_id por coluna ausente...');
            const { data: data2, error: error2 } = await supabase
                .from('pedidos')
                .insert([pedidoBase])
                .select();
            if (error2) throw error2;
            data = data2;
            error = null;
        }

        if (error) throw error;

        console.log('Pedido salvo no banco:', data);
        mostrarToast('Pedido salvo no sistema!');

        // TENTAR baixar estoque via updates (pode falhar por política RLS)
        try {
            for (const item of carrinho) {
                const produto = produtos.find(p => p.id === item.id);
                if (!produto || typeof produto.estoque !== 'number') continue;
                const novoEstoque = Math.max(0, produto.estoque - item.quantidade);
                if (novoEstoque === produto.estoque) continue;
                // Esta chamada pode ser bloqueada por RLS (apenas admins atualizam). O trigger no banco deve tratar.
                await supabase.from('produtos').update({ estoque: novoEstoque }).eq('id', item.id);
            }
        } catch (e) {
            // Sem problema: trigger do banco deve manejar o estoque
            console.warn('Atualização de estoque pelo cliente falhou (esperado com RLS):', e.message || e);
        }
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        mostrarToast('Não foi possível salvar seu pedido no sistema. Continuaremos pelo WhatsApp.');
        // Continua mesmo se falhar ao salvar no banco
    }
    
    // Formatar mensagem
    let mensagem = `🏃‍♂️ *NOVO PEDIDO - EXTREME SPORT* 🏃‍♂️\n\n`;
    mensagem += `*CLIENTE:*\n`;
    mensagem += `👤 ${dados.nome}\n`;
    mensagem += `📧 ${dados.email}\n`;
    mensagem += `📱 ${dados.telefone}\n\n`;
    
    mensagem += `*ENDEREÇO DE ENTREGA:*\n`;
    mensagem += `📍 ${dados.endereco}, ${dados.numero}`;
    if (dados.complemento) mensagem += ` - ${dados.complemento}`;
    mensagem += `\n🏘️ ${dados.bairro}\n`;
    mensagem += `🌆 ${dados.cidade} - ${dados.estado}\n`;
    mensagem += `📮 CEP: ${dados.cep}\n\n`;
    
    mensagem += `*PRODUTOS:*\n`;
    carrinho.forEach(item => {
        mensagem += `\n${item.emoji || '📦'} *${item.nome}*\n`;
        mensagem += `   Quantidade: ${item.quantidade}x\n`;
        mensagem += `   Valor unit.: R$ ${item.preco.toFixed(2).replace('.', ',')}\n`;
        mensagem += `   Subtotal: R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
    });
    
    mensagem += `\n💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    
    // Forma de pagamento
    const formaPagamento = {
        'pix': '🔷 PIX',
        'cartao': '💳 Cartão de Crédito',
        'boleto': '📄 Boleto Bancário'
    };
    mensagem += `*FORMA DE PAGAMENTO:*\n${formaPagamento[dados.pagamento]}`;
    
    // Enviar para WhatsApp
    const whatsappNumero = '558396765427';
    const url = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
    
    // Limpar carrinho e fechar modal
    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
    fecharCheckout();
    
    mostrarToast('Redirecionando para WhatsApp...');
    
    setTimeout(() => {
        window.open(url, '_blank');
    }, 500);
}

// Event listeners para buscar CEP e formatar inputs
document.addEventListener('DOMContentLoaded', () => {
    // Buscar CEP ao digitar
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', (e) => formatarCEP(e.target));
        cepInput.addEventListener('blur', buscarCEP);
    }
    
    // Formatar telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => formatarTelefone(e.target));
    }
    
    // Submit do formulário
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', enviarPedidoWhatsApp);
    }
    
    // Fechar modal ao clicar fora
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                fecharCheckout();
            }
        });
    }
});

// Scroll suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== CARROSSEL ==========

function iniciarCarrossel() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    // Pegar produtos com imagem para o carrossel
    const produtosDestaque = produtos.filter(p => p.imagem);
    
    if (produtosDestaque.length === 0) return;
    
    // Renderizar slides
    produtosDestaque.forEach((produto, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `
            <div class="carousel-produto">
                <div class="carousel-img">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="carousel-info">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao}</p>
                    <div class="carousel-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                    <button class="carousel-add-btn" onclick="adicionarAoCarrinho(${produto.id})">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
        track.appendChild(slide);
        
        // Criar dot
        const dot = document.createElement('span');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
    
    // Iniciar autoplay
    startAutoplay();
}

function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    const slides = track.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    currentSlide += direction;
    
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    updateCarousel();
    resetAutoplay();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetAutoplay();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.carousel-dot');
    
    // Mover track
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Atualizar dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoplay() {
    carouselInterval = setInterval(() => {
        moveCarousel(1);
    }, 5000); // Muda a cada 5 segundos
}

function resetAutoplay() {
    clearInterval(carouselInterval);
    startAutoplay();
}
