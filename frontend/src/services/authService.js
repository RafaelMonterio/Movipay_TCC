import api from './api';

// ── Contas de teste pré-existentes ────────────────────────────────────────────
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

// ── Banco local persistente (localStorage) ────────────────────────────────────
const DB_KEY = 'movipay_users_db';

function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    // Seeds sempre presentes, contas salvas sobrescrevem as seeds se existirem
    return { ...SEED_USERS, ...saved };
  } catch {
    return { ...SEED_USERS };
  }
}

function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch { /* quota excedida: ignora */ }
}

function getDevUser() {
  try {
    const raw = localStorage.getItem('dev_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Serviço ───────────────────────────────────────────────────────────────────
const authService = {
  async login(email, password) {
    const normalized = (email || '').trim().toLowerCase();

    // Verifica banco local PRIMEIRO — sem precisar de backend
    const db = getDB();
    const found = db[normalized];
    if (found && found.password === password) {
      const { password: _pw, ...user } = found;
      localStorage.setItem('access_token', 'dev-token');
      localStorage.setItem('dev_user', JSON.stringify(user));
      return user;
    }

    // Se não encontrou localmente, tenta API real
    try {
      const { data } = await api.post('/auth/login', { email: normalized, password });
      localStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch {
      throw new Error('E-mail ou senha incorretos.');
    }
  },

  async register(payload) {
    const email = (payload?.email || '').trim().toLowerCase();
    if (!email || !payload?.password) throw new Error('Preencha todos os campos obrigatórios.');

    const db = getDB();

    // Verifica duplicidade localmente
    if (db[email]) {
      throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
    }

    // Tenta API real primeiro
    try {
      const { data } = await api.post('/auth/register', { ...payload, email });
      localStorage.setItem('access_token', data.access_token);
      return data.user;
    } catch { /* sem backend: cai no fallback local */ }

    // Fallback: persiste no banco local
    const newUser = {
      id: Date.now(),
      name: payload.name || 'Usuário',
      email,
      password: payload.password,
      mode: payload.mode || 'client',
      points: 0,
      phone: payload.phone || '',
      bio: payload.bio || '',
      avatar_url: payload.avatar_url || '',
      lat: payload.lat || null,
      lng: payload.lng || null,
      neighborhood: payload.neighborhood || '',
      category: payload.category || '',
    };

    db[email] = newUser;
    saveDB(db);

    const { password: _pw, ...user } = newUser;
    localStorage.setItem('access_token', 'dev-token');
    localStorage.setItem('dev_user', JSON.stringify(user));
    return user;
  },

  async getMe() {
    if (localStorage.getItem('access_token') === 'dev-token') {
      const user = getDevUser();
      if (!user) throw new Error('Sessão expirada.');
      return user;
    }
    const { data } = await api.get('/auth/me');
    return data;
  },

  async switchMode(mode) {
    if (localStorage.getItem('access_token') === 'dev-token') {
      const current = getDevUser();
      const updated = { ...current, mode };
      const db = getDB();
      if (current?.email && db[current.email]) {
        db[current.email].mode = mode;
        saveDB(db);
      }
      localStorage.setItem('dev_user', JSON.stringify(updated));
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