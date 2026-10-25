const { errorResponse } = require('../utils/response.utils');

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR_HANDLER]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno en el servidor';
  const errors = err.errors || null;

  return errorResponse(res, statusCode, message, errors);
};

module.exports = {
  errorHandler,
};
