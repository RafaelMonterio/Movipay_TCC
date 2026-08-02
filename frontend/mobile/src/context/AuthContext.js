import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) setUser(await authService.getMe());
      } catch {
        await AsyncStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  async function login(email, password) {
    setUser(await authService.login(email, password));
  }

  async function register(name, email, password) {
    setUser(await authService.register(name, email, password));
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function switchMode(mode) {
    await authService.switchMode(mode);
    setUser(prev => ({ ...prev, mode }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}

export default AuthContext;
