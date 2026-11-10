import api from './api';

export const spaceService = {
  async getAll(params = {}) {
    return api.get('/espacios', { params });
  },

  async getById(id) {
    return api.get(`/espacios/${id}`);
  },

  async create(data) {
    return api.post('/espacios', data);
  },

  async update(id, data) {
    return api.patch(`/espacios/${id}`, data);
  },

  async getDisponibles(inicio, fin) {
    return api.get('/espacios/disponibles', { params: { inicio, fin } });
  },
};

export default spaceService;
