import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

// GET - Listar todos os pedidos
router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM orders ORDER BY date DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao listar pedidos' });
  }
});

// GET - Obter um pedido específico
router.get('/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao obter pedido' });
  }
});

// POST - Criar novo pedido
router.post('/', async (req, res) => {
  const { id, date, items, subtotal, shipping, discount, total, status = 'pending' } = req.body || {};
  
  if (!id || !items || !total) {
    return res.status(400).json({ error: 'Dados do pedido inválidos' });
  }

  try {
    const now = new Date().toISOString();
    const itemsJson = JSON.stringify(items);

    const result = await run(
      `INSERT INTO orders (id, date, items, subtotal, shipping, discount, total, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, date || now, itemsJson, subtotal || 0, shipping || 0, discount || 0, total, status, now, now]
    );

    const row = await get('SELECT * FROM orders WHERE id = ?', [id]);
    res.status(201).json(row);
  } catch (e) {
    console.error('Erro ao criar pedido:', e);
    res.status(500).json({ error: 'Falha ao criar pedido' });
  }
});

// PUT - Atualizar status do pedido
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }

  try {
    const existing = await get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const now = new Date().toISOString();
    await run(
      'UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?',
      [status, now, id]
    );

    const row = await get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao atualizar pedido' });
  }
});

// DELETE - Excluir pedido
router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Falha ao excluir pedido' });
  }
});

export default router;
