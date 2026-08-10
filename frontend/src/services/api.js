import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    // Só envia o header se for um token real (não o token de dev local)
    if (token && token !== 'dev-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const isDevToken = token === 'dev-token';
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

      // Só remove sessão e redireciona se:
      // - for 401
      // - NÃO for token de dev (modo offline/TCC)
      // - NÃO for rota de login/register (que tratam o erro elas mesmas)
      if (error.response?.status === 401 && !isDevToken && !isAuthRoute) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;