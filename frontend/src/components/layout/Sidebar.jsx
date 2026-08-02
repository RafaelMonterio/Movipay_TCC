'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const clientLinks = [
  { href:'/client',         icon:'🏠', label:'Início' },
  { href:'/client/services',icon:'🔍', label:'Serviços' },
  { href:'/client/quotes',  icon:'📋', label:'Orçamentos' },
  { href:'/client/workers', icon:'👷', label:'Trabalhadores' },
  { href:'/client/orders',  icon:'🛒', label:'Pedidos' },
  { href:'/client/chat',    icon:'💬', label:'Chat' },
  { href:'/client/profile', icon:'👤', label:'Perfil' },
];
const workerLinks = [
  { href:'/worker',          icon:'🏠', label:'Início' },
  { href:'/worker/orders',   icon:'📋', label:'Pedidos' },
  { href:'/worker/quotes',   icon:'🎯', label:'Oportunidades' },
  { href:'/worker/earnings', icon:'💰', label:'Ganhos' },
  { href:'/worker/calendar', icon:'📅', label:'Calendário' },
  { href:'/worker/chat',     icon:'💬', label:'Chat' },
  { href:'/worker/profile',  icon:'👤', label:'Perfil' },
];

export default function Sidebar() {
  const { user, logout, switchMode } = useAuth();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const isWorker = user?.mode === 'worker';
  const links    = isWorker ? workerLinks : clientLinks;
  const accent   = isWorker ? 'text-worker' : 'text-client';
  const accentBg = isWorker ? 'bg-worker/10' : 'bg-client/10';

  return (
    <>
      {/* ── Desktop ───────────────────────── */}
      <motion.aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ width: hovered ? 220 : 68 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden bg-white z-30"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-[22px] flex-shrink-0 border-b border-slate-50">
          <span className="text-2xl flex-shrink-0">🐜</span>
          <AnimatePresence>
            {hovered && (
              <motion.span key="logo-text"
                initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }}
                transition={{ duration:0.12 }}
                className="ml-3 font-black text-slate-800 text-lg whitespace-nowrap"
              >
                MoviPay
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Mode badge */}
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          <AnimatePresence>
            {hovered && (
              <motion.div key="mode-badge"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accentBg} ${accent} inline-block whitespace-nowrap`}
              >
                {isWorker ? '🔧 Trabalhador' : '📱 Cliente'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Links */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {links.map(l => {
            const active = pathname === l.href ||
              (l.href !== '/client' && l.href !== '/worker' && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href}
                className={`flex items-center h-11 px-3 rounded-xl transition-all group relative ${
                  active ? `${accentBg} ${accent} font-semibold` : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <span className="text-xl flex-shrink-0">{l.icon}</span>
                <AnimatePresence>
                  {hovered && (
                    <motion.span key={`lbl-${l.href}`}
                      initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }}
                      transition={{ duration:0.12 }}
                      className="ml-3 text-sm whitespace-nowrap overflow-hidden"
                    >
                      {l.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip colapsado */}
                {!hovered && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg
                    opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {l.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 space-y-0.5 flex-shrink-0 border-t border-slate-50 pt-2">
          <button onClick={() => switchMode?.(isWorker ? 'client' : 'worker')}
            className={`flex items-center h-10 w-full px-3 rounded-xl transition-all ${
              isWorker ? 'text-client hover:bg-client/5' : 'text-worker hover:bg-worker/5'
            }`}
          >
            <span className="text-xl flex-shrink-0">{isWorker ? '📱' : '🔧'}</span>
            <AnimatePresence>
              {hovered && (
                <motion.span key="switch-label"
                  initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }}
                  transition={{ duration:0.12 }}
                  className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {isWorker ? 'Modo Cliente' : 'Modo Trabalhador'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button onClick={logout}
            className="flex items-center h-10 w-full px-3 rounded-xl text-red-400 hover:bg-red-50 transition-all"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            <AnimatePresence>
              {hovered && (
                <motion.span key="logout-label"
                  initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-6 }}
                  transition={{ duration:0.12 }}
                  className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {hovered && (
              <motion.div key="user-info"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="px-3 pt-2"
              >
                <p className="text-xs font-semibold text-slate-600 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ── Mobile bottom nav ─────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 flex items-center justify-around px-1 h-16">
        {links.slice(0, 5).map(l => {
          const active = pathname === l.href ||
            (l.href !== '/client' && l.href !== '/worker' && pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href}
              className={`flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all ${
                active ? accent : 'text-slate-400'
              }`}
            >
              <span className={`text-xl ${active ? 'scale-110' : ''} transition-transform`}>{l.icon}</span>
              <span className="text-[10px] font-medium leading-none">{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
