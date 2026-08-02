const { Pool } = require('pg');

// Pool de conexões — reutiliza conexões abertas em vez de criar uma nova por query
const pool = new Pool({
  host:     process.env.DB_HOST     || 'db',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'movipay',
  user:     process.env.DB_USER     || 'movipay',
  password: process.env.DB_PASSWORD || 'movipay_secret',
  max:      20,        // máximo de conexões simultâneas no pool
  idleTimeoutMillis:    30000,
  connectionTimeoutMillis: 5000,
});

// Testa a conexão ao iniciar
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool do PostgreSQL:', err.message);
});

// Helper: executa uma query com parâmetros
async function query(text, params) {
  const start = Date.now();
  const res   = await pool.query(text, params);
  const ms    = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SQL] ${ms}ms → ${text.slice(0, 80).replace(/\s+/g, ' ')}`);
  }
  return res;
}

// Helper: pega uma conexão do pool (para transações)
async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
