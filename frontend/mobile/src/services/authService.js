import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEED_USERS = {
  'ana@teste.com': {
    id: 1,
    name: 'Ana Cliente',
    email: 'ana@teste.com',
    password: '123456',
    mode: 'client',
    points: 120,
    phone: '(11) 99999-1111',
    bio: 'Cliente em desenvolvimento do frontend.',
  },
  'bruno@teste.com': {
    id: 2,
    name: 'Bruno Trabalhador',
    email: 'bruno@teste.com',
    password: '123456',
    mode: 'worker',
    points: 320,
    phone: '(11) 98888-2222',
    bio: 'Trabalhador em desenvolvimento do frontend.',
  },
};

async function getLocalUsers() {
  try {
    const raw = await AsyncStorage.getItem('movipay_users_db');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveLocalUsers(db) {
  try {
    await AsyncStorage.setItem('movipay_users_db', JSON.stringify(db));
  } catch {
    // ignora falha silenciosa de persistência
  }
}

async function getLocalDevUser() {
  try {
    const raw = await AsyncStorage.getItem('dev_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const authService = {
  async login(email, password) {
    const normalized = (email || '').trim().toLowerCase();
    const db = { ...SEED_USERS, ...(await getLocalUsers()) };
    const found = db[normalized];

    if (found && found.password === password) {
      const { password: _password, ...user } = found;
      await AsyncStorage.setItem('access_token', 'dev-token');
      await AsyncStorage.setItem('dev_user', JSON.stringify(user));
      return user;
    }

    try {
      const { data } = await api.post('/auth/login', { email: normalized, password });
      await AsyncStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch (error) {
      throw new Error(error?.response?.data?.error || 'E-mail ou senha incorretos.');
    }
  },

  async register(name, email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const db = { ...SEED_USERS, ...(await getLocalUsers()) };

    if (!normalizedEmail || !password) {
      throw new Error('Preencha todos os campos obrigatórios.');
    }

    if (db[normalizedEmail]) {
      throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
    }

    try {
      const { data } = await api.post('/auth/register', { name, email: normalizedEmail, password });
      await AsyncStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch (error) {
      const newUser = {
        id: Date.now(),
        name: name || 'Usuário',
        email: normalizedEmail,
        password,
        mode: 'client',
        points: 0,
        phone: '',
        bio: '',
      };

      db[normalizedEmail] = newUser;
      await saveLocalUsers(db);
      const { password: _password, ...user } = newUser;
      await AsyncStorage.setItem('access_token', 'dev-token');
      await AsyncStorage.setItem('dev_user', JSON.stringify(user));
      return user;
    }
  },

  async logout() {
    await AsyncStorage.clear();
  },

  async getMe() {
    const token = await AsyncStorage.getItem('access_token');
    if (token === 'dev-token') {
      const user = await getLocalDevUser();
      if (!user) throw new Error('Sessão expirada.');
      return user;
    }

    const { data } = await api.get('/auth/me');
    return data;
  },

  async switchMode(mode) {
    const token = await AsyncStorage.getItem('access_token');
    if (token === 'dev-token') {
      const current = await getLocalDevUser();
      const updated = { ...current, mode };
      await AsyncStorage.setItem('dev_user', JSON.stringify(updated));
      return { access_token: 'dev-token' };
    }

    const { data } = await api.patch('/auth/mode', { mode });
    await AsyncStorage.setItem('access_token', data.access_token);
    return data;
  },
};

export default authService;
