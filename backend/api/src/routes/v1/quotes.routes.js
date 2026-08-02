const express = require('express');
const { query } = require('../../db/pool');
const { authMiddleware } = require('../../middleware/auth');
const router = express.Router();

// GET /api/v1/quotes — lista orçamentos abertos (trabalhadores veem todos, clientes veem os seus)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const isWorker = req.user.mode === 'worker';
    const sql = isWorker
      ? `SELECT q.*, u.name AS client_name,
                c.name AS category_name, c.icon AS category_icon,
                COUNT(p.id) AS proposal_count
           FROM quotes q
           JOIN users u ON u.id = q.client_id
           LEFT JOIN categories c ON c.id = q.category_id
           LEFT JOIN quote_proposals p ON p.quote_id = q.id
           WHERE q.status = 'open' AND q.expires_at > NOW()
           GROUP BY q.id, u.name, c.name, c.icon
           ORDER BY q.created_at DESC`
      : `SELECT q.*, u.name AS client_name,
                c.name AS category_name, c.icon AS category_icon,
                COUNT(p.id) AS proposal_count
           FROM quotes q
           JOIN users u ON u.id = q.client_id
           LEFT JOIN categories c ON c.id = q.category_id
           LEFT JOIN quote_proposals p ON p.quote_id = q.id
           WHERE q.client_id = $1
           GROUP BY q.id, u.name, c.name, c.icon
           ORDER BY q.created_at DESC`;

    const { rows } = isWorker
      ? await query(sql)
      : await query(sql, [req.user.id]);
    res.json({ quotes: rows, total: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/v1/quotes/:id — detalhe com propostas
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows: [quote] } = await query(
      `SELECT q.*, u.name AS client_name, c.name AS category_name
       FROM quotes q
       JOIN users u ON u.id = q.client_id
       LEFT JOIN categories c ON c.id = q.category_id
       WHERE q.id = $1`, [req.params.id]
    );
    if (!quote) return res.status(404).json({ error: 'Orçamento não encontrado' });

    const { rows: proposals } = await query(
      `SELECT p.*, u.name AS worker_name, u.avg_rating, u.is_verified, u.total_orders
       FROM quote_proposals p
       JOIN users u ON u.id = p.worker_id
       WHERE p.quote_id = $1
       ORDER BY p.price ASC`, [req.params.id]
    );

    res.json({ ...quote, proposals });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/v1/quotes — cliente cria orçamento
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, category, budget_max, city } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'title e description obrigatórios' });
  try {
    const cat = await query(`SELECT id FROM categories WHERE slug = $1`, [category]);
    const { rows: [quote] } = await query(
      `INSERT INTO quotes (client_id, category_id, title, description, budget_max, city)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, cat.rows[0]?.id || null, title, description, budget_max || null, city || null]
    );
    res.status(201).json(quote);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/v1/quotes/:id/proposals — trabalhador envia proposta
router.post('/:id/proposals', authMiddleware, async (req, res) => {
  const { price, message } = req.body;
  if (!price || !message) return res.status(400).json({ error: 'price e message obrigatórios' });
  try {
    const { rows: [p] } = await query(
      `INSERT INTO quote_proposals (quote_id, worker_id, price, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.user.id, price, message]
    );
    res.status(201).json(p);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Você já enviou uma proposta' });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/quotes/:id/proposals/:pid — cliente aceita/rejeita proposta
router.patch('/:id/proposals/:pid', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['accepted','rejected'].includes(status)) return res.status(400).json({ error: 'status inválido' });
  try {
    const { rows: [p] } = await query(
      `UPDATE quote_proposals SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.pid]
    );
    if (status === 'accepted') {
      await query(`UPDATE quotes SET status = 'in_review' WHERE id = $1`, [req.params.id]);
    }
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
