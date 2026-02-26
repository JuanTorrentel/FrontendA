/**
 * Citas.js - CRUD de citas con backend API
 * Cache local para uso síncrono en UI
 */

const SLOT_MINUTES = 15;
const DURATION_MINUTES = 15;
const MODALIDAD = 'Virtual';
const SERVICIOS = ['Curso', 'Mentoría', 'Copytrading'];
const ESTADOS = ['Pendiente', 'Confirmada', 'Reprogramada', 'Cancelada'];
const HOUR_START = 8;
const HOUR_END = 18;

let _citasCache = [];
let _scheduleCache = null;

function handle401(err) {
  if (err?.status === 401) {
    if (typeof logout === 'function') logout();
    if (typeof window !== 'undefined') window.location.href = 'login.html';
  }
}

/**
 * Carga citas desde API y actualiza cache
 */
async function loadCitas() {
  try {
    const data = await API.citas.list();
    _citasCache = Array.isArray(data) ? data : [];
    return _citasCache;
  } catch (err) {
    handle401(err);
    throw err;
  }
}

/**
 * Carga schedule desde API
 */
async function loadSchedule() {
  try {
    const data = await API.schedule.get();
    _scheduleCache = data && typeof data === 'object' ? data : {};
    return _scheduleCache;
  } catch (err) {
    handle401(err);
    throw err;
  }
}

function generateSlots() {
  const slots = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

function add15Minutes(hora) {
  const [h, m] = hora.split(':').map(Number);
  let total = h * 60 + m + DURATION_MINUTES;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function isSlotOcupado(fecha, horaInicio, excluirCitaId = null) {
  const citas = getCitas();
  const horaFin = add15Minutes(horaInicio);
  return citas.some((c) => {
    if (c.estado === 'Cancelada') return false;
    if (excluirCitaId && c.id === excluirCitaId) return false;
    if (c.fecha !== fecha) return false;
    const cStart = c.horaInicio;
    const cEnd = c.horaFin;
    return (
      (horaInicio >= cStart && horaInicio < cEnd) ||
      (horaFin > cStart && horaFin <= cEnd) ||
      (horaInicio <= cStart && horaFin >= cEnd)
    );
  });
}

function getCitas() {
  return _citasCache;
}

function getSchedule() {
  return _scheduleCache || {};
}

function getDefaultSchedule() {
  const ranges = [{ start: '09:00', end: '18:00' }];
  return { '1': ranges, '2': ranges, '3': ranges, '4': ranges, '5': ranges, '0': [], '6': [] };
}

function getScheduleWithDefaults() {
  const s = getSchedule();
  if (!s || Object.keys(s).length === 0) return getDefaultSchedule();
  const out = {};
  for (let d = 0; d <= 6; d++) {
    out[String(d)] = Array.isArray(s[String(d)]) ? s[String(d)] : [];
  }
  return out;
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

function getSlotsDisponiblesParaFecha(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  const dow = d.getDay();
  const schedule = getScheduleWithDefaults();
  const ranges = schedule[String(dow)];
  if (!Array.isArray(ranges) || ranges.length === 0) return [];
  const allSlots = new Set();
  ranges.forEach((r) => {
    const start = (r && r.start) || '08:00';
    const end = (r && r.end) || '18:00';
    slotsFromRange(start, end).forEach((s) => allSlots.add(s));
  });
  return [...allSlots].sort();
}

function isSlotDisponible(fecha, horaInicio, excluirCitaId = null) {
  const slotsProf = getSlotsDisponiblesParaFecha(fecha);
  if (!slotsProf.includes(horaInicio)) return false;
  return !isSlotOcupado(fecha, horaInicio, excluirCitaId);
}

function getEstadoSlotsParaFecha(fecha) {
  const slotsProf = getSlotsDisponiblesParaFecha(fecha);
  const ocupados = getCitas()
    .filter((c) => c.fecha === fecha && c.estado !== 'Cancelada')
    .map((c) => c.horaInicio);
  const disponibles = slotsProf.filter((s) => !ocupados.includes(s));
  return { disponibles, ocupados, todos: slotsProf };
}

async function setSchedule(schedule) {
  try {
    const data = await API.schedule.put(schedule);
    _scheduleCache = data;
    return data;
  } catch (err) {
    handle401(err);
    throw err;
  }
}

/**
 * Crear cita - llama a API
 */
async function crearCita(data, userId) {
  const payload = {
    nombre: data.nombre,
    whatsapp: data.whatsapp,
    email: data.email,
    servicio: data.servicio || 'Mentoría',
    fecha: data.fecha,
    horaInicio: data.horaInicio,
    comentarios: data.comentarios || '',
  };

  const ahora = new Date();
  const fechaSel = new Date(data.fecha + 'T00:00:00');
  const hoyStart = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  if (fechaSel < hoyStart) {
    return { success: false, error: 'No puedes agendar en el pasado' };
  }
  const hoyStr = ahora.toISOString().split('T')[0];
  if (data.fecha === hoyStr) {
    const [h, m] = data.horaInicio.split(':').map(Number);
    const slotTime = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
    if (slotTime <= ahora) {
      return { success: false, error: 'No puedes agendar en el pasado' };
    }
  }
  if (!SERVICIOS.includes(payload.servicio)) {
    return { success: false, error: 'Servicio no válido' };
  }

  try {
    const cita = await API.citas.create(payload);
    _citasCache = [..._citasCache, cita];
    return { success: true, cita };
  } catch (err) {
    handle401(err);
    return { success: false, error: err.data?.error || err.message || 'Error al agendar' };
  }
}

/**
 * Actualizar cita - llama a API
 */
async function actualizarCita(id, cambios) {
  try {
    const cita = await API.citas.update(id, cambios);
    const idx = _citasCache.findIndex((c) => c.id === id);
    if (idx >= 0) {
      _citasCache = [..._citasCache];
      _citasCache[idx] = { ..._citasCache[idx], ...cita };
    } else {
      _citasCache = [..._citasCache, cita];
    }
    return { success: true, cita };
  } catch (err) {
    handle401(err);
    return { success: false, error: err.data?.error || err.message || 'Error al actualizar' };
  }
}

/**
 * Eliminar cita - llama a API
 */
async function eliminarCita(id) {
  try {
    await API.citas.delete(id);
    _citasCache = _citasCache.filter((c) => c.id !== id);
    return { success: true };
  } catch (err) {
    handle401(err);
    return { success: false, error: err.data?.error || err.message || 'Error al eliminar' };
  }
}

function getCitasByUserEmail(email) {
  return getCitas().filter((c) => c.email.toLowerCase() === (email || '').toLowerCase());
}
