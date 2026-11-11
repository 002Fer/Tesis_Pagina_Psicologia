const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.utils');
const { isValidEmail, isMinor, calculateAge } = require('../utils/validator.utils');

class AuthController {
  async register(req, res, next) {
    try {
      const { correo, password, nombres, apellidos, fecha_nacimiento, telefono, id_rol, responsable } = req.body;

      if (!correo || !password || !nombres || !apellidos) {
        return errorResponse(res, 400, 'Todos los campos obligatorios deben ser proporcionados: correo, password, nombres, apellidos.');
      }

      if (!isValidEmail(correo)) {
        return errorResponse(res, 400, 'El correo electrónico no tiene un formato válido (ejemplo: usuario@dominio.com).');
      }

      // Validar fecha de nacimiento si se proporciona
      let menorDeEdad = false;
      if (fecha_nacimiento) {
        const edad = calculateAge(fecha_nacimiento);
        if (edad === null || edad < 0 || edad > 120) {
          return errorResponse(res, 400, 'La fecha de nacimiento proporcionada no es válida.');
        }
        menorDeEdad = isMinor(fecha_nacimiento);
      }

      // Si es un paciente menor de edad, validar datos del tutor/responsable
      if (menorDeEdad) {
        if (!responsable || !responsable.nombres || !responsable.apellidos || !responsable.parentesco || !responsable.telefono) {
          return errorResponse(res, 400, 'Para pacientes menores de 18 años es obligatorio registrar los datos del padre, madre o tutor legal responsable (nombres, apellidos, parentesco y teléfono).');
        }

        if (responsable.correo && !isValidEmail(responsable.correo)) {
          return errorResponse(res, 400, 'El correo electrónico del tutor responsable no tiene un formato válido.');
        }
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
        responsable: menorDeEdad ? responsable : (responsable || null),
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
