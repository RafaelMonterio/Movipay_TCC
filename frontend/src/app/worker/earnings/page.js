'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function WorkerEarningsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders,  setOrders]  = useState([]);
  const [wallet,  setWallet]  = useState({ balance: 0, held: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders').then(r => setOrders(r.data.orders || [])),
      api.get('/payments/wallet').then(r => setWallet(r.data)),
    ])
    .catch(() => toast('Erro ao carregar dados', 'error'))
    .finally(() => setLoading(false));
  }, []);

  const completed = orders.filter(o => o.status === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + parseFloat(o.price), 0);
  const thisMonth = completed.filter(o => {
    const d = new Date(o.completed_at || o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = thisMonth.reduce((s, o) => s + parseFloat(o.price), 0);

  // Agrupa por mês (últimos 6 meses)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const total = completed
      .filter(o => {
        const od = new Date(o.completed_at || o.created_at);
        return od.getMonth() === m && od.getFullYear() === y;
      })
      .reduce((s, o) => s + parseFloat(o.price), 0);
    return { label: MONTHS[m], value: total };
  });

  const maxVal = Math.max(...monthlyData.map(d => d.value), 1);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-3xl">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Meus Ganhos 💰</h1>
          <p className="text-slate-500 mt-1 text-sm">Acompanhe sua receita e carteira</p>
        </motion.div>

        {/* Carteira */}
        <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
          className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-6 text-white"
        >
          <p className="text-indigo-100 text-sm mb-1">Saldo disponível na carteira</p>
          <p className="text-4xl font-black mb-4">{formatCurrency(wallet.balance)}</p>
          {wallet.held > 0 && (
            <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-sm font-semibold">{formatCurrency(wallet.held)} em custódia</p>
                <p className="text-xs text-indigo-100">Será liberado após conclusão dos pedidos</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon:'💵', label:'Este mês',      value: formatCurrency(monthRevenue),  color:'text-green-600' },
            { icon:'📊', label:'Total histórico', value: formatCurrency(totalRevenue), color:'text-client' },
            { icon:'✅', label:'Pedidos feitos', value: completed.length,              color:'text-slate-800' },
            { icon:'⭐', label:'Nota média',     value: user?.avg_rating ? parseFloat(user.avg_rating).toFixed(1) : '—', color:'text-amber-500' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-4"
            >
              <p className="text-xl mb-1">{s.icon}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Gráfico de barras */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="bg-white rounded-2xl border border-slate-100 p-6"
        >
          <h2 className="font-bold text-slate-800 mb-5">Receita dos últimos 6 meses</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((d, i) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-600">
                  {d.value > 0 ? `R$${Math.round(d.value)}` : ''}
                </p>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / maxVal) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                  className={`w-full rounded-t-lg min-h-[4px] ${
                    i === monthlyData.length - 1 ? 'bg-client' : 'bg-slate-200'
                  }`}
                />
                <p className="text-xs text-slate-400">{d.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pedidos recentes */}
        <div>
          <h2 className="font-bold text-slate-800 mb-3">Pedidos concluídos</h2>
          {loading ? (
            <div className="space-y-2">{[0,1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
          ) : completed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-500 text-sm">Nenhum pedido concluído ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completed.slice(0, 8).map((o, i) => (
                <motion.div key={o.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{o.service_title || `Pedido #${o.id}`}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {o.client_name} · {new Date(o.completed_at || o.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="font-black text-green-600">{formatCurrency(o.price)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
