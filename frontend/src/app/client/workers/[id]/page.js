'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';

const FALLBACK_COORDS = {
  'carlos@teste.com': [-23.7061, -46.3685],
  'maria@teste.com': [-23.7042, -46.3698],
  'joao@teste.com': [-23.7075, -46.3653],
  'anati@teste.com': [-23.7052, -46.3690],
};

const FALLBACK_PROFILES = {
  'barbeiro-1': {
    id: 'barbeiro-1',
    name: 'Carlos "Navalha" Mendes',
    avatar_url: '/img/prestadores/barbeiro1.jpg',
    bio: 'Especialista em cortes modernos e barba estilizada. Atendo no conforto da sua casa com kit profissional completo.',
    avg_rating: 4.9,
    total_reviews: 312,
    is_available: true,
    is_verified: true,
    neighborhood: 'Centro',
    city: 'Ribeirão Pires',
    services: [
      { id: 'barbeiro-1-serv-1', title: 'Corte de cabelo', category: 'Barbearia', category_icon: '✂️', price: 35 },
      { id: 'barbeiro-1-serv-2', title: 'Barba completa', category: 'Barbearia', category_icon: '🧔', price: 30 },
    ],
    reviews: [
      { id: 1, reviewer_name: 'Ana', rating: 5, comment: 'Atendimento impecável, corte muito bem feito.' },
      { id: 2, reviewer_name: 'Luiz', rating: 5, comment: 'Ponto no tempo e visual incrível.' },
    ],
  },
  'barbeiro-2': {
    id: 'barbeiro-2',
    name: 'Diego Ferreira',
    avatar_url: '/img/prestadores/barbeiro2.jpg',
    bio: 'Barbeiro certificado com foco em cortes clássicos e contemporâneos.',
    avg_rating: 4.8,
    total_reviews: 198,
    is_available: true,
    is_verified: true,
    neighborhood: 'Vila Nova',
    city: 'Ribeirão Pires',
    services: [
      { id: 'barbeiro-2-serv-1', title: 'Corte clássico', category: 'Barbearia', category_icon: '✂️', price: 28 },
      { id: 'barbeiro-2-serv-2', title: 'Hidratação facial', category: 'Barbearia', category_icon: '💧', price: 25 },
    ],
    reviews: [
      { id: 1, reviewer_name: 'Pedro', rating: 5, comment: 'Muito profissional e pontual.' },
      { id: 2, reviewer_name: 'Gabriela', rating: 4, comment: 'Barba bem feita e ambiente agradável.' },
    ],
  },
  'barbeiro-3': {
    id: 'barbeiro-3',
    name: 'Rafael "Rê" Santos',
    avatar_url: '/img/prestadores/barbeiro3.jpg',
    bio: 'Único com nota 5.0 no bairro! Especializado em cortes afro e crespos.',
    avg_rating: 5,
    total_reviews: 87,
    is_available: true,
    is_verified: true,
    neighborhood: 'Jardim Primavera',
    city: 'Ribeirão Pires',
    services: [
      { id: 'barbeiro-3-serv-1', title: 'Corte afro', category: 'Barbearia', category_icon: '✂️', price: 45 },
      { id: 'barbeiro-3-serv-2', title: 'Design de sobrancelha', category: 'Barbearia', category_icon: '🧴', price: 35 },
    ],
    reviews: [
      { id: 1, reviewer_name: 'Renato', rating: 5, comment: 'Excelente domínio da técnica e atenção ao detalhe.' },
      { id: 2, reviewer_name: 'Mirela', rating: 5, comment: 'O melhor corte que já fiz no bairro.' },
    ],
  },
  'faxina-1': {
    id: 'faxina-1',
    name: 'Maria das Graças',
    avatar_url: '',
    bio: 'Profissional experiente com mais de 12 anos de limpeza residencial e comercial.',
    avg_rating: 4.9,
    total_reviews: 541,
    is_available: true,
    is_verified: true,
    neighborhood: 'Centro',
    city: 'Ribeirão Pires',
    services: [
      { id: 'faxina-1-serv-1', title: 'Faxina residencial', category: 'Limpeza', category_icon: '🧼', price: 120 },
      { id: 'faxina-1-serv-2', title: 'Limpeza de escritório', category: 'Limpeza', category_icon: '🏢', price: 180 },
    ],
    reviews: [
      { id: 1, reviewer_name: 'Célia', rating: 5, comment: 'Tudo impecável e muito atenciosa.' },
      { id: 2, reviewer_name: 'Wagner', rating: 5, comment: 'Faz a faxina com muito cuidado.' },
    ],
  },
  'faxina-2': {
    id: 'faxina-2',
    name: 'Cleide Oliveira',
    avatar_url: '',
    bio: 'Especialista em limpeza de alto padrão com produtos premium.',
    avg_rating: 4.7,
    total_reviews: 203,
    is_available: true,
    is_verified: true,
    neighborhood: 'Vila Santa Helena',
    city: 'Ribeirão Pires',
    services: [
      { id: 'faxina-2-serv-1', title: 'Faxina profunda', category: 'Limpeza', category_icon: '🧽', price: 90 },
      { id: 'faxina-2-serv-2', title: 'Limpeza pós-obra', category: 'Limpeza', category_icon: '🧱', price: 140 },
    ],
    reviews: [
      { id: 1, reviewer_name: 'Sofia', rating: 5, comment: 'Casa ficou brilhando, adorei.' },
      { id: 2, reviewer_name: 'Rafael', rating: 4, comment: 'Muito eficiente e organizada.' },
    ],
  },
  'pintura-1': {
    id: 'pintura-1',
    name: 'José "Pincel" Alves',
    avatar_url: '',
    bio: 'Pintor profissional com 15 anos de experiência e acabamento impecável.',
    avg_rating: 4.8,
    total_reviews: 156,
    is_available: true,
    is_verified: true,
    neighborhood: 'Jardim das Flores',
    city: 'Ribeirão Pires',
    services: [
      { id: 'pintura-1-serv-1', title: 'Pintura interna', category: 'Pintura', category_icon: '🎨', price: 80 },
      { id: 'pintura-1-serv-2', title: 'Pintura externa', category: 'Pintura', category_icon: '🧱', price: 110 },
    ],
    reviews: [
      { id: 1, reviewer_name: 'Marta', rating: 5, comment: 'Acabamento muito bonito e limpo.' },
      { id: 2, reviewer_name: 'Daniel', rating: 4, comment: 'Atendeu tudo o que pedimos.' },
    ],
  },
  'pintura-2': {
    id: 'pintura-2',
    name: 'Antônio Pinturas',
    avatar_url: '',
    bio: 'Equipe própria com foco em imóveis para locação e venda.',
    avg_rating: 4.6,
    total_reviews: 98,
    is_available: true,
    is_verified: true,
    neighborhood: 'Parque das Nações',
    city: 'Ribeirão Pires',
    services: [
      { id: 'pintura-2-serv-1', title: 'Pintura para locação', category: 'Pintura', category_icon: '🎨', price: 65 },
      { id: 'pintura-2-serv-2', title: 'Textura e acabamento', category: 'Pintura', category_icon: '🪄', price: 90 },
    ],
    reviews: [
      { id: 1, reviewer_name: 'Bárbara', rating: 5, comment: 'Trabalho rápido e profissional.' },
      { id: 2, reviewer_name: 'João', rating: 4, comment: 'Foi bem organizado e limpo.' },
    ],
  },
};

function resolvePosition(worker) {
  if (worker?.email && FALLBACK_COORDS[worker.email]) return FALLBACK_COORDS[worker.email];
  if (Number.isFinite(worker?.lat) && Number.isFinite(worker?.lng)) return [Number(worker.lat), Number(worker.lng)];
  return [-23.7060, -46.3690];
}

function getFallbackWorkerById(id) {
  if (!id) return null;
  return FALLBACK_PROFILES[String(id)] || null;
}

export default function WorkerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('Hoje • 18:30');
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    api.get(`/workers/${params.id}`)
      .then(r => setWorker(r.data))
      .catch(() => {
        const fallback = getFallbackWorkerById(params.id);
        setWorker(fallback);
      })
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
  const completionRate = Math.min(99, Math.max(72, Math.round((worker.total_reviews || 0) / 6) + 78));
  const portfolio = worker.portfolio || [
    { id: 1, title: 'Reforma de tomada', type: 'Elétrica', image: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    { id: 2, title: 'Instalação de luminária', type: 'Iluminação', image: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { id: 3, title: 'Pintura de parede', type: 'Acabamento', image: 'linear-gradient(135deg, #10b981, #22c55e)' },
    { id: 4, title: 'Detalhes de acabamento', type: 'Casa', image: 'linear-gradient(135deg, #fb7185, #f43f5e)' },
  ];
  const recentJobs = [
    { title: 'Reforma de tomada', status: 'Concluído', value: 'R$ 180,00' },
    { title: 'Instalação de luminária', status: 'Concluído', value: 'R$ 250,00' },
    { title: 'Manutenção elétrica', status: 'Concluído', value: 'R$ 320,00' },
  ];
  const workHistory = [
    { title: 'Instalação de luminária', date: '12 ago', status: 'Concluído' },
    { title: 'Troca de tomada e revisão elétrica', date: '08 ago', status: 'Concluído' },
    { title: 'Diagnóstico de curto-circuito', date: '03 ago', status: 'Avaliando' },
  ];
  const bookingSlots = ['Hoje • 18:30', 'Amanhã • 09:15', 'Qua • 15:00', 'Sex • 17:45'];
  const stats = [
    { label: 'Avaliação', value: worker.avg_rating ? Number(worker.avg_rating).toFixed(1) : 'Novo', icon: '⭐' },
    { label: 'Avaliações', value: String(worker.total_reviews || 0), icon: '💬' },
    { label: 'Tempo', value: '2-4h', icon: '⏱️' },
    { label: 'Distância', value: worker.distance_km ? `${worker.distance_km} km` : '0.7 km', icon: '📍' },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => router.back()} className="text-sm font-semibold text-slate-600 hover:text-slate-800">
              ← Voltar
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="border border-slate-200 bg-white text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                Enviar mensagem
              </button>
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="border border-client/20 bg-client/5 text-client px-4 py-2 rounded-xl text-sm font-semibold hover:bg-client/10 transition-all"
              >
                Agendar
              </button>
              <button
                type="button"
                onClick={() => setContractOpen(true)}
                className="bg-client text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all"
              >
                Contratar agora
              </button>
            </div>
          </div>

          <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 md:p-7">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                <div className="flex items-start gap-4">
                  {worker.avatar_url ? (
                    <img src={worker.avatar_url} alt={worker.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-worker to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-sm">{worker.name?.charAt(0)}</div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-black text-slate-900 truncate">{worker.name}</h1>
                      {worker.is_verified && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-client/10 text-client">✓ Verificado</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1 max-w-xl">{worker.bio || 'Especialista em serviços domésticos e manutenção com atendimento rápido e acabamento premium.'}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span>⭐ {worker.avg_rating ? Number(worker.avg_rating).toFixed(1) : 'Novo'}</span>
                      <span>•</span>
                      <span>{worker.total_reviews || 0} avaliações</span>
                      <span>•</span>
                      <span>{worker.is_available ? 'Disponível agora' : 'Indisponível agora'}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">Top 5% na região</span>
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Resposta em {worker.response_time || '5 min'}</span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">Membro desde 2022</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 xl:justify-end">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${worker.is_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {worker.is_available ? '● Disponível' : '○ Ocupado'}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((item, index) => (
              <motion.div key={item.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: index * 0.04 }} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="text-xl mb-2">{item.icon}</div>
                <p className="text-xl font-black text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-black text-slate-800">Sobre</h2>
                  <span className="text-xs text-slate-500">{completionRate}% de perfil completo</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {worker.bio || 'Atendo clientes com foco em qualidade, pontualidade e conforto. Trabalho com materiais de boa procedência, explico o serviço antes de iniciar e mantenho a comunicação clara durante todo o atendimento.'}
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-client to-amber-500" style={{ width: `${completionRate}%` }} />
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
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-black text-slate-800">Portfólio</h2>
                  <span className="text-xs text-slate-500">Últimos projetos</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {portfolio.map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedPhoto(item)}
                      className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 text-left transition-all hover:border-client/30 hover:shadow-sm"
                    >
                      <div className="h-32" style={{ background: item.image }} />
                      <div className="p-3">
                        <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.section>

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
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

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-black text-slate-800 mb-4">Histórico de serviços</h2>
                <div className="space-y-4">
                  {workHistory.map((item, index) => (
                    <div key={item.title} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-client' : index === 1 ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        {index < workHistory.length - 1 && <div className="w-px h-10 bg-slate-200 mt-2" />}
                      </div>
                      <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
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
                    <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,122,0,0.12) 50%, transparent 100%)' }} />
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-800">📍 {worker.neighborhood || 'Bairro'}, {worker.city || 'Ribeirão Pires'}</p>
                  <p className="text-xs text-slate-500">Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                  <p className="text-xs text-slate-500">Atende em até {worker.service_area || '3 km'} da localidade.</p>
                </div>
              </motion.section>

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-black text-slate-800 mb-4">Resumo</h2>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between gap-2"><span>Total de pedidos</span><strong className="text-slate-800">{worker.total_orders || 0}</strong></div>
                  <div className="flex justify-between gap-2"><span>Avaliação média</span><strong className="text-slate-800">{worker.avg_rating ? Number(worker.avg_rating).toFixed(1) : '—'}</strong></div>
                  <div className="flex justify-between gap-2"><span>Tempo de resposta</span><strong className="text-slate-800">{worker.response_time || '5 min'}</strong></div>
                  <div className="flex justify-between gap-2"><span>Último check-in</span><strong className="text-slate-800">Hoje</strong></div>
                </div>
              </motion.section>

              <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-black text-slate-800 mb-4">Destaques</h2>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><span>✅</span><span>Atendimento pontual e respeitoso</span></li>
                  <li className="flex gap-2"><span>✅</span><span>Materiais e ferramentas profissionais</span></li>
                  <li className="flex gap-2"><span>✅</span><span>Orçamento claro antes do início</span></li>
                  <li className="flex gap-2"><span>✅</span><span>Excelente reputação na região</span></li>
                </ul>
              </motion.section>
            </div>
          </div>
        </div>
      </div>

      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title={`Agendar com ${worker.name}`} size="md">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Escolha um horário</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {bookingSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium text-left transition-all ${
                    selectedSlot === slot ? 'border-client bg-client/5 text-client' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <span>Serviço</span>
              <strong className="text-slate-800">{worker.services?.[0]?.title || 'Atendimento personalizado'}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 mt-2">
              <span>Horário</span>
              <strong className="text-slate-800">{selectedSlot}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setBookingOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setBookingOpen(false);
                setScheduled(true);
              }}
              className="px-4 py-2 rounded-xl bg-client text-white font-semibold hover:bg-indigo-600"
            >
              Confirmar agendamento
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={contractOpen} onClose={() => setContractOpen(false)} title="Confirmar contratação" size="md">
        <div className="space-y-4">
          <div className="rounded-2xl bg-client/5 border border-client/20 p-4">
            <p className="text-sm text-slate-600">Você está prestes a contratar</p>
            <p className="mt-2 text-xl font-black text-slate-800">{worker.name}</p>
            <p className="mt-1 text-sm text-slate-600">{worker.services?.[0]?.title || 'Atendimento personalizado'} · {worker.services?.[0] ? formatCurrency(worker.services[0].price) : 'Orçamento sob consulta'}</p>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed">
            O profissional será avisado e poderá confirmar disponibilidade. Você também pode agendar um horário após a confirmação.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setContractOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                setContractOpen(false);
                setScheduled(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
            >
              Confirmar contratação
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title={selectedPhoto?.title || 'Projeto'} size="lg">
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="h-72 rounded-2xl" style={{ background: selectedPhoto.image }} />
            <div>
              <p className="text-lg font-black text-slate-800">{selectedPhoto.title}</p>
              <p className="text-sm text-slate-500 mt-1">{selectedPhoto.type}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={scheduled} onClose={() => setScheduled(false)} title="Solicitação enviada" size="sm">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-slate-700 text-sm">Sua solicitação foi enviada com sucesso.</p>
          </div>
          <button
            type="button"
            onClick={() => setScheduled(false)}
            className="w-full px-4 py-2 rounded-xl bg-client text-white font-semibold hover:bg-indigo-600"
          >
            Entendi
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
