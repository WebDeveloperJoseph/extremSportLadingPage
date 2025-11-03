// Gerenciamento de Pedidos
let pedidoAtual = null;

async function carregarPedidos() {
    try {
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
                </div>
            `;
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
                                <td><span class="badge badge-${pedido.status}">${pedido.status}</span></td>
                                <td>${formatarData(pedido.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        document.getElementById('pedidosLista').innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar pedidos: ${error.message}</p>
            </div>
        `;
    }
}

async function abrirDetalhesPedido(id) {
    try {
        const { data: pedido, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        pedidoAtual = pedido;
        
        const produtos = JSON.parse(pedido.produtos_json);
        
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
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        alert('Erro ao carregar detalhes do pedido');
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
        const { error } = await supabase
            .from('pedidos')
            .update({ status: novoStatus })
            .eq('id', pedidoAtual.id);
        
        if (error) throw error;
        
        alert('Status atualizado com sucesso!');
        fecharModalPedido();
        carregarPedidos();
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status: ' + error.message);
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
