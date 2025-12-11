import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM banners ORDER BY ord ASC, createdAt DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Falha ao listar banners' }); }
});

router.post('/', async (req, res) => {
  const { image, title, subtitle = '', link = '', ord = 0, active = 1 } = req.body || {};
  if (!image || !title) return res.status(400).json({ error: 'Imagem e Título são obrigatórios' });
  const now = new Date().toISOString();
  try {
    const result = await run(`INSERT INTO banners (image, title, subtitle, link, ord, active, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [image, title, subtitle, link, ord, active ? 1 : 0, now, now]);
    const row = await get('SELECT * FROM banners WHERE id = ?', [result.lastID]);
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: 'Falha ao criar banner' }); }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const existing = await get('SELECT * FROM banners WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Banner não encontrado' });
  const { image = existing.image, title = existing.title, subtitle = existing.subtitle, link = existing.link, ord = existing.ord, active = existing.active } = req.body || {};
  const now = new Date().toISOString();
  try {
    await run(`UPDATE banners SET image=?, title=?, subtitle=?, link=?, ord=?, active=?, updatedAt=? WHERE id=?`,
      [image, title, subtitle, link, ord, active ? 1 : 0, now, id]);
    const row = await get('SELECT * FROM banners WHERE id = ?', [id]);
    res.json(row);
  } catch (e) { res.status(500).json({ error: 'Falha ao atualizar banner' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM banners WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Banner não encontrado' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Falha ao excluir banner' }); }
});

export default router;
