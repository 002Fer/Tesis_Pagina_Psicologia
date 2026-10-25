const asistenciasService = require('../services/asistencias.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class AsistenciasController {
  async registrar(req, res, next) {
    try {
      const { id_cita, estado, tipo_inasistencia } = req.body;
      if (!id_cita || !estado) {
        return errorResponse(res, 400, 'id_cita y estado son requeridos');
      }

      const data = await asistenciasService.registrar(
        {
          id_cita,
          estado,
          tipo_inasistencia,
        },
        req.user
      );
      return successResponse(res, 201, 'Asistencia registrada con éxito', data);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { id_profesional, estado } = req.query;
      const data = await asistenciasService.getAll({ id_profesional, estado });
      return successResponse(res, 200, 'Lista de asistencias obtenida', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AsistenciasController();
