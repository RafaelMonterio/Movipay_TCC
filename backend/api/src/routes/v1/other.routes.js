// ── points.routes.js ─────────────────────────────────────────
const express = require('express');
const { query: q } = require('../../db/pool');
const { authMiddleware } = require('../../middleware/auth');

const routerP = express.Router();

routerP.get('/balance', authMiddleware, async (req, res) => {
  try {
    const { rows } = await q(`SELECT points AS balance FROM users WHERE id = $1`, [req.user.id]);
    res.json({ balance: rows[0]?.balance || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

routerP.get('/history', authMiddleware, async (req, res) => {
  const page  = parseInt(req.query.page  || '1');
  const limit = parseInt(req.query.limit || '20');
  const offset = (page - 1) * limit;
  try {
    const { rows } = await q(
      `SELECT * FROM points_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    const count = await q(`SELECT COUNT(*) FROM points_history WHERE user_id = $1`, [req.user.id]);
    const total = parseInt(count.rows[0].count);
    res.json({ transactions: rows, total, total_pages: Math.ceil(total / limit), page });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── payments.routes.js ───────────────────────────────────────
const expressY = express;
const routerY  = expressY.Router();

routerY.post('/checkout', authMiddleware, async (req, res) => {
  const { order_id } = req.body;
  try {
    const { rows } = await q(
      `UPDATE orders SET status = 'accepted', paid_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [order_id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido não encontrado ou não está pendente' });
    res.json({ success: true, message: 'Pagamento simulado (v0.4 — sem gateway real)', order: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── workers.routes.js ────────────────────────────────────────
const expressW = express;
const routerW  = expressW.Router();

routerW.get('/', async (req, res) => {
  try {
    const { rows } = await q(
      `SELECT u.id, u.name, u.email, u.bio, u.avg_rating, u.total_orders, u.total_reviews,
              JSON_AGG(
                JSON_BUILD_OBJECT('id', s.id, 'title', s.title, 'price', s.price)
              ) FILTER (WHERE s.id IS NOT NULL) AS services
       FROM users u
       LEFT JOIN services s ON s.worker_id = u.id AND s.is_active = TRUE
       WHERE u.mode = 'worker' AND u.is_active = TRUE
       GROUP BY u.id
       ORDER BY u.avg_rating DESC NULLS LAST`
    );
    res.json({ workers: rows, total: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

routerW.get('/:id', async (req, res) => {
  try {
    const { rows } = await q(
      `SELECT u.id, u.name, u.email, u.bio, u.avg_rating, u.total_orders
       FROM users u WHERE u.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Trabalhador não encontrado' });
    const svcs = await q(`SELECT * FROM services WHERE worker_id = $1 AND is_active = TRUE`, [req.params.id]);
    res.json({ ...rows[0], services: svcs.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── calendar.routes.js ───────────────────────────────────────
const expressC = express;
const routerC  = expressC.Router();

routerC.get('/events', authMiddleware, async (req, res) => {
  const { month } = req.query; // YYYY-MM
  try {
    let sql = `
      SELECT o.id, o.scheduled_at AS event_date, o.status,
             o.price, o.notes AS address,
             c.name AS client_name,
             s.title
      FROM orders o
      JOIN users c ON c.id = o.client_id
      LEFT JOIN services s ON s.id = o.service_id
      WHERE o.worker_id = $1 AND o.scheduled_at IS NOT NULL`;
    const params = [req.user.id];

    if (month) {
      sql += ` AND TO_CHAR(o.scheduled_at, 'YYYY-MM') = $2`;
      params.push(month);
    }
    sql += ` ORDER BY o.scheduled_at ASC`;

    const { rows } = await q(sql, params);
    res.json({ events: rows, total: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

routerC.post('/events', authMiddleware, async (req, res) => {
  const { order_id, scheduled_at } = req.body;
  try {
    const { rows } = await q(
      `UPDATE orders SET scheduled_at = $1, updated_at = NOW()
       WHERE id = $2 AND worker_id = $3 RETURNING *`,
      [scheduled_at, order_id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── users.routes.js ──────────────────────────────────────────
const expressU = express;
const routerU  = expressU.Router();

routerU.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await q(
      `SELECT id, name, email, mode, points, avatar_url, bio, avg_rating, total_orders
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

routerU.patch('/:id', authMiddleware, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: 'Sem permissão para editar este usuário' });
  const { name, bio, phone, avatar_url, lat, lng, neighborhood } = req.body;
  try {
    const { rows } = await q(
      `UPDATE users SET
         name = COALESCE($1, name),
         bio  = COALESCE($2, bio),
         phone = COALESCE($3, phone),
         avatar_url = COALESCE($4, avatar_url),
         lat = COALESCE($5, lat),
         lng = COALESCE($6, lng),
         neighborhood = COALESCE($7, neighborhood),
         updated_at = NOW()
       WHERE id = $8 RETURNING id, name, email, mode, points, bio, phone, avatar_url, lat, lng, neighborhood`,
      [name, bio, phone, avatar_url, lat, lng, neighborhood, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = {
  pointsRouter: routerP,
  paymentsRouter: routerY,
  workersRouter: routerW,
  calendarRouter: routerC,
  usersRouter: routerU,
};

