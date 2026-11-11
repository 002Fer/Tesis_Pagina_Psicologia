const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.utils');
const { isValidEmail, isMinor, calculateAge } = require('../utils/validator.utils');

class AuthController {
  async register(req, res, next) {
    try {
      const {
        correo,
        password,
        nombres,
        apellidos,
        fecha_nacimiento,
        telefono,
        id_rol,
        es_menor_edad = false,
        responsable,
      } = req.body;

      if (!correo || !password || !nombres || !apellidos) {
        return errorResponse(res, 400, 'Todos los campos obligatorios deben ser proporcionados: correo, password, nombres, apellidos.');
      }

      if (!isValidEmail(correo)) {
        return errorResponse(res, 400, 'El correo electrónico no tiene un formato válido (ejemplo: usuario@dominio.com).');
      }

      // Validar fecha de nacimiento y coherencia con la opción seleccionada
      let menorDeEdad = Boolean(es_menor_edad);
      if (fecha_nacimiento) {
        const edad = calculateAge(fecha_nacimiento);
        if (edad === null || edad < 0 || edad > 120) {
          return errorResponse(res, 400, 'La fecha de nacimiento proporcionada no es válida.');
        }

        if (menorDeEdad && edad >= 18) {
          return errorResponse(
            res,
            400,
            `La fecha de nacimiento corresponde a una persona mayor de edad (${edad} años). Si es mayor de 18 años, elija la opción de registro personal.`
          );
        }

        if (!menorDeEdad && edad < 18) {
          return errorResponse(
            res,
            400,
            `La fecha de nacimiento corresponde a un menor de 18 años (${edad} años). Por favor seleccione la opción 'Padre, Madre o Tutor registrando a un Menor de Edad'.`
          );
        }

        if (edad < 18) {
          menorDeEdad = true;
        }
      }

      // Si es un paciente menor de edad, validar datos del tutor/responsable
      let responsableFinal = null;
      if (menorDeEdad) {
        if (!responsable || !responsable.nombres || !responsable.apellidos || !responsable.parentesco) {
          return errorResponse(
            res,
            400,
            'Para pacientes menores de 18 años es obligatorio registrar los nombres, apellidos y parentesco del padre, madre o tutor legal responsable.'
          );
        }

        const telefonoTutor = (responsable.telefono || telefono || '').trim();
        if (!telefonoTutor) {
          return errorResponse(res, 400, 'Debe proporcionar un número de teléfono o celular del tutor legal para contacto clínico.');
        }

        responsableFinal = {
          nombres: responsable.nombres.trim(),
          apellidos: responsable.apellidos.trim(),
          parentesco: responsable.parentesco.trim(),
          telefono: telefonoTutor,
          correo: correo.trim().toLowerCase(), // El correo de la cuenta pertenece al tutor legal
        };
      } else if (responsable && responsable.nombres && responsable.apellidos) {
        responsableFinal = responsable;
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
        responsable: responsableFinal,
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
