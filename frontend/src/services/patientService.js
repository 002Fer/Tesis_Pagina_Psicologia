import api from './api';

export const patientService = {
  async getAll(params = {}) {
    return api.get('/pacientes', { params });
  },

  async getById(id) {
    return api.get(`/pacientes/${id}`);
  },

  async create(data) {
    return api.post('/pacientes', data);
  },

  async update(id, data) {
    return api.patch(`/pacientes/${id}`, data);
  },

  async addResponsable(idPaciente, data) {
    return api.post(`/pacientes/${idPaciente}/responsables`, data);
  },

  async createSolicitud(data) {
    return api.post('/pacientes/solicitud', data);
  },

  async getSolicitudes(params = {}) {
    return api.get('/pacientes/solicitudes', { params });
  },

  async getHistorial(idPaciente) {
    return api.get(`/pacientes/${idPaciente}/historial`);
  },
};

export default patientService;
