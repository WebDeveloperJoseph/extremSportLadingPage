/**
 * Dashboard Admin Moderno
 * Com gráficos interativos e dados em tempo real
 */

let salesChart, categoriesChart;
let currentOrdersPage = 1;
let currentProductsPage = 1;
let ordersPerPage = 5;
let productsPerPage = 4;

document.addEventListener('DOMContentLoaded', function() {
    // Atualizar data
    updateCurrentDate();
    
    // Carregar dados
    loadDashboardData();
    
    // Inicializar gráficos
    initCharts();
    
    // Atualizar dados a cada minuto
    setInterval(loadDashboardData, 60000);
});

function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', options);
    document.getElementById('currentDate').textContent = dateStr;
}

function loadDashboardData() {
    // Carregar pedidos do localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Calcular estatísticas
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalProducts = products.length;
    const totalCustomers = new Set(orders.map(o => o.customerEmail || 'anonymous')).size;
    
    // Atualizar cards
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalCustomers').textContent = totalCustomers;
    
    // Atualizar tabela de pedidos
    updateOrdersTable(orders);
    
    // Atualizar produtos mais vendidos
    updateTopProducts(orders);
    
    // Atualizar gráficos
    updateCharts(orders);
}

function updateOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    Nenhum pedido realizado ainda
                </td>
            </tr>
        `;
        return;
    }
    
    // Calcular paginação
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const startIndex = (currentOrdersPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = orders.slice(-orders.length).reverse().slice(startIndex, endIndex);
    
    // Renderizar linhas
    tbody.innerHTML = paginatedOrders.map(order => {
        const date = new Date(order.date);
        const dateStr = date.toLocaleDateString('pt-BR');
        const status = getStatusBadge(order.status || 'pending');
        
        return `
            <tr class="order-row">
                <td><strong>#${order.id}</strong></td>
                <td>${dateStr}</td>
                <td>Orçamento</td>
                <td><strong>R$ ${(order.total || 0).toFixed(2)}</strong></td>
                <td>${status}</td>
                <td>
                    <button class="btn-action" onclick="viewOrder(${order.id})">Ver</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Adicionar paginação se necessário
    if (totalPages > 1) {
        createPagination('ordersTableBody', totalPages, currentOrdersPage, (page) => {
            currentOrdersPage = page;
            updateOrdersTable(orders);
        });
    }
}

function createPagination(tableId, totalPages, currentPage, onPageChange) {
    const container = document.querySelector('.orders-table');
    
    // Remover paginação anterior se existir
    const oldPagination = container.querySelector('.pagination');
    if (oldPagination) oldPagination.remove();
    
    // Criar nova paginação
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
        padding: 16px 0;
        border-top: 1px solid #e5e7eb;
    `;
    
    // Botão anterior
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Anterior';
        prevBtn.className = 'pagination-btn';
        prevBtn.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            color: #667eea;
            transition: all 0.2s;
        `;
        prevBtn.onmouseover = () => prevBtn.style.background = '#f9fafb';
        prevBtn.onmouseout = () => prevBtn.style.background = 'white';
        prevBtn.onclick = () => onPageChange(currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.style.cssText = `
            width: 36px;
            height: 36px;
            border: 1px solid #e5e7eb;
            background: ${i === currentPage ? '#98D447' : 'white'};
            color: ${i === currentPage ? 'white' : '#6b7280'};
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        `;
        pageBtn.onmouseover = () => {
            if (i !== currentPage) {
                pageBtn.style.background = '#f9fafb';
                pageBtn.style.borderColor = '#98D447';
            }
        };
        pageBtn.onmouseout = () => {
            if (i !== currentPage) {
                pageBtn.style.background = 'white';
                pageBtn.style.borderColor = '#e5e7eb';
            }
        };
        pageBtn.onclick = () => onPageChange(i);
        pagination.appendChild(pageBtn);
    }
    
    // Botão próximo
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Próximo →';
        nextBtn.className = 'pagination-btn';
        nextBtn.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            color: #667eea;
            transition: all 0.2s;
        `;
        nextBtn.onmouseover = () => nextBtn.style.background = '#f9fafb';
        nextBtn.onmouseout = () => nextBtn.style.background = 'white';
        nextBtn.onclick = () => onPageChange(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
    
    container.appendChild(pagination);
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="status-badge status-pending">⏳ Pendente</span>',
        'confirmed': '<span class="status-badge status-confirmed">✅ Confirmado</span>',
        'shipped': '<span class="status-badge status-shipped">📦 Enviado</span>',
        'delivered': '<span class="status-badge status-delivered">🎉 Entregue</span>',
        'cancelled': '<span class="status-badge status-cancelled">❌ Cancelado</span>'
    };
    return badges[status] || badges['pending'];
}

function updateTopProducts(orders) {
    const productSales = {};
    
    // Contar vendas por produto
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const key = item.name || `Produto ${item.id}`;
                productSales[key] = (productSales[key] || 0) + item.quantity;
            });
        }
    });
    
    // Ordenar por vendas
    const allTopProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1]);
    
    // Paginação de produtos
    const totalPages = Math.ceil(allTopProducts.length / productsPerPage);
    const startIndex = (currentProductsPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = allTopProducts.slice(startIndex, endIndex);
    
    const container = document.getElementById('topProductsList');
    
    if (allTopProducts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 40px; grid-column: 1 / -1;">
                Nenhuma venda realizada ainda
            </div>
        `;
        return;
    }
    
    container.innerHTML = paginatedProducts.map(([name, sales], index) => `
        <div class="product-top-card" style="animation-delay: ${index * 50}ms;">
            <div class="product-badge">#${sales}</div>
            <div class="product-name">${name}</div>
            <div class="product-sales">${sales} venda${sales !== 1 ? 's' : ''}</div>
        </div>
    `).join('');
    
    // Criar paginação se necessário
    if (totalPages > 1) {
        createProductsPagination('topProductsList', totalPages, currentProductsPage, (page) => {
            currentProductsPage = page;
            updateTopProducts(orders);
        });
    }
}

function createProductsPagination(containerId, totalPages, currentPage, onPageChange) {
    const container = document.querySelector('.products-grid-small');
    
    // Remover paginação anterior
    const oldPagination = container.querySelector('.products-pagination');
    if (oldPagination) oldPagination.remove();
    
    // Criar paginação
    const pagination = document.createElement('div');
    pagination.className = 'products-pagination';
    pagination.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
        padding: 16px 0;
        grid-column: 1 / -1;
    `;
    
    // Botões
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.cssText = `
            width: 32px;
            height: 32px;
            border: 2px solid ${i === currentPage ? '#98D447' : '#e5e7eb'};
            background: ${i === currentPage ? '#98D447' : 'white'};
            color: ${i === currentPage ? 'white' : '#6b7280'};
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
            font-size: 12px;
        `;
        btn.onmouseover = () => {
            if (i !== currentPage) btn.style.borderColor = '#98D447';
        };
        btn.onmouseout = () => {
            if (i !== currentPage) btn.style.borderColor = '#e5e7eb';
        };
        btn.onclick = () => onPageChange(i);
        pagination.appendChild(btn);
    }
    
    container.appendChild(pagination);
}

function initCharts() {
    // Gráfico de Vendas
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
            datasets: [{
                label: 'Vendas (R$)',
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { size: 12 }, usePointStyle: true }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => `R$ ${v}` }
                }
            }
        }
    });
    
    // Gráfico de Categorias
    const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
    categoriesChart = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Mochilas', 'Canetas', 'Cadernos', 'Estojos', 'Outros'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f59e0b',
                    '#10b981',
                    '#ef4444'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 12 }, padding: 15 }
                }
            }
        }
    });
}

function updateCharts(orders) {
    if (!salesChart || !categoriesChart) return;
    
    // Calcular vendas por dia
    const salesByDay = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    
    orders.forEach(order => {
        const orderDate = new Date(order.date);
        const dayDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        if (dayDiff < 7) {
            const dayIndex = 6 - dayDiff;
            if (dayIndex >= 0) {
                salesByDay[dayIndex] += order.total || 0;
            }
        }
    });
    
    salesChart.data.datasets[0].data = salesByDay;
    salesChart.update();
    
    // Calcular vendas por categoria (simulado)
    const categoryData = [0, 0, 0, 0, 0];
    const categories = ['mochilas', 'canetas', 'cadernos', 'estojos'];
    
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const name = (item.name || '').toLowerCase();
                if (name.includes('mochila')) categoryData[0] += item.quantity;
                else if (name.includes('caneta')) categoryData[1] += item.quantity;
                else if (name.includes('caderno')) categoryData[2] += item.quantity;
                else if (name.includes('estojo')) categoryData[3] += item.quantity;
                else categoryData[4] += item.quantity;
            });
        }
    });
    
    categoriesChart.data.datasets[0].data = categoryData;
    categoriesChart.update();
}

function viewOrder(orderId) {
    // Buscar pedido nos dados
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        // Armazenar para visualização detalhada
        localStorage.setItem('selectedOrder', JSON.stringify(order));
        alert(`📋 Pedido #${orderId}\n\n` +
              `Total: R$ ${(order.total || 0).toFixed(2)}\n` +
              `Itens: ${order.items ? order.items.length : 0}\n` +
              `Status: ${order.status || 'Pendente'}`);
    }
}

// Formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}
