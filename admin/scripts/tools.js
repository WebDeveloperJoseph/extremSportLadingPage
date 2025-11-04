// Restringe a página a super_admin
(async function ensureSuperAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return; }
  const { data: admin } = await supabase.from('admins').select('*').eq('id', session.user.id).single();
  if (!admin || admin.role !== 'super_admin') {
    alert('Acesso restrito a super_admin.');
    window.location.href = 'painel.html';
  }
})();

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><div class="toast-content"><div class="toast-title">Ferramentas</div><div class="toast-message">${message}</div></div><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 5000);
}

function copiarSQL(codeId) {
  const el = document.getElementById(codeId);
  if (!el) return;
  const text = el.innerText.replace(/\\n/g, '\n');
  navigator.clipboard.writeText(text).then(() => {
    showToast('SQL copiado para a área de transferência', 'success');
  }).catch(() => showToast('Falha ao copiar SQL', 'error'));
}
