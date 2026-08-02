'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

export default function QuoteDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const toast   = useToast();
  const [quote, setQuote]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null);

  useEffect(() => {
    api.get(`/quotes/${id}`)
      .then(r => setQuote(r.data))
      .catch(() => toast('Orçamento não encontrado', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleProposal(proposalId, status) {
    try {
      setActing(proposalId);
      await api.patch(`/quotes/${id}/proposals/${proposalId}`, { status });
      setQuote(prev => ({
        ...prev,
        proposals: prev.proposals.map(p =>
          p.id === proposalId ? { ...p, status } : p
        ),
        status: status === 'accepted' ? 'in_review' : prev.status,
      }));
      if (status === 'accepted') {
        toast('Proposta aceita! Entre em contato com o profissional.', 'success');
      } else {
        toast('Proposta recusada.', 'info');
      }
    } catch {
      toast('Erro ao responder proposta', 'error');
    } finally {
      setActing(null);
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 space-y-4">
        {[0,1,2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
    </DashboardLayout>
  );

  if (!quote) return (
    <DashboardLayout>
      <div className="p-8 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-slate-500">Orçamento não encontrado.</p>
        <button onClick={() => router.back()} className="text-client text-sm font-semibold hover:underline mt-3 inline-block">
          ← Voltar
        </button>
      </div>
    </DashboardLayout>
  );

  const accepted = quote.proposals?.find(p => p.status === 'accepted');

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-2xl space-y-6">
        {/* Back */}
        <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
          ← Voltar
        </button>

        {/* Header do orçamento */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          className="bg-white rounded-2xl border border-slate-100 p-6"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-xl font-black text-slate-800">{quote.title}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
              quote.status === 'open' ? 'bg-green-100 text-green-700' :
              quote.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {quote.status === 'open' ? '● Aberto' : quote.status === 'in_review' ? '● Em análise' : quote.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{quote.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            {quote.category_name && <span>📂 {quote.category_name}</span>}
            {quote.city && <span>📍 {quote.city}</span>}
            {quote.budget_max && <span className="text-green-600 font-semibold">Até {formatCurrency(quote.budget_max)}</span>}
            <span>📅 {new Date(quote.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </motion.div>

        {/* Proposta aceita em destaque */}
        {accepted && (
          <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
            className="bg-green-50 border-2 border-green-300 rounded-2xl p-5"
          >
            <p className="text-sm font-bold text-green-800 mb-3">✅ Proposta aceita!</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-worker to-amber-400 flex items-center justify-center text-white font-black flex-shrink-0">
                {accepted.worker_name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{accepted.worker_name}</p>
                {accepted.avg_rating > 0 && (
                  <p className="text-amber-400 text-xs">
                    {'★'.repeat(Math.round(accepted.avg_rating))}
                    <span className="text-slate-400 ml-1">{parseFloat(accepted.avg_rating).toFixed(1)}</span>
                  </p>
                )}
              </div>
              <p className="ml-auto font-black text-green-700 text-xl">{formatCurrency(accepted.price)}</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{accepted.message}</p>
          </motion.div>
        )}

        {/* Lista de propostas */}
        <div>
          <h2 className="font-bold text-slate-800 mb-3">
            {quote.proposals?.length || 0} proposta{quote.proposals?.length !== 1 ? 's' : ''} recebida{quote.proposals?.length !== 1 ? 's' : ''}
          </h2>

          {!quote.proposals?.length ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <p className="text-3xl mb-2">⏳</p>
              <p className="text-slate-500 text-sm">Aguardando propostas dos profissionais...</p>
              <p className="text-slate-400 text-xs mt-1">Profissionais serão notificados automaticamente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quote.proposals.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                  className={`bg-white rounded-2xl border p-5 transition-all ${
                    p.status === 'accepted' ? 'border-green-300 bg-green-50' :
                    p.status === 'rejected' ? 'border-slate-200 opacity-50' :
                    'border-slate-100 hover:shadow-sm'
                  }`}
                >
                  {/* Header da proposta */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-worker to-amber-400 flex items-center justify-center text-white font-black flex-shrink-0">
                      {p.worker_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800">{p.worker_name}</p>
                        {p.is_verified && <span className="text-xs text-client font-semibold">✓ Verificado</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        {p.avg_rating > 0 && (
                          <span className="text-amber-400">
                            {'★'.repeat(Math.round(p.avg_rating))}
                            <span className="text-slate-400 ml-1">{parseFloat(p.avg_rating).toFixed(1)}</span>
                          </span>
                        )}
                        <span>📋 {p.total_orders || 0} pedidos</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-client">{formatCurrency(p.price)}</p>
                      {quote.budget_max && parseFloat(p.price) <= parseFloat(quote.budget_max) && (
                        <p className="text-xs text-green-600 font-semibold">Dentro do orçamento</p>
                      )}
                    </div>
                  </div>

                  {/* Mensagem */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{p.message}</p>

                  {/* Ações */}
                  {p.status === 'pending' && !accepted && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleProposal(p.id, 'accepted')}
                        disabled={acting === p.id}
                        className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl hover:bg-green-600 transition-all disabled:opacity-60 text-sm"
                      >
                        {acting === p.id ? '⏳' : '✅'} Aceitar proposta
                      </button>
                      <button
                        onClick={() => handleProposal(p.id, 'rejected')}
                        disabled={acting === p.id}
                        className="px-5 border border-slate-200 text-slate-500 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                  {p.status === 'accepted' && (
                    <span className="text-xs font-semibold text-green-600">✅ Proposta aceita</span>
                  )}
                  {p.status === 'rejected' && (
                    <span className="text-xs font-semibold text-slate-400">❌ Proposta recusada</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
