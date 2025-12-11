// Admin Banners via backend + upload
const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:3333';
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderBanners();
  document.getElementById('btnNewBanner')?.addEventListener('click', openNew);
  document.getElementById('btnSaveBanner')?.addEventListener('click', saveBanner);
  document.getElementById('btnCancelBanner')?.addEventListener('click', closeModal);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // atalho: duplo clique no campo imagem abre seletor de arquivo
  const imgInput = document.getElementById('bnImage');
  if (imgInput) {
    imgInput.addEventListener('dblclick', async () => {
      const file = await pickImageFile();
      if (file) imgInput.value = file;
    });
  }
});

async function pickImageFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return resolve(null);
      const form = new FormData();
      form.append('file', input.files[0]);
      try {
        const resp = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form });
        if (!resp.ok) throw new Error();
        const data = await resp.json();
        resolve(data.url);
      } catch (e) {
        alert('Falha ao enviar imagem');
        resolve(null);
      }
    };
    input.click();
  });
}

async function fetchBanners() {
  const resp = await fetch(`${API_BASE}/api/banners`);
  if (!resp.ok) throw new Error();
  return resp.json();
}

async function renderBanners() {
  const box = document.getElementById('bannerList');
  box.innerHTML = 'Carregando...';
  try {
    const list = await fetchBanners();
    if (list.length === 0) { box.innerHTML = '<p>Nenhum banner cadastrado.</p>'; return; }
    box.innerHTML = list.map(b => `
      <div class="product-row" style="display:flex; align-items:center; gap:12px; padding:10px; background:#fff; border-radius:10px; box-shadow: 0 1px 4px rgba(0,0,0,.06); margin-bottom:10px;">
        <img src="${b.image?.startsWith('http') ? b.image : API_BASE + b.image}" onerror="this.style.display='none'; this.onerror=null;" style="width:80px;height:50px;object-fit:cover;border-radius:6px;"/>
        <div style="flex:1;">
          <div style="font-weight:700;">${b.title}</div>
          <div style="font-size:.9rem;color:#666;">${b.subtitle||''}</div>
          <div style="font-size:.85rem;color:#999;">Ordem: ${b.ord||0} • ${b.active? 'Ativo' : 'Inativo'}</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-secondary" onclick='editBanner(${JSON.stringify(b).replace(/'/g,"&apos;")})'>Editar</button>
          <button class="btn-danger" onclick='deleteBanner(${b.id})'>Excluir</button>
        </div>
      </div>
    `).join('');
    updatePreview();
  } catch (e) {
    box.innerHTML = '<p>Falha ao carregar banners</p>';
  }
}

// ATUALIZA PREVIEW EM TEMPO REAL
async function updatePreview() {
  const preview = document.querySelector('.slides-preview');
  if (!preview) return;
  
  try {
    const list = await fetchBanners();
    const banners = list.filter(b => !!b.active).sort((a,b)=> (a.ord||0)-(b.ord||0));
    
    if (banners.length === 0) {
      preview.innerHTML = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#999;">Nenhum banner ativo</div>';
      return;
    }

    preview.innerHTML = banners.map((b, idx) => `
      <div class="slide${idx===0?' active':''}" style="position:absolute; width:100%; height:100%; background-image:url('${b.image?.startsWith('http') ? b.image : API_BASE + b.image}'); background-size:cover; background-position:center; display:${idx===0?'flex':'none'}; align-items:center; justify-content:center; flex-direction:column; color:white; text-shadow:0 2px 10px rgba(0,0,0,0.5);">
        <div style="text-align:center; z-index:2;">
          <h2 style="margin:0; font-size:2rem;">${b.title}</h2>
          <p style="margin:10px 0 0 0; font-size:1.1rem;">${b.subtitle||''}</p>
          ${b.link ? `<a href="${b.link}" style="display:inline-block; margin-top:15px; padding:10px 20px; background:#FF8C00; color:white; border-radius:6px; text-decoration:none; font-weight:600;">Ver mais</a>` : ''}
        </div>
      </div>
    `).join('');

    setupPreviewControls(banners);
  } catch (e) {
    console.error('Erro ao atualizar preview:', e);
  }
}

function setupPreviewControls(banners) {
  const prev = document.querySelector('.prev-preview');
  const next = document.querySelector('.next-preview');
  const slides = Array.from(document.querySelectorAll('.slides-preview .slide'));
  let index = 0;

  function show(i) {
    slides.forEach((s, k) => {
      s.style.display = k === i ? 'flex' : 'none';
    });
    index = i;
  }

  function step(dir) {
    const n = slides.length;
    show(((index + dir) % n + n) % n);
  }

  if (prev) prev.addEventListener('click', () => step(-1));
  if (next) next.addEventListener('click', () => step(1));

  // Auto-rotate
  setInterval(() => step(1), 5000);
}

function openNew() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Novo Banner';
  document.getElementById('bnImage').value = '';
  document.getElementById('bnTitle').value = '';
  document.getElementById('bnSubtitle').value = '';
  document.getElementById('bnLink').value = '';
  document.getElementById('bnOrder').value = 1;
  document.getElementById('bnActive').value = 'true';
  openModal();
}

window.editBanner = (b) => {
  editingId = b.id;
  document.getElementById('modalTitle').textContent = 'Editar Banner';
  document.getElementById('bnImage').value = b.image||'';
  document.getElementById('bnTitle').value = b.title||'';
  document.getElementById('bnSubtitle').value = b.subtitle||'';
  document.getElementById('bnLink').value = b.link||'';
  document.getElementById('bnOrder').value = b.ord||1;
  document.getElementById('bnActive').value = String(!!b.active);
  openModal();
}

async function saveBanner() {
  const image = document.getElementById('bnImage').value.trim();
  const title = document.getElementById('bnTitle').value.trim();
  const subtitle = document.getElementById('bnSubtitle').value.trim();
  const link = document.getElementById('bnLink').value.trim();
  const ord = Number(document.getElementById('bnOrder').value)||1;
  const active = document.getElementById('bnActive').value === 'true';
  if (!image || !title) { alert('Informe ao menos Imagem e Título'); return; }
  try {
    if (editingId) {
      const resp = await fetch(`${API_BASE}/api/banners/${editingId}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ image, title, subtitle, link, ord, active }) });
      if (!resp.ok) throw new Error();
    } else {
      const resp = await fetch(`${API_BASE}/api/banners`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ image, title, subtitle, link, ord, active }) });
      if (!resp.ok) throw new Error();
    }
    closeModal();
    await renderBanners();
    await updatePreview();
  } catch (e) { alert('Falha ao salvar banner'); }
}

window.deleteBanner = async (id) => {
  if (!confirm('Excluir este banner?')) return;
  try {
    const resp = await fetch(`${API_BASE}/api/banners/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error();
    await renderBanners();
    await updatePreview();
  } catch (e) { alert('Falha ao excluir banner'); }
}

function openModal() { document.getElementById('bannerModal').style.display = 'block'; }
function closeModal() { document.getElementById('bannerModal').style.display = 'none'; }

function checkAuth() { return true; }
function logout() { window.location.href = 'login.html'; }

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderBanners();
  document.getElementById('btnNewBanner')?.addEventListener('click', openNew);
  document.getElementById('btnSaveBanner')?.addEventListener('click', saveBanner);
  document.getElementById('btnCancelBanner')?.addEventListener('click', closeModal);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
});
