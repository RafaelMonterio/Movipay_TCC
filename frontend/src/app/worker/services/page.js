'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function WorkerServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', category: '', price: '' });
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');

  async function load() {
    try {
      setLoading(true);
      const all = await api.get('/services').then(r => r.data.services);
      setServices(all.filter(s => s.worker_id === user?.id));
    } finally { setLoading(false); }
  }

  useEffect(() => { if (user) load(); }, [user]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title || !form.price) return;
    try {
      setSaving(true);
      await api.post('/services', { ...form, price: Number(form.price) });
      setForm({ title: '', category: '', price: '' });
      setShowForm(false);
      setToast('✅ Serviço criado com sucesso!');
      setTimeout(() => setToast(''), 3000);
      load();
    } catch {
      setToast('❌ Erro ao criar serviço.');
      setTimeout(() => setToast(''), 3000);
    } finally { setSaving(false); }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Meus Serviços 🛠️</h1>
            <p className="text-slate-500 mt-1">{services.length} serviço{services.length !== 1 ? 's' : ''} cadastrado{services.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2"
          >
            {showForm ? '✕ Cancelar' : '+ Novo serviço'}
          </button>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="card p-6 border-l-4 border-amber-400"
            >
              <h2 className="font-bold text-slate-800 mb-4">Novo serviço</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Título *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Limpeza Residencial"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="Ex: limpeza, elétrica"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Preço (R$) *</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    type="number" min="0" placeholder="80"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" disabled={saving}
                    className="bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving ? <span className="animate-spin">⏳</span> : '💾'} Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-slate-100" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-5xl mb-3">🛠️</p>
            <p className="text-slate-500 text-lg">Nenhum serviço ainda.</p>
            <p className="text-slate-400 text-sm mt-1">Clique em "Novo serviço" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.category || 'geral'}</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">{s.title}</h3>
                  </div>
                  <p className="text-2xl font-black text-amber-500">{formatCurrency(s.price)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
