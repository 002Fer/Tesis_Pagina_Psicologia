import api from './api';

export const followUpService = {
  async vincular(data) {
    return api.post('/seguimientos/vincular', data);
  },

  async createPlan(data) {
    return api.post('/seguimientos/planes', data);
  },

  async getPlanById(id) {
    return api.get(`/seguimientos/planes/${id}`);
  },

  async updateFrecuencia(id, data) {
    return api.patch(`/seguimientos/planes/${id}/frecuencia`, data);
  },

  async finalizar(id) {
    return api.post(`/seguimientos/planes/${id}/finalizar`);
  },

  async generarCitas(id, semanas = 4) {
    return api.post(`/seguimientos/planes/${id}/generar-citas`, { semanas });
  },
};

export default followUpService;
