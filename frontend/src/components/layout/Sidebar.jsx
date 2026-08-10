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
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isWorker = user?.mode === 'worker';
  const links = isWorker ? workerLinks : clientLinks;
  const mobileLinks = isWorker ? workerLinks.slice(0, 5) : [clientLinks[0], clientLinks[1], clientLinks[2], clientLinks[3], clientLinks[5]];
  const accent = isWorker ? 'text-worker' : 'text-client';
  const accentBg = isWorker ? 'bg-worker/10' : 'bg-client/10';

  return (
    <>
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="hidden lg:flex fixed left-0 top-0 h-screen flex-col z-40 border-r border-white/60 shadow-xl overflow-hidden"
        style={{
          width: collapsed ? 88 : 250,
          transition: 'width 260ms ease',
          background: 'linear-gradient(180deg, #FFFDF7 0%, #F5FBEF 100%)',
        }}
      >
        <div className="flex items-center h-20 px-4 flex-shrink-0 border-b border-[#E8EEDB] relative">
          <div className="relative flex items-center justify-center w-full">
            {collapsed ? (
              <div className="flex items-center justify-center">
                <img src="/img/logo.png" alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E6F1DD]" />
              </div>
            ) : (
              <span className="flex items-center whitespace-nowrap">
                <img src="/img/logo.png" alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E6F1DD]" />
                <span className="ml-3 font-black text-slate-800 text-2xl whitespace-nowrap">
                  <span className="text-[#FF7A00]">Movi</span><span className="text-[#22D31B]">Pay</span>
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="px-2 py-2 flex-shrink-0 flex items-center justify-center">
          <button
            onClick={() => setCollapsed(v => !v)}
            className="group flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-[#EAF7DE] to-[#FFF0D8] border-2 border-[#B4D3A2] text-[#2D562C] transition-all hover:scale-105 shadow-md"
            aria-label={collapsed ? 'Abrir menu' : 'Recolher menu'}
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
                className={`flex items-center ${collapsed ? 'justify-center' : ''} h-12 px-3 rounded-2xl transition-all group relative ${
                  active ? 'bg-gradient-to-r from-[#E8F9D2] to-[#FFE3BD] text-[#304b2a] font-bold shadow-inner border border-[#BCE9A4]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
                title={collapsed ? l.label : undefined}
              >
                <span className="text-xl flex-shrink-0">{l.icon}</span>
                {!collapsed && (
                  <span className="ml-3 text-sm whitespace-nowrap overflow-hidden">
                    {l.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-2 flex-shrink-0 border-t border-[#DDEDD7] pt-3">
          <button onClick={logout}
            className="flex items-center justify-center h-11 w-full px-3 rounded-2xl text-white bg-gradient-to-r from-[#FF7A00] to-[#E9B05A] transition-all font-bold text-sm shadow-md hover:shadow-lg"
          >
            {!collapsed && <span className="mr-2">Sair</span>}
            {collapsed && <span className="text-base">↵</span>}
          </button>

          {!collapsed && (
            <>
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[11px] font-black">!</span>
                <span className="text-[11px] font-bold text-slate-500">1 error</span>
                <span className="text-slate-400">×</span>
              </div>

              <div className="px-3 pt-1">
                <p className="text-[11px] font-semibold text-slate-600 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </>
          )}
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 flex items-center justify-around px-1 h-16">
        {mobileLinks.map(l => {
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
