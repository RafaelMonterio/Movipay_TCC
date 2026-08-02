'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';
import orderService from '@/services/orderService';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Padrão' },
  { value: 'price_asc',  label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'rating',     label: 'Melhor avaliado' },
];

export default function ClientServicesPage() {
  const toast = useToast();
  const [services, setServices]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [contracting, setContracting] = useState(null);

  // Filtros
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort]         = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/services').then(r => setServices(r.data.services)),
      api.get('/workers').then(r => {
        // Extrai categorias únicas dos serviços
        const cats = [...new Set(r.data.workers.flatMap(w => w.services?.map(s => s.category) || []).filter(Boolean))];
        setCategories(cats);
      }),
    ])
    .catch(() => toast('Erro ao carregar serviços', 'error'))
    .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...services];
    if (query) list = list.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      (s.category || '').toLowerCase().includes(query.toLowerCase()) ||
      (s.worker_name || '').toLowerCase().includes(query.toLowerCase())
    );
    if (category) list = list.filter(s => s.category === category);
    if (maxPrice)  list = list.filter(s => parseFloat(s.price) <= parseFloat(maxPrice));
    switch (sort) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)); break;
    }
    return list;
  }, [services, query, category, maxPrice, sort]);

  const hasActiveFilters = category || maxPrice || sort !== 'default';

  async function handleContract(service) {
    try {
      setContracting(service.id);
      await orderService.create(service.id);
      toast(`Pedido para "${service.title}" criado!`, 'success');
    } catch (err) {
      toast(err?.response?.data?.error || 'Erro ao criar pedido', 'error');
    } finally {
      setContracting(null);
    }
  }

  function clearFilters() {
    setCategory(''); setMaxPrice(''); setSort('default');
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Buscar Serviços</h1>
          <p className="text-slate-500 mt-1 text-sm">{filtered.length} serviço{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {/* Search + filter toggle */}
        <div className="flex gap-3 items-center">
          <input type="text" placeholder="🔍  Buscar serviço, categoria ou profissional..."
            value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-client/30 focus:border-client transition-all"
          />
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              hasActiveFilters
                ? 'bg-client text-white border-client'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}>
            ⚙️ Filtros {hasActiveFilters && `(${[category,maxPrice,sort!=='default'].filter(Boolean).length})`}
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-client">
                    <option value="">Todas</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Preço máximo (R$)</label>
                  <input type="number" placeholder="Ex: 200" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-client"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Ordenar por</label>
                  <select value={sort} onChange={e => setSort(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-client">
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-3 text-xs text-red-500 hover:underline font-semibold">
                  ✕ Limpar filtros
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? <GridSkeleton count={6} /> : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-500">Nenhum serviço encontrado.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 text-client text-sm font-semibold hover:underline">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.category_icon} {s.category}</span>
                      <h3 className="text-base font-bold text-slate-800 mt-1 leading-snug">{s.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">por {s.worker_name}</p>
                  {s.avg_rating > 0 && (
                    <p className="text-xs text-amber-500 mt-1">
                      {'★'.repeat(Math.round(s.avg_rating))}{'☆'.repeat(5-Math.round(s.avg_rating))} {parseFloat(s.avg_rating).toFixed(1)}
                    </p>
                  )}
                  <p className="text-2xl font-black text-client mt-3">{formatCurrency(s.price)}</p>
                  {s.price_type !== 'fixed' && (
                    <span className="text-xs text-slate-400">
                      {s.price_type === 'hourly' ? '/ hora' : 'a combinar'}
                    </span>
                  )}
                </div>
                <button onClick={() => handleContract(s)} disabled={contracting === s.id}
                  className="w-full bg-client text-white font-bold py-2.5 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {contracting === s.id ? <span className="animate-spin">⏳</span> : '📋'}
                  Contratar
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
