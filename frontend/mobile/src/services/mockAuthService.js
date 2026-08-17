import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user para testes sem backend
const MOCK_USERS = {
  'teste@movipay.com': {
    id: '1',
    email: 'teste@movipay.com',
    name: 'Usuário Teste',
    phone: '11999999999',
    mode: 'personal',
    access_token: 'mock_token_teste_12345',
  },
  'empresa@movipay.com': {
    id: '2',
    email: 'empresa@movipay.com',
    name: 'Empresa Teste',
    phone: '11988888888',
    mode: 'business',
    access_token: 'mock_token_empresa_67890',
  },
};

const mockAuthService = {
  async login(email, password) {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = MOCK_USERS[email];
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    if (password !== 'teste123') {
      throw new Error('Email ou senha inválidos');
    }

    // Salvar token no AsyncStorage (igual ao real)
    await AsyncStorage.setItem('access_token', user.access_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      mode: user.mode,
    };
  },

  async register(name, email, password) {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (MOCK_USERS[email]) {
      throw new Error('Email já registrado');
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone: '11900000000',
      mode: 'personal',
      access_token: `mock_token_${Date.now()}`,
    };

    MOCK_USERS[email] = newUser;
    await AsyncStorage.setItem('access_token', newUser.access_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(newUser));

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      mode: newUser.mode,
    };
  },

  async logout() {
    await AsyncStorage.clear();
  },

  async getMe() {
    const userData = await AsyncStorage.getItem('user_data');
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }
    return JSON.parse(userData);
  },

  async switchMode(mode) {
    const userData = await AsyncStorage.getItem('user_data');
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }

    const user = JSON.parse(userData);
    user.mode = mode;
    await AsyncStorage.setItem('user_data', JSON.stringify(user));

    return { user, access_token: user.access_token };
  },
};

export default mockAuthService;
