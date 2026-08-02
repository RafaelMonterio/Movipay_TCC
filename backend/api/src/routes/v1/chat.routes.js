const express = require('express');
const { query } = require('../../db/pool');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// GET /api/v1/chat/:orderId — busca mensagens de um pedido
router.get('/:orderId', authMiddleware, async (req, res) => {
  const { orderId } = req.params;
  try {
    // Verifica se o usuário pertence ao pedido
    const orderCheck = await query(
      `SELECT id FROM orders WHERE id = $1 AND (client_id = $2 OR worker_id = $2)`,
      [orderId, req.user.id]
    );
    if (!orderCheck.rows[0])
      return res.status(403).json({ error: 'Sem acesso a este pedido' });

    const { rows } = await query(
      `SELECT m.*, u.name AS sender_name
       FROM chat_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.order_id = $1
       ORDER BY m.created_at ASC`,
      [orderId]
    );

    // Marca mensagens como lidas
    await query(
      `UPDATE chat_messages SET is_read = TRUE
       WHERE order_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [orderId, req.user.id]
    );

    res.json({ messages: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/chat/:orderId — envia mensagem
router.post('/:orderId', authMiddleware, async (req, res) => {
  const { orderId } = req.params;
  const { content } = req.body;

  if (!content?.trim())
    return res.status(400).json({ error: 'Mensagem não pode ser vazia' });

  try {
    const orderCheck = await query(
      `SELECT id FROM orders WHERE id = $1 AND (client_id = $2 OR worker_id = $2)`,
      [orderId, req.user.id]
    );
    if (!orderCheck.rows[0])
      return res.status(403).json({ error: 'Sem acesso a este pedido' });

    const { rows } = await query(
      `INSERT INTO chat_messages (order_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *, $4::text AS sender_name`,
      [orderId, req.user.id, content.trim(), req.user.name || 'Usuário']
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
