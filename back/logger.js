/**
 * Logger sencillo y estructurado.
 * Centralizamos aquí los logs para poder mejorar fácilmente
 * (por ejemplo, enviarlos a un servicio externo en el futuro).
 */

function baseFields(extra) {
  return {
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function logInfo(message, extra = {}) {
  console.log(JSON.stringify(baseFields({ level: 'info', message, ...extra })));
}

function logWarn(message, extra = {}) {
  console.warn(JSON.stringify(baseFields({ level: 'warn', message, ...extra })));
}

function logError(message, err, extra = {}) {
  const errorFields = err instanceof Error
    ? { name: err.name, message: err.message, stack: err.stack }
    : { error: err };
  console.error(JSON.stringify(baseFields({ level: 'error', message, ...extra, ...errorFields })));
}

module.exports = {
  logInfo,
  logWarn,
  logError,
};

