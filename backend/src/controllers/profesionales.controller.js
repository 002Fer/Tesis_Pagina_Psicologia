const profesionalesService = require('../services/profesionales.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class ProfesionalesController {
  async getAll(req, res, next) {
    try {
      const { estado } = req.query;
      const data = await profesionalesService.getAll({ estado });
      return successResponse(res, 200, 'Lista de profesionales obtenida', data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await profesionalesService.getById(id);
      return successResponse(res, 200, 'Profesional encontrado', data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { correo, password, nombres, apellidos, telefono } = req.body;
      if (!correo || !nombres || !apellidos) {
        return errorResponse(res, 400, 'Campos requeridos: correo, nombres, apellidos');
      }
      const data = await profesionalesService.create({ correo, password, nombres, apellidos, telefono });
      return successResponse(res, 201, 'Profesional creado exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = await profesionalesService.update(id, req.body);
      return successResponse(res, 200, 'Profesional actualizado', data);
    } catch (err) {
      next(err);
    }
  }

  async getDisponibilidad(req, res, next) {
    try {
      const { id } = req.params;
      const data = await profesionalesService.getDisponibilidad(id);
      return successResponse(res, 200, 'Disponibilidad obtenida', data);
    } catch (err) {
      next(err);
    }
  }

  async addDisponibilidad(req, res, next) {
    try {
      const { id } = req.params;
      // Seguridad: solo admin o el propio profesional pueden modificar su disponibilidad
      if (req.user.rol === 'PROFESIONAL' && req.user.id_profesional !== Number(id)) {
        return errorResponse(res, 403, 'No tiene permiso para editar la disponibilidad de otro profesional.');
      }

      const { dia_semana, hora_inicio, hora_fin, fecha_inicio_vigencia, fecha_fin_vigencia } = req.body;
      if (!dia_semana || !hora_inicio || !hora_fin) {
        return errorResponse(res, 400, 'Campos obligatorios: dia_semana, hora_inicio, hora_fin');
      }

      const data = await profesionalesService.addDisponibilidad(id, {
        dia_semana,
        hora_inicio,
        hora_fin,
        fecha_inicio_vigencia,
        fecha_fin_vigencia,
      });
      return successResponse(res, 201, 'Disponibilidad agregada exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async deleteDisponibilidad(req, res, next) {
    try {
      const { id, idDisponibilidad } = req.params;
      if (req.user.rol === 'PROFESIONAL' && req.user.id_profesional !== Number(id)) {
        return errorResponse(res, 403, 'No tiene permiso para eliminar la disponibilidad de otro profesional.');
      }

      const data = await profesionalesService.deleteDisponibilidad(id, idDisponibilidad);
      return successResponse(res, 200, 'Disponibilidad desactivada', data);
    } catch (err) {
      next(err);
    }
  }

  async getHorariosDisponibles(req, res, next) {
    try {
      const { id } = req.params;
      const { fecha } = req.query; // Formato YYYY-MM-DD
      if (!fecha) {
        return errorResponse(res, 400, 'Debe especificar el parámetro ?fecha=YYYY-MM-DD');
      }

      const slots = await profesionalesService.getHorariosDisponiblesPorFecha(id, fecha);
      return successResponse(res, 200, 'Horarios disponibles consultados', slots);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfesionalesController();
