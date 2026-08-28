import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('access_token', data.access_token);
    return data.user;
  },

  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    await AsyncStorage.setItem('access_token', data.access_token);
    return data.user;
  },

  async logout() {
    await AsyncStorage.clear();
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async switchMode(mode) {
    const { data } = await api.patch('/auth/mode', { mode });
    await AsyncStorage.setItem('access_token', data.access_token);
    return data;
  },
};

export default authService;
