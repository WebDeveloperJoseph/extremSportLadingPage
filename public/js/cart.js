// Sistema Completo do Carrinho de Compras
const API_BASE = localStorage.getItem('API_BASE') || (window.location.origin.includes('vercel') || window.location.origin.includes('localhost') ? 'https://extremsportladingpage-production.up.railway.app' : window.location.origin);
let cart = [];
let listenersAttached = false;

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    renderCart();
    setupEventListeners();
    ensureNotificationStyles();
    checkAndEnableShipping();
});

function setupEventListeners() {
    if (listenersAttached) return; // evita duplicar ouvintes em re-render
    listenersAttached = true;
    // Botões de quantidade
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('qty-plus')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.productId);
            updateQuantity(productId, 1);
        }
        
        if (e.target.classList.contains('qty-minus')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.productId);
            updateQuantity(productId, -1);
        }
        
        if (e.target.classList.contains('btn-remove')) {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.productId);
            removeFromCart(productId);
        }
    });

    // Botão aplicar cupom
    const btnApplyCoupon = document.querySelector('.btn-apply-coupon');
    if (btnApplyCoupon) {
        btnApplyCoupon.addEventListener('click', applyCoupon);
    }

    // Botão atualizar carrinho
    const btnUpdateCart = document.querySelector('.btn-update-cart');
    if (btnUpdateCart) {
        btnUpdateCart.addEventListener('click', function() {
            showNotification('✅ Carrinho atualizado!', 'success');
        });
    }

    // Botão finalizar compra
    const btnCheckout = document.querySelector('.btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', checkout);
    }

    // Toggle B2B fields
    const b2bToggle = document.getElementById('b2b-toggle');
    const b2bFields = document.getElementById('b2b-fields');
    if (b2bToggle && b2bFields) {
        b2bToggle.addEventListener('change', () => {
            if (b2bToggle.checked) {
                b2bFields.classList.add('active');
            } else {
                b2bFields.classList.remove('active');
            }
        });
    }

    // Botão enviar orçamento B2B
    const btnB2B = document.getElementById('btn-b2b-quote');
    if (btnB2B) {
        btnB2B.addEventListener('click', enviarOrcamentoB2B);
    }
}

function loadCart() {
    const data = localStorage.getItem('cart');
    cart = data ? JSON.parse(data) : [];
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function renderCart() {
    const cartItemsSection = document.querySelector('.cart-items-section');
    
    if (!cartItemsSection) return;

    if (cart.length === 0) {
        cartItemsSection.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 5rem; margin-bottom: 20px;">🛒</div>
                <h2 style="color: #666; margin-bottom: 15px;">Seu carrinho está vazio</h2>
                <p style="color: #999; margin-bottom: 30px;">Adicione produtos para começar suas compras!</p>
                <a href="index.html" class="btn-primary" style="display: inline-block; padding: 15px 40px;">
                    Ir para a Loja
                </a>
            </div>
        `;
        updateSummary();
        return;
    }

    const API_BASE_INTERNAL = localStorage.getItem('API_BASE') || (window.location.origin.includes('vercel') || window.location.origin.includes('localhost') ? 'https://extremsportladingpage-production.up.railway.app' : window.location.origin);
    const productsHtml = cart.map(item => {
        const imgSrc = item.image?.startsWith('http') ? item.image : `${API_BASE_INTERNAL}${item.image}`;
        return `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="col-product">
                <img src="${imgSrc}" alt="${item.name}" class="product-thumb" onerror="this.style.display='none'; this.onerror=null;">
                <div class="product-details">
                    <h3>${item.name}</h3>
                    <p class="product-spec">${item.description}</p>
                </div>
            </div>
            <div class="col-price">
                <span class="price">R$ ${item.price.toFixed(2)}</span>
            </div>
            <div class="col-quantity">
                <div class="quantity-selector">
                    <button class="qty-btn qty-minus">−</button>
                    <input type="number" value="${item.quantity}" min="1" class="qty-input" readonly>
                    <button class="qty-btn qty-plus">+</button>
                </div>
            </div>
            <div class="col-subtotal">
                <span class="subtotal-price">R$ ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div class="col-remove">
                <button class="btn-remove" title="Remover item">🗑️</button>
            </div>
        </div>
        `;
    }).join('');

    const fullHtml = `
        <div class="cart-table-header">
            <div class="col-product">Produto</div>
            <div class="col-price">Preço Unit.</div>
            <div class="col-quantity">Quantidade</div>
            <div class="col-subtotal">Subtotal</div>
            <div class="col-remove"></div>
        </div>
        ${productsHtml}
        <div class="cart-actions">
            <a href="index.html" class="btn-continue-shopping">← Continuar Comprando</a>
            <button class="btn-update-cart">Atualizar Carrinho</button>
        </div>
    `;

    cartItemsSection.innerHTML = fullHtml;
    updateSummary();
    setupEventListeners();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        saveCart();
        updateCartItemRow(productId);
        updateSummary();
        showNotification('✅ Quantidade atualizada!', 'success');
    }
}

function removeFromCart(productId) {
    if (!confirm('Deseja remover este item do carrinho?')) return;
    
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    const row = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
    if (row) row.remove();
    if (cart.length === 0) {
        renderCart();
    } else {
        updateSummary();
    }
    showNotification('🗑️ Item removido do carrinho', 'info');
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = parseFloat(localStorage.getItem('shippingCost') || 0);
    const discount = parseFloat(localStorage.getItem('discountAmount') || 0);
    const total = subtotal + shipping - discount;

    // Atualizar valores
    const subtotalEl = document.querySelector('.summary-row .value');
    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;

    const shippingEl = document.querySelector('.summary-row .value.shipping');
    if (shippingEl) {
        shippingEl.textContent = shipping > 0 ? `R$ ${shipping.toFixed(2)}` : 'A calcular';
    }

    const totalEl = document.querySelector('.total-row .value.total');
    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2)}`;

    // Mostrar desconto se houver
    const discountRow = document.querySelector('.discount-row');
    if (discountRow) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            const discountEl = discountRow.querySelector('.value.discount');
            if (discountEl) discountEl.textContent = `- R$ ${discount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }
    }
}

function applyCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const couponCode = couponInput.value.trim().toUpperCase();

    // Cupons válidos (exemplo)
    const validCoupons = {
        'DESCONTO10': 10,
        'PROMO20': 20,
        'VOLTAAS': 15,
        'PRIMEIRA': 25
    };

    if (!couponCode) {
        showNotification('⚠️ Digite um cupom válido', 'warning');
        return;
    }

    if (validCoupons[couponCode]) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPercent = validCoupons[couponCode];
        const discountAmount = (subtotal * discountPercent) / 100;
        
        localStorage.setItem('discountAmount', discountAmount);
        localStorage.setItem('appliedCoupon', couponCode);
        
        updateSummary();
        showNotification(`✅ Cupom "${couponCode}" aplicado! ${discountPercent}% de desconto`, 'success');
        couponInput.value = '';
    } else {
        showNotification('❌ Cupom inválido!', 'error');
    }
}

function calculateShipping() {
    const cepInput = document.getElementById('cep-input');
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        showNotification('⚠️ CEP inválido! Digite 8 dígitos', 'warning');
        return;
    }

    // Simulação de cálculo de frete
    showNotification('🔄 Calculando frete...', 'info');

    setTimeout(() => {
        // Frete simulado (em produção, usar API dos Correios)
        const shippingCost = Math.random() * 30 + 10; // Entre R$ 10 e R$ 40
        
        localStorage.setItem('shippingCost', shippingCost.toFixed(2));
        updateSummary();
        
        showNotification(`✅ Frete calculado: R$ ${shippingCost.toFixed(2)}`, 'success');
    }, 1500);
}

function checkout() {
    if (cart.length === 0) {
        showNotification('⚠️ Seu carrinho está vazio!', 'warning');
        return;
    }

    const shipping = parseFloat(localStorage.getItem('shippingCost') || 0);
    
    // Criar pedido (sem validação obrigatória de frete)
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: shipping,
        discount: parseFloat(localStorage.getItem('discountAmount') || 0),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shipping - parseFloat(localStorage.getItem('discountAmount') || 0),
        status: 'pending'
    };

    console.log('📦 [CHECKOUT] Criando pedido:', order);

    // 1. Salvar no localStorage (local)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    console.log('💾 [CHECKOUT] Pedido salvo no localStorage');

    // 2. Tentar salvar no backend (persistente)
    saveOrderToBackend(order);

    // Limpar carrinho
    cart = [];
    saveCart();
    localStorage.removeItem('shippingCost');
    localStorage.removeItem('discountAmount');
    localStorage.removeItem('appliedCoupon');

    showNotification('🎉 Pedido realizado com sucesso! Redirecionando...', 'success');

    // Salvar orçamento para exibir na página de orçamento
    localStorage.setItem('orcamento', JSON.stringify(order));
    setTimeout(() => {
        window.location.href = 'orcamento.html';
    }, 1200);
}

// Salvar pedido no backend
async function saveOrderToBackend(order) {
    try {
        const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || (window.location.origin.includes('vercel') || window.location.origin.includes('localhost') ? 'https://extremsportladingpage-production.up.railway.app' : window.location.origin);
        
        console.log(`🌐 [BACKEND] Enviando pedido para: ${API_BASE}/api/orders`);
        
        const response = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ [BACKEND] Pedido salvo no servidor:', result);
        } else {
            console.warn('⚠️ [BACKEND] Erro ao salvar:', response.status);
        }
    } catch (error) {
        console.error('❌ [BACKEND] Erro ao conectar:', error);
        // Falha silenciosa - o pedido já está no localStorage
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar ao carrinho (chamado da página principal)
function addToCart(productId) {

    let products = JSON.parse(localStorage.getItem('products') || '[]');
    let product = products.find(p => p.id === productId);
    // Se não encontrou, tenta buscar da API
    if (!product) {
        fetch(`${API_BASE}/api/products/${productId}`)
            .then(resp => resp.ok ? resp.json() : null)
            .then(prod => {
                if (!prod) {
                    showNotification('❌ Produto não encontrado!', 'error');
                    return;
                }
                addToCartResolved(prod);
            });
        return;
    }
    addToCartResolved(product);
}

function addToCartResolved(product) {
    let item = cart.find(i => i.id === product.id);
    if (item) {
        item.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.priceCurrent,
            image: product.image,
            quantity: 1
        });
    }
    saveCart();
    showNotification('✅ Produto adicionado ao carrinho!', 'success');

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.priceCurrent,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification('✅ Produto adicionado ao carrinho!', 'success');
}

// Exportar funções globais
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;

// ============ B2B (Empresa/CNPJ) ============
async function enviarOrcamentoB2B() {
    if (cart.length === 0) {
        showNotification('⚠️ Seu carrinho está vazio!', 'warning');
        return;
    }

    const shipping = parseFloat(localStorage.getItem('shippingCost') || 0);
    if (shipping === 0) {
        showNotification('⚠️ Calcule o frete antes de solicitar orçamento B2B', 'warning');
        return;
    }

    const cnpj = (document.getElementById('b2b-cnpj')?.value || '').trim();
    const razaoSocial = (document.getElementById('b2b-razao')?.value || '').trim();
    const email = (document.getElementById('b2b-email')?.value || '').trim();
    const telefone = (document.getElementById('b2b-phone')?.value || '').trim();
    const notes = (document.getElementById('b2b-notes')?.value || '').trim();

    if (!cnpj || !razaoSocial) {
        showNotification('⚠️ Informe CNPJ e Razão Social', 'warning');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = parseFloat(localStorage.getItem('discountAmount') || 0);
    const total = subtotal + shipping - discount;

    const payload = {
        company: { cnpj, razaoSocial, email, telefone },
        items: cart.map(it => ({
            productId: it.id,
            name: it.name,
            price: Number(it.price),
            quantity: Number(it.quantity)
        })),
        discount,
        shipping,
        notes
    };

    try {
        showNotification('🔄 Enviando orçamento B2B...', 'info');
        const resp = await fetch(`${API_BASE}/api/company-quotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || 'Falha ao enviar orçamento');
        }
        const data = await resp.json();

        // Mostrar resultado e links de exportação
        const resBox = document.getElementById('b2b-result');
        const resMsg = document.getElementById('b2b-result-msg');
        const resLinks = document.getElementById('b2b-export-links');
        if (resBox && resMsg && resLinks) {
            resBox.style.display = 'block';
            resMsg.textContent = `✅ Orçamento #${data.id} criado com sucesso! Total: R$ ${Number(data.total).toFixed(2)}`;
            resLinks.innerHTML = `
                <a class="btn-primary" style="flex:1; text-align:center;" href="${API_BASE}/api/company-quotes/${data.id}/export?format=xlsx" target="_blank">Baixar Excel (.xlsx)</a>
                <a class="btn-secondary" style="flex:1; text-align:center;" href="${API_BASE}/api/company-quotes/${data.id}/export?format=docx" target="_blank">Baixar Word (.docx)</a>
            `;
        }

        showNotification('🎉 Orçamento B2B enviado!', 'success');
    } catch (e) {
        console.error(e);
        showNotification(`❌ ${e.message}`, 'error');
    }
}

// Garante CSS fixo para notificações no carrinho (evita tremidas/reflow)
function ensureNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        background: #333;
        color: #fff;
    }
    .notification.show { transform: translateX(0); }
    .notification-success { background-color: #98D447; color: #fff; }
    .notification-error { background-color: #dc3545; color: #fff; }
    .notification-warning { background-color: #ffc107; color: #333; }
    .notification-info { background-color: #17a2b8; color: #fff; }
    `;
    document.head.appendChild(style);
}

function updateCartItemRow(productId) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    const row = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
    if (!row) return;
    const qtyInput = row.querySelector('.qty-input');
    const subtotalEl = row.querySelector('.subtotal-price');
    if (qtyInput) qtyInput.value = item.quantity;
    if (subtotalEl) subtotalEl.textContent = `R$ ${(item.price * item.quantity).toFixed(2)}`;
}

// ==========================================
// VERIFICAR E ATIVAR FRETE DINAMICAMENTE
// ==========================================
function checkAndEnableShipping() {
    const shippingSettings = getShippingConfigFromAdmin();
    const shippingCalculator = document.getElementById('shipping-calculator');
    
    if (shippingSettings.enabled) {
        if (shippingCalculator) {
            shippingCalculator.style.display = 'block';
        }
        
        // Se é frete fixo ou progressivo, atualizar resumo
        if (shippingSettings.type === 'fixed') {
            applyFixedShipping(shippingSettings.value);
        }
    } else {
        if (shippingCalculator) {
            shippingCalculator.style.display = 'none';
        }
        localStorage.removeItem('shippingCost');
        updateSummary();
    }
    
    // Monitorar mudanças nas configurações
    window.addEventListener('storage', function(e) {
        if (e.key === 'shippingSettings') {
            checkAndEnableShipping();
        }
    });
}

function getShippingConfigFromAdmin() {
    const settings = localStorage.getItem('shippingSettings');
    if (settings) {
        try {
            return JSON.parse(settings);
        } catch (e) {
            return getDefaultShippingConfig();
        }
    }
    return getDefaultShippingConfig();
}

function getDefaultShippingConfig() {
    return {
        enabled: false,
        type: 'fixed',
        value: 0,
        progressiveBase: 100,
        info: 'Entrega em até 5 dias úteis'
    };
}

function applyFixedShipping(value) {
    localStorage.setItem('shippingCost', value.toFixed(2));
    updateSummary();
}
