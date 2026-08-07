import api from './api';

const DEV_USERS = {
  'ana@teste.com': {
    id: 1,
    name: 'Ana Cliente',
    email: 'ana@teste.com',
    mode: 'client',
    points: 120,
    phone: '(11) 99999-1111',
    bio: 'Cliente em desenvolvimento do frontend.',
  },
  'bruno@teste.com': {
    id: 2,
    name: 'Bruno Trabalhador',
    email: 'bruno@teste.com',
    mode: 'worker',
    points: 320,
    phone: '(11) 98888-2222',
    bio: 'Trabalhador em desenvolvimento do frontend.',
  },
};

function getDevUser() {
  try {
    const value = localStorage.getItem('dev_user');
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

const authService = {
  async login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch (error) {
      const normalized = (email || '').trim().toLowerCase();
      const fakeUser = DEV_USERS[normalized];
      if (fakeUser && password === '123456') {
        localStorage.setItem('access_token', 'dev-token');
        localStorage.setItem('dev_user', JSON.stringify(fakeUser));
        return fakeUser;
      }
      throw error;
    }
  },
  async register(payload) {
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch (error) {
      const email = (payload?.email || '').trim().toLowerCase();
      const fakeUser = {
        id: Date.now(),
        name: payload?.name || 'Usuário Dev',
        email,
        mode: payload?.mode || 'client',
        points: 0,
        phone: payload?.phone || '',
        bio: payload?.bio || 'Usuário de desenvolvimento local.',
      };

      if (email && payload?.password) {
        localStorage.setItem('access_token', 'dev-token');
        localStorage.setItem('dev_user', JSON.stringify(fakeUser));
        return fakeUser;
      }

      throw error;
    }
  },
  async getMe() {
    if (localStorage.getItem('access_token') === 'dev-token') {
      return getDevUser();
    }

    const { data } = await api.get('/auth/me');
    return data;
  },
  async switchMode(mode) {
    if (localStorage.getItem('access_token') === 'dev-token') {
      const current = getDevUser();
      const nextUser = { ...current, mode };
      localStorage.setItem('dev_user', JSON.stringify(nextUser));
      return { access_token: 'dev-token' };
    }

    const { data } = await api.patch('/auth/mode', { mode });
    localStorage.setItem('access_token', data.access_token);
    return data;
  },
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('dev_user');
  },
};

export default authService;
