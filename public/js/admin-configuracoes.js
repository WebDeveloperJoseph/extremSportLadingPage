const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:3333';

document.addEventListener('DOMContentLoaded', () => {
  bindAuth();
  loadHero();
  document.getElementById('btnUploadHero')?.addEventListener('click', uploadHero);
  document.getElementById('btnSaveHero')?.addEventListener('click', saveHero);
});

function bindAuth() {
  const logout = document.getElementById('logoutBtn');
  if (logout) logout.addEventListener('click', () => { window.location.href = 'login.html'; });
}

async function loadHero() {
  try {
    const resp = await fetch(`${API_BASE}/api/settings/heroImage`);
    if (!resp.ok) return;
    const data = await resp.json();
    const url = data?.value || '';
    const input = document.getElementById('heroImageUrl');
    const preview = document.getElementById('heroPreview');
    if (input) input.value = url;
    if (preview && url) preview.style.backgroundImage = `url('${url}')`;
  } catch {}
}

async function uploadHero() {
  const fileInput = document.getElementById('heroImageFile');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('Selecione um arquivo de imagem');
    return;
  }
  const form = new FormData();
  form.append('file', fileInput.files[0]);
  try {
    const resp = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form });
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    document.getElementById('heroImageUrl').value = data.url;
    const preview = document.getElementById('heroPreview');
    if (preview) preview.style.backgroundImage = `url('${data.url}')`;
    alert('✅ Imagem do Hero enviada!');
  } catch (e) {
    alert('Falha ao enviar imagem');
  }
}

async function saveHero() {
  const url = document.getElementById('heroImageUrl').value.trim();
  try {
    const resp = await fetch(`${API_BASE}/api/settings/heroImage`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: url })
    });
    if (!resp.ok) throw new Error();
    alert('✅ Hero atualizado!');
  } catch (e) {
    alert('Falha ao salvar configuração do Hero');
  }
}
