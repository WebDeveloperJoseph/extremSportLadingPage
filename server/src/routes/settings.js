import { Router } from 'express';
import { get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // fetch all
    const keys = ['heroImage'];
    const out = {};
    for (const k of keys) {
      const row = await get('SELECT value FROM settings WHERE key = ?', [k]);
      out[k] = row?.value ? JSON.parse(row.value) : null;
    }
    res.json(out);
  } catch (e) { res.status(500).json({ error: 'Falha ao obter configurações' }); }
});

router.get('/:key', async (req, res) => {
  try {
    const row = await get('SELECT value FROM settings WHERE key = ?', [req.params.key]);
    if (!row) return res.json({ key: req.params.key, value: null });
    res.json({ key: req.params.key, value: JSON.parse(row.value) });
  } catch (e) { res.status(500).json({ error: 'Falha ao obter configuração' }); }
});

router.put('/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const value = JSON.stringify(req.body?.value ?? null);
    await run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, value]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Falha ao salvar configuração' }); }
});

export default router;
