// Gerenciamento de Pedidos
let orders = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadOrders();
    setupEventListeners();
});

function checkAuth() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true' && 
        localStorage.getItem('adminRemember') !== 'true') {
        window.location.href = 'login.html';
    }
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('filterStatus').addEventListener('change', filterOrders);
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    document.getElementById('orderModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminRemember');
    window.location.href = 'login.html';
}

function loadOrders() {
    // Carregar do backend primeiro (persistente)
    loadOrdersFromBackend();
    
    // Fallback: carregar do localStorage
    const localOrders = getOrders();
    if (localOrders.length > 0) {
        orders = localOrders;
        renderOrders(orders);
        updateStats();
    }
}

async function loadOrdersFromBackend() {
    try {
        const API_BASE = window.API_BASE || localStorage.getItem('API_BASE') || window.location.origin;
        console.log(`🔌 Carregando pedidos do backend: ${API_BASE}/api/orders`);
        
        const response = await fetch(`${API_BASE}/api/orders`);
        if (response.ok) {
            const backendOrders = await response.json();
            console.log(`✅ ${backendOrders.length} pedidos carregados do backend`);
            
            // Converter items de string JSON se necessário
            orders = backendOrders.map(order => {
                if (typeof order.items === 'string') {
                    order.items = JSON.parse(order.items);
                }
                return order;
            });
            
            renderOrders(orders);
            updateStats();
            
            // Salvar no localStorage para cache
            localStorage.setItem('orders', JSON.stringify(orders));
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar pedidos do backend:', error);
        // Fallback automático para localStorage
    }
}

function getOrders() {
    const data = localStorage.getItem('orders');
    return data ? JSON.parse(data) : [];
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function renderOrders(ordersToRender) {
    const grid = document.getElementById('ordersGrid');

    if (ordersToRender.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;"><h2>Nenhum pedido encontrado</h2><p>Comece a receber pedidos dos clientes!</p></div>';
        return;
    }

    grid.innerHTML = ordersToRender.map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <div class="order-id">
                    <h3>#${order.id}</h3>
                    <p class="order-date">${formatDate(order.date)}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                </div>
            </div>

            <div class="order-card-body">
                <div class="order-info">
                    <div class="info-item">
                        <span class="label">Itens:</span>
                        <span class="value">${order.items.length} produto(s)</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Subtotal:</span>
                        <span class="value">R$ ${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Frete:</span>
                        <span class="value">R$ ${order.shipping.toFixed(2)}</span>
                    </div>
                    <div class="info-item total">
                        <span class="label">Total:</span>
                        <span class="value">R$ ${order.total.toFixed(2)}</span>
                    </div>
                </div>

                <div class="order-status-select">
                    <label>Atualizar Status:</label>
                    <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processando</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregue</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
            </div>

            <div class="order-card-footer">
                <button class="btn-view" onclick="viewOrderDetails(${order.id})">👁️ Ver Detalhes</button>
                <button class="btn-delete" onclick="deleteOrder(${order.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('shippedOrders').textContent = shippedOrders;
    document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;
}

function filterOrders() {
    const status = document.getElementById('filterStatus').value;
    
    if (!status) {
        renderOrders(orders);
        return;
    }

    const filtered = orders.filter(o => o.status === status);
    renderOrders(filtered);
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        order.status = newStatus;
        saveOrders();
        updateStats();
        showNotification('✅ Status atualizado com sucesso!', 'success');
    }
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;

    document.getElementById('orderIdModal').textContent = `#${order.id}`;
    
    const content = `
        <div style="margin-bottom: 25px;">
            <h3 style="margin-bottom: 15px; color: #333;">Informações do Pedido</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div>
                    <strong>Data:</strong> ${formatDate(order.date)}
                </div>
                <div>
                    <strong>Status:</strong> <span style="color: #FF8C00;">${getStatusText(order.status)}</span>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 25px;">
            <h3 style="margin-bottom: 15px; color: #333;">Itens do Pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f4f4f4;">
                        <th style="padding: 10px; text-align: left;">Produto</th>
                        <th style="padding: 10px; text-align: center;">Qtd</th>
                        <th style="padding: 10px; text-align: right;">Preço Unit.</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr style="border-bottom: 1px solid #e0e0e0;">
                            <td style="padding: 10px;">${item.name}</td>
                            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                            <td style="padding: 10px; text-align: right;">R$ ${item.price.toFixed(2)}</td>
                            <td style="padding: 10px; text-align: right;"><strong>R$ ${(item.price * item.quantity).toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div style="border-top: 2px solid #e0e0e0; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>R$ ${order.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Frete:</span>
                <span>R$ ${order.shipping.toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #28a745;">
                    <span>Desconto:</span>
                    <span>- R$ ${order.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 700; color: #FF8C00; margin-top: 15px;">
                <span>Total:</span>
                <span>R$ ${order.total.toFixed(2)}</span>
            </div>
        </div>
    `;

    document.getElementById('orderDetailsContent').innerHTML = content;
    document.getElementById('orderModal').classList.add('active');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'processing': 'Processando',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

function deleteOrder(orderId) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    orders = orders.filter(o => o.id !== orderId);
    saveOrders();
    loadOrders();
    showNotification('🗑️ Pedido excluído com sucesso!', 'success');
}

function closeModal() {
    document.getElementById('orderModal').classList.remove('active');
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

window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.deleteOrder = deleteOrder;
