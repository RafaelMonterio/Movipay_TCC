'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';

const categoryGroups = [
  {
    title: 'Conveniência',
    cards: [
      { name: 'Barbeiro', subtitle: 'Cabelo, barba e estética', icon: '✂️', accent: 'from-rose-500 via-red-500 to-red-600', badge: 'Hoje' },
      { name: 'Faxina', subtitle: 'Casa e escritório', icon: '🧽', accent: 'from-sky-500 via-cyan-500 to-teal-500', badge: 'Próximo' },
      { name: 'Pintura', subtitle: 'Reformas e acabamento', icon: '🎨', accent: 'from-violet-500 via-purple-500 to-fuchsia-500', badge: 'Top' },
    ],
  },
  {
    title: 'Fornecedores',
    cards: [
      { name: 'Mercadinhos de rua', subtitle: 'Produtos locais', icon: '🏪', accent: 'from-orange-500 via-amber-500 to-yellow-400', badge: 'Mais perto' },
      { name: 'Padarias', subtitle: 'Pães e doces frescos', icon: '🥐', accent: 'from-amber-500 via-orange-400 to-orange-300', badge: 'Fresquinho' },
      { name: 'Marcenarias', subtitle: 'Móveis e reformas', icon: '🪵', accent: 'from-yellow-700 via-amber-600 to-orange-500', badge: 'Sob medida' },
      { name: 'Artesanatos', subtitle: 'Itens únicos e feitos à mão', icon: '🎨', accent: 'from-pink-500 via-rose-400 to-red-400', badge: 'Único' },
      { name: 'Comidas artesanais', subtitle: 'Receitas e sabores especiais', icon: '🍽️', accent: 'from-red-500 via-orange-500 to-yellow-400', badge: 'Chef' },
      { name: 'Verdureiras', subtitle: 'Legumes e frutas frescas', icon: '🥬', accent: 'from-lime-500 via-emerald-500 to-green-600', badge: 'Natural' },
    ],
  },
  {
    title: 'Serviços digitais',
    cards: [
      { name: 'Design gráfico', subtitle: 'Identidade visual e artes', icon: '🖌️', accent: 'from-violet-500 via-purple-500 to-indigo-600', badge: 'Popular' },
      { name: 'Marketing digital', subtitle: 'Gestão e campanhas', icon: '📈', accent: 'from-cyan-500 via-sky-500 to-blue-600', badge: 'Growth' },
      { name: 'Criação de sites', subtitle: 'Landing pages e lojas', icon: '💻', accent: 'from-slate-700 via-slate-800 to-slate-900', badge: 'Web' },
      { name: 'Edição de vídeo', subtitle: 'Reels e anúncios', icon: '🎬', accent: 'from-pink-600 via-red-500 to-orange-500', badge: 'Shorts' },
      { name: 'SEO', subtitle: 'Posicionamento e tráfego', icon: '🔎', accent: 'from-teal-500 via-emerald-500 to-green-600', badge: 'Ranking' },
      { name: 'Suporte técnico', subtitle: 'Configuração e ajuda', icon: '🛠️', accent: 'from-indigo-500 via-blue-500 to-cyan-500', badge: '24/7' },
    ],
  },
];

export default function ClientServicesPage() {
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return categoryGroups;

    return categoryGroups
      .map((group) => ({
        ...group,
        cards: group.cards.filter((card) =>
          card.name.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q) ||
          card.subtitle.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.cards.length > 0);
  }, [query]);

  return (
    <DashboardLayout>
      <div className="w-full px-4 pb-20 pt-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[760px]">
          <div className="relative flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-2xl text-slate-500">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Mercado perto de mim"
              className="w-full border-0 bg-transparent text-lg text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[1100px] space-y-8">
          {filteredGroups.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
              Nenhuma categoria encontrada para “{query}”.
            </div>
          ) : (
            filteredGroups.map((group, groupIndex) => (
              <motion.section
                key={group.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.04 }}
                className="space-y-4"
              >
                <h2 className="px-1 text-[2rem] font-black tracking-[-0.04em] text-slate-900">
                  {group.title}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {group.cards.map((card) => (
                    <button
                      key={card.name}
                      type="button"
                      className={`group relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-r ${card.accent} p-5 text-left text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5`}
                    >
                      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-black/10" />

                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[1.5rem] font-black leading-tight tracking-[-0.04em]">
                            {card.name}
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-[1.8rem] shadow-inner">
                          {card.icon}
                        </div>
                      </div>

                      <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white/90">{card.subtitle}</p>
                        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          {card.badge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.section>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
