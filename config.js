/**
 * Configuración del frontend - URL del API
 * Para producción: definir window.API_BASE_URL antes de cargar este script
 * o editar la URL por defecto debajo.
 * Si se define más de una URL (separada por comas), se usa solo la primera.
 */
(function(global) {
  if (typeof global.API_BASE_URL !== 'undefined') return;
  const host = global.location?.hostname || '';
  const isLocal = /localhost|127\.0\.0\.1|^$/.test(host);
  let base = isLocal
    ? 'http://localhost:3002'
    : (global.DEFAULT_API_URL || 'https://yotago-api.fly.dev');
  base = String(base).split(',')[0].trim();
  if (base && !/^https?:\/\//i.test(base)) base = 'https://' + base.replace(/^\/*/, '');
  global.API_BASE_URL = (base || 'http://localhost:3002').replace(/\/+$/, '');
})(typeof window !== 'undefined' ? window : this);
