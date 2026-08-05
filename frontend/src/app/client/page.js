'use client';
import { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { formatCurrency, formatStatus } from '@/utils/formatters';

// Leaflet não suporta SSR — lazy load
const WorkersMap = lazy(() => import('@/components/map/WorkersMap'));

const LEVEL_ICONS = ['🌱','🥉','🥈','🥇','💎','👑'];
const LEVEL_NAMES = ['Iniciante','Bronze','Prata','Ouro','Platina','Diamante'];
const THRESHOLDS  = [0,100,300,600,1000,2000];

export default function ClientHomePage() {
  const { user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [points,  setPoints]  = useState(0);
  const [workers, setWorkers] = useState([]);
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([-23.7060, -46.3690]);

  useEffect(() => {
    Promise.all([
      api.get('/orders').then(r => setOrders(r.data.orders || [])),
      api.get('/points/balance').then(r => setPoints(r.data.balance || 0)),
      api.get('/quotes').then(r => setQuotes(r.data.quotes || [])),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCenter([coords.latitude, coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const [lat, lng] = center;
    api.get(`/workers?available=true&lat=${lat}&lng=${lng}`)
      .then(r => setWorkers(r.data.workers || []))
      .catch(() => setWorkers([]));
  }, [center]);

  const pts      = points;
  const level    = THRESHOLDS.reduce((acc, t, i) => pts >= t ? i : acc, 0);
  const nextThr  = THRESHOLDS[level + 1];
  const progress = nextThr ? Math.round(((pts - THRESHOLDS[level]) / (nextThr - THRESHOLDS[level])) * 100) : 100;
  const completed = orders.filter(o => o.status === 'completed').length;
  const recent    = orders.slice(0, 3);

  const nearbyWorkers = workers.filter(w => typeof w.distance_km === 'number' && w.distance_km <= 1);
  const mapCenter = center;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 max-w-5xl">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Bem-vindo de volta ao MoviPay</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard icon="📋" label="Total de pedidos" value={orders.length}   color="client" delay={0.05} />
          <StatCard icon="✅" label="Concluídos"       value={completed}        color="green"  delay={0.1}  />
          <div className="col-span-2 md:col-span-1">
            <StatCard icon="⭐" label="Seus pontos"   value={`${pts} pts`}     color="worker" delay={0.15} />
          </div>
        </div>

        {/* Mapa com trabalhadores */}
        <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
          className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm"
        >
          <div className="p-5 pb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Profissionais perto de você</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                Sua localização está centralizada no mapa abaixo. Veja os profissionais disponíveis dentro de 1 km.
              </p>
            </div>
            <Link href="/client/services"
              className="self-start bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-all">
              Ver todos →
            </Link>
          </div>
          <div className="mx-4 mb-4">
            <Suspense fallback={
              <div className="w-full h-64 bg-slate-200 rounded-2xl animate-pulse flex items-center justify-center">
                <p className="text-slate-400 text-sm">Carregando mapa...</p>
              </div>
            }>
              <WorkersMap workers={workers} center={mapCenter} />
            </Suspense>
          </div>

          <div className="px-5 pb-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Trabalhadores em até 1 km</p>
                <p className="text-xs text-slate-500 mt-1">{nearbyWorkers.length} profissional{nearbyWorkers.length !== 1 ? 'es' : ''} perto de você</p>
              </div>
            </div>
            {nearbyWorkers.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {nearbyWorkers.slice(0, 4).map((w, i) => (
                  <motion.div key={w.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
                    className="bg-slate-50 rounded-3xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-lg">
                        {w.name?.charAt(0) || 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{w.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{w.neighborhood || w.city || 'Ribeirão Pires'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{w.avg_rating ? `⭐ ${Number(w.avg_rating).toFixed(1)}` : 'Novo'}</span>
                      <span>{w.distance_km ? `${w.distance_km} km` : '—'} </span>
                    </div>
                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${w.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {w.is_available ? 'Disponível' : 'Indisponível'}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Não há profissionais dentro de 1 km no momento. Continue navegando pelo mapa ou verifique novamente em breve.
              </div>
            )}
          </div>
        </motion.div>

        {/* Orçamentos abertos */}
        {quotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800">Meus orçamentos</h2>
              <Link href="/client/quotes" className="text-xs text-client font-semibold hover:underline">Ver todos →</Link>
            </div>
            <div className="space-y-2">
              {quotes.slice(0,2).map((q, i) => (
                <motion.div key={q.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}>
                  <Link href={`/client/quotes/${q.id}`}
                    className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-sm hover:border-client/20 transition-all block"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 text-sm truncate max-w-xs">{q.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {q.proposal_count || 0} proposta{q.proposal_count !== 1 ? 's' : ''} · {q.category_icon} {q.category_name}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${
                      q.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {q.status === 'open' ? '● Aberto' : '● Em análise'}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pontos + nível */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-amber-100 text-sm">Seus pontos</p>
              <p className="text-3xl font-black">{pts}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl">{LEVEL_ICONS[level]}</p>
              <p className="text-amber-100 text-sm font-semibold">{LEVEL_NAMES[level]}</p>
            </div>
          </div>
          {nextThr && (
            <>
              <div className="w-full bg-white/30 rounded-full h-2 mb-1">
                <motion.div initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ delay:0.5, duration:1 }}
                  className="bg-white rounded-full h-2" />
              </div>
              <p className="text-xs text-amber-100">{nextThr - pts} pts para {LEVEL_NAMES[level+1]}</p>
            </>
          )}
        </motion.div>

        {/* Top trabalhadores disponíveis */}
        {workers.filter(w => w.is_available).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800">Disponíveis agora</h2>
              <Link href="/client/services" className="text-xs text-client font-semibold hover:underline">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {workers.filter(w => w.is_available).slice(0,3).map((w, i) => (
                <motion.div key={w.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-sm transition-all"
                >
                  <div className="relative flex-shrink-0">
                    {w.avatar_url
                      ? <img src={w.avatar_url} alt={w.name} className="w-10 h-10 rounded-full object-cover" />
                      : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-worker to-amber-400 flex items-center justify-center text-white font-black">
                          {w.name.charAt(0)}
                        </div>
                    }
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-slate-800 text-sm truncate">{w.name}</p>
                      {w.is_verified && <span className="text-client text-xs" title="Verificado">✓</span>}
                    </div>
                    <p className="text-xs text-amber-500">
                      {w.avg_rating > 0 ? `⭐ ${parseFloat(w.avg_rating).toFixed(1)}` : 'Novo'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">Pedidos recentes</h2>
            <Link href="/client/orders" className="text-xs text-client font-semibold hover:underline">Ver todos →</Link>
          </div>
          {loading ? (
            <div className="space-y-2">{[0,1,2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
          ) : recent.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-500 text-sm">Nenhum pedido ainda.</p>
              <Link href="/client/services" className="text-client text-sm font-semibold hover:underline mt-2 inline-block">
                Encontrar serviços →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((o, i) => (
                <motion.div key={o.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}>
                  <Link href={`/client/orders/${o.id}`}
                    className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-sm hover:border-client/20 transition-all block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-client/10 text-client rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0">#{o.id}</div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{o.service_title || 'Serviço'}</p>
                        <p className="text-xs text-slate-400">{formatStatus(o.status)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-client text-sm">{formatCurrency(o.price)}</p>
                      <span className="text-slate-300">›</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
