/**
 * Auth.js - Autenticación simulada (SOLO FRONT-END)
 * Registro con verificación por token al correo (simulado).
 * Sin backend real. Sesión en sessionStorage, usuarios en localStorage.
 */

const AUTH_STORAGE_KEY = 'ytg_session';
const USERS_STORAGE_KEY = 'ytg_users';

const MOCK_USERS = [
  { id: 1, nombre: 'Admin', email: 'admin@demo.com', password: '123456', rol: 'admin', verified: true },
  { id: 2, nombre: 'Usuario', email: 'user@demo.com', password: '123456', rol: 'user', verified: true },
];

/**
 * Obtiene todos los usuarios (mock + registrados)
 */
function getAllUsers() {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    const arr = stored ? JSON.parse(stored) : [];
    const registrados = Array.isArray(arr) ? arr : [];
    return [...MOCK_USERS, ...registrados];
  } catch {
    return [...MOCK_USERS];
  }
}

/**
 * Guarda usuarios registrados (excluye mock)
 */
function saveRegistredUsers(users) {
  const sinMock = users.filter((u) => !MOCK_USERS.some((m) => m.email === u.email));
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sinMock));
}

/**
 * Genera token único para verificación
 */
function generateToken() {
  return 'ytg_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
}

/**
 * Registro de usuario. Simula envío de token al correo.
 * En realidad redirige a verify.html?token=XXX (simula el enlace del correo).
 * @returns { { success: boolean, verifyUrl?: string, error?: string } }
 */
function register(nombre, email, celular, password) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedNombre = (nombre || '').trim();
  const trimmedCelular = (celular || '').trim();

  if (!trimmedNombre || !trimmedEmail || !trimmedCelular || !password) {
    return { success: false, error: 'Completa todos los campos' };
  }
  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const todos = getAllUsers();
  if (todos.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    return { success: false, error: 'Este correo ya está registrado' };
  }

  const token = generateToken();
  const nuevoUsuario = {
    id: 'usr_' + Date.now(),
    nombre: trimmedNombre,
    email: trimmedEmail,
    celular: trimmedCelular,
    password: password,
    rol: 'user',
    verified: false,
    verificationToken: token,
    createdAt: new Date().toISOString(),
  };

  const registrados = todos.filter((u) => !MOCK_USERS.some((m) => m.email === u.email));
  registrados.push(nuevoUsuario);
  saveRegistredUsers(registrados);

  // Simular envío de correo: en producción sería un email real.
  // Para demo, redirigimos al usuario al enlace de verificación (simula el clic en el email).
  const path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  const baseDir = path.replace(/[^/]*$/, '');
  const verifyUrl = (typeof window !== 'undefined' && window.location)
    ? window.location.origin + baseDir + 'verify.html?token=' + encodeURIComponent(token)
    : 'verify.html?token=' + encodeURIComponent(token);

  return { success: true, verifyUrl };
}

/**
 * Verifica usuario con token del correo
 * @returns { { success: boolean, error?: string } }
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Token inválido' };
  }

  const todos = getAllUsers();
  const idx = todos.findIndex((u) => u.verificationToken === token && !u.verified);
  if (idx < 0) {
    const yaVerificado = todos.find((u) => u.verificationToken === token && u.verified);
    if (yaVerificado) {
      return { success: false, error: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión.' };
    }
    return { success: false, error: 'Token inválido o expirado' };
  }

  const usuario = todos[idx];
  usuario.verified = true;
  delete usuario.verificationToken;

  const registrados = todos.filter((u) => !MOCK_USERS.some((m) => m.email === u.email));
  const regIdx = registrados.findIndex((u) => u.email === usuario.email);
  if (regIdx >= 0) {
    registrados[regIdx] = usuario;
  }
  saveRegistredUsers(registrados);

  return { success: true };
}

/**
 * Obtiene la sesión actual
 */
function getSession() {
  try {
    const data = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda la sesión
 */
function setSession(usuario) {
  const session = {
    isAuthenticated: true,
    rol: usuario.rol,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, celular: usuario.celular },
    timestamp: Date.now(),
  };
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

/**
 * Cierra sesión
 */
function logout() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Intento de login. Solo usuarios verificados.
 * @returns { { success: boolean, usuario?: object, error?: string } }
 */
function login(email, password) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, error: 'Completa todos los campos' };
  }

  const todos = getAllUsers();
  const usuario = todos.find(
    (u) => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
  );

  if (!usuario) {
    return { success: false, error: 'Credenciales inválidas' };
  }

  if (!usuario.verified) {
    return {
      success: false,
      error: 'Cuenta no verificada. Revisa tu correo y haz clic en el enlace de verificación.',
    };
  }

  setSession(usuario);
  return { success: true, usuario };
}

/**
 * Comprueba si hay sesión activa y redirige según corresponda
 * @param {string} page - 'login' | 'agenda' | 'admin' | 'verify'
 * @returns { { allowed: boolean, redirect?: string, msg?: string } }
 */
function checkAuth(page) {
  const session = getSession();

  if (page === 'login') {
    if (session?.isAuthenticated) {
      return {
        allowed: false,
        redirect: session.rol === 'admin' ? 'admin.html' : 'agenda.html',
      };
    }
    return { allowed: true };
  }

  if (page === 'verify') {
    return { allowed: true };
  }

  if (!session?.isAuthenticated) {
    return { allowed: false, redirect: 'login.html', msg: 'Debes iniciar sesión' };
  }

  if (page === 'admin' && session.rol !== 'admin') {
    return { allowed: false, redirect: 'agenda.html', msg: 'Acceso restringido. Solo administradores.' };
  }

  if (page === 'agenda' && session.rol === 'admin') {
    return { allowed: false, redirect: 'admin.html' };
  }

  return { allowed: true };
}
