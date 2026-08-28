import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMode } from './ModeContext';

/**
 * Color palette — mirrors src/context/ThemeContext.jsx (getThemeColors) on
 * the web app exactly, so the mobile app looks like the same product
 * instead of using its own unrelated indigo/amber scheme.
 */
const BRAND = {
  orange: '#FF7A00',
  orangeLight: '#FF9A33',
  green: '#22D31B',
};

const LIGHT = {
  background: '#FAF6EC',
  backgroundAlt: '#F1EAD9',
  card: 'rgba(255,255,255,0.92)',
  border: 'rgba(23,36,26,0.09)',
  line: 'rgba(23,36,26,0.13)',
  text: '#17241A',
  textSecondary: '#5B6B57',
  textDisabled: '#9AA795',
  mono: '#8A4A00',
  success: '#22c55e',
  error: '#ef4444',
};

const DARK = {
  background: '#121A0F',
  backgroundAlt: '#0D130B',
  card: 'rgba(26,36,23,0.85)',
  border: 'rgba(243,239,226,0.09)',
  line: 'rgba(243,239,226,0.13)',
  text: '#F3EFE2',
  textSecondary: '#8AA085',
  textDisabled: '#5B6B57',
  mono: '#FFB627',
  success: '#22c55e',
  error: '#ef4444',
};

const STORAGE_KEY = 'movipay-theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { isWorker } = useMode();
  const [darkMode, setDarkModeState] = useState(false);

  // Load persisted preference — same storage key concept as the web app
  // (kept separate since AsyncStorage and localStorage are different
  // stores, but the intent — one saved preference — matches).
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.darkMode === 'boolean') setDarkModeState(parsed.darkMode);
        }
      } catch {
        // ignore malformed/missing value, fall back to default (light)
      }
    })();
  }, []);

  const setDarkMode = useCallback((value) => {
    setDarkModeState(value);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ darkMode: value })).catch(() => {});
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  const palette = darkMode ? DARK : LIGHT;

  const theme = {
    ...palette,
    darkMode,
    toggleDarkMode,
    setDarkMode,
    isWorker,
    // Single brand accent used everywhere (client & worker alike), same as
    // the web app — no more separate indigo (client) / amber (worker)
    // color schemes that made the mobile app look like a different product.
    primary: BRAND.orange,
    primaryAlt: BRAND.orangeLight,
    accent: BRAND.green,
    primaryBg: darkMode ? 'rgba(255,122,0,0.16)' : 'rgba(255,122,0,0.10)',
    clientPrimary: BRAND.orange,
    workerPrimary: BRAND.orange,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme fora do ThemeProvider');
  return ctx;
}

export default ThemeContext;
