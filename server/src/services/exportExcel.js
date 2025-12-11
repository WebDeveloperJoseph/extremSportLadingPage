import ExcelJS from 'exceljs';

export async function generateQuoteExcel(quote) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Orçamento');

  ws.columns = [
    { header: 'Produto', key: 'name', width: 40 },
    { header: 'Preço', key: 'price', width: 12 },
    { header: 'Qtd', key: 'quantity', width: 8 },
    { header: 'Subtotal', key: 'subtotal', width: 14 }
  ];

  ws.addRow([`Orçamento #${quote.id}`]);
  ws.addRow([`Empresa: ${quote.company.razaoSocial} | CNPJ: ${quote.company.cnpj}`]);
  if (quote.company.email || quote.company.telefone) {
    ws.addRow([`Contato: ${[quote.company.email, quote.company.telefone].filter(Boolean).join(' | ')}`]);
  }
  ws.addRow([`Data: ${new Date(quote.createdAt).toLocaleString('pt-BR')}`]);
  ws.addRow([]);

  ws.addRow(['Produto', 'Preço', 'Qtd', 'Subtotal']);
  quote.items.forEach(it => {
    ws.addRow([it.name, it.price, it.quantity, it.subtotal]);
  });
  ws.addRow([]);
  ws.addRow(['Subtotal', quote.subtotal]);
  ws.addRow(['Frete', quote.shipping]);
  ws.addRow(['Desconto', quote.discount]);
  ws.addRow(['Total', quote.total]);

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `orcamento_${quote.id}.xlsx`;
  return { buffer, filename };
}
