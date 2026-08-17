'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const clientLinks = [
  { href:'/client',         icon:'🏠', label:'Home' },
  { href:'/client/services',icon:'🔍', label:'Serviços' },
  { href:'/client/quotes',  icon:'📋', label:'Orçamentos' },
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

function getAccessibilityState() {
  if (typeof document === 'undefined') return { dark: false, highContrast: false, daltonism: '' };

  const root = document.documentElement;
  return {
    dark: root.dataset.darkMode === 'true',
    highContrast: root.dataset.highContrast === 'true',
    daltonism: root.dataset.daltonism || '',
  };
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [a11y, setA11y] = useState(getAccessibilityState);
  const isWorker = user?.mode === 'worker';
  const links = isWorker ? workerLinks : clientLinks;
  const mobileLinks = isWorker ? workerLinks.slice(0, 5) : [clientLinks[0], clientLinks[1], clientLinks[2], clientLinks[3], clientLinks[5]];
  const accent = isWorker ? 'text-worker' : 'text-client';
  const accentBg = isWorker ? 'bg-worker/10' : 'bg-client/10';

  useEffect(() => {
    const sync = () => setA11y(getAccessibilityState());
    sync();

    if (typeof document === 'undefined') return undefined;

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-dark-mode', 'data-high-contrast', 'data-daltonism'],
    });

    return () => observer.disconnect();
  }, []);

  const isDark = a11y.dark || a11y.highContrast;
  const panelBg = a11y.highContrast
    ? (isDark ? '#09090B' : '#F8FAFC')
    : (isDark ? 'linear-gradient(180deg, #0F172A 0%, #111827 100%)' : 'linear-gradient(180deg, #FFFDF7 0%, #F5FBEF 100%)');
  const borderColor = a11y.highContrast ? (isDark ? '#F2F7FF' : '#0F172A') : (isDark ? 'rgba(148,163,184,0.28)' : '#E8EEDB');
  const textPrimary = a11y.highContrast ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#E2E8F0' : '#1F2937');
  const textMuted = a11y.highContrast ? (isDark ? '#CBD5E1' : '#334155') : (isDark ? '#94A3B8' : '#64748B');
  const buttonStyle = a11y.highContrast
    ? { background: isDark ? '#F8FAFC' : '#0F172A', color: isDark ? '#0F172A' : '#F8FAFC' }
    : (isDark ? { background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)', color: '#F8FAFC' } : { background: 'linear-gradient(135deg, #FF7A00 0%, #E9B05A 100%)', color: '#fff' });

  return (
    <>
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="hidden lg:flex fixed left-0 top-0 h-screen flex-col z-40 border-r shadow-xl overflow-hidden"
        style={{
          width: collapsed ? 88 : 250,
          transition: 'width 260ms ease',
          background: panelBg,
          borderColor,
          color: textPrimary,
        }}
      >
        <div className="flex items-center h-20 px-4 flex-shrink-0 border-b relative" style={{ borderColor }}>
          <div className="relative flex items-center justify-center w-full">
            {collapsed ? (
              <div className="flex items-center justify-center">
                <img src="/img/logo.png" alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E6F1DD]" />
              </div>
            ) : (
              <span className="flex items-center whitespace-nowrap">
                <img src="/img/logo.png" alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E6F1DD]" />
                <span className="ml-3 font-black text-slate-800 text-2xl whitespace-nowrap" style={{ color: textPrimary }}>
                  <span className="text-[#FF7A00]">Movi</span><span className="text-[#22D31B]">Pay</span>
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="px-2 py-2 flex-shrink-0 flex items-center justify-center">
          <button
            onClick={() => setCollapsed(v => !v)}
            className="group flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all hover:scale-105 shadow-md"
            aria-label={collapsed ? 'Abrir menu' : 'Recolher menu'}
            style={{
              background: isDark ? 'rgba(148,163,184,0.10)' : 'linear-gradient(135deg, #EAF7DE 0%, #FFF0D8 100%)',
              borderColor: isDark ? 'rgba(148,163,184,0.24)' : '#B4D3A2',
              color: textPrimary,
            }}
          >
            <span className="text-[20px] font-black transition-transform group-hover:scale-110">
              {collapsed ? '›' : '‹'}
            </span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {links.map(l => {
            const active = pathname === l.href ||
              (l.href !== '/client' && l.href !== '/worker' && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href}
                className={`flex items-center ${collapsed ? 'justify-center' : ''} h-12 px-3 rounded-2xl transition-all group relative`}
                title={collapsed ? l.label : undefined}
                style={{
                  background: active
                    ? (isDark ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(45,212,191,0.18))' : 'linear-gradient(135deg, #E8F9D2 0%, #FFE3BD 100%)')
                    : 'transparent',
                  color: active ? (isDark ? '#F8FAFC' : '#304b2a') : textMuted,
                  border: active ? `1px solid ${isDark ? 'rgba(96,165,250,0.5)' : '#BCE9A4'}` : '1px solid transparent',
                  boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                }}
              >
                <span className="text-xl flex-shrink-0">{l.icon}</span>
                {!collapsed && (
                  <span className="ml-3 text-sm whitespace-nowrap overflow-hidden font-medium" style={{ color: active ? (isDark ? '#F8FAFC' : '#304b2a') : textMuted }}>
                    {l.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2 flex-shrink-0 border-t pt-3" style={{ borderColor }}>
          <button onClick={logout}
            className="flex items-center justify-center h-11 w-full px-3 rounded-2xl transition-all font-bold text-sm shadow-md hover:shadow-lg"
            style={buttonStyle}
          >
            {!collapsed && <span className="mr-2">Sair</span>}
            {collapsed && <span className="text-base">↵</span>}
          </button>

          {!collapsed && (
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[11px] font-black">!</span>
              <span className="text-[11px] font-bold" style={{ color: textMuted }}>1 error</span>
              <span style={{ color: textMuted }}>×</span>
            </div>
          )}
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 flex items-center justify-around px-1 h-16" style={{
        background: panelBg,
        borderColor,
      }}>
        {mobileLinks.map(l => {
          const active = pathname === l.href ||
            (l.href !== '/client' && l.href !== '/worker' && pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href}
              className="flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all"
              style={{ color: active ? (isDark ? '#F8FAFC' : '#FF7A00') : textMuted }}
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
