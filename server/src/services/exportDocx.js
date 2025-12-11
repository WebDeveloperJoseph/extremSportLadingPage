import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function generateQuoteDocx(quote) {
  const paragraphs = [];

  paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Orçamento #${quote.id}`, bold: true, size: 28 })] }));
  paragraphs.push(new Paragraph({ children: [new TextRun(`Empresa: ${quote.company.razaoSocial}`)] }));
  paragraphs.push(new Paragraph({ children: [new TextRun(`CNPJ: ${quote.company.cnpj}`)] }));
  if (quote.company.email || quote.company.telefone) {
    paragraphs.push(new Paragraph({ children: [new TextRun(`Contato: ${[quote.company.email, quote.company.telefone].filter(Boolean).join(' | ')}`)] }));
  }
  paragraphs.push(new Paragraph({ children: [new TextRun(`Data: ${new Date(quote.createdAt).toLocaleString('pt-BR')}`)] }));
  paragraphs.push(new Paragraph({ children: [new TextRun(' ')] }));

  paragraphs.push(new Paragraph({ children: [new TextRun({ text: 'Itens', bold: true })] }));
  quote.items.forEach((it, idx) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun(`${idx + 1}. ${it.name} | Preço: R$ ${it.price.toFixed(2)} | Qtd: ${it.quantity} | Subtotal: R$ ${it.subtotal.toFixed(2)}`)
        ]
      })
    );
  });

  paragraphs.push(new Paragraph({ children: [new TextRun(' ')] }));
  paragraphs.push(new Paragraph({ children: [new TextRun(`Subtotal: R$ ${quote.subtotal.toFixed(2)}`)] }));
  paragraphs.push(new Paragraph({ children: [new TextRun(`Frete: R$ ${quote.shipping.toFixed(2)}`)] }));
  paragraphs.push(new Paragraph({ children: [new TextRun(`Desconto: R$ ${quote.discount.toFixed(2)}`)] }));
  paragraphs.push(new Paragraph({ children: [new TextRun({ text: `Total: R$ ${quote.total.toFixed(2)}`, bold: true })] }));

  if (quote.notes) {
    paragraphs.push(new Paragraph({ children: [new TextRun(' ')] }));
    paragraphs.push(new Paragraph({ children: [new TextRun(`Observações: ${quote.notes}`)] }));
  }

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const buffer = await Packer.toBuffer(doc);
  const filename = `orcamento_${quote.id}.docx`;
  return { buffer, filename };
}
