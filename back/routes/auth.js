/**
 * Rutas de autenticación
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function toCamel(obj) {
  if (!obj) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, celular, password } = req.body;
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedNombre = (nombre || '').trim();
    const trimmedCelular = (celular || '').trim();

    if (!trimmedNombre || !trimmedEmail || !trimmedCelular || !password) {
      return res.status(400).json({ error: 'Completa todos los campos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const exists = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [trimmedEmail]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    }

    const token = 'ytg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
    const hash = await bcrypt.hash(password, 10);
    const id = 'usr_' + Date.now();

    await pool.query(
      `INSERT INTO users (id, nombre, email, celular, password, rol, verified, verification_token)
       VALUES ($1, $2, $3, $4, $5, 'user', 0, $6)`,
      [id, trimmedNombre, trimmedEmail, trimmedCelular, hash, token]
    );

    const baseUrl = req.protocol + '://' + req.get('host');
    const verifyUrl = baseUrl.replace(/:\d+$/, '') + req.baseUrl.replace('/api', '') + '/../verify.html?token=' + encodeURIComponent(token);
    const frontUrl = process.env.FRONT_URL || 'http://localhost:5500';
    const verifyUrlFront = frontUrl + '/verify.html?token=' + encodeURIComponent(token);

    res.json({ success: true, verifyUrl: verifyUrlFront });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return res.status(400).json({ error: 'Completa todos los campos' });
    }

    const r = await pool.query(
      'SELECT id, nombre, email, celular, password, rol, verified FROM users WHERE LOWER(email) = $1',
      [trimmedEmail]
    );
    const row = r.rows[0];
    if (!row) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    if (!row.verified) {
      return res.status(400).json({
        error: 'Cuenta no verificada. Revisa tu correo y haz clic en el enlace de verificación.',
      });
    }

    const valid = await bcrypt.compare(password, row.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: row.id, email: row.email, rol: row.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const usuario = {
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      celular: row.celular || '',
      rol: row.rol,
    };

    res.json({ success: true, token, usuario });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/verify?token=xxx
router.get('/verify', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const r = await pool.query(
      'SELECT id, verified FROM users WHERE verification_token = $1',
      [token]
    );
    const row = r.rows[0];
    if (!row) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    if (row.verified) {
      return res.status(400).json({ error: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión.' });
    }

    await pool.query(
      'UPDATE users SET verified = 1, verification_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [row.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Error al verificar' });
  }
});

// GET /api/auth/me - Usuario actual (requiere token)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, nombre, email, celular, rol FROM users WHERE id = $1',
      [req.user.id]
    );
    const row = r.rows[0];
    if (!row) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(toCamel(row));
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

module.exports = router;
