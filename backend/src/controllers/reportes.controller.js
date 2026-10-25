const reportesService = require('../services/reportes.service');
const { successResponse } = require('../utils/response.utils');

class ReportesController {
  async getCitas(req, res, next) {
    try {
      const data = await reportesService.getReporteCitas();
      return successResponse(res, 200, 'Reporte de citas obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async getPacientes(req, res, next) {
    try {
      const data = await reportesService.getReportePacientes();
      return successResponse(res, 200, 'Reporte de pacientes obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async getProfesionales(req, res, next) {
    try {
      const data = await reportesService.getReporteProfesionales();
      return successResponse(res, 200, 'Reporte de carga de profesionales obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async getEspacios(req, res, next) {
    try {
      const data = await reportesService.getReporteEspacios();
      return successResponse(res, 200, 'Reporte de ocupación de espacios obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async getAsistencias(req, res, next) {
    try {
      const data = await reportesService.getReporteAsistencias();
      return successResponse(res, 200, 'Reporte de asistencias obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const data = await reportesService.getDashboardSummary(req.user);
      return successResponse(res, 200, 'Resumen para dashboard obtenido', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportesController();
