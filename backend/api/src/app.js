require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const { runMigrations } = require('./db/migrate');
const authRoutes        = require('./routes/v1/auth.routes');
const servicesRoutes    = require('./routes/v1/services.routes');
const ordersRoutes      = require('./routes/v1/orders.routes');
const chatRoutes        = require('./routes/v1/chat.routes');
const reviewsRoutes     = require('./routes/v1/reviews.routes');
const quotesRoutes      = require('./routes/v1/quotes.routes');
const workersRoutes     = require('./routes/v1/workers.routes');
const paymentsRoutes    = require('./routes/v1/payments.routes');
const {
  pointsRouter,
  paymentsRouter,
  workersRouter,
  calendarRouter,
  usersRouter,
} = require('./routes/v1/other.routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/services', servicesRoutes);
app.use('/api/v1/orders',   ordersRoutes);
app.use('/api/v1/chat',     chatRoutes);
app.use('/api/v1/reviews',  reviewsRoutes);
app.use('/api/v1/quotes',   quotesRoutes);
app.use('/api/v1/workers',  workersRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/points',    pointsRouter);
app.use('/api/v1/calendar',  calendarRouter);
app.use('/api/v1/users',     usersRouter);
app.use('/api/v1/workers',   workersRouter);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', version: '0.5.0', uptime: process.uptime() })
);
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use((err, req, res, next) => {
  try {
    console.error('=== Erro interno ===');
    console.error('URL:', req.method, req.originalUrl);
    console.error('Body:', req.body);
    console.error(err.stack || err);
  } catch (logErr) {
    console.error('Erro ao logar erro:', logErr);
  }
  res.status(500).json({ error: 'Erro interno' });
});

const PORT = process.env.PORT || 3000;
async function start() {
  const MAX = 15;
  for (let i = 1; i <= MAX; i++) {
    try { const { pool } = require('./db/pool'); await pool.query('SELECT 1'); break; }
    catch {
      console.log(`⏳ Aguardando PostgreSQL... (${i}/${MAX})`);
      await new Promise(r => setTimeout(r, 2000));
      if (i === MAX) process.exit(1);
    }
  }
  await runMigrations();
  app.listen(PORT, () => console.log(`🚀 MoviPay API 0.5.0 na porta ${PORT}`));
}
start();
