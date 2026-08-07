'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';

const FALLBACK_COORDS = {
  'carlos@teste.com': [-23.7061, -46.3685],
  'maria@teste.com': [-23.7042, -46.3698],
  'joao@teste.com': [-23.7075, -46.3653],
  'anati@teste.com': [-23.7052, -46.3690],
};

function resolvePosition(worker) {
  if (worker?.email && FALLBACK_COORDS[worker.email]) return FALLBACK_COORDS[worker.email];
  if (Number.isFinite(worker?.lat) && Number.isFinite(worker?.lng)) return [Number(worker.lat), Number(worker.lng)];
  return [-23.7060, -46.3690];
}

export default function WorkerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    api.get(`/workers/${params.id}`)
      .then(r => setWorker(r.data))
      .catch(() => setWorker(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="grid md:grid-cols-3 gap-4">
              {[0,1,2].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse" />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!worker) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-10">
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <p className="text-4xl mb-3">👷</p>
            <h1 className="text-xl font-black text-slate-800 mb-2">Perfil não encontrado</h1>
            <p className="text-slate-500 text-sm mb-5">Este profissional não está mais disponível ou não existe.</p>
            <button onClick={() => router.push('/client/workers')} className="bg-client text-white px-5 py-3 rounded-xl font-semibold">Voltar para trabalhadores</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const [lat, lng] = resolvePosition(worker);
  const recentJobs = [
    { title: 'Reforma de tomada', status: 'Concluído', value: 'R$ 180,00' },
    { title: 'Instalação de luminária', status: 'Concluído', value: 'R$ 250,00' },
    { title: 'Manutenção elétrica', status: 'Concluído', value: 'R$ 320,00' },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => router.back()} className="text-sm font-semibold text-slate-600 hover:text-slate-800">
              ← Voltar
            </button>
            <button className="bg-client text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all">
              Contratar agora
            </button>
          </div>

          <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 md:p-7">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex items-start gap-4">
                  {worker.avatar_url ? (
                    <img src={worker.avatar_url} alt={worker.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-worker to-amber-400 flex items-center justify-center text-white text-2xl font-black">{worker.name?.charAt(0)}</div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-black text-slate-900 truncate">{worker.name}</h1>
                      {worker.is_verified && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-client/10 text-client">✓ Verificado</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{worker.bio || 'Especialista em serviços domésticos e manutenção.'}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>⭐ {worker.avg_rating ? Number(worker.avg_rating).toFixed(1) : 'Novo'}</span>
                      <span>•</span>
                      <span>{worker.total_reviews || 0} avaliações</span>
                      <span>•</span>
                      <span>{worker.is_available ? 'Disponível agora' : 'Indisponível agora'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${worker.is_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {worker.is_available ? '● Disponível' : '○ Ocupado'}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-slate-800">Trabalhos recentes</h2>
                  <span className="text-xs text-slate-500">Últimos 3</span>
                </div>
                <div className="space-y-3">
                  {recentJobs.map((job, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800">{job.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{job.status}</p>
                      </div>
                      <span className="text-sm font-black text-client">{job.value}</span>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-black text-slate-800 mb-4">Serviços disponíveis</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {(worker.services || []).map(service => (
                    <div key={service.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">{service.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{service.category_icon || '🛠️'} {service.category || 'Serviço'}</p>
                        </div>
                        <span className="font-black text-client text-sm">{formatCurrency(service.price)}</span>
                      </div>
                    </div>
                  ))}
                  {(!worker.services || worker.services.length === 0) && (
                    <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
                      Nenhum serviço cadastrado ainda.
                    </div>
                  )}
                </div>
              </motion.section>

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-black text-slate-800 mb-4">Avaliações</h2>
                <div className="space-y-3">
                  {(worker.reviews || []).slice(0, 4).map(review => (
                    <div key={review.id} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-800 text-sm">{review.reviewer_name}</p>
                        <p className="text-amber-500 text-xs">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      </div>
                      {review.comment && <p className="text-sm text-slate-600 mt-2 leading-relaxed">“{review.comment}”</p>}
                    </div>
                  ))}
                  {(!worker.reviews || worker.reviews.length === 0) && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 text-center">
                      Ainda não há avaliações públicas para este perfil.
                    </div>
                  )}
                </div>
              </motion.section>
            </div>

            <div className="space-y-6">
              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-black text-slate-800 mb-4">Localização</h2>
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <div className="w-full h-56 bg-[radial-gradient(circle_at_center,_#e2e8f0_0,_#cbd5e1_40%,_#f8fafc_100%)] relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-client border-4 border-white shadow-lg" />
                    <div className="absolute left-6 top-8 w-16 h-16 rounded-full bg-client/10" />
                    <div className="absolute right-10 bottom-10 w-20 h-20 rounded-full bg-worker/10" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">📍 {worker.neighborhood || 'Bairro'}, {worker.city || 'Ribeirão Pires'}</p>
                  <p className="mt-1 text-xs text-slate-500">Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                </div>
              </motion.section>

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-black text-slate-800 mb-4">Resumo</h2>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-2"><span>Total de pedidos</span><strong className="text-slate-800">{worker.total_orders || 0}</strong></div>
                  <div className="flex justify-between gap-2"><span>Avaliação média</span><strong className="text-slate-800">{worker.avg_rating ? Number(worker.avg_rating).toFixed(1) : '—'}</strong></div>
                  <div className="flex justify-between gap-2"><span>Tempo médio</span><strong className="text-slate-800">2-4h</strong></div>
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
