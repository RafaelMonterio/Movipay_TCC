const fs   = require('fs');
const path = require('path');
const { pool } = require('./pool');

const DB_DIR = path.join(__dirname, '..', '..', '..', '..', 'database');

async function runSQLDir(dirPath, label) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.sql'))
    .sort(); // ordem numérica garantida pelo prefixo 001_, 01_, etc.

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const sql      = fs.readFileSync(filePath, 'utf8');
    try {
      await pool.query(sql);
      console.log(`  ✓ ${label}/${file}`);
    } catch (err) {
      // "already exists" errors são inofensivos (IF NOT EXISTS nas migrations)
      if (err.code === '42P07' || err.message.includes('already exists')) {
        console.log(`  ~ ${label}/${file} (já existia)`);
      } else {
        console.error(`  ✗ ${label}/${file}: ${err.message}`);
        throw err;
      }
    }
  }
}

async function runMigrations() {
  console.log('\n🗄️  Executando migrations...');
  await runSQLDir(path.join(DB_DIR, 'migrations'), 'migrations');

  console.log('\n⚙️  Criando functions...');
  await runSQLDir(path.join(DB_DIR, 'functions'), 'functions');

  console.log('\n⚡ Criando triggers...');
  await runSQLDir(path.join(DB_DIR, 'triggers'), 'triggers');

  console.log('\n🌱 Executando seeds...');
  await runSQLDir(path.join(DB_DIR, 'seeds'), 'seeds');

  console.log('\n✅ Banco de dados pronto!\n');
}

module.exports = { runMigrations };
