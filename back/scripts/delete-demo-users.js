/**
 * Elimina los usuarios demo (admin@demo.com, user@demo.com) de la base de datos.
 * Ejecutar una sola vez cuando ya no quieras tener esos usuarios en producción.
 *
 * Uso:
 *   cd back
 *   node scripts/delete-demo-users.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

async function run() {
  try {
    const res = await pool.query(
      "DELETE FROM users WHERE email IN ('admin@demo.com', 'user@demo.com') RETURNING id, email, nombre, rol"
    );
    console.log(`Usuarios eliminados: ${res.rowCount}`);
    if (res.rows.length) {
      console.table(res.rows);
    }
  } catch (e) {
    console.error('Error eliminando usuarios demo:', e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();

