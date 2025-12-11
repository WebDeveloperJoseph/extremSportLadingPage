const API_BASE = 'http://localhost:3333';
let allProducts = [];

async function loadProducts() {
  try {
    const resp = await fetch(`${API_BASE}/api/products`);
    if (!resp.ok) throw new Error();
    allProducts = await resp.json();
    renderPromotions();
  } catch (e) {
    console.error('Erro ao carregar produtos:', e);
  }
}

function renderPromotions() {
  const list = document.getElementById('promotionsList');
  
  // Filtrar produtos com preço antigo (promoções)
  const promos = allProducts.filter(p => p.priceOld && p.priceOld > 0);
  
  if (promos.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Nenhum produto em promoção. <a href="produtos.html">Adicione promoções aos produtos →</a></p>';
    return;
  }

  list.innerHTML = promos.map(p => {
    const desconto = p.discount || Math.round(((p.priceOld - p.priceCurrent) / p.priceOld) * 100);
    return `
      <div class="product-row" style="display:flex; align-items:center; gap:12px; padding:12px; background:#fff; border-radius:10px; box-shadow: 0 1px 4px rgba(0,0,0,.06); margin-bottom:10px; border-left:4px solid #ff6b6b;">
        <img src="${p.image?.startsWith('http') ? p.image : API_BASE + p.image}" 
             onerror="this.style.display='none'" 
             style="width:80px; height:80px; object-fit:cover; border-radius:6px;"/>
        <div style="flex:1;">
          <div style="font-weight:700; margin-bottom:4px;">${p.name}</div>
          <div style="font-size:0.9rem; color:#666; margin-bottom:6px;">${p.description || 'Sem descrição'}</div>
          <div style="display:flex; gap:12px; align-items:center;">
            <span style="text-decoration:line-through; color:#999;">R$ ${p.priceOld?.toFixed(2)}</span>
            <span style="font-weight:700; color:#ff6b6b; font-size:1.1rem;">R$ ${p.priceCurrent?.toFixed(2)}</span>
            <span style="background:#ff6b6b; color:#fff; padding:4px 8px; border-radius:4px; font-weight:700; font-size:0.85rem;">-${desconto}%</span>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-secondary" onclick="editPromotion(${p.id})">Editar</button>
          <button class="btn-warning" onclick="removePromotion(${p.id})">Remover Promo</button>
        </div>
      </div>
    `;
  }).join('');
}

async function editPromotion(productId) {
  // Redireciona para produtos.html para editar
  window.location.href = `produtos.html?edit=${productId}&type=promotion`;
}

async function removePromotion(productId) {
  if (!confirm('Remover promoção deste produto?')) return;
  
  try {
    const resp = await fetch(`${API_BASE}/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        priceOld: 0, 
        discount: 0 
      })
    });
    if (!resp.ok) throw new Error();
    await loadProducts();
  } catch (e) {
    alert('❌ Erro ao remover promoção');
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  document.getElementById('logoutBtn')?.addEventListener('click', () => window.location.href = 'login.html');
});
