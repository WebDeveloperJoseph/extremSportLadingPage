// Lista e diagnóstico de clientes

function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const titles = { success: title || 'Sucesso!', error: title || 'Erro!', warning: title || 'Atenção!', info: title || 'Informação' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><div class="toast-content"><div class="toast-title">${titles[type]}</div><div class="toast-message">${message}</div></div><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 5000);
}

async function carregarClientes() {
  try {
    const container = document.getElementById('clientesLista');
    container.innerHTML = 'Carregando...';
    const termo = (document.getElementById('buscaCliente').value || '').trim().toLowerCase();

    let query = supabase.from('clientes').select('*').order('created_at', { ascending: false });
    const { data: clientes, error } = await query;
    if (error) throw error;

    const filtrados = clientes?.filter(c => {
      if (!termo) return true;
      return (c.nome || '').toLowerCase().includes(termo) || (c.email || '').toLowerCase().includes(termo);
    }) || [];

    if (filtrados.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <p>Nenhum cliente encontrado</p>
          <p style="opacity:.8">Faça um checkout no site para gerar o primeiro cliente.</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
          </tr>
        </thead>
        <tbody>
          ${filtrados.map(c => `
            <tr>
              <td>#${c.id}</td>
              <td>${c.nome || '-'}</td>
              <td>${c.email || '-'}</td>
              <td>${c.telefone || '-'}</td>
              <td>${formatarData(c.created_at)}</td>
              <td>${formatarData(c.updated_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    showToast(`${filtrados.length} cliente(s) carregado(s)`, 'success');
  } catch (e) {
    console.error('Erro ao carregar clientes:', e);
    showToast(e.message || 'Erro ao carregar clientes', 'error');
    document.getElementById('clientesLista').innerHTML = `
      <div class="empty-state">
        <div class="icon">❌</div>
        <p>Erro ao carregar clientes</p>
        <p style="color: var(--danger-color); font-size: 0.9rem;">${e.message}</p>
      </div>`;
  }
}

function formatarData(dataISO) {
  if (!dataISO) return '-';
  const d = new Date(dataISO);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

document.addEventListener('DOMContentLoaded', () => {
  const busca = document.getElementById('buscaCliente');
  if (busca) busca.addEventListener('input', () => carregarClientes());
  carregarClientes();
});

async function diagnosticarClientes() {
  try {
    showToast('Diagnóstico de clientes...', 'info');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { showToast('Sem sessão.', 'error'); return; }

    const { data: admin, error: adminErr } = await supabase
      .from('admins').select('id, role').eq('id', session.user.id).single();
    if (adminErr || !admin) showToast('Usuário não é admin na tabela admins.', 'error');
    else showToast(`Admin OK (${admin.role})`, 'success');

    const { count, error: cntErr } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });
    if (cntErr) showToast(`Erro ao contar clientes: ${cntErr.message}`, 'error');
    else showToast(`Clientes acessíveis. Quantidade: ${count ?? 0}`, count ? 'success' : 'warning');
  } catch (e) {
    console.error('Diagnóstico clientes falhou:', e);
    showToast(e.message || 'Diagnóstico clientes falhou', 'error');
  }
}
