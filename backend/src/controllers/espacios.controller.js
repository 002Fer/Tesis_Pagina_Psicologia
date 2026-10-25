const espaciosService = require('../services/espacios.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

class EspaciosController {
  async getAll(req, res, next) {
    try {
      const { estado } = req.query;
      const data = await espaciosService.getAll({ estado });
      return successResponse(res, 200, 'Lista de espacios obtenida', data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await espaciosService.getById(id);
      return successResponse(res, 200, 'Espacio obtenido', data);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { nombre, descripcion, ubicacion, estado } = req.body;
      if (!nombre) {
        return errorResponse(res, 400, 'El nombre del espacio es obligatorio');
      }
      const data = await espaciosService.create({ nombre, descripcion, ubicacion, estado });
      return successResponse(res, 201, 'Espacio creado exitosamente', data);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = await espaciosService.update(id, req.body);
      return successResponse(res, 200, 'Espacio actualizado', data);
    } catch (err) {
      next(err);
    }
  }

  async getDisponibles(req, res, next) {
    try {
      const { inicio, fin } = req.query;
      if (!inicio || !fin) {
        return errorResponse(res, 400, 'Debe especificar inicio y fin en formato ISO (ej. ?inicio=...&fin=...)');
      }
      const data = await espaciosService.getDisponibles(inicio, fin);
      return successResponse(res, 200, 'Espacios disponibles obtenidos', data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EspaciosController();
