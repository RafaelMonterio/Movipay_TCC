// ── services.routes.js ──────────────────────────────────────
const express = require('express');
const { query } = require('../../db/pool');
const { authMiddleware } = require('../../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT s.id, s.title, s.description, s.price, s.price_type,
              c.name AS category, c.icon AS category_icon,
              u.name AS worker_name, u.avg_rating,
              s.worker_id, s.is_active
       FROM services s
       JOIN users      u ON u.id = s.worker_id
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.is_active = TRUE
       ORDER BY s.created_at DESC`
    );
    res.json({ services: rows, total: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT s.*, c.name AS category, u.name AS worker_name
       FROM services s
       JOIN users u ON u.id = s.worker_id
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, category, price, description, price_type } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'title e price obrigatórios' });
  try {
    const catRow = await query(`SELECT id FROM categories WHERE slug = $1`, [category]);
    const category_id = catRow.rows[0]?.id || null;

    const { rows } = await query(
      `INSERT INTO services (worker_id, category_id, title, description, price, price_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, category_id, title, description, Number(price), price_type || 'fixed']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
