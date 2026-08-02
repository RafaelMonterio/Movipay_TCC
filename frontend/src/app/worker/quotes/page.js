'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';

export default function WorkerQuotesPage() {
  const toast = useToast();
  const [quotes,   setQuotes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ price: '', message: '' });
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    api.get('/quotes')
      .then(r => setQuotes(r.data.quotes || []))
      .catch(() => toast('Erro ao carregar orçamentos', 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handlePropose(e) {
    e.preventDefault();
    if (!form.price || !form.message) { toast('Preencha preço e mensagem', 'warning'); return; }
    try {
      setSaving(true);
      await api.post(`/quotes/${selected.id}/proposals`, form);
      toast('Proposta enviada com sucesso!', 'success');
      setModal(false);
      setForm({ price: '', message: '' });
      // Marca localmente como enviado
      setQuotes(prev => prev.map(q => q.id === selected.id ? { ...q, _proposed: true } : q));
    } catch (err) {
      toast(err?.response?.data?.error || 'Erro ao enviar proposta', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-3xl">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Oportunidades 🎯</h1>
          <p className="text-slate-500 mt-1 text-sm">Clientes buscando profissionais — envie sua proposta</p>
        </motion.div>

        {/* Dica */}
        <div className="bg-client/5 border border-client/20 rounded-2xl p-4 flex gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-client">Como aumentar suas chances</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Seja específico na mensagem, mencione experiência com o tipo de serviço e ofereça um prazo claro. Propostas detalhadas têm 3x mais aceitação.
            </p>
          </div>
        </div>

        {loading ? <ListSkeleton count={4} /> : quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-slate-500 font-medium">Nenhuma oportunidade no momento</p>
            <p className="text-slate-400 text-sm mt-1">Novas solicitações aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <motion.div key={q.id}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{q.category_icon || '📋'}</span>
                      <p className="font-bold text-slate-800 leading-snug">{q.title}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>👤 {q.client_name}</span>
                      {q.city && <span>📍 {q.city}</span>}
                      {q.budget_max && <span className="text-green-600 font-semibold">Até {formatCurrency(q.budget_max)}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                    {q.proposal_count || 0} proposta{q.proposal_count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">{q.description}</p>

                {/* Ação */}
                {q._proposed ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                    <span>✅</span> Proposta enviada
                  </div>
                ) : (
                  <button
                    onClick={() => { setSelected(q); setModal(true); }}
                    className="bg-client text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all text-sm"
                  >
                    Enviar proposta →
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de proposta */}
      <Modal open={modal} onClose={() => setModal(false)} title="Enviar proposta" size="md">
        {selected && (
          <div className="space-y-4">
            {/* Resumo do orçamento */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Solicitação</p>
              <p className="font-semibold text-slate-800 text-sm">{selected.title}</p>
              {selected.budget_max && (
                <p className="text-xs text-slate-400 mt-1">Orçamento do cliente: até {formatCurrency(selected.budget_max)}</p>
              )}
            </div>

            <form onSubmit={handlePropose} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Seu preço (R$) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="Ex: 350"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Sua mensagem *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Apresente-se, mencione experiência com este tipo de serviço, prazo estimado e diferenciais..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
                />
                <p className="text-xs text-slate-400 mt-1">{form.message.length}/500 caracteres</p>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-client text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><span className="animate-spin">⏳</span> Enviando...</> : '📤 Enviar proposta'}
              </button>
            </form>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
