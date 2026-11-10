import api from './api';

export const reportService = {
  async getDashboardSummary() {
    return api.get('/reportes/dashboard');
  },

  async getCitas() {
    return api.get('/reportes/citas');
  },

  async getPacientes() {
    return api.get('/reportes/pacientes');
  },

  async getProfesionales() {
    return api.get('/reportes/profesionales');
  },

  async getEspacios() {
    return api.get('/reportes/espacios');
  },

  async getAsistencias() {
    return api.get('/reportes/asistencias');
  },
};

export default reportService;
