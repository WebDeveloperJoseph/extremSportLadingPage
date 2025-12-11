document.addEventListener('DOMContentLoaded', function() {
    const quoteDetails = document.getElementById('quote-details');
    const orcamento = JSON.parse(localStorage.getItem('orcamento') || 'null');
    if (!orcamento) {
        quoteDetails.innerHTML = '<p style="color:#c00">Nenhum orçamento encontrado. Volte ao carrinho e gere um novo orçamento.</p>';
        return;
    }

    let html = `<h2>Resumo do Orçamento</h2>`;
    html += `<p><strong>Nº do Orçamento:</strong> ${orcamento.id}</p>`;
    html += `<p><strong>Data:</strong> ${new Date(orcamento.date).toLocaleString('pt-BR')}</p>`;
    html += `<table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <thead>
            <tr style="background:#f7f7f7;">
                <th style="padding:8px; border:1px solid #eee;">Produto</th>
                <th style="padding:8px; border:1px solid #eee;">Qtd</th>
                <th style="padding:8px; border:1px solid #eee;">Preço Unit.</th>
                <th style="padding:8px; border:1px solid #eee;">Subtotal</th>
            </tr>
        </thead>
        <tbody>`;
    orcamento.items.forEach(item => {
        html += `<tr>
            <td style="padding:8px; border:1px solid #eee;">${item.name}</td>
            <td style="padding:8px; border:1px solid #eee; text-align:center;">${item.quantity}</td>
            <td style="padding:8px; border:1px solid #eee;">R$ ${item.price.toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #eee;">R$ ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    html += `<div style="margin-bottom:8px;"><strong>Subtotal:</strong> R$ ${orcamento.subtotal.toFixed(2)}</div>`;
    html += `<div style="margin-bottom:8px;"><strong>Frete:</strong> R$ ${orcamento.shipping.toFixed(2)}</div>`;
    if (orcamento.discount > 0) {
        html += `<div style="margin-bottom:8px;"><strong>Desconto:</strong> -R$ ${orcamento.discount.toFixed(2)}</div>`;
    }
    html += `<div style="font-size:1.2em; font-weight:700; margin-bottom:16px;"><strong>Total:</strong> R$ ${orcamento.total.toFixed(2)}</div>`;
    html += `<p style="color:#2a7; font-weight:600;">Leve este orçamento à loja física para retirar seus produtos e pagar presencialmente.</p>`;
    quoteDetails.innerHTML = html;
});
