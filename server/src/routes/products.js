import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Falha ao listar produtos' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(row);
  } catch (e) { res.status(500).json({ error: 'Falha ao obter produto' }); }
});

router.post('/', async (req, res) => {
  const { name, description = '', category = '', priceOld = 0, priceCurrent = 0, discount = 0, image = '', stock = 0, active = 1 } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
  const now = new Date().toISOString();
  try {
    const result = await run(`INSERT INTO products (name, description, category, priceOld, priceCurrent, discount, image, stock, active, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, category, priceOld, priceCurrent, discount, image, stock, active ? 1 : 0, now, now]);
    const row = await get('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: 'Falha ao criar produto' }); }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const existing = await get('SELECT * FROM products WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Produto não encontrado' });
  const { name = existing.name, description = existing.description, category = existing.category, priceOld = existing.priceOld, priceCurrent = existing.priceCurrent, discount = existing.discount, image = existing.image, stock = existing.stock, active = existing.active } = req.body || {};
  const now = new Date().toISOString();
  try {
    await run(`UPDATE products SET name=?, description=?, category=?, priceOld=?, priceCurrent=?, discount=?, image=?, stock=?, active=?, updatedAt=? WHERE id=?`,
      [name, description, category, priceOld, priceCurrent, discount, image, stock, active ? 1 : 0, now, id]);
    const row = await get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(row);
  } catch (e) { res.status(500).json({ error: 'Falha ao atualizar produto' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Falha ao excluir produto' }); }
});

export default router;
