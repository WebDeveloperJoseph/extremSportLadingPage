// Gerenciamento de Pedidos
let pedidoAtual = null;

// Toast util (compartilhado neste arquivo)
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const titles = {
        success: title || 'Sucesso!',
        error: title || 'Erro!',
        warning: title || 'Atenção!',
        info: title || 'Informação'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 5000);
}

async function carregarPedidos() {
    try {
        showToast('Carregando pedidos...', 'info');
        const filtroStatus = document.getElementById('filtroStatus').value;
        
        let query = supabase
            .from('pedidos')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (filtroStatus) {
            query = query.eq('status', filtroStatus);
        }
        
        const { data: pedidos, error } = await query;
        
        if (error) throw error;
        
        const container = document.getElementById('pedidosLista');
        const countElement = document.getElementById('totalCount');
        
        countElement.textContent = `${pedidos?.length || 0} pedidos`;
        
        if (!pedidos || pedidos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>Nenhum pedido encontrado</p>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                        <a class="btn" href="../index.html" target="_blank">Ir para a loja</a>
                    </div>
                </div>
            `;
            showToast('Nenhum pedido encontrado', 'warning');
            return;
        }
        
        container.innerHTML = `
            <div class="pedidos-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Total</th>
                            <th>Pagamento</th>
                            <th>Status</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos.map(pedido => `
                            <tr class="pedido-row" onclick="abrirDetalhesPedido(${pedido.id})">
                                <td><strong>#${pedido.id}</strong></td>
                                <td>${pedido.cliente_nome}</td>
                                <td>${pedido.cliente_email}</td>
                                <td><strong>R$ ${parseFloat(pedido.total).toFixed(2).replace('.', ',')}</strong></td>
                                <td>${formatarPagamento(pedido.forma_pagamento)}</td>
                                <td onclick="event.stopPropagation()">
                                    <select class="status-inline-select status-${pedido.status}" onchange="alterarStatusInline(${pedido.id}, this)">
                                        ${['pendente','confirmado','enviado','entregue','cancelado'].map(s => `
                                            <option value="${s}" ${s===pedido.status?'selected':''}>${s}</option>
                                        `).join('')}
                                    </select>
                                </td>
                                <td>${formatarData(pedido.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        showToast(`${pedidos.length} pedido(s) carregado(s)`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        document.getElementById('pedidosLista').innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <p>Erro ao carregar pedidos</p>
                <p style="color: var(--danger-color); font-size: 0.9rem;">${error.message}</p>
                <button class="btn" onclick="carregarPedidos()">Tentar novamente</button>
            </div>
        `;
        showToast(error.message || 'Erro ao carregar pedidos', 'error');
    }
}

// Atualização inline de status via <select>
async function alterarStatusInline(id, selectEl) {
    const novoStatus = selectEl.value;
    try {
        showToast(`Atualizando status do pedido #${id}...`, 'info');
        const { error } = await supabase
            .from('pedidos')
            .update({ status: novoStatus })
            .eq('id', id);
        if (error) throw error;
        showToast(`Pedido #${id} → ${novoStatus}`, 'success');
        // Atualiza classe visual do select conforme novo status
        const classes = ['status-pendente','status-confirmado','status-enviado','status-entregue','status-cancelado'];
        classes.forEach(c => selectEl.classList.remove(c));
        selectEl.classList.add(`status-${novoStatus}`);
    } catch (e) {
        console.error('Erro ao alterar status inline:', e);
        showToast(e.message || 'Erro ao alterar status', 'error');
        // Recarrega a lista para voltar ao valor original
        carregarPedidos();
    }
}

async function abrirDetalhesPedido(id) {
    try {
        showToast(`Abrindo detalhes do pedido #${id}...`, 'info');
        const { data: pedido, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        pedidoAtual = pedido;
        
        const produtos = Array.isArray(pedido.produtos_json)
            ? pedido.produtos_json
            : JSON.parse(pedido.produtos_json || '[]');
        
        document.getElementById('modalTitle').textContent = `Pedido #${pedido.id}`;
        document.getElementById('pedidoDetalhes').innerHTML = `
            <div class="pedido-details-grid">
                <div class="detail-section">
                    <h4>👤 Dados do Cliente</h4>
                    <div class="detail-item"><strong>Nome:</strong> ${pedido.cliente_nome}</div>
                    <div class="detail-item"><strong>Email:</strong> ${pedido.cliente_email}</div>
                    <div class="detail-item"><strong>Telefone:</strong> ${pedido.cliente_telefone}</div>
                </div>
                
                <div class="detail-section">
                    <h4>📍 Endereço de Entrega</h4>
                    <div class="detail-item"><strong>CEP:</strong> ${pedido.endereco_cep}</div>
                    <div class="detail-item"><strong>Rua:</strong> ${pedido.endereco_rua}, ${pedido.endereco_numero}</div>
                    ${pedido.endereco_complemento ? `<div class="detail-item"><strong>Complemento:</strong> ${pedido.endereco_complemento}</div>` : ''}
                    <div class="detail-item"><strong>Bairro:</strong> ${pedido.endereco_bairro}</div>
                    <div class="detail-item"><strong>Cidade:</strong> ${pedido.endereco_cidade} - ${pedido.endereco_estado}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>🛒 Produtos do Pedido</h4>
                <div class="produtos-list">
                    ${produtos.map(item => `
                        <div class="produto-pedido-item">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${item.nome}</strong>
                                    <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.6); margin-top: 5px;">
                                        ${item.quantidade}x R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                                <div style="font-size: 1.2rem; color: var(--primary-color); font-weight: bold;">
                                    R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--primary-color);">
                        <strong style="font-size: 1.5rem; color: var(--primary-color);">
                            TOTAL: R$ ${parseFloat(pedido.total).toFixed(2).replace('.', ',')}
                        </strong>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>💳 Informações de Pagamento</h4>
                <div class="detail-item"><strong>Forma:</strong> ${formatarPagamento(pedido.forma_pagamento)}</div>
                <div class="detail-item"><strong>Status:</strong> <span class="badge badge-${pedido.status}">${pedido.status}</span></div>
                <div class="detail-item"><strong>Data do Pedido:</strong> ${formatarDataCompleta(pedido.created_at)}</div>
            </div>
            
            <div class="status-update">
                <h4>Atualizar Status do Pedido</h4>
                <div class="status-buttons">
                    <button class="btn btn-primary" onclick="atualizarStatus('confirmado')" ${pedido.status === 'confirmado' ? 'disabled' : ''}>Confirmar</button>
                    <button class="btn btn-primary" onclick="atualizarStatus('enviado')" ${pedido.status === 'enviado' ? 'disabled' : ''}>Marcar Enviado</button>
                    <button class="btn btn-primary" onclick="atualizarStatus('entregue')" ${pedido.status === 'entregue' ? 'disabled' : ''}>Marcar Entregue</button>
                    <button class="btn btn-danger" onclick="atualizarStatus('cancelado')" ${pedido.status === 'cancelado' ? 'disabled' : ''}>Cancelar</button>
                </div>
            </div>
        `;
        
        document.getElementById('modalPedido').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
        showToast('Detalhes carregados', 'success');
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        showToast(error.message || 'Erro ao carregar detalhes do pedido', 'error');
    }
}

function fecharModalPedido() {
    document.getElementById('modalPedido').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    pedidoAtual = null;
}

async function atualizarStatus(novoStatus) {
    if (!pedidoAtual) return;
    
    if (!confirm(`Tem certeza que deseja alterar o status para "${novoStatus}"?`)) {
        return;
    }
    
    try {
        showToast('Atualizando status...', 'info');
        const { error } = await supabase
            .from('pedidos')
            .update({ status: novoStatus })
            .eq('id', pedidoAtual.id);
        
        if (error) throw error;
        
        showToast('Status atualizado com sucesso!', 'success');
        fecharModalPedido();
        carregarPedidos();
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showToast(error.message || 'Erro ao atualizar status', 'error');
    }
}

// Atualizar status com base em um ID digitado (ferramenta rápida)
async function atualizarStatusPorId() {
    try {
        const idStr = document.getElementById('statusPedidoId').value.trim();
        const novoStatus = document.getElementById('statusNovo').value;
        const id = parseInt(idStr, 10);

        const permitidos = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];
        if (!id || id < 1) {
            showToast('Informe um ID de pedido válido.', 'warning');
            return;
        }
        if (!permitidos.includes(novoStatus)) {
            showToast('Status inválido.', 'warning');
            return;
        }

        if (!confirm(`Alterar status do pedido #${id} para "${novoStatus}"?`)) return;

        showToast('Atualizando status...', 'info');
        const { data, error } = await supabase
            .from('pedidos')
            .update({ status: novoStatus })
            .eq('id', id)
            .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
            showToast(`Pedido #${id} não encontrado.`, 'warning');
            return;
        }

        showToast(`Status do pedido #${id} atualizado para ${novoStatus}.`, 'success');
        carregarPedidos();
    } catch (e) {
        console.error('Erro ao atualizar status por ID:', e);
        showToast(e.message || 'Erro ao atualizar status por ID', 'error');
    }
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDataCompleta(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) + ' às ' + data.toLocaleTimeString('pt-BR');
}

function formatarPagamento(tipo) {
    const tipos = {
        'pix': '🔷 PIX',
        'cartao': '💳 Cartão',
        'boleto': '📄 Boleto'
    };
    return tipos[tipo] || tipo;
}

// Carregar pedidos ao iniciar
document.addEventListener('DOMContentLoaded', carregarPedidos);

// Diagnóstico similar ao de produtos
async function diagnosticarPedidos() {
    try {
        showToast('Executando diagnóstico de pedidos...', 'info');

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            showToast('Sem sessão. Faça login novamente.', 'error');
            return;
        }

        const { data: admin, error: adminErr } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .single();
        if (adminErr || !admin) {
            showToast('Usuário não é admin na tabela admins.', 'error');
        } else {
            showToast(`Admin OK (${admin.role})`, 'success');
        }

        const { data: _, count, error: cntErr } = await supabase
            .from('pedidos')
            .select('*', { count: 'exact', head: true });
        if (cntErr) {
            showToast(`Erro ao contar pedidos: ${cntErr.message}`, 'error');
        } else {
            showToast(`Pedidos acessíveis. Quantidade: ${count ?? 0}`, count ? 'success' : 'warning');
        }

        const { data: sample, error: sampleErr } = await supabase
            .from('pedidos')
            .select('id, cliente_nome, total, status')
            .limit(3);
        if (sampleErr) {
            showToast(`Erro SELECT pedidos: ${sampleErr.message}`, 'error');
        } else {
            console.log('Amostra de pedidos:', sample);
            if ((sample?.length || 0) > 0) showToast(`Amostra OK: ${sample.length} item(ns)`, 'success');
        }

        showToast('Se a contagem for 0, faça uma compra teste no site público.', 'info');
    } catch (e) {
        console.error('Diagnóstico de pedidos falhou:', e);
        showToast(e.message || 'Diagnóstico de pedidos falhou', 'error');
    }
}

// Criar um pedido de teste (para validar policies/tabela)
async function criarPedidoTeste() {
    try {
        showToast('Criando pedido de teste...', 'info');
        const agora = new Date();

        // Buscar um produto real com estoque > 0
        const { data: produtos, error: prodErr } = await supabase
            .from('produtos')
            .select('id, nome, preco, estoque')
            .gt('estoque', 0)
            .order('id', { ascending: true })
            .limit(2);

        if (prodErr) throw prodErr;
        if (!produtos || produtos.length === 0) {
            showToast('Nenhum produto com estoque disponível. Cadastre produtos ou rode o seed.', 'warning');
            return;
        }

        const itens = produtos.map(p => ({ id: p.id, nome: p.nome, preco: parseFloat(p.preco), quantidade: 1 }));
        const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);

        const { error } = await supabase
            .from('pedidos')
            .insert([{
                cliente_nome: 'Cliente Teste',
                cliente_email: 'teste@example.com',
                cliente_telefone: '(83) 99999-9999',
                endereco_cep: '58000-000',
                endereco_rua: 'Rua Teste',
                endereco_numero: '123',
                endereco_complemento: null,
                endereco_bairro: 'Centro',
                endereco_cidade: 'João Pessoa',
                endereco_estado: 'PB',
                produtos_json: itens,
                total: total,
                forma_pagamento: 'pix',
                status: 'pendente',
                created_at: agora.toISOString()
            }]);

        if (error) throw error;
        showToast('Pedido de teste criado!', 'success');
        carregarPedidos();
    } catch (e) {
        console.error('Erro ao criar pedido teste:', e);
        showToast(e.message || 'Erro ao criar pedido de teste', 'error');
    }
}
