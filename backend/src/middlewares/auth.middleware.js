const { verifyToken } = require('../utils/jwt.utils');
const { query } = require('../config/database');
const { errorResponse } = require('../utils/response.utils');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No se proporcionó un token de autorización válido.');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      return errorResponse(res, 401, 'Token de autenticación expirado o inválido.');
    }

    // Consultar el estado actual del usuario en la BD
    const userQuery = `
      SELECT u.id_usuario, u.correo, u.estado, u.id_rol, r.nombre AS rol_nombre,
             p.id_profesional, pac.id_paciente
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN profesional p ON p.id_usuario = u.id_usuario
      LEFT JOIN paciente pac ON pac.id_usuario = u.id_usuario
      WHERE u.id_usuario = $1
    `;
    const result = await query(userQuery, [decoded.id_usuario]);

    if (result.rowCount === 0) {
      return errorResponse(res, 401, 'Usuario no encontrado.');
    }

    const user = result.rows[0];
    if (user.estado !== 'ACTIVO') {
      return errorResponse(res, 403, `El usuario se encuentra ${user.estado}. Acceso denegado.`);
    }

    // Adjuntar usuario a la request
    req.user = {
      id_usuario: Number(user.id_usuario),
      correo: user.correo,
      id_rol: Number(user.id_rol),
      rol: user.rol_nombre,
      id_profesional: user.id_profesional ? Number(user.id_profesional) : null,
      id_paciente: user.id_paciente ? Number(user.id_paciente) : null,
    };

    next();
  } catch (err) {
    console.error('[AUTH_MIDDLEWARE] Error:', err);
    return errorResponse(res, 500, 'Error interno durante la autenticación.');
  }
};

module.exports = {
  authenticate,
};
