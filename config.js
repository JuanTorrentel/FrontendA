/**
 * Configuración del frontend - URL del API
 * Para producción: definir window.API_BASE_URL antes de cargar este script
 * o editar la URL por defecto debajo
 */
(function(global) {
  if (typeof global.API_BASE_URL !== 'undefined') return;
  const host = global.location?.hostname || '';
  const isLocal = /localhost|127\.0\.0\.1|^$/.test(host);
  global.API_BASE_URL = isLocal ? 'http://localhost:3002' : (global.DEFAULT_API_URL || 'https://api.tudominio.com');
})(typeof window !== 'undefined' ? window : this);
