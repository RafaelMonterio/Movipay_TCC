import api from './api';
import mockAuthService from './mockAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  async login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch (error) {
      // Se houver erro de conexão (sem backend), usar mock
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        console.warn('⚠️ Backend não disponível. Usando modo offline com dados de teste.');
        return mockAuthService.login(email, password);
      }
      throw error;
    }
  },

  async register(name, email, password) {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      await AsyncStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        console.warn('⚠️ Backend não disponível. Usando modo offline com dados de teste.');
        return mockAuthService.register(name, email, password);
      }
      throw error;
    }
  },

  async logout() {
    await AsyncStorage.clear();
  },

  async getMe() {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        return mockAuthService.getMe();
      }
      throw error;
    }
  },

  async switchMode(mode) {
    try {
      const { data } = await api.patch('/auth/mode', { mode });
      await AsyncStorage.setItem('access_token', data.access_token);
      return data;
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        return mockAuthService.switchMode(mode);
      }
      throw error;
    }
  },
};

export default authService;
