'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { formatDate } from '@/utils/formatters';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]       = useState(0);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    // Polling simples a cada 30s (substitui WebSocket na v0.4)
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  async function loadNotifications() {
    try {
      // Busca pedidos pendentes/recentes como notificações simuladas
      const { data } = await api.get('/orders');
      const orders = data.orders || [];

      const notifs = orders
        .filter(o => {
          if (user.mode === 'worker') return o.status === 'pending';
          return o.status === 'completed' || o.status === 'accepted';
        })
        .slice(0, 10)
        .map(o => ({
          id: o.id,
          read: localStorage.getItem(`notif_read_${o.id}`) === '1',
          title: user.mode === 'worker'
            ? `Novo pedido #${o.id} aguardando`
            : o.status === 'accepted'
              ? `Pedido #${o.id} foi aceito! ✅`
              : `Pedido #${o.id} concluído 🏁`,
          time: o.updated_at || o.created_at,
          icon: user.mode === 'worker' ? '📋' : o.status === 'accepted' ? '✅' : '🏁',
        }));

      setNotifications(notifs);
      setUnread(notifs.filter(n => !n.read).length);
    } catch {
      // Silencioso — notificações são não-críticas
    }
  }

  function markRead(id) {
    localStorage.setItem(`notif_read_${id}`, '1');
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  }

  function markAllRead() {
    notifications.forEach(n => localStorage.setItem(`notif_read_${n.id}`, '1'));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) loadNotifications(); }}
        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all relative"
      >
        🔔
        {unread > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-40"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-slate-800 text-sm">Notificações</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-client hover:underline">Marcar todas como lidas</button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-2xl mb-2">🔕</p>
                    <p className="text-slate-400 text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button key={n.id} onClick={() => markRead(n.id)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-50 ${!n.read ? 'bg-client/5' : ''}`}
                    >
                      <span className="text-lg flex-shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${n.read ? 'text-slate-600' : 'text-slate-800 font-semibold'}`}>{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(n.time)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-client flex-shrink-0 mt-1.5" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
