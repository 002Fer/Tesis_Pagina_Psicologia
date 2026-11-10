import api from './api';

export const authService = {
  async login(correo, password) {
    return api.post('/auth/login', { correo, password });
  },

  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async getMe() {
    return api.get('/auth/me');
  },
};

export default authService;
