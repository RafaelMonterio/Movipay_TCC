'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatCurrency, formatDate, formatStatus } from '@/utils/formatters';
import orderService from '@/services/orderService';

const STATUS_COLOR = {
  pending:     'bg-yellow-100 text-yellow-700',
  accepted:    'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
};

export default function WorkerOrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast]       = useState('');

  async function load() {
    try { setLoading(true); const d = await orderService.getAll(); setOrders(d.orders); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function act(id, status) {
    try {
      setUpdating(id);
      await orderService.updateStatus(id, status);
      setToast(`✅ Pedido ${status === 'accepted' ? 'aceito' : status === 'cancelled' ? 'recusado' : 'concluído'}!`);
      setTimeout(() => setToast(''), 3000);
      load();
    } catch {
      setToast('❌ Erro ao atualizar pedido.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setUpdating(null);
    }
  }

  const pending   = orders.filter(o => o.status === 'pending');
  const others    = orders.filter(o => o.status !== 'pending');

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-800">Pedidos Recebidos</h1>
          <p className="text-slate-500 mt-1">{pending.length} aguardando resposta</p>
        </motion.div>

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-amber-600 mb-3">🕐 Aguardando resposta</h2>
            <div className="space-y-3">
              {pending.map((o, i) => (
                <motion.div key={o.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="card p-5 border-l-4 border-amber-400"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-slate-800">Pedido #{o.id}</p>
                      <p className="text-xs text-slate-400">{formatDate(o.created_at)}</p>
                    </div>
                    <p className="text-2xl font-black text-amber-500">{formatCurrency(o.price)}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => act(o.id, 'accepted')}
                      disabled={updating === o.id}
                      className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl hover:bg-green-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {updating === o.id ? <span className="animate-spin">⏳</span> : '✅'} Aceitar
                    </button>
                    <button
                      onClick={() => act(o.id, 'cancelled')}
                      disabled={updating === o.id}
                      className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      ❌ Recusar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Others */}
        <div>
          <h2 className="text-base font-bold text-slate-600 mb-3">📋 Todos os pedidos</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-slate-100" />)}</div>
          ) : others.length === 0 && pending.length === 0 ? (
            <div className="card p-16 text-center"><p className="text-4xl mb-2">📭</p><p className="text-slate-400">Nenhum pedido ainda.</p></div>
          ) : (
            <div className="space-y-3">
              {others.map((o, i) => (
                <motion.div key={o.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="card p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-sm">#{o.id}</div>
                    <div>
                      <p className="font-semibold text-slate-800">{formatStatus(o.status)}</p>
                      <p className="text-xs text-slate-400">{formatDate(o.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {o.status === 'accepted' && (
                      <button onClick={() => act(o.id, 'completed')} disabled={updating === o.id}
                        className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-all disabled:opacity-60"
                      >
                        🏁 Concluir
                      </button>
                    )}
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-600'}`}>
                      {o.status}
                    </span>
                    <p className="font-black text-amber-500">{formatCurrency(o.price)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-xl z-50"
        >
          {toast}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
