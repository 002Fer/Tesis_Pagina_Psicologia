import api from './api';

export const appointmentService = {
  async getAll(params = {}) {
    return api.get('/citas', { params });
  },

  async getById(id) {
    return api.get(`/citas/${id}`);
  },

  async create(data) {
    return api.post('/citas', data);
  },

  async cancel(id, motivo_cancelacion) {
    return api.post(`/citas/${id}/cancelar`, { motivo_cancelacion });
  },

  async reschedule(id, data) {
    return api.post(`/citas/${id}/reprogramar`, data);
  },
};

export const attendanceService = {
  async register(data) {
    return api.post('/asistencias', data);
  },

  async getAll(params = {}) {
    return api.get('/asistencias', { params });
  },
};

export default appointmentService;
