// Dashboard - Carregar estatísticas e pedidos recentes
let stats = {
    totalProdutos: 0,
    totalPedidos: 0,
    pedidosPendentes: 0,
    valorTotal: 0
};

async function carregarDashboard() {
    await Promise.all([
        carregarEstatisticas(),
        carregarPedidosRecentes()
    ]);
    
    atualizarHorario();
}

async function carregarEstatisticas() {
    try {
        // Total de produtos
        const { count: totalProdutos } = await supabase
            .from('produtos')
            .select('*', { count: 'exact', head: true });
        
        stats.totalProdutos = totalProdutos || 0;
        document.getElementById('totalProdutos').textContent = stats.totalProdutos;
        
        // Total de pedidos
        const { data: pedidos, count: totalPedidos } = await supabase
            .from('pedidos')
            .select('total, status', { count: 'exact' });
        
        stats.totalPedidos = totalPedidos || 0;
        document.getElementById('totalPedidos').textContent = stats.totalPedidos;
        
        // Pedidos pendentes
        const pedidosPendentes = pedidos?.filter(p => p.status === 'pendente').length || 0;
        stats.pedidosPendentes = pedidosPendentes;
        document.getElementById('pedidosPendentes').textContent = pedidosPendentes;
        
        // Valor total
        const valorTotal = pedidos?.reduce((sum, p) => sum + parseFloat(p.total || 0), 0) || 0;
        stats.valorTotal = valorTotal;
        document.getElementById('valorTotal').textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function carregarPedidosRecentes() {
    try {
        const { data: pedidos, error } = await supabase
            .from('pedidos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        
        const container = document.getElementById('recentOrders');
        
        if (!pedidos || pedidos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>Nenhum pedido ainda</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos.map(pedido => `
                            <tr>
                                <td>#${pedido.id}</td>
                                <td>${pedido.cliente_nome}</td>
                                <td>R$ ${parseFloat(pedido.total).toFixed(2).replace('.', ',')}</td>
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
        document.getElementById('recentOrders').innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar pedidos</p>
            </div>
        `;
    }
}

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function atualizarHorario() {
    const agora = new Date();
    const horario = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('lastUpdate').textContent = `Última atualização: ${horario}`;
}

// Carregar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', carregarDashboard);

// Recarregar a cada 30 segundos
setInterval(carregarDashboard, 30000);
