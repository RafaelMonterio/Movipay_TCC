'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/utils/formatters';
import api from '@/services/api';

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000];
const LEVEL_NAMES      = ['Iniciante', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante'];
const LEVEL_ICONS      = ['🌱', '🥉', '🥈', '🥇', '💎', '👑'];

function getLevel(pts) {
  let lvl = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (pts >= LEVEL_THRESHOLDS[i]) lvl = i;
  }
  return lvl;
}

export default function ClientPointsPage() {
  const [balance, setBalance]     = useState(0);
  const [history, setHistory]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/points/balance').then(r => setBalance(r.data.balance)),
      api.get('/points/history').then(r => setHistory(r.data.transactions)),
    ]).finally(() => setLoading(false));
  }, []);

  const level     = getLevel(balance);
  const nextLevel = LEVEL_THRESHOLDS[level + 1];
  const progress  = nextLevel
    ? Math.round(((balance - LEVEL_THRESHOLDS[level]) / (nextLevel - LEVEL_THRESHOLDS[level])) * 100)
    : 100;

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-800">Meus Pontos ⭐</h1>
          <p className="text-slate-500 mt-1">Acumule pontos e suba de nível</p>
        </motion.div>

        {/* Balance card */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 text-white shadow-xl"
        >
          <p className="text-amber-100 font-medium mb-1">Saldo atual</p>
          <p className="text-6xl font-black mb-2">{balance}</p>
          <p className="text-amber-100 text-lg">pontos</p>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl">{LEVEL_ICONS[level]}</span>
            <div className="flex-1">
              <div className="flex justify-between text-sm font-semibold text-amber-100 mb-1">
                <span>{LEVEL_NAMES[level]}</span>
                {nextLevel && <span>{nextLevel - balance} pts para {LEVEL_NAMES[level + 1]}</span>}
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.5, duration: 1 }}
                  className="bg-white rounded-full h-2"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Levels grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Níveis</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {LEVEL_NAMES.map((name, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={`card p-4 text-center ${level >= i ? 'border-amber-300 bg-amber-50' : 'opacity-40'}`}
              >
                <p className="text-2xl mb-1">{LEVEL_ICONS[i]}</p>
                <p className="text-xs font-semibold text-slate-700">{name}</p>
                <p className="text-xs text-slate-400">{LEVEL_THRESHOLDS[i]} pts</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Histórico</h2>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-slate-100" />)}</div>
          ) : history.length === 0 ? (
            <div className="card p-10 text-center"><p className="text-slate-400">Nenhuma transação ainda.</p></div>
          ) : (
            <div className="space-y-2">
              {history.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="card p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{t.description}</p>
                    <p className="text-xs text-slate-400">{formatDate(t.created_at)}</p>
                  </div>
                  <span className={`text-lg font-black ${t.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.amount} pts
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
