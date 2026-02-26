/**
 * Servidor API - Yotago School
 * Citas, autenticación, horario
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const citasRoutes = require('./routes/citas');
const scheduleRoutes = require('./routes/schedule');

const app = express();
const PORT = process.env.PORT || 3002;

const frontUrl = process.env.FRONT_URL || 'http://localhost:5500';
const allowedOrigins = frontUrl.split(',').map(s => s.trim()).filter(Boolean);
if (allowedOrigins.length === 0) allowedOrigins.push('http://localhost:5500');

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

app.listen(PORT, () => {
  console.log(`API Yotago escuchando en http://localhost:${PORT}`);
  console.log(`CORS permitido para: ${frontUrl}`);
});
