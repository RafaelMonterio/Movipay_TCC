'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatCurrency, formatDate, formatStatus } from '@/utils/formatters';
import orderService from '@/services/orderService';

const STATUS_COLOR = {
  pending:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted:    'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  completed:   'bg-green-100 text-green-700 border-green-200',
  cancelled:   'bg-red-100 text-red-600 border-red-200',
};

export default function ClientOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const d = await orderService.getAll();
      setOrders(d.orders);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-800">Meus Pedidos</h1>
          <p className="text-slate-500 mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''} no total</p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-6 h-20 animate-pulse bg-slate-100 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-16 text-center rounded-2xl border border-slate-100">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-slate-500 text-lg">Nenhum pedido ainda.</p>
            <Link href="/client/services" className="text-client text-sm font-semibold hover:underline mt-3 inline-block">
              Encontrar serviços →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o, i) => (
              <motion.div key={o.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/client/orders/${o.id}`}
                  className="card p-5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 hover:shadow-md hover:border-client/30 transition-all block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-client/10 text-client rounded-xl flex items-center justify-center font-bold text-sm">
                      #{o.id}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{o.service_title || 'Serviço'}</p>
                      <p className="text-xs text-slate-400">{formatDate(o.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-600'}`}>
                      {formatStatus(o.status)}
                    </span>
                    <p className="font-black text-lg text-client">{formatCurrency(o.price)}</p>
                    <span className="text-slate-300">›</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
