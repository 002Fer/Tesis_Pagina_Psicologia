/**
 * Utilidades para estandarizar respuestas HTTP en la API
 */

const successResponse = (res, statusCode = 200, message = 'Operación exitosa', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 500, message = 'Ocurrió un error en el servidor', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
