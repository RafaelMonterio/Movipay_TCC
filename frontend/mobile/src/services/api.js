import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) return envUrl.replace(/\/$/, '');

  if (__DEV__) {
    const debuggerHost =
      Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
    const host = debuggerHost?.split(':')[0];
    if (host) return `http://${host}:3000/api/v1`;
  }

  return 'https://SUA_API_EM_PRODUCAO.com/api/v1';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default api;
