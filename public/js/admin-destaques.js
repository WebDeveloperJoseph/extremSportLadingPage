// Admin Destaques - seleciona produtos por grupo (maisVendidos, novidades, promocoes)

const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:3333';
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderGroups();
  document.getElementById('btnSaveGroups')?.addEventListener('click', saveGroups);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
});

async function getProducts() {
  const resp = await fetch(`${API_BASE}/api/products`);
  if (!resp.ok) throw new Error();
  return resp.json();
}

async function getFeaturedGroups() {
  const resp = await fetch(`${API_BASE}/api/featured-groups`);
  if (!resp.ok) throw new Error();
  return resp.json();
}

async function setFeaturedGroups(groups) {
  const resp = await fetch(`${API_BASE}/api/featured-groups`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(groups) });
  if (!resp.ok) throw new Error();
}

async function renderGroups() {
  const [groups, productsAll] = await Promise.all([getFeaturedGroups(), getProducts()]);
  const products = productsAll.filter(p => !!p.active);
  const container = document.getElementById('groupsContainer');
  if (!container) return;

  const groupDefs = [
    { key: 'maisVendidos', title: 'Mais Vendidos' },
    { key: 'novidades', title: 'Novidades' },
    { key: 'promocoes', title: 'Promoções' }
  ];

  container.innerHTML = groupDefs.map(g => `
    <div class="card" style="padding:16px; background:#fff; border-radius:12px; box-shadow: 0 1px 4px rgba(0,0,0,.06); margin-bottom:16px;">
      <h3 style="margin-bottom:8px;">${g.title}</h3>
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
        ${products.map(p => `
          <label style="display:flex; gap:8px; align-items:center; background:#fafafa; border:1px solid #eee; padding:8px; border-radius:8px;">
            <input type="checkbox" data-group="${g.key}" value="${p.id}" ${groups[g.key]?.includes(p.id)?'checked':''}>
            <span>${p.name}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
}

async function saveGroups() {
  const groups = { maisVendidos: [], novidades: [], promocoes: [] };
  document.querySelectorAll('input[type="checkbox"][data-group]').forEach(cb => {
    const key = cb.getAttribute('data-group');
    const id = Number(cb.value);
    if (cb.checked) groups[key].push(id);
  });
  try {
    await setFeaturedGroups(groups);
    alert('Destaques salvos!');
  } catch (e) {
    alert('Falha ao salvar destaques');
  }
}

function checkAuth() { return true; }
function logout() { window.location.href = 'login.html'; }
