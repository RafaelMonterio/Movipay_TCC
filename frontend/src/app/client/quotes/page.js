'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const CATEGORIES = [
  ['limpeza','🧹 Limpeza'],['eletrica','⚡ Elétrica'],['pintura','🎨 Pintura'],
  ['encanamento','🔧 Encanamento'],['jardinagem','🌿 Jardinagem'],
  ['informatica','💻 Informática'],['mudanca','📦 Mudança'],
  ['reforma','🏗️ Reforma'],['cuidado-pessoal','💆 Cuidado Pessoal'],['aulas','📚 Aulas'],
];

export default function ClientQuotesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [quotes, setQuotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ title:'', description:'', category:'limpeza', budget_max:'', city:'' });

  useEffect(() => {
    api.get('/quotes')
      .then(r => setQuotes(r.data.quotes || []))
      .catch(() => toast('Erro ao carregar orçamentos', 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title || !form.description) { toast('Preencha título e descrição', 'warning'); return; }
    try {
      setSaving(true);
      const { data } = await api.post('/quotes', form);
      setQuotes(prev => [{ ...data, proposal_count: 0 }, ...prev]);
      setModal(false);
      setForm({ title:'', description:'', category:'limpeza', budget_max:'', city:'' });
      toast('Orçamento publicado! Trabalhadores receberão notificação.', 'success');
    } catch (err) {
      toast(err?.response?.data?.error || 'Erro ao criar orçamento', 'error');
    } finally {
      setSaving(false);
    }
  }

  const STATUS_STYLE = {
    open:      'bg-green-100 text-green-700',
    in_review: 'bg-yellow-100 text-yellow-700',
    closed:    'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  const STATUS_LABEL = { open:'Aberto', in_review:'Em análise', closed:'Encerrado', cancelled:'Cancelado' };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-3xl">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">Meus Orçamentos</h1>
            <p className="text-slate-500 mt-1 text-sm">Publique o que precisa e receba propostas</p>
          </div>
          <button onClick={() => setModal(true)}
            className="bg-client text-white font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-600 transition-all text-sm flex-shrink-0">
            + Pedir orçamento
          </button>
        </motion.div>

        {/* Como funciona */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { step:'1', icon:'📝', text:'Descreva o que precisa' },
            { step:'2', icon:'💬', text:'Receba propostas' },
            { step:'3', icon:'✅', text:'Escolha e contrate' },
          ].map(s => (
            <div key={s.step} className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xs text-slate-500 font-medium leading-snug">{s.text}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        {loading ? <ListSkeleton count={3} /> : quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-500 font-medium">Nenhum orçamento ainda</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Publique o que você precisa e receba propostas de profissionais</p>
            <button onClick={() => setModal(true)}
              className="bg-client text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-all text-sm">
              Pedir meu primeiro orçamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                <Link href={`/client/quotes/${q.id}`}
                  className="bg-white rounded-2xl border border-slate-100 p-5 block hover:shadow-sm hover:border-client/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 leading-snug">{q.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {q.category_icon} {q.category_name}
                        {q.budget_max && ` · Até R$ ${parseFloat(q.budget_max).toFixed(0)}`}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[q.status] || ''}`}>
                      {STATUS_LABEL[q.status] || q.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{q.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className={`font-semibold ${q.proposal_count > 0 ? 'text-client' : ''}`}>
                      {q.proposal_count || 0} proposta{q.proposal_count !== 1 ? 's' : ''} recebida{q.proposal_count !== 1 ? 's' : ''}
                    </span>
                    <span>Ver propostas →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal criar orçamento */}
      <Modal open={modal} onClose={() => setModal(false)} title="Pedir orçamento" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">O que você precisa? *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ex: Instalar tomadas e interruptores no apartamento"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Descreva em detalhes *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Quantos cômodos, tipo de imóvel, o que já foi feito, prazo desejado..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Categoria</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-client">
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Orçamento máximo (R$)</label>
              <input type="number" value={form.budget_max} onChange={e => setForm(p => ({ ...p, budget_max: e.target.value }))}
                placeholder="Ex: 500"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-client"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Cidade</label>
            <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              placeholder="Ex: São Paulo, SP"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-client"
            />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-client text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><span className="animate-spin">⏳</span> Publicando...</> : '📋 Publicar orçamento'}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
