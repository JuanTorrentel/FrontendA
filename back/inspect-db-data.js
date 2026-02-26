/**
 * Inspecciona datos de users, schedule
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  const client = await pool.connect();
  try {
    console.log('=== USERS ===');
    const usersRes = await client.query('SELECT id, nombre, email, rol, verified FROM public.users');
    console.log(JSON.stringify(usersRes.rows, null, 2));

    console.log('\n=== SCHEDULE ===');
    const schedRes = await client.query('SELECT * FROM public.schedule');
    console.log(JSON.stringify(schedRes.rows, null, 2));

    console.log('\n=== CITAS (muestra) ===');
    const citasRes = await client.query('SELECT id, nombre, fecha, estado FROM public.citas LIMIT 5');
    console.log(JSON.stringify(citasRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
