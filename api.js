/**
 * Cliente API - Yotago School
 * Conecta con el backend para auth, citas y schedule
 */
const API = (function() {
  const getBase = () => (typeof API_BASE_URL !== 'undefined' ? String(API_BASE_URL).replace(/\/$/, '') : 'http://localhost:3002');
  const getToken = () => sessionStorage.getItem('ytg_token') || localStorage.getItem('ytg_token');
  const getStorage = () => (localStorage.getItem('ytg_remember') ? localStorage : sessionStorage);

  async function request(method, path, body) {
    const url = getBase() + path;
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const token = getToken();
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || 'Error en la solicitud');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    auth: {
      login: (email, password) => request('POST', '/api/auth/login', { email, password }),
      register: (nombre, email, celular, password) =>
        request('POST', '/api/auth/register', { nombre, email, celular, password }),
      verify: (token) => request('GET', '/api/auth/verify?token=' + encodeURIComponent(token)),
      me: () => request('GET', '/api/auth/me'),
    },
    citas: {
      list: () => request('GET', '/api/citas'),
      slots: (fecha) => request('GET', '/api/citas/slots?fecha=' + encodeURIComponent(fecha)),
      create: (data) => request('POST', '/api/citas', data),
      update: (id, data) => request('PUT', '/api/citas/' + id, data),
      delete: (id) => request('DELETE', '/api/citas/' + id),
    },
    schedule: {
      get: () => request('GET', '/api/schedule'),
      put: (data) => request('PUT', '/api/schedule', data),
    },
    getToken,
    getStorage,
  };
})();
