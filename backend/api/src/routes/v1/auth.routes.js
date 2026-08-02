const express  = require('express');
const bcrypt   = require('bcryptjs');
const { query }            = require('../../db/pool');
const { authMiddleware, signToken } = require('../../middleware/auth');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    mode = 'client',
    phone = '',
    bio = '',
    city = '',
  } = req.body;

  const normalizedMode = ['client', 'worker'].includes(mode) ? mode : 'client';

  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email e password são obrigatórios' });

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, mode, phone, bio, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, mode, points, created_at`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        password_hash,
        normalizedMode,
        phone?.toString().trim() || null,
        bio?.toString().trim() || null,
        city?.toString().trim() || null,
      ]
    );

    const user = rows[0];
    // Bônus de boas-vindas
    await query(
      `INSERT INTO points_history (user_id, type, amount, description)
       VALUES ($1, 'bonus', 50, 'Bônus de boas-vindas')`,
      [user.id]
    );
    await query(`UPDATE users SET points = 50 WHERE id = $1`, [user.id]);
    user.points = 50;

    res.status(201).json({ user, access_token: signToken(user) });
  } catch (err) {
    if (err.code === '23505')  // unique_violation
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email e password são obrigatórios' });

  try {
    const { rows } = await query(
      `SELECT id, name, email, password_hash, mode, points
       FROM users WHERE email = $1 AND is_active = TRUE`,
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Credenciais inválidas' });

    const { password_hash, ...safe } = user;
    res.json({ user: safe, access_token: signToken(safe) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, mode, points, avatar_url, phone, bio, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PATCH /api/v1/auth/mode
router.patch('/mode', authMiddleware, async (req, res) => {
  const { mode } = req.body;
  if (!['client', 'worker'].includes(mode))
    return res.status(400).json({ error: 'mode deve ser "client" ou "worker"' });

  try {
    const { rows } = await query(
      `UPDATE users SET mode = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, mode, points`,
      [mode, req.user.id]
    );
    res.json({ access_token: signToken(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
