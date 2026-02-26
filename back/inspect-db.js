/**
 * Script para inspeccionar la base de datos PostgreSQL (Neon)
 * Ejecutar: node inspect-db.js
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
    console.log('=== Conexión exitosa a PostgreSQL (Neon) ===\n');

    // Listar todas las tablas
    const tablesRes = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

    if (tablesRes.rows.length === 0) {
      console.log('No hay tablas en la base de datos.');
      console.log('Se deben crear las tablas: users, citas, schedule (y opcionales: planes, testimonios, config)\n');
      return;
    }

    console.log('Tablas existentes:', tablesRes.rows.length);
    for (const t of tablesRes.rows) {
      console.log('  -', t.table_schema + '.' + t.table_name);
    }

    // Esquema de cada tabla
    for (const t of tablesRes.rows) {
      const fullName = `"${t.table_schema}"."${t.table_name}"`;
      const colsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `, [t.table_schema, t.table_name]);

      console.log('\n---', fullName, '---');
      colsRes.rows.forEach(c => {
        console.log('  ', c.column_name, ':', c.data_type, c.is_nullable === 'NO' ? 'NOT NULL' : '', c.column_default ? `DEFAULT ${c.column_default}` : '');
      });
    }

    // Contar registros por tabla
    console.log('\n--- Conteo de registros ---');
    for (const t of tablesRes.rows) {
      const fullName = t.table_schema === 'public' ? `"${t.table_name}"` : `"${t.table_schema}"."${t.table_name}"`;
      const countRes = await client.query(`SELECT COUNT(*) as n FROM ${fullName}`);
      console.log('  ', t.table_name + ':', countRes.rows[0].n, 'filas');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
