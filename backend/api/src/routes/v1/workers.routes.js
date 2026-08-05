const express = require('express');
const { query } = require('../../db/pool');
const { authMiddleware } = require('../../middleware/auth');
const router = express.Router();

// GET /api/v1/workers — lista com filtros de localização e disponibilidade
router.get('/', async (req, res) => {
  const { category, available, lat, lng, radius = 10 } = req.query;
  try {
    let sql = `
      SELECT u.id, u.name, u.email, u.bio, u.avatar_url,
             u.lat, u.lng, u.city, u.neighborhood,
             u.avg_rating, u.total_orders, u.total_reviews,
             u.is_verified, u.is_available, u.points,
             JSON_AGG(
               DISTINCT JSONB_BUILD_OBJECT(
                 'id', s.id, 'title', s.title, 'price', s.price,
                 'price_type', s.price_type, 'category', c.name, 'category_icon', c.icon
               )
             ) FILTER (WHERE s.id IS NOT NULL) AS services
      FROM users u
      LEFT JOIN services s ON s.worker_id = u.id AND s.is_active = TRUE
      LEFT JOIN categories c ON c.id = s.category_id
      WHERE u.mode = 'worker' AND u.is_active = TRUE
      AND LOWER(u.city) = LOWER('Ribeirão Pires');`;

    const params = [];
    if (available === 'true') { params.push(true); sql += ` AND u.is_available = $${params.length}`; }
    if (category) { params.push(category); sql += ` AND c.slug = $${params.length}`; }
    sql += ` GROUP BY u.id ORDER BY u.avg_rating DESC NULLS LAST, u.total_orders DESC`;

    const { rows } = await query(sql, params);

    // Calcula distância se lat/lng fornecidos
    let workers = rows;
    if (lat && lng) {
      workers = rows.map(w => ({
        ...w,
        distance_km: w.lat && w.lng
          ? Math.round(Math.sqrt(Math.pow((w.lat - lat) * 111, 2) + Math.pow((w.lng - lng) * 111 * Math.cos(lat * Math.PI / 180), 2)) * 10) / 10
          : null,
      })).sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    }

    res.json({ workers, total: workers.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/v1/workers/:id — perfil completo
router.get('/:id', async (req, res) => {
  try {
    const { rows: [u] } = await query(
      `SELECT u.id, u.name, u.email, u.bio, u.avatar_url, u.phone,
              u.lat, u.lng, u.city, u.neighborhood,
              u.avg_rating, u.total_orders, u.total_reviews,
              u.is_verified, u.is_available, u.points, u.created_at
       FROM users u WHERE u.id = $1`, [req.params.id]
    );
    if (!u) return res.status(404).json({ error: 'Trabalhador não encontrado' });

    const [svcs, reviews, photos, slots] = await Promise.all([
      query(`SELECT s.*, c.name AS category, c.icon AS category_icon
             FROM services s LEFT JOIN categories c ON c.id = s.category_id
             WHERE s.worker_id = $1 AND s.is_active = TRUE`, [req.params.id]),
      query(`SELECT r.*, u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
             FROM reviews r JOIN users u ON u.id = r.reviewer_id
             WHERE r.reviewed_id = $1 AND r.is_public = TRUE
             ORDER BY r.created_at DESC LIMIT 10`, [req.params.id]),
      query(`SELECT * FROM portfolio_photos WHERE worker_id = $1 ORDER BY created_at DESC`, [req.params.id]),
      query(`SELECT * FROM availability_slots WHERE worker_id = $1 ORDER BY weekday, hour_start`, [req.params.id]),
    ]);

    res.json({ ...u, services: svcs.rows, reviews: reviews.rows, photos: photos.rows, availability: slots.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/v1/workers/:id/availability — toggle disponibilidade
router.patch('/:id/availability', authMiddleware, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: 'Sem permissão' });
  const { is_available } = req.body;
  try {
    const { rows: [u] } = await query(
      `UPDATE users SET is_available = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, is_available`,
      [is_available, req.params.id]
    );
    res.json(u);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/v1/workers/:id/portfolio — adiciona foto ao portfólio
router.post('/:id/portfolio', authMiddleware, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: 'Sem permissão' });
  const { url, caption } = req.body;
  if (!url) return res.status(400).json({ error: 'url obrigatória' });
  try {
    const { rows: [photo] } = await query(
      `INSERT INTO portfolio_photos (worker_id, url, caption) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, url, caption || null]
    );
    res.status(201).json(photo);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/v1/workers/:id/portfolio/:photoId
router.delete('/:id/portfolio/:photoId', authMiddleware, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: 'Sem permissão' });
  try {
    await query(`DELETE FROM portfolio_photos WHERE id = $1 AND worker_id = $2`, [req.params.photoId, req.params.id]);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/v1/workers/:id/slots — horários disponíveis num dia
router.get('/:id/slots', async (req, res) => {
  const { weekday } = req.query;
  try {
    const { rows } = await query(
      `SELECT * FROM availability_slots WHERE worker_id = $1 ${weekday !== undefined ? 'AND weekday = $2' : ''} ORDER BY weekday, hour_start`,
      weekday !== undefined ? [req.params.id, weekday] : [req.params.id]
    );
    res.json({ slots: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
