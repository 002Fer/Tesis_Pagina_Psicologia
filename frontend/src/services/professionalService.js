import api from './api';

export const professionalService = {
  async getPublicList() {
    return api.get('/profesionales/public');
  },

  async getAll(params = {}) {
    return api.get('/profesionales', { params });
  },

  async getById(id) {
    return api.get(`/profesionales/${id}`);
  },

  async create(data) {
    return api.post('/profesionales', data);
  },

  async update(id, data) {
    return api.patch(`/profesionales/${id}`, data);
  },

  async getDisponibilidad(id) {
    return api.get(`/profesionales/${id}/disponibilidad`);
  },

  async getHorariosLibres(id, fecha) {
    return api.get(`/profesionales/${id}/horarios-libres`, { params: { fecha } });
  },

  async addDisponibilidad(id, data) {
    return api.post(`/profesionales/${id}/disponibilidad`, data);
  },

  async deleteDisponibilidad(id, idDisponibilidad) {
    return api.delete(`/profesionales/${id}/disponibilidad/${idDisponibilidad}`);
  },
};

export default professionalService;
