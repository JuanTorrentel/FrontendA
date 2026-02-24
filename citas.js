/**
 * Citas.js - CRUD de citas (SOLO FRONT-END)
 * Persistencia en localStorage. Slots de 15 min, sin solapamientos.
 */

const CITAS_STORAGE_KEY = 'ytg_citas';
const AVAILABILITY_STORAGE_KEY = 'ytg_availability';
const SCHEDULE_STORAGE_KEY = 'ytg_schedule'; // Lun-Dom con rangos { "0":[{start,end}], ..., "6":[] }
const SLOT_MINUTES = 15;
const DURATION_MINUTES = 15;
const MODALIDAD = 'Virtual';
const SERVICIOS = ['Curso', 'Mentoría', 'Copytrading'];
const ESTADOS = ['Pendiente', 'Confirmada', 'Reprogramada', 'Cancelada'];
const HOUR_START = 8;
const HOUR_END = 18;

/**
 * Genera slots de 15 min entre HOUR_START y HOUR_END
 */
function generateSlots() {
  const slots = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

/**
 * Suma 15 minutos a HH:mm
 */
function add15Minutes(hora) {
  const [h, m] = hora.split(':').map(Number);
  let total = h * 60 + m + DURATION_MINUTES;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/**
 * Compara fecha+hora para saber si A es anterior a B
 */
function isBefore(dateA, timeA, dateB, timeB) {
  if (dateA !== dateB) return dateA < dateB;
  return timeA < timeB;
}

/**
 * Comprueba si un slot está ocupado (excluyendo citaId para edición)
 */
function isSlotOcupado(fecha, horaInicio, excluirCitaId = null) {
  const citas = getCitas();
  const horaFin = add15Minutes(horaInicio);

  return citas.some((c) => {
    if (c.estado === 'Cancelada') return false;
    if (excluirCitaId && c.id === excluirCitaId) return false;
    if (c.fecha !== fecha) return false;

    const cStart = c.horaInicio;
    const cEnd = c.horaFin;

    const overlap =
      (horaInicio >= cStart && horaInicio < cEnd) ||
      (horaFin > cStart && horaFin <= cEnd) ||
      (horaInicio <= cStart && horaFin >= cEnd);

    return overlap;
  });
}

/**
 * Obtiene todas las citas
 */
function getCitas() {
  try {
    const data = localStorage.getItem(CITAS_STORAGE_KEY);
    const arr = data ? JSON.parse(data) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Guarda citas
 */
function saveCitas(citas) {
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(citas));
}

/**
 * Horario semanal (admin): rangos por día de semana.
 * dow: 0=Domingo, 1=Lunes, ..., 6=Sábado
 * Estructura: { "0": [{ start: "09:00", end: "12:00" }, ...], ..., "6": [] }
 */
function getSchedule() {
  try {
    const data = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    const s = data ? JSON.parse(data) : {};
    return typeof s === 'object' ? s : {};
  } catch {
    return {};
  }
}

function setSchedule(schedule) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
}

/** Genera slots de 15 min en un rango [start, end) */
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

/** Slots disponibles para una fecha según el horario semanal (dow del día) */
function getSlotsDisponiblesParaFecha(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  const dow = d.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
  const schedule = getScheduleWithDefaults();
  const ranges = schedule[String(dow)];
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return [];
  }
  const allSlots = new Set();
  ranges.forEach((r) => {
    const start = (r && r.start) || '08:00';
    const end = (r && r.end) || '18:00';
    slotsFromRange(start, end).forEach((s) => allSlots.add(s));
  });
  return [...allSlots].sort();
}

/** Horario por defecto: Lun-Vie 9:00-18:00 */
function getDefaultSchedule() {
  const ranges = [{ start: '09:00', end: '18:00' }];
  return { '1': ranges, '2': ranges, '3': ranges, '4': ranges, '5': ranges, '0': [], '6': [] };
}

function getScheduleWithDefaults() {
  const s = getSchedule();
  if (Object.keys(s).length === 0) return getDefaultSchedule();
  const out = {};
  for (let d = 0; d <= 6; d++) {
    const key = String(d);
    out[key] = Array.isArray(s[key]) ? s[key] : [];
  }
  return out;
}

/** Indica si un slot está disponible: en horario del profesional Y no ocupado */
function isSlotDisponible(fecha, horaInicio, excluirCitaId = null) {
  const slotsProf = getSlotsDisponiblesParaFecha(fecha);
  if (!slotsProf.includes(horaInicio)) return false;
  return !isSlotOcupado(fecha, horaInicio, excluirCitaId);
}

/** Para agenda: retorna { disponibles: [], ocupados: [] } para una fecha */
function getEstadoSlotsParaFecha(fecha) {
  const slotsProf = getSlotsDisponiblesParaFecha(fecha);
  const ocupados = getCitas()
    .filter((c) => c.fecha === fecha && c.estado !== 'Cancelada')
    .map((c) => c.horaInicio);
  const disponibles = slotsProf.filter((s) => !ocupados.includes(s));
  return { disponibles, ocupados, todos: slotsProf };
}

/**
 * Datos semilla para demo
 */
function seedCitas() {
  const existing = getCitas();
  if (existing.length > 0) return;

  const hoy = new Date();
  const hoyStr = hoy.toISOString().split('T')[0];
  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);
  const mañanaStr = mañana.toISOString().split('T')[0];

  const seed = [
    {
      id: 'seed-1',
      nombre: 'Juan Pérez',
      whatsapp: '+57 300 111 2233',
      email: 'juan@ejemplo.com',
      servicio: 'Curso',
      fecha: hoyStr,
      horaInicio: '10:00',
      horaFin: '10:15',
      modalidad: MODALIDAD,
      duracionMinutos: DURATION_MINUTES,
      comentarios: 'Primera clase de introducción',
      estado: 'Pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: 2,
    },
    {
      id: 'seed-2',
      nombre: 'María González',
      whatsapp: '+57 310 222 3344',
      email: 'maria@ejemplo.com',
      servicio: 'Mentoría',
      fecha: hoyStr,
      horaInicio: '11:00',
      horaFin: '11:15',
      modalidad: MODALIDAD,
      duracionMinutos: DURATION_MINUTES,
      comentarios: '',
      estado: 'Confirmada',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: 2,
    },
    {
      id: 'seed-3',
      nombre: 'Carlos López',
      whatsapp: '+57 320 333 4455',
      email: 'carlos@ejemplo.com',
      servicio: 'Copytrading',
      fecha: mañanaStr,
      horaInicio: '09:15',
      horaFin: '09:30',
      modalidad: MODALIDAD,
      duracionMinutos: DURATION_MINUTES,
      comentarios: 'Consulta sobre plataforma',
      estado: 'Pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: 2,
    },
    {
      id: 'seed-4',
      nombre: 'Ana Martínez',
      whatsapp: '+57 315 444 5566',
      email: 'ana@ejemplo.com',
      servicio: 'Curso',
      fecha: mañanaStr,
      horaInicio: '14:00',
      horaFin: '14:15',
      modalidad: MODALIDAD,
      duracionMinutos: DURATION_MINUTES,
      comentarios: '',
      estado: 'Confirmada',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: 2,
    },
    {
      id: 'seed-5',
      nombre: 'Pedro Ruiz',
      whatsapp: '+57 301 555 6677',
      email: 'pedro@ejemplo.com',
      servicio: 'Mentoría',
      fecha: mañanaStr,
      horaInicio: '16:30',
      horaFin: '16:45',
      modalidad: MODALIDAD,
      duracionMinutos: DURATION_MINUTES,
      comentarios: 'Seguimiento de estrategia',
      estado: 'Cancelada',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: 2,
    },
  ];

  saveCitas(seed);
}

/**
 * Crea una cita
 */
function crearCita(data, userId) {
  seedCitas();

  const { nombre, whatsapp, email, servicio, fecha, horaInicio, comentarios } = data;

  const now = new Date().toISOString();
  const ahora = new Date();
  const fechaSel = new Date(fecha + 'T00:00:00');
  const hoyStart = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  if (fechaSel < hoyStart) {
    return { success: false, error: 'No puedes agendar en el pasado' };
  }

  const hoyStr = ahora.toISOString().split('T')[0];
  if (fecha === hoyStr) {
    const [h, m] = horaInicio.split(':').map(Number);
    const slotTime = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
    if (slotTime <= ahora) {
      return { success: false, error: 'No puedes agendar en el pasado' };
    }
  }

  const userEmail = (email || '').trim().toLowerCase();
  const citasActivas = getCitas().filter(
    (c) => c.estado !== 'Cancelada' && c.email.toLowerCase() === userEmail
  );
  if (citasActivas.length >= 1) {
    return { success: false, error: 'Solo puedes tener una cita activa. Cancela tu cita actual para agendar otra.' };
  }

  if (!isSlotDisponible(fecha, horaInicio)) {
    return { success: false, error: 'Este horario ya no está disponible. Elige otro slot.' };
  }

  if (!SERVICIOS.includes(servicio)) {
    return { success: false, error: 'Servicio no válido' };
  }

  const horaFin = add15Minutes(horaInicio);
  const id = 'cita-' + Date.now();

  const nueva = {
    id,
    nombre: (nombre || '').trim(),
    whatsapp: (whatsapp || '').trim(),
    email: (email || '').trim(),
    servicio,
    fecha,
    horaInicio,
    horaFin,
    modalidad: MODALIDAD,
    duracionMinutos: DURATION_MINUTES,
    comentarios: (comentarios || '').trim(),
    estado: 'Pendiente',
    createdAt: now,
    updatedAt: now,
    createdByUserId: userId,
  };

  const todas = getCitas();
  todas.push(nueva);
  saveCitas(todas);

  return { success: true, cita: nueva };
}

/**
 * Actualiza una cita (admin)
 */
function actualizarCita(id, cambios) {
  const citas = getCitas();
  const idx = citas.findIndex((c) => c.id === id);
  if (idx < 0) return { success: false, error: 'Cita no encontrada' };

  const actual = citas[idx];
  const fecha = cambios.fecha ?? actual.fecha;
  const horaInicio = cambios.horaInicio ?? actual.horaInicio;

  if (cambios.fecha || cambios.horaInicio) {
    const ahora = new Date();
    const fechaSel = new Date(fecha + 'T00:00:00');
    const hoyStart = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    if (fechaSel < hoyStart) {
      return { success: false, error: 'No puedes programar en una fecha pasada' };
    }

    const hoyStr = ahora.toISOString().split('T')[0];
    if (fecha === hoyStr) {
      const [h, m] = horaInicio.split(':').map(Number);
      const slotTime = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
      if (slotTime <= ahora) {
        return { success: false, error: 'No puedes programar en un horario pasado' };
      }
    }

    if (!isSlotDisponible(fecha, horaInicio, id)) {
      return { success: false, error: 'Este horario no está disponible' };
    }
  }

  const horaFin = add15Minutes(horaInicio);
  const updated = {
    ...actual,
    ...cambios,
    horaFin,
    duracionMinutos: DURATION_MINUTES,
    modalidad: MODALIDAD,
    updatedAt: new Date().toISOString(),
  };

  citas[idx] = updated;
  saveCitas(citas);

  return { success: true, cita: updated };
}

/**
 * Elimina una cita (o la cancela según criterio - aquí eliminamos)
 */
function eliminarCita(id) {
  const citas = getCitas();
  const filtradas = citas.filter((c) => c.id !== id);
  if (filtradas.length === citas.length) {
    return { success: false, error: 'Cita no encontrada' };
  }
  saveCitas(filtradas);
  return { success: true };
}

/**
 * Obtiene citas de un usuario por email
 */
function getCitasByUserEmail(email) {
  return getCitas().filter((c) => c.email.toLowerCase() === (email || '').toLowerCase());
}
