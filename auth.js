/**
 * Auth.js - Autenticación con backend API
 * Login, registro, verificación con JWT
 */

const AUTH_STORAGE_KEY = 'ytg_session';
const TOKEN_KEY = 'ytg_token';
const REMEMBER_KEY = 'ytg_remember';

/**
 * Obtiene la sesión actual (desde storage)
 */
function getSession() {
  try {
    const storage = localStorage.getItem(REMEMBER_KEY) ? localStorage : sessionStorage;
    const data = storage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda sesión y token
 */
function setSession(usuario, token, remember) {
  const storage = remember ? localStorage : sessionStorage;
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, '1');
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      isAuthenticated: true,
      rol: usuario.rol,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, celular: usuario.celular || '' },
      timestamp: Date.now(),
    }));
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      isAuthenticated: true,
      rol: usuario.rol,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, celular: usuario.celular || '' },
      timestamp: Date.now(),
    }));
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Cierra sesión
 */
function logout() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

/**
 * Login contra API
 * @returns {Promise<{ success: boolean, usuario?: object, error?: string }>}
 */
async function login(email, password) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();
  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, error: 'Completa todos los campos' };
  }

  try {
    const data = await API.auth.login(trimmedEmail, trimmedPassword);
    if (data.token && data.usuario) {
      const remember = document.getElementById('remember')?.checked || false;
      setSession(data.usuario, data.token, remember);
      return { success: true, usuario: data.usuario };
    }
    return { success: false, error: data.error || 'Error al iniciar sesión' };
  } catch (err) {
    return { success: false, error: err.data?.error || err.message || 'Credenciales inválidas' };
  }
}

/**
 * Registro contra API
 * @returns {Promise<{ success: boolean, verifyUrl?: string, error?: string }>}
 */
async function register(nombre, email, celular, password) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedNombre = (nombre || '').trim();
  const trimmedCelular = (celular || '').trim();

  if (!trimmedNombre || !trimmedEmail || !trimmedCelular || !password) {
    return { success: false, error: 'Completa todos los campos' };
  }
  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  try {
    const data = await API.auth.register(trimmedNombre, trimmedEmail, trimmedCelular, password);
    if (data.verifyUrl) {
      return { success: true, verifyUrl: data.verifyUrl };
    }
    return { success: false, error: data.error || 'Error al registrarse' };
  } catch (err) {
    return { success: false, error: err.data?.error || err.message || 'Error al registrarse' };
  }
}

/**
 * Verifica token por email
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Token inválido' };
  }
  try {
    await API.auth.verify(token);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.data?.error || err.message || 'Token inválido o expirado' };
  }
}

/**
 * Comprueba si hay sesión activa
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
