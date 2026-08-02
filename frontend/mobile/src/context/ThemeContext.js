import React, { createContext, useContext } from 'react';
import { useMode } from './ModeContext';

const base = {
  background:    '#f8fafc',
  card:          '#ffffff',
  text:          '#1e293b',
  textSecondary: '#64748b',
  textDisabled:  '#94a3b8',
  border:        '#e2e8f0',
  backgroundAlt: '#f1f5f9',
  success:       '#22c55e',
  error:         '#ef4444',
};

export const clientTheme = { ...base, primary: '#6366f1', primaryBg: '#eef2ff', clientPrimary: '#6366f1', workerPrimary: '#f59e0b' };
export const workerTheme = { ...base, primary: '#f59e0b', primaryBg: '#fffbeb', clientPrimary: '#6366f1', workerPrimary: '#f59e0b' };

const ThemeContext = createContext(clientTheme);

export function ThemeProvider({ children }) {
  const { isWorker } = useMode();
  return (
    <ThemeContext.Provider value={isWorker ? workerTheme : clientTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
