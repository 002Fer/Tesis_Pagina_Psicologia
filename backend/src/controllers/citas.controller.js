const citasService = require('../services/citas.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class CitasController {
  async getAll(req, res, next) {
    try {
      const { id_paciente, id_profesional, estado, tipo, fecha, search } = req.query;
      const data = await citasService.getAll(req.user, {
        id_paciente,
        id_profesional,
        estado,
        tipo,
        fecha,
        search,
      });
      return successResponse(res, 200, 'Lista de citas obtenida', data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await citasService.getById(id, req.user);
      return successResponse(res, 200, 'Detalle de la cita obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { id_paciente, id_profesional, id_espacio, id_plan_seguimiento, fecha_hora_inicio, fecha_hora_fin, tipo } = req.body;

      if (!id_profesional || !fecha_hora_inicio || !fecha_hora_fin) {
        return errorResponse(res, 400, 'Parámetros obligatorios: id_profesional, fecha_hora_inicio, fecha_hora_fin');
      }

      const data = await citasService.create(
        {
          id_paciente,
          id_profesional,
          id_espacio,
          id_plan_seguimiento,
          fecha_hora_inicio,
          fecha_hora_fin,
          tipo,
        },
        req.user
      );
      return successResponse(res, 201, 'Cita programada exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async cancelar(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo_cancelacion } = req.body;
      const data = await citasService.cancelar(id, motivo_cancelacion, req.user);
      return successResponse(res, 200, 'Cita cancelada exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async reprogramar(req, res, next) {
    try {
      const { id } = req.params;
      const { nueva_fecha_hora_inicio, nueva_fecha_hora_fin, id_espacio } = req.body;

      if (!nueva_fecha_hora_inicio || !nueva_fecha_hora_fin) {
        return errorResponse(res, 400, 'Debe indicar nueva_fecha_hora_inicio y nueva_fecha_hora_fin');
      }

      const data = await citasService.reprogramar(
        id,
        {
          nueva_fecha_hora_inicio,
          nueva_fecha_hora_fin,
          id_espacio,
        },
        req.user
      );
      return successResponse(res, 200, 'Cita reprogramada exitosamente', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CitasController();
