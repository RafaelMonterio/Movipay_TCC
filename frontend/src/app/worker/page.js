'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import orderService from '@/services/orderService';
import api from '@/services/api';
import { formatCurrency, formatStatus } from '@/utils/formatters';

export default function WorkerHomePage() {
  const { user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [wallet,  setWallet]  = useState({ balance: 0, held: 0 });
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderService.getAll().then(d => setOrders(d.orders || [])),
      api.get('/payments/wallet').then(r => setWallet(r.data)).catch(() => {}),
      api.get('/quotes').then(r => setQuotes(r.data.quotes || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const pending   = orders.filter(o => o.status === 'pending');
  const accepted  = orders.filter(o => o.status === 'accepted');
  const completed = orders.filter(o => o.status === 'completed');
  const monthRevenue = completed
    .filter(o => {
      const d = new Date(o.completed_at || o.created_at);
      const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    })
    .reduce((s, o) => s + parseFloat(o.price), 0);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            Olá, {user?.name?.split(' ')[0]} 👷
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Painel do trabalhador</p>
        </motion.div>

        {/* Alerta de pendentes */}
        {pending.length > 0 && (
          <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-bold text-amber-800">
                🔔 {pending.length} pedido{pending.length > 1 ? 's' : ''} aguardando sua resposta
              </p>
              <p className="text-sm text-amber-600 mt-0.5">Responda rápido para não perder a oportunidade!</p>
            </div>
            <Link href="/worker/orders"
              className="bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-all whitespace-nowrap text-sm">
              Ver pedidos
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon:'🕐', label:'Aguardando',    value: pending.length,             color:'text-amber-500' },
            { icon:'🔧', label:'Em andamento',  value: accepted.length,            color:'text-blue-500' },
            { icon:'✅', label:'Concluídos',    value: completed.length,           color:'text-green-500' },
            { icon:'💵', label:'Este mês',      value: formatCurrency(monthRevenue), color:'text-client' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05+i*0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-4"
            >
              <p className="text-xl mb-1">{s.icon}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Carteira */}
        <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Carteira disponível</p>
              <p className="text-3xl font-black mt-1">{formatCurrency(wallet.balance)}</p>
              {wallet.held > 0 && (
                <p className="text-indigo-200 text-xs mt-1">🔒 {formatCurrency(wallet.held)} em custódia</p>
              )}
            </div>
            <Link href="/worker/earnings"
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm">
              Ver ganhos →
            </Link>
          </div>
        </motion.div>

        {/* Oportunidades novas */}
        {quotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800">🎯 Novas oportunidades</h2>
              <Link href="/worker/quotes" className="text-xs text-client font-semibold hover:underline">Ver todas →</Link>
            </div>
            <div className="space-y-2">
              {quotes.slice(0, 2).map((q, i) => (
                <motion.div key={q.id}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                >
                  <Link href="/worker/quotes"
                    className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-sm hover:border-client/20 transition-all block"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{q.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {q.category_icon} {q.category_name}
                        {q.budget_max && ` · Até ${formatCurrency(q.budget_max)}`}
                      </p>
                    </div>
                    <span className="ml-3 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                      {q.proposal_count || 0} proposta{q.proposal_count !== 1 ? 's' : ''}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800">Pedidos recentes</h2>
            <Link href="/worker/orders" className="text-xs text-client font-semibold hover:underline">Ver todos →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[0,1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-500 text-sm">Nenhum pedido ainda.</p>
              <Link href="/worker/quotes" className="text-client text-sm font-semibold hover:underline mt-2 inline-block">
                Ver oportunidades →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 4).map((o, i) => (
                <motion.div key={o.id}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0">
                      #{o.id}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{o.service_title || 'Serviço'}</p>
                      <p className="text-xs text-slate-400">{o.client_name} · {formatStatus(o.status)}</p>
                    </div>
                  </div>
                  <p className="font-black text-amber-500">{formatCurrency(o.price)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
