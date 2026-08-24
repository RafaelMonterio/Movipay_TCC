'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const clientLinks = [
  { href: '/client', icon: '🏠', label: 'Home' },
  { href: '/client/services', icon: '🔍', label: 'Serviços' },
  { href: '/client/quotes', icon: '📋', label: 'Orçamentos' },
  { href: '/client/orders', icon: '🛒', label: 'Pedidos' },
  { href: '/client/chat', icon: '💬', label: 'Chat' },
  { href: '/client/profile', icon: '👤', label: 'Perfil' },
];

const workerLinks = [
  { href: '/worker', icon: '🏠', label: 'Início' },
  { href: '/worker/orders', icon: '📋', label: 'Pedidos' },
  { href: '/worker/quotes', icon: '🎯', label: 'Oportunidades' },
  { href: '/worker/earnings', icon: '💰', label: 'Ganhos' },
  { href: '/worker/calendar', icon: '📅', label: 'Calendário' },
  { href: '/worker/chat', icon: '💬', label: 'Chat' },
  { href: '/worker/profile', icon: '👤', label: 'Perfil' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode, highContrast } = useTheme();
  const isWorker = user?.mode === 'worker';
  const links = isWorker ? workerLinks : clientLinks;
  const mobileLinks = isWorker ? workerLinks.slice(0, 5) : [clientLinks[0], clientLinks[1], clientLinks[2], clientLinks[3], clientLinks[5]];

  // Compute colors based on accessibility state
  const isDark = darkMode || highContrast;

  const panelBg = highContrast
    ? (isDark ? '#09090B' : '#F8FAFC')
    : (isDark ? 'linear-gradient(180deg, #0F172A 0%, #111827 100%)' : 'linear-gradient(180deg, #FFFDF7 0%, #F5FBEF 100%)');

  const borderColor = highContrast
    ? (isDark ? '#F2F7FF' : '#0F172A')
    : (isDark ? 'rgba(243,239,226,0.09)' : '#E8EEDB');

  const textPrimary = highContrast
    ? (isDark ? '#F8FAFC' : '#0F172A')
    : (isDark ? '#F3EFE2' : '#17241A');

  const textMuted = highContrast
    ? (isDark ? '#CBD5E1' : '#334155')
    : (isDark ? '#8AA085' : '#5B6B57');

  const activeBg = isDark
    ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(45,212,191,0.18))'
    : 'linear-gradient(135deg, #E8F9D2 0%, #FFE3BD 100%)';

  const activeText = isDark ? '#F8FAFC' : '#304b2a';
  const activeBorder = isDark ? 'rgba(96,165,250,0.5)' : '#BCE9A4';

  const buttonStyle = highContrast
    ? { background: isDark ? '#F8FAFC' : '#0F172A', color: isDark ? '#0F172A' : '#F8FAFC' }
    : (isDark
      ? { background: 'linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)', color: '#F8FAFC' }
      : { background: 'linear-gradient(135deg, #FF7A00 0%, #FF9A33 100%)', color: '#fff' });

  const toggleButtonBg = isDark
    ? 'rgba(243,239,226,0.10)'
    : 'linear-gradient(135deg, #EAF7DE 0%, #FFF0D8 100%)';

  const toggleButtonBorder = isDark
    ? 'rgba(243,239,226,0.24)'
    : '#B4D3A2';

  const logoRingColor = isDark ? 'rgba(243,239,226,0.2)' : '#E6F1DD';

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
                <img src="/img/logo.png" alt="" className="w-10 h-10 rounded-full object-cover ring-2" style={{ ringColor: logoRingColor }} />
              </div>
            ) : (
              <span className="flex items-center whitespace-nowrap">
                <img src="/img/logo.png" alt="" className="w-10 h-10 rounded-full object-cover ring-2" style={{ ringColor: logoRingColor }} />
                <span className="ml-3 font-black text-2xl whitespace-nowrap" style={{ color: textPrimary }}>
                  <span style={{ color: '#FF7A00' }}>Movi</span><span style={{ color: '#22D31B' }}>Pay</span>
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
              background: toggleButtonBg,
              borderColor: toggleButtonBorder,
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
                  background: active ? activeBg : 'transparent',
                  color: active ? activeText : textMuted,
                  border: active ? `1px solid ${activeBorder}` : '1px solid transparent',
                  boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                }}
              >
                <span className="text-xl flex-shrink-0">{l.icon}</span>
                {!collapsed && (
                  <span className="ml-3 text-sm whitespace-nowrap overflow-hidden font-medium" style={{ color: active ? activeText : textMuted }}>
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

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around px-1 h-16" style={{
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