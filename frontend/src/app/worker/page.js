'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useTheme, getThemeColors } from '@/context/ThemeContext';
import orderService from '@/services/orderService';
import api from '@/services/api';
import { formatCurrency, formatStatus } from '@/utils/formatters';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────── */
// Display: Fraunces · Body: Inter · Mono: IBM Plex Mono
// Acentos: Laranja #FF7A00 · Verde #22D31B

/* ─── SVG ICONS ─────────────────────────────────────────────────── */
function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>;
    case 'tool': return <svg {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
    case 'check': return <svg {...p}><polyline points="20 6 9 17 4 12" /></svg>;
    case 'checkCircle': return <svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="9 12 11 14 15 10" /></svg>;
    case 'wallet': return <svg {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>;
    case 'lock': return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
    case 'target': return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>;
    case 'arrowRight': return <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case 'bell': return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case 'inbox': return <svg {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 2l1.5 5h5L14 10.5l1.5 5L12 13l-3.5 2.5L10 10.5 5.5 7h5z" /></svg>;
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4.5" /><line x1="12" y1="1.5" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22.5" /><line x1="4.2" y1="4.2" x2="6" y2="6" /><line x1="18" y1="18" x2="19.8" y2="19.8" /><line x1="1.5" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22.5" y2="12" /></svg>;
    case 'moon': return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
    default: return null;
  }
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function WorkerHomePage() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const theme = getThemeColors(darkMode);

  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, held: 0 });
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'month' | 'week' | 'year'

  useEffect(() => {
    if (!user) return;
    Promise.all([
      orderService.getAll().then(d => setOrders(d.orders || [])),
      api.get('/payments/wallet').then(r => setWallet(r.data)).catch(() => {}),
      api.get('/quotes').then(r => setQuotes(r.data.quotes || [])).catch(() => {}),
      // worker availability removed from dashboard; notifications handled by the bell
    ]).finally(() => setLoading(false));
  }, [user]);

  // availability toggle removed per UI request

  const pending = orders.filter(o => o.status === 'pending');
  const accepted = orders.filter(o => o.status === 'accepted' || o.status === 'in_progress');
  const completed = orders.filter(o => o.status === 'completed');
  const monthRevenue = completed
    .filter(o => {
      const d = new Date(o.completed_at || o.created_at);
      const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    })
    .reduce((s, o) => s + parseFloat(o.price), 0);

  const stats = [
    { icon: 'clock', label: 'Aguardando', value: pending.length, color: '#FFB347' },
    { icon: 'tool', label: 'Em andamento', value: accepted.length, color: '#3B82F6' },
    { icon: 'checkCircle', label: 'Concluídos', value: completed.length, color: '#22D31B' },
    { icon: 'wallet', label: 'Este mês', value: formatCurrency(monthRevenue), color: '#FF7A00' },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: '28px 20px 60px', maxWidth: 880, margin: '0 auto', fontFamily: 'var(--body)' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.9rem', letterSpacing: '-0.02em', color: theme.text }}>
              {greet()}, {user?.name?.split(' ')[0]} <span style={{ fontStyle: 'italic', color: '#FF7A00' }}>🔧</span>
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: 4 }}>Painel do prestador de serviço</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={toggleDarkMode} style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Alternar tema">
              <Icon name={darkMode ? 'sun' : 'moon'} size={15} color={theme.textMuted} />
            </button>
          </div>
        </motion.div>

        {/* Pending alert removed — notifications are available via the bell in the header */}

        {/* Gráfico de resumo (período selecionável) */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.05rem', color: theme.text }}>Resumo</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {['month', 'week', 'year'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 10px', borderRadius: 10, border: `1px solid ${period === p ? '#FF7A00' : theme.cardBorder}`, background: period === p ? '#FFFBF6' : 'transparent', cursor: 'pointer', fontWeight: 700 }}>{p === 'month' ? 'Mês' : p === 'week' ? 'Semana' : 'Ano'}</button>
              ))}
            </div>
          </div>

          {/* compute chart data inline */}
          {(() => {
            const now = new Date();
            let buckets = [];
            if (period === 'month') {
              // last 6 months
              for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = d.toLocaleString('pt-BR', { month: 'short' });
                const value = completed.filter(o => {
                  const od = new Date(o.completed_at || o.created_at);
                  return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
                }).reduce((s, o) => s + parseFloat(o.price), 0);
                buckets.push({ label, value });
              }
            } else if (period === 'week') {
              // last 6 weeks
              for (let i = 5; i >= 0; i--) {
                const start = new Date(now);
                start.setDate(now.getDate() - i * 7);
                const weekLabel = `${start.getDate()}/${start.getMonth() + 1}`;
                const value = completed.filter(o => {
                  const od = new Date(o.completed_at || o.created_at);
                  const diff = Math.floor((now - od) / (1000 * 60 * 60 * 24));
                  return diff >= i * 7 && diff < (i + 1) * 7;
                }).reduce((s, o) => s + parseFloat(o.price), 0);
                buckets.push({ label: weekLabel, value });
              }
            } else {
              // last 6 years
              for (let i = 5; i >= 0; i--) {
                const y = now.getFullYear() - i;
                const value = completed.filter(o => {
                  const od = new Date(o.completed_at || o.created_at);
                  return od.getFullYear() === y;
                }).reduce((s, o) => s + parseFloat(o.price), 0);
                buckets.push({ label: String(y), value });
              }
            }
            const maxVal = Math.max(...buckets.map(b => b.value), 1);
            return (
              <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
                  {buckets.map((b, i) => (
                    <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontSize: '0.66rem', fontWeight: 700, color: theme.text }}>{b.value > 0 ? `R$${Math.round(b.value)}` : ''}</p>
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(b.value / maxVal) * 100}%` }} transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                        style={{ width: '100%', borderRadius: '8px 8px 3px 3px', minHeight: 6, background: i === buckets.length - 1 ? '#FF7A00' : theme.line }} />
                      <p style={{ fontSize: '0.66rem', color: theme.textMuted }}>{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} className="wk-stat-grid">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}
              style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: '16px 14px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${s.color}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon name={s.icon} size={15} color={s.color} />
              </div>
              <p style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.15rem', color: theme.text }}>{s.value}</p>
              <p style={{ fontSize: '0.68rem', color: theme.textMuted, marginTop: 2 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Carteira */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, padding: 22, background: 'linear-gradient(135deg, #1B5E20, #256B29 55%, #22D31B)', color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="0.9" style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.12 }}><path d="M5 21c0-9 6-15 15-15-1 9-7 15-15 15z" /><path d="M5 21c3-3 6-6 9-9" /></svg>
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: '0.78rem', opacity: 0.9 }}>Carteira disponível</p>
            <p style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '2.1rem', marginTop: 4 }}>{formatCurrency(wallet.balance)}</p>
            {wallet.held > 0 && (
              <p style={{ fontSize: '0.76rem', opacity: 0.88, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="lock" size={12} color="#fff" /> {formatCurrency(wallet.held)} em custódia
              </p>
            )}
          </div>
          <Link href="/worker/earnings" style={{ position: 'relative', background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', padding: '10px 18px', borderRadius: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            Ver ganhos <Icon name="arrowRight" size={13} color="#fff" />
          </Link>
        </motion.div>

        {/* Oportunidades */}
        {quotes.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.05rem', color: theme.text, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon name="target" size={16} color="#FF7A00" /> Novas oportunidades
              </h2>
              <Link href="/worker/quotes" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF7A00', textDecoration: 'none' }}>Ver todas →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quotes.slice(0, 2).map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href="/worker/quotes" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: 14, gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</p>
                      <p style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: 2 }}>
                        {q.category_icon} {q.category_name}{q.budget_max && ` · Até ${formatCurrency(q.budget_max)}`}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#22D31B', background: 'rgba(34,211,27,0.12)', padding: '5px 10px', borderRadius: 999, flexShrink: 0 }}>
                      {q.proposal_count || 0} proposta{q.proposal_count !== 1 ? 's' : ''}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos recentes */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.05rem', color: theme.text }}>Pedidos recentes</h2>
            <Link href="/worker/orders" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF7A00', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[0, 1, 2].map(i => <div key={i} style={{ height: 62, borderRadius: 14, background: theme.line, opacity: 0.5 }} />)}</div>
          ) : orders.length === 0 ? (
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: 34, textAlign: 'center' }}>
              <Icon name="inbox" size={30} color={theme.textMuted} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem', color: theme.textMuted }}>Nenhum pedido ainda.</p>
              <Link href="/worker/quotes" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FF7A00', textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>Ver oportunidades →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {orders.slice(0, 4).map((o, i) => (
                <motion.div key={o.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,122,0,0.12)', color: '#FF7A00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>#{o.id}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.83rem', color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.service_title || 'Serviço'}</p>
                      <p style={{ fontSize: '0.72rem', color: theme.textMuted }}>{o.client_name} · {formatStatus(o.status)}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 800, color: '#FF7A00', flexShrink: 0, fontSize: '0.85rem' }}>{formatCurrency(o.price)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .wk-btn-primary { background: #FF7A00; color: #fff; font-weight: 800; font-size: 0.8rem; padding: 10px 18px; border-radius: 12px; text-decoration: none; transition: background 0.2s, transform 0.15s; }
        .wk-btn-primary:hover { background: #E86D00; transform: translateY(-1px); }
        @media (max-width: 700px) { .wk-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </DashboardLayout>
  );
}
