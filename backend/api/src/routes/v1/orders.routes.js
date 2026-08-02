const express = require('express');
const { query, getClient } = require('../../db/pool');
const { authMiddleware }   = require('../../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT o.*,
              c.name AS client_name, w.name AS worker_name,
              s.title AS service_title
       FROM orders o
       JOIN users c ON c.id = o.client_id
       JOIN users w ON w.id = o.worker_id
       LEFT JOIN services s ON s.id = o.service_id
       WHERE o.client_id = $1 OR o.worker_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders: rows, total: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT o.*, c.name AS client_name, w.name AS worker_name, s.title AS service_title
       FROM orders o
       JOIN users c ON c.id = o.client_id
       JOIN users w ON w.id = o.worker_id
       LEFT JOIN services s ON s.id = o.service_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  const { service_id } = req.body;
  try {
    const svc = await query(`SELECT * FROM services WHERE id = $1 AND is_active = TRUE`, [service_id]);
    if (!svc.rows[0]) return res.status(404).json({ error: 'Serviço não encontrado' });
    const s = svc.rows[0];

    const { rows } = await query(
      `INSERT INTO orders (client_id, worker_id, service_id, price, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [req.user.id, s.worker_id, s.id, s.price]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status, cancel_reason } = req.body;
  const VALID = ['accepted', 'in_progress', 'completed', 'cancelled'];
  if (!VALID.includes(status))
    return res.status(400).json({ error: `Status inválido. Use: ${VALID.join(', ')}` });

  try {
    const { rows } = await query(
      `UPDATE orders
       SET status = $1, cancel_reason = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, cancel_reason || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    // Captura erros do trigger de validação
    if (err.message.includes('inválida') || err.message.includes('imutável'))
      return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
