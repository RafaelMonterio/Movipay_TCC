import api from './api';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    return data.user;
  },
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('access_token', data.access_token);
    return data.user;
  },
  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },
  async switchMode(mode) {
    const { data } = await api.patch('/auth/mode', { mode });
    localStorage.setItem('access_token', data.access_token);
    return data;
  },
  logout() {
    localStorage.clear();
  },
};

export default authService;
