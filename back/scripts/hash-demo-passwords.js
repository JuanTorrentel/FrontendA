/**
 * Hashea las contraseñas de los usuarios demo (admin@demo.com, user@demo.com)
 * Ejecutar una vez: node scripts/hash-demo-passwords.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const hash = await bcrypt.hash('123456', 10);
  await pool.query(
    "UPDATE users SET password = $1 WHERE email IN ('admin@demo.com', 'user@demo.com')",
    [hash]
  );
  console.log('Contraseñas demo hasheadas correctamente.');
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
