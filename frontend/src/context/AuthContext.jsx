'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

const AuthContext = createContext(null);

function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    authService.getMe()
      .then(u => setUser(u))
      .catch(() => {
        localStorage.removeItem('access_token');
        deleteCookie('access_token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const u = await authService.login(email, password);
    const token = localStorage.getItem('access_token');
    setCookie('access_token', token);
    setUser(u);
    router.push(u.mode === 'worker' ? '/worker' : '/client');
  }

  async function register(nameOrPayload, email, password, mode = 'client', phone = '', bio = '', city = '') {
    const payload = typeof nameOrPayload === 'object'
      ? nameOrPayload
      : { name: nameOrPayload, email, password, mode, phone, bio, city };

    const u = await authService.register(payload);
    const token = localStorage.getItem('access_token');
    setCookie('access_token', token);
    setIsFirstLogin(true);
    setUser(u);
    router.push(payload.mode === 'worker' ? '/worker' : '/client');
  }

  async function switchMode(mode) {
    await authService.switchMode(mode);
    const token = localStorage.getItem('access_token');
    setCookie('access_token', token);
    setUser(prev => ({ ...prev, mode }));
    router.push(mode === 'worker' ? '/worker' : '/client');
  }

  function logout() {
    authService.logout();
    deleteCookie('access_token');
    setUser(null);
    router.push('/login');
  }

  function dismissOnboarding() {
    setIsFirstLogin(false);
    localStorage.setItem('onboarding_done', '1');
  }

  return (
    <AuthContext.Provider value={{
      user, loading, isFirstLogin,
      login, register, logout, switchMode, dismissOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
