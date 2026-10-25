const { errorResponse } = require('../utils/response.utils');

/**
 * Middleware para validar que el rol del usuario esté dentro de los permitidos
 * @param  {...string} allowedRoles Ej: 'ADMINISTRADOR', 'PROFESIONAL'
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'No autenticado.');
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return errorResponse(
        res,
        403,
        `Acceso no autorizado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
