'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

export default function WorkersPage() {
  const toast = useToast();
  const [workers,  setWorkers]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [workerDetail, setWorkerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api.get('/workers')
      .then(r => { setWorkers(r.data.workers || []); setFiltered(r.data.workers || []); })
      .catch(() => toast('Erro ao carregar trabalhadores', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = workers;
    if (query)      list = list.filter(w => w.name.toLowerCase().includes(query.toLowerCase()) || w.services?.some(s => s.title.toLowerCase().includes(query.toLowerCase())));
    if (onlyAvail)  list = list.filter(w => w.is_available);
    setFiltered(list);
  }, [query, onlyAvail, workers]);

  async function openProfile(worker) {
    setSelected(worker);
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/workers/${worker.id}`);
      setWorkerDetail(data);
    } catch { toast('Erro ao carregar perfil', 'error'); }
    finally { setLoadingDetail(false); }
  }

  function renderStars(r) {
    const n = Math.round(parseFloat(r) || 0);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Trabalhadores</h1>
          <p className="text-slate-500 mt-1 text-sm">{filtered.length} profissional{filtered.length !== 1 ? 'is' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="🔍  Buscar por nome ou serviço..."
            value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 min-w-48 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
          />
          <button onClick={() => setOnlyAvail(!onlyAvail)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              onlyAvail ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            Disponíveis agora
          </button>
        </div>

        {loading ? <GridSkeleton count={6} /> : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <p className="text-4xl mb-3">👷</p>
            <p className="text-slate-500">Nenhum trabalhador encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((w, i) => (
              <motion.div key={w.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:Math.min(i*0.04, 0.3) }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => openProfile(w)}
              >
                {/* Header com avatar */}
                <div className="p-5 flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    {w.avatar_url
                      ? <img src={w.avatar_url} alt={w.name} className="w-12 h-12 rounded-full object-cover" />
                      : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-worker to-amber-400 flex items-center justify-center text-white font-black text-lg">{w.name.charAt(0)}</div>
                    }
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${w.is_available ? 'bg-green-400' : 'bg-slate-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-800 truncate">{w.name}</p>
                      {w.is_verified && <span className="text-client text-xs font-bold" title="Verificado">✓</span>}
                    </div>
                    {w.avg_rating > 0 ? (
                      <p className="text-amber-400 text-xs">
                        {renderStars(w.avg_rating)} <span className="text-slate-400">{parseFloat(w.avg_rating).toFixed(1)} ({w.total_reviews})</span>
                      </p>
                    ) : <p className="text-xs text-slate-400">Novo profissional</p>}
                    {w.neighborhood && <p className="text-xs text-slate-400 mt-0.5">📍 {w.neighborhood}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    w.is_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {w.is_available ? 'Disponível' : 'Ocupado'}
                  </span>
                </div>

                {w.bio && <p className="px-5 text-xs text-slate-500 line-clamp-2 -mt-2 mb-3">{w.bio}</p>}

                {/* Serviços */}
                {w.services?.length > 0 && (
                  <div className="px-5 pb-4 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Serviços</p>
                    {w.services.slice(0, 2).map(s => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 truncate max-w-[140px]">{s.category_icon} {s.title}</span>
                        <span className="font-bold text-client flex-shrink-0">{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                    {w.services.length > 2 && (
                      <p className="text-xs text-slate-400">+{w.services.length - 2} serviços</p>
                    )}
                  </div>
                )}

                <div className="px-5 pb-4">
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>📋 {w.total_orders || 0} pedidos</span>
                    {w.distance_km && <span>📍 {w.distance_km} km</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de perfil completo */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setWorkerDetail(null); }} title="Perfil do profissional" size="lg">
        {loadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-3xl animate-spin">⏳</p>
          </div>
        ) : workerDetail ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              {workerDetail.avatar_url
                ? <img src={workerDetail.avatar_url} alt={workerDetail.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-worker to-amber-400 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">{workerDetail.name?.charAt(0)}</div>
              }
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black text-slate-800">{workerDetail.name}</p>
                  {workerDetail.is_verified && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-client/10 text-client">✓ Verificado</span>}
                </div>
                {workerDetail.avg_rating > 0 && (
                  <p className="text-amber-400">
                    {'★'.repeat(Math.round(workerDetail.avg_rating))}{'☆'.repeat(5-Math.round(workerDetail.avg_rating))}
                    <span className="text-slate-400 text-sm ml-1">{parseFloat(workerDetail.avg_rating).toFixed(1)} · {workerDetail.total_reviews} avaliações</span>
                  </p>
                )}
                {workerDetail.neighborhood && <p className="text-sm text-slate-400">📍 {workerDetail.neighborhood}, {workerDetail.city}</p>}
                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${workerDetail.is_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {workerDetail.is_available ? '● Disponível agora' : '○ Indisponível'}
                </span>
              </div>
            </div>

            {workerDetail.bio && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{workerDetail.bio}</p>
              </div>
            )}

            {/* Portfólio */}
            {workerDetail.photos?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-slate-800 mb-2">📸 Portfólio</p>
                <div className="grid grid-cols-3 gap-2">
                  {workerDetail.photos.slice(0,6).map(ph => (
                    <img key={ph.id} src={ph.url} alt={ph.caption} className="aspect-square rounded-xl object-cover" />
                  ))}
                </div>
              </div>
            )}

            {/* Serviços */}
            {workerDetail.services?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-slate-800 mb-2">🛠️ Serviços</p>
                <div className="space-y-2">
                  {workerDetail.services.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">{s.category_icon} {s.title}</span>
                      <span className="font-black text-client">{formatCurrency(s.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliações */}
            {workerDetail.reviews?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-slate-800 mb-2">⭐ Avaliações</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {workerDetail.reviews.map(r => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-slate-700">{r.reviewer_name}</p>
                        <p className="text-amber-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</p>
                      </div>
                      {r.comment && <p className="text-xs text-slate-500">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setSelected(null); setWorkerDetail(null); }}
              className="w-full bg-client text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all">
              Fechar
            </button>
          </div>
        ) : null}
      </Modal>
    </DashboardLayout>
  );
}
