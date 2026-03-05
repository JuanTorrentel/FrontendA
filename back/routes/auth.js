/**
 * Rutas de autenticación
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../email');
const { logError, logInfo } = require('../logger');

const router = express.Router();
const PASSWORD_RESET_TTL_MINUTES = 60;

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

    const now = new Date();

    await pool.query(
      `INSERT INTO users (id, nombre, email, celular, password, rol, verified, verification_token)
       VALUES ($1, $2, $3, $4, $5, 'user', 0, $6)`,
      [id, trimmedNombre, trimmedEmail, trimmedCelular, hash, token]
    );

    const baseUrl = req.protocol + '://' + req.get('host');
    const verifyUrl = baseUrl.replace(/:\d+$/, '') + req.baseUrl.replace('/api', '') + '/../verify.html?token=' + encodeURIComponent(token);
    // FRONT_URL puede ser una sola URL o varias separadas por comas (CORS); para el enlace usamos solo la primera
    let frontUrl = (process.env.FRONT_URL || 'http://localhost:5500').split(',')[0].trim();
    if (!/^https?:\/\//i.test(frontUrl)) {
      frontUrl = 'https://' + frontUrl.replace(/^\/*/, '');
    }
    frontUrl = frontUrl.replace(/\/+$/, '');
    const verifyUrlFront = frontUrl + '/verify.html?token=' + encodeURIComponent(token);

    // Preparado para envío real de correo: ahora mismo usa provider "console"
    await sendVerificationEmail({ to: trimmedEmail, verifyUrl: verifyUrlFront });

    logInfo('user_registered', { email: trimmedEmail, userId: id });

    res.json({ success: true, verifyUrl: verifyUrlFront });
  } catch (err) {
    logError('register_error', err, { route: 'POST /api/auth/register' });
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

    logInfo('login_success', { email: trimmedEmail, userId: row.id });

    res.json({ success: true, token, usuario });
  } catch (err) {
    logError('login_error', err, { route: 'POST /api/auth/login' });
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

    logInfo('verify_success', { userId: row.id });

    res.json({ success: true });
  } catch (err) {
    logError('verify_error', err, { route: 'GET /api/auth/verify' });
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
    logError('me_error', err, { route: 'GET /api/auth/me', userId: req.user?.id });
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// POST /api/auth/forgot-password - solicita link mágico para restablecer contraseña
router.post('/forgot-password', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Correo obligatorio' });
    }

    const r = await pool.query(
      'SELECT id, email, verified FROM users WHERE LOWER(email) = $1',
      [email]
    );
    const user = r.rows[0];

    // Respondemos siempre 200 para no filtrar si el correo existe o no.
    if (!user || !user.verified) {
      logInfo('forgot_password_non_existing_or_unverified', { email });
      return res.json({ success: true });
    }

    const token = 'rst_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [token, expiresAt.toISOString(), user.id]
    );

    let frontUrl = (process.env.FRONT_URL || 'http://localhost:5500').split(',')[0].trim();
    if (!/^https?:\/\//i.test(frontUrl)) {
      frontUrl = 'https://' + frontUrl.replace(/^\/*/, '');
    }
    frontUrl = frontUrl.replace(/\/+$/, '');
    const resetUrl = `${frontUrl}/reset.html?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({ to: email, resetUrl });
    logInfo('forgot_password_token_created', { email, userId: user.id });

    res.json({ success: true });
  } catch (err) {
    logError('forgot_password_error', err, { route: 'POST /api/auth/forgot-password' });
    res.status(500).json({ error: 'Error al solicitar restablecimiento' });
  }
});

// POST /api/auth/reset-password - aplica el link mágico y cambia la contraseña
router.post('/reset-password', async (req, res) => {
  try {
    const token = (req.body.token || '').trim();
    const newPassword = (req.body.password || '').trim();

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const r = await pool.query(
      'SELECT id, email, password_reset_expires_at FROM users WHERE password_reset_token = $1',
      [token]
    );
    const user = r.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    if (user.password_reset_expires_at && new Date(user.password_reset_expires_at) < new Date()) {
      return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = $1,
           password_reset_token = NULL,
           password_reset_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hash, user.id]
    );

    logInfo('reset_password_success', { userId: user.id, email: user.email });

    res.json({ success: true });
  } catch (err) {
    logError('reset_password_error', err, { route: 'POST /api/auth/reset-password' });
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
});

module.exports = router;
