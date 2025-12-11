import { Router } from 'express';
import { get, run } from '../db.js';

const router = Router();

const KEYS = ['maisVendidos', 'novidades', 'promocoes'];

router.get('/', async (req, res) => {
  try {
    const result = {};
    for (const key of KEYS) {
      const row = await get('SELECT items FROM featured_groups WHERE key = ?', [key]);
      result[key] = row?.items ? JSON.parse(row.items) : [];
    }
    res.json(result);
  } catch (e) { res.status(500).json({ error: 'Falha ao listar destaques' }); }
});

router.put('/', async (req, res) => {
  try {
    const body = req.body || {};
    for (const key of KEYS) {
      const items = JSON.stringify(Array.isArray(body[key]) ? body[key] : []);
      await run('INSERT INTO featured_groups (key, items) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET items=excluded.items', [key, items]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Falha ao salvar destaques' }); }
});

export default router;
