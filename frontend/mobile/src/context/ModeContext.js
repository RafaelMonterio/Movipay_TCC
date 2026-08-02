import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const { user, switchMode } = useAuth();
  const mode     = user?.mode || 'client';
  const isWorker = mode === 'worker';

  return (
    <ModeContext.Provider value={{ mode, isWorker, switchMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode fora do ModeProvider');
  return ctx;
}

export default ModeContext;
