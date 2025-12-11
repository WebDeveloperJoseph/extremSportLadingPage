// Dashboard Admin
const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:3333';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    checkAuth();

    // Carregar estatísticas
    loadStats();

    // Carregar produtos recentes
    loadRecentProducts();

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
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

async function loadStats() {
    try {
        const resp = await fetch(`${API_BASE}/api/products`);
        const products = await resp.json();
        document.getElementById('totalProducts').textContent = products.length;
    } catch(e) {
        console.error('Erro ao carregar stats:', e);
    }
}

async function loadRecentProducts() {
    try {
        const resp = await fetch(`${API_BASE}/api/products`);
        const products = await resp.json();
        const recentList = document.getElementById('recentProductsList');

        if (products.length === 0) {
            recentList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum produto cadastrado ainda.</p>';
            return;
        }

        // Mostrar últimos 5 produtos
        const recent = products.slice(-5).reverse();
        
        recentList.innerHTML = recent.map(product => {
            const imgSrc = product.image?.startsWith('http') ? product.image : `${API_BASE}${product.image}`;
            return `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                <img src="${imgSrc}" alt="${product.name}" onerror="this.style.display='none'; this.onerror=null;" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; background-color: #e0e0e0;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; color: #333;">${product.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.85rem;">${product.category}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; color: #999; font-size: 0.85rem; text-decoration: line-through;">R$ ${product.priceOld.toFixed(2)}</p>
                    <p style="margin: 0; color: #FF8C00; font-weight: 700; font-size: 1.1rem;">R$ ${product.priceCurrent.toFixed(2)}</p>
                </div>
            </div>
            `;
        }).join('');
    } catch(e) {
        console.error('Erro ao carregar produtos recentes:', e);
    }
}
