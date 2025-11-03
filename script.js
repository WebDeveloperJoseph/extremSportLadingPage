// Produtos da loja
const produtos = [
    {
        id: 1,
        nome: 'Chuteira Profissional Branca',
        descricao: 'Chuteira de alta performance para campo',
        preco: 349.90,
        emoji: '⚽',
        imagem: 'img/chuteiraBranca.png'
    },
    {
        id: 2,
        nome: 'Chuteira Performance Verde',
        descricao: 'Conforto e tração para jogo intenso',
        preco: 389.90,
        emoji: '⚽',
        imagem: 'img/chuteiraVerde.png'
    },
    {
        id: 3,
        nome: 'Kit Chuteiras Premium',
        descricao: 'Conjunto completo para treino e jogo',
        preco: 699.90,
        emoji: '�',
        imagem: 'img/chuteiras.png'
    },
    {
        id: 4,
        nome: 'Luva de Goleiro Pro',
        descricao: 'Proteção e aderência máximas',
        preco: 179.90,
        emoji: '🧤',
        imagem: 'img/luvaGoleiro.png'
    },
    {
        id: 5,
        nome: 'Par de Luvas Goleiro Elite',
        descricao: 'Tecnologia anti-impacto e grip superior',
        preco: 299.90,
        emoji: '🥅',
        imagem: 'img/luvasGoleiro.png'
    },
    {
        id: 6,
        nome: 'Camisa Esportiva Premium',
        descricao: 'Tecido Dry-Fit respirável',
        preco: 149.90,
        emoji: '�',
        imagem: 'img/modeloCamisa.png'
    },
    {
        id: 7,
        nome: 'Camisa Treino Profissional',
        descricao: 'Design moderno e alta durabilidade',
        preco: 139.90,
        emoji: '👕',
        imagem: 'img/modeloCamisa2.png'
    },
    {
        id: 8,
        nome: 'Skate Profissional',
        descricao: 'Skate completo para manobras radicais',
        preco: 499.90,
        emoji: '�'
    },
    {
        id: 9,
        nome: 'Capacete Extreme',
        descricao: 'Proteção máxima para esportes radicais',
        preco: 299.90,
        emoji: '⛑️'
    }
];

// Carrinho de compras
let carrinho = [];

// Carrossel
let currentSlide = 0;
let carouselInterval;

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos();
    carregarCarrinho();
    iniciarCarrossel();
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
        card.innerHTML = `
            ${badgeDestaque}
            <div class="produto-img">
                ${temImagem ? `<img src="${produto.imagem}" alt="${produto.nome}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                <div class="produto-emoji-fallback" style="${temImagem ? 'display:none;' : 'display:flex;'}">${emojiFallback}</div>
            </div>
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="produto-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                <button class="add-to-cart" onclick="adicionarAoCarrinho(${produto.id})">
                    Adicionar ao Carrinho
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Adicionar produto ao carrinho
function adicionarAoCarrinho(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    const itemExistente = carrinho.find(item => item.id === produtoId);
    
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
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Número do WhatsApp da loja
    const numeroWhatsApp = '558396765427'; // Extreme Sport
    
    // Montar mensagem
    let mensagem = '*🛒 PEDIDO - EXTREME SPORT*\n\n';
    
    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        mensagem += `${item.emoji} *${item.nome}*\n`;
        mensagem += `Quantidade: ${item.quantidade}\n`;
        mensagem += `Preço unitário: R$ ${item.preco.toFixed(2).replace('.', ',')}\n`;
        mensagem += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
    });
    
    const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    mensagem += `*💰 TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    mensagem += 'Gostaria de finalizar este pedido!';
    
    // Codificar mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // Criar link do WhatsApp
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
    
    // Abrir WhatsApp
    window.open(linkWhatsApp, '_blank');
    
    // Opcional: limpar carrinho após enviar
    // carrinho = [];
    // salvarCarrinho();
    // atualizarCarrinho();
    // toggleCart();
}

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
