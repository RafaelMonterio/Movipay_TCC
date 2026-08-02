const express = require('express');
const { query } = require('../../db/pool');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// POST /api/v1/reviews — cria avaliação
router.post('/', authMiddleware, async (req, res) => {
  const { order_id, reviewed_id, rating, comment } = req.body;

  if (!order_id || !reviewed_id || !rating)
    return res.status(400).json({ error: 'order_id, reviewed_id e rating são obrigatórios' });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ error: 'rating deve ser entre 1 e 5' });

  try {
    // Verifica se o pedido está concluído e o usuário participou
    const orderCheck = await query(
      `SELECT id FROM orders WHERE id = $1 AND status = 'completed'
       AND (client_id = $2 OR worker_id = $2)`,
      [order_id, req.user.id]
    );
    if (!orderCheck.rows[0])
      return res.status(403).json({ error: 'Pedido não encontrado ou não concluído' });

    const { rows } = await query(
      `INSERT INTO reviews (order_id, reviewer_id, reviewed_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, req.user.id, reviewed_id, rating, comment || null]
    );

    // Atualiza stats do avaliado
    await query(`SELECT update_user_stats($1)`, [reviewed_id]);

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Você já avaliou este pedido' });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/reviews/worker/:id — avaliações de um trabalhador
router.get('/worker/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, u.name AS reviewer_name
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewed_id = $1 AND r.is_public = TRUE
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json({ reviews: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
