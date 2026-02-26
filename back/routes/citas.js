/**
 * Rutas de citas
 */
const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
const SLOT_MINUTES = 15;
const DURATION_MINUTES = 15;
const MODALIDAD = 'Virtual';
const SERVICIOS = ['Curso', 'Mentoría', 'Copytrading'];

function toCamel(obj) {
  if (!obj) return obj;
  const map = {
    hora_inicio: 'horaInicio',
    hora_fin: 'horaFin',
    duracion_minutos: 'duracionMinutos',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    created_by_user_id: 'createdByUserId',
  };
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const camel = map[k] || k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

function add15Minutes(hora) {
  const [h, m] = hora.split(':').map(Number);
  let total = h * 60 + m + DURATION_MINUTES;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function slotsFromRange(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let tStart = sh * 60 + sm;
  const tEnd = eh * 60 + em;
  const slots = [];
  while (tStart + SLOT_MINUTES <= tEnd) {
    const h = Math.floor(tStart / 60);
    const m = tStart % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    tStart += SLOT_MINUTES;
  }
  return slots;
}

// GET /api/citas - Listar (admin: todas, user: propias)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM citas ORDER BY fecha, hora_inicio';
    let params = [];
    if (req.user.rol !== 'admin') {
      query = 'SELECT * FROM citas WHERE LOWER(email) = LOWER($1) ORDER BY fecha, hora_inicio';
      params = [req.user.email];
    }
    const r = await pool.query(query, params);
    res.json(r.rows.map(toCamel));
  } catch (err) {
    console.error('Get citas error:', err);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// GET /api/citas/slots?fecha=YYYY-MM-DD
router.get('/slots', async (req, res) => {
  try {
    const fecha = req.query.fecha;
    if (!fecha) {
      return res.status(400).json({ error: 'Parámetro fecha requerido' });
    }

    const d = new Date(fecha + 'T12:00:00');
    const dow = d.getDay();

    const schedRes = await pool.query('SELECT data FROM schedule WHERE id = 1');
    const data = schedRes.rows[0]?.data || {};
    const ranges = data[String(dow)];
    if (!Array.isArray(ranges) || ranges.length === 0) {
      return res.json({ disponibles: [], ocupados: [], todos: [] });
    }

    const allSlots = new Set();
    ranges.forEach((r) => {
      const start = (r && r.start) || '08:00';
      const end = (r && r.end) || '18:00';
      slotsFromRange(start, end).forEach((s) => allSlots.add(s));
    });
    const todos = [...allSlots].sort();

    const citasRes = await pool.query(
      "SELECT hora_inicio FROM citas WHERE fecha = $1 AND estado != 'Cancelada'",
      [fecha]
    );
    const ocupados = citasRes.rows.map((r) => r.hora_inicio);
    const disponibles = todos.filter((s) => !ocupados.includes(s));

    res.json({ disponibles, ocupados, todos });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ error: 'Error al obtener slots' });
  }
});

// POST /api/citas - Crear (autenticado)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, whatsapp, email, servicio, fecha, horaInicio, comentarios } = req.body;

    if (!nombre || !email || !servicio || !fecha || !horaInicio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (!SERVICIOS.includes(servicio)) {
      return res.status(400).json({ error: 'Servicio no válido' });
    }

    const ahora = new Date();
    const fechaSel = new Date(fecha + 'T00:00:00');
    const hoyStart = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    if (fechaSel < hoyStart) {
      return res.status(400).json({ error: 'No puedes agendar en el pasado' });
    }
    const hoyStr = ahora.toISOString().split('T')[0];
    if (fecha === hoyStr) {
      const [h, m] = horaInicio.split(':').map(Number);
      const slotTime = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
      if (slotTime <= ahora) {
        return res.status(400).json({ error: 'No puedes agendar en el pasado' });
      }
    }

    const userEmail = (email || '').trim().toLowerCase();
    const activasRes = await pool.query(
      "SELECT id FROM citas WHERE LOWER(email) = $1 AND estado != 'Cancelada'",
      [userEmail]
    );
    if (activasRes.rows.length >= 1) {
      return res.status(400).json({
        error: 'Solo puedes tener una cita activa. Cancela tu cita actual para agendar otra.',
      });
    }

    const slotsRes = await pool.query(
      "SELECT hora_inicio FROM citas WHERE fecha = $1 AND estado != 'Cancelada'",
      [fecha]
    );
    const ocupados = slotsRes.rows.map((r) => r.hora_inicio);
    if (ocupados.includes(horaInicio)) {
      return res.status(400).json({ error: 'Este horario ya no está disponible. Elige otro slot.' });
    }

    const horaFin = add15Minutes(horaInicio);
    const id = 'cita-' + Date.now();

    await pool.query(
      `INSERT INTO citas (id, nombre, whatsapp, email, servicio, fecha, hora_inicio, hora_fin, modalidad, duracion_minutos, comentarios, estado, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Pendiente', $12)`,
      [
        id,
        (nombre || '').trim(),
        (whatsapp || '').trim(),
        (email || '').trim(),
        servicio,
        fecha,
        horaInicio,
        horaFin,
        MODALIDAD,
        DURATION_MINUTES,
        (comentarios || '').trim(),
        req.user.id,
      ]
    );

    const row = (await pool.query('SELECT * FROM citas WHERE id = $1', [id])).rows[0];
    res.status(201).json(toCamel(row));
  } catch (err) {
    console.error('Create cita error:', err);
    res.status(500).json({ error: 'Error al crear cita' });
  }
});

// PUT /api/citas/:id - Actualizar (solo admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, whatsapp, email, servicio, fecha, horaInicio, estado, comentarios } = req.body;

    const existRes = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);
    const actual = existRes.rows[0];
    if (!actual) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const newFecha = fecha ?? actual.fecha;
    const newHora = horaInicio ?? actual.hora_inicio;

    if (fecha || horaInicio) {
      const ahora = new Date();
      const fechaSel = new Date(newFecha + 'T00:00:00');
      const hoyStart = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      if (fechaSel < hoyStart) {
        return res.status(400).json({ error: 'No puedes programar en una fecha pasada' });
      }
      const ocupadosRes = await pool.query(
        "SELECT hora_inicio FROM citas WHERE fecha = $1 AND estado != 'Cancelada' AND id != $2",
        [newFecha, id]
      );
      if (ocupadosRes.rows.some((r) => r.hora_inicio === newHora)) {
        return res.status(400).json({ error: 'Este horario no está disponible' });
      }
    }

    const horaFin = add15Minutes(newHora);

    await pool.query(
      `UPDATE citas SET
        nombre = COALESCE($2, nombre),
        whatsapp = COALESCE($3, whatsapp),
        email = COALESCE($4, email),
        servicio = COALESCE($5, servicio),
        fecha = COALESCE($6, fecha),
        hora_inicio = COALESCE($7, hora_inicio),
        hora_fin = COALESCE($8, hora_fin),
        estado = COALESCE($9, estado),
        comentarios = COALESCE($10, comentarios),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        id,
        nombre,
        whatsapp,
        email,
        servicio,
        fecha,
        horaInicio,
        horaFin,
        estado,
        comentarios,
      ]
    );

    const row = (await pool.query('SELECT * FROM citas WHERE id = $1', [id])).rows[0];
    res.json(toCamel(row));
  } catch (err) {
    console.error('Update cita error:', err);
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
});

// DELETE /api/citas/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.rol !== 'admin') {
      const own = await pool.query('SELECT id FROM citas WHERE id = $1 AND LOWER(email) = LOWER($2)', [
        id,
        req.user.email,
      ]);
      if (own.rows.length === 0) {
        return res.status(403).json({ error: 'No puedes eliminar esta cita' });
      }
    }

    const r = await pool.query('DELETE FROM citas WHERE id = $1 RETURNING id', [id]);
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete cita error:', err);
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
});

module.exports = router;
