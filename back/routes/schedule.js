/**
 * Rutas de horario semanal
 */
const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_SCHEDULE = {
  0: [],
  1: [{ start: '09:00', end: '18:00' }],
  2: [{ start: '09:00', end: '18:00' }],
  3: [{ start: '09:00', end: '18:00' }],
  4: [{ start: '09:00', end: '18:00' }],
  5: [{ start: '09:00', end: '18:00' }],
  6: [],
};

// GET /api/schedule - Público (para slots)
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT data FROM schedule WHERE id = 1');
    const data = r.rows[0]?.data || DEFAULT_SCHEDULE;
    res.json(data);
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json({ error: 'Error al obtener horario' });
  }
});

// PUT /api/schedule - Solo admin
router.put('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const out = {};
    for (let d = 0; d <= 6; d++) {
      const key = String(d);
      out[key] = Array.isArray(data[key]) ? data[key] : [];
    }

    const r = await pool.query('UPDATE schedule SET data = $1 WHERE id = 1', [out]);
    if (r.rowCount === 0) {
      await pool.query('INSERT INTO schedule (id, data) VALUES (1, $1)', [out]);
    }

    res.json(out);
  } catch (err) {
    console.error('Put schedule error:', err);
    res.status(500).json({ error: 'Error al guardar horario' });
  }
});

module.exports = router;
