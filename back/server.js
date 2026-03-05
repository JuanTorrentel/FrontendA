/**
 * Servidor API - Yotago School
 * Citas, autenticación, horario
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { logInfo } = require('./logger');

const authRoutes = require('./routes/auth');
const citasRoutes = require('./routes/citas');
const scheduleRoutes = require('./routes/schedule');

const app = express();
const PORT = process.env.PORT || 8080;

const frontUrlRaw = process.env.FRONT_URL || 'http://localhost:5500';
const allowedOrigins = frontUrlRaw.split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(origin => {
    if (!/^https?:\/\//i.test(origin)) return 'https://' + origin.replace(/^\/*/, '');
    return origin.replace(/\/+$/, '');
  });
if (allowedOrigins.length === 0) allowedOrigins.push('http://localhost:5500');

// Middleware de logging básico por petición
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  res.locals.requestId = requestId;
  logInfo('request_in', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  res.on('finish', () => {
    logInfo('request_out', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
});

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => o === '*')) return cb(null, true);
    cb(null, allowedOrigins[0]);
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/schedule', scheduleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Yotago API' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`API Yotago escuchando en ${HOST}:${PORT}`);
  console.log('CORS permitido para:', allowedOrigins.length ? allowedOrigins.join(', ') : frontUrlRaw);
});
