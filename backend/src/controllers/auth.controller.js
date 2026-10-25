const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class AuthController {
  async register(req, res, next) {
    try {
      const { correo, password, nombres, apellidos, fecha_nacimiento, telefono, id_rol } = req.body;

      if (!correo || !password || !nombres || !apellidos) {
        return errorResponse(res, 400, 'Todos los campos obligatorios deben ser proporcionados: correo, password, nombres, apellidos.');
      }

      // Si no es admin, solo se permite autoregistro como PACIENTE (id_rol = 3)
      let roleToAssign = 3;
      if (req.user && req.user.rol === 'ADMINISTRADOR' && id_rol) {
        roleToAssign = id_rol;
      }

      const result = await authService.register({
        correo,
        password,
        nombres,
        apellidos,
        fecha_nacimiento,
        telefono,
        id_rol: roleToAssign,
      });

      return successResponse(res, 201, 'Usuario registrado exitosamente', result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { correo, password } = req.body;
      if (!correo || !password) {
        return errorResponse(res, 400, 'Por favor proporcione correo y contraseña.');
      }

      const result = await authService.login(correo, password);
      return successResponse(res, 200, 'Inicio de sesión exitoso', result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getMe(req.user.id_usuario);
      return successResponse(res, 200, 'Información del usuario obtenida', result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
