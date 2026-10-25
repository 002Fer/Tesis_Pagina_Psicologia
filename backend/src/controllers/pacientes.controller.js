const pacientesService = require('../services/pacientes.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class PacientesController {
  async getAll(req, res, next) {
    try {
      const { estado, search } = req.query;
      const data = await pacientesService.getAll(req.user, { estado, search });
      return successResponse(res, 200, 'Lista de pacientes obtenida', data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await pacientesService.getById(id, req.user);
      return successResponse(res, 200, 'Paciente encontrado', data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { nombres, apellidos, fecha_nacimiento, telefono, estado } = req.body;
      if (!nombres || !apellidos) {
        return errorResponse(res, 400, 'Nombres y apellidos son requeridos.');
      }
      const data = await pacientesService.create(
        { nombres, apellidos, fecha_nacimiento, telefono, estado },
        req.user.id_usuario
      );
      return successResponse(res, 201, 'Paciente registrado exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = await pacientesService.update(id, req.body, req.user);
      return successResponse(res, 200, 'Datos del paciente actualizados', data);
    } catch (err) {
      next(err);
    }
  }

  async addResponsable(req, res, next) {
    try {
      const { id } = req.params;
      const { nombres, apellidos, parentesco, telefono, correo } = req.body;
      if (!nombres || !apellidos) {
        return errorResponse(res, 400, 'Nombres y apellidos del responsable requeridos');
      }
      const data = await pacientesService.addResponsable(id, {
        nombres,
        apellidos,
        parentesco,
        telefono,
        correo,
      });
      return successResponse(res, 201, 'Responsable agregado', data);
    } catch (err) {
      next(err);
    }
  }

  async createSolicitud(req, res, next) {
    try {
      const idPaciente = req.user.rol === 'PACIENTE' ? req.user.id_paciente : req.body.id_paciente;
      if (!idPaciente) {
        return errorResponse(res, 400, 'Identificador de paciente no proporcionado.');
      }
      const { motivo_consulta } = req.body;
      const data = await pacientesService.createSolicitud(idPaciente, motivo_consulta);
      return successResponse(res, 201, 'Solicitud de atención creada', data);
    } catch (err) {
      next(err);
    }
  }

  async getSolicitudes(req, res, next) {
    try {
      const { estado } = req.query;
      const data = await pacientesService.getSolicitudes({ estado });
      return successResponse(res, 200, 'Solicitudes de atención obtenidas', data);
    } catch (err) {
      next(err);
    }
  }

  async getHistorial(req, res, next) {
    try {
      const { id } = req.params;
      const data = await pacientesService.getHistorial(id, req.user);
      return successResponse(res, 200, 'Historial administrativo obtenido', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PacientesController();
