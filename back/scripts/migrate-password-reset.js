/**
 * Añade columnas para recuperación de contraseña por link mágico.
 *
 * Uso:
 *   cd back
 *   node scripts/migrate-password-reset.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function run() {
  const sql = `
    ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
      ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;
  `;

  await pool.query(sql);
  console.log('Migración de campos de recuperación de contraseña aplicada correctamente.');
}

run()
  .catch((e) => {
    console.error('Error ejecutando migración de password reset:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

