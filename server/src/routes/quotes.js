import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { addQuote, getQuotes, getQuoteById, saveQuotes } from '../data/store.js';
import { generateQuoteExcel } from '../services/exportExcel.js';
import { generateQuoteDocx } from '../services/exportDocx.js';

const router = Router();

function calcTotals(items = [], discount = 0, shipping = 0) {
  const subtotal = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0) + (Number(shipping) || 0));
  return { subtotal, total };
}

router.get('/', (req, res) => {
  const list = getQuotes().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.get('/:id', (req, res) => {
  const quote = getQuoteById(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Orçamento não encontrado' });
  res.json(quote);
});

router.post('/', (req, res) => {
  const { company, items, discount = 0, shipping = 0, notes = '' } = req.body || {};

  if (!company || !company.cnpj || !company.razaoSocial) {
    return res.status(400).json({ error: 'Dados da empresa inválidos (CNPJ e Razão Social são obrigatórios)' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Itens do orçamento são obrigatórios' });
  }

  const { subtotal, total } = calcTotals(items, discount, shipping);

  const quote = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    status: 'novo',
    company: {
      cnpj: String(company.cnpj),
      razaoSocial: String(company.razaoSocial),
      email: company.email ? String(company.email) : '',
      telefone: company.telefone ? String(company.telefone) : ''
    },
    items: items.map(i => ({
      productId: i.productId ?? null,
      name: String(i.name),
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      subtotal: (Number(i.price) || 0) * (Number(i.quantity) || 1)
    })),
    discount: Number(discount) || 0,
    shipping: Number(shipping) || 0,
    subtotal,
    total,
    notes: String(notes || '')
  };

  addQuote(quote);
  res.status(201).json(quote);
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body || {};
  const allowed = ['novo', 'em-analise', 'aprovado', 'rejeitado', 'enviado'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  const quotes = getQuotes();
  const idx = quotes.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Orçamento não encontrado' });
  quotes[idx].status = status;
  quotes[idx].updatedAt = new Date().toISOString();
  saveQuotes(quotes);
  res.json(quotes[idx]);
});

router.get('/:id/export', async (req, res) => {
  const { format = 'xlsx' } = req.query;
  const quote = getQuoteById(req.params.id);
  if (!quote) return res.status(404).json({ error: 'Orçamento não encontrado' });

  try {
    if (format === 'xlsx') {
      const { buffer, filename } = await generateQuoteExcel(quote);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    }
    if (format === 'docx') {
      const { buffer, filename } = await generateQuoteDocx(quote);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    }
    return res.status(400).json({ error: 'Formato inválido. Use format=xlsx ou format=docx' });
  } catch (e) {
    console.error('Erro ao exportar orçamento:', e);
    return res.status(500).json({ error: 'Falha ao exportar orçamento' });
  }
});

export default router;
