const express = require('express');
const { query, getClient } = require('../../db/pool');
const { authMiddleware } = require('../../middleware/auth');
const router = express.Router();

// POST /api/v1/payments/checkout — cria pedido + retém pagamento em escrow
router.post('/checkout', authMiddleware, async (req, res) => {
  const { order_id, scheduled_at } = req.body;
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: [order] } = await client.query(
      `SELECT o.*, u.wallet_balance AS client_balance
       FROM orders o JOIN users u ON u.id = o.client_id
       WHERE o.id = $1 AND o.client_id = $2 AND o.status = 'pending'`,
      [order_id, req.user.id]
    );
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado ou não está pendente' });

    // Atualiza status para accepted
    await client.query(
      `UPDATE orders SET status = 'accepted', paid_at = NOW(), scheduled_at = $1, updated_at = NOW() WHERE id = $2`,
      [scheduled_at || null, order_id]
    );

    // Cria registro de escrow
    const { rows: [payment] } = await client.query(
      `INSERT INTO payments (order_id, payer_id, payee_id, amount, status)
       VALUES ($1, $2, $3, $4, 'held') RETURNING *`,
      [order_id, req.user.id, order.worker_id, order.price]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      message: `R$ ${order.price} retido em custódia. Será liberado ao trabalhador após conclusão.`,
      payment,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/v1/payments/:id/release — libera escrow ao concluir
router.post('/:id/release', authMiddleware, async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows: [payment] } = await client.query(
      `SELECT p.*, o.worker_id FROM payments p JOIN orders o ON o.id = p.order_id
       WHERE p.id = $1 AND p.status = 'held'`, [req.params.id]
    );
    if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado ou já liberado' });

    // Libera o escrow e adiciona saldo ao trabalhador
    await client.query(
      `UPDATE payments SET status = 'released', released_at = NOW() WHERE id = $1`, [req.params.id]
    );
    await client.query(
      `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
      [payment.amount, payment.worker_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: `R$ ${payment.amount} liberado para o trabalhador.` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/v1/payments/wallet — saldo da carteira
router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    const { rows: [u] } = await query(
      `SELECT wallet_balance FROM users WHERE id = $1`, [req.user.id]
    );
    const { rows: held } = await query(
      `SELECT COALESCE(SUM(amount), 0) AS held
       FROM payments WHERE payee_id = $1 AND status = 'held'`, [req.user.id]
    );
    res.json({ balance: u.wallet_balance, held: held[0].held });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
