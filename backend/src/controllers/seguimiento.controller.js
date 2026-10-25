const seguimientoService = require('../services/seguimiento.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class SeguimientoController {
  async vincular(req, res, next) {
    try {
      const { id_paciente, id_profesional, origen } = req.body;
      if (!id_paciente || !id_profesional) {
        return errorResponse(res, 400, 'id_paciente e id_profesional son requeridos');
      }
      const data = await seguimientoService.vincularPaciente({ id_paciente, id_profesional, origen }, req.user);
      return successResponse(res, 201, 'Vinculación registrada exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async createPlan(req, res, next) {
    try {
      const { id_vinculacion, frecuencia, horarios } = req.body;
      if (!id_vinculacion || !frecuencia) {
        return errorResponse(res, 400, 'id_vinculacion y frecuencia son requeridos');
      }
      const data = await seguimientoService.createPlan({ id_vinculacion, frecuencia, horarios }, req.user);
      return successResponse(res, 201, 'Plan de seguimiento creado exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async getPlanById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await seguimientoService.getPlanById(id);
      return successResponse(res, 200, 'Plan de seguimiento obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async updateFrecuencia(req, res, next) {
    try {
      const { id } = req.params;
      const { nueva_frecuencia, horarios } = req.body;
      if (!nueva_frecuencia) {
        return errorResponse(res, 400, 'nueva_frecuencia es requerida');
      }
      const data = await seguimientoService.updateFrecuencia(id, { nueva_frecuencia, horarios }, req.user);
      return successResponse(res, 200, 'Frecuencia de seguimiento actualizada', data);
    } catch (err) {
      next(err);
    }
  }

  async finalizar(req, res, next) {
    try {
      const { id } = req.params;
      const data = await seguimientoService.finalizarSeguimiento(id, req.user);
      return successResponse(res, 200, 'Seguimiento finalizado', data);
    } catch (err) {
      next(err);
    }
  }

  async generarCitas(req, res, next) {
    try {
      const { id } = req.params;
      const { semanas } = req.body;
      const data = await seguimientoService.generarCitasRecurrentes(id, semanas || 4, req.user);
      return successResponse(res, 201, `${data.length} citas de seguimiento generadas`, data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SeguimientoController();
