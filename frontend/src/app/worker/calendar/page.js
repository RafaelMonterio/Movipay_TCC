'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme, getThemeColors } from '@/context/ThemeContext';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

/* ─── SVG ICONS ─────────────────────────────────────────────────── */
function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'chevronLeft': return <svg {...p}><polyline points="15 18 9 12 15 6" /></svg>;
    case 'chevronRight': return <svg {...p}><polyline points="9 18 15 12 9 6" /></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'mapPin': return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case 'inbox': return <svg {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
    default: return null;
  }
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  return { first, total };
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function WorkerCalendarPage() {
  const { darkMode } = useTheme();
  const theme = getThemeColors(darkMode);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(today.getDate());
  const [loading, setLoading] = useState(true);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    api.get('/calendar/events', { params: { month: monthStr } })
      .then(r => setEvents(r.data.events))
      .finally(() => setLoading(false));
  }, [monthStr]);

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  const { first, total } = getMonthDays(year, month);
  const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`;
  const dayEvents = events.filter(e => e.event_date === selectedDate);

  function hasEvent(day) {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(e => e.event_date === d);
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '28px 20px 60px', maxWidth: 980, margin: '0 auto', fontFamily: 'var(--body)' }}>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.9rem', color: theme.text, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            Calendário <Icon name="calendar" size={20} color="#FF7A00" />
          </h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: 4 }}>Seus compromissos do mês</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }} className="wk-cal-grid">

          {/* Calendário */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ width: 34, height: 34, borderRadius: 11, background: theme.bgAlt, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="chevronLeft" size={16} color={theme.text} />
              </button>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.05rem', color: theme.text }}>{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} style={{ width: 34, height: 34, borderRadius: 11, background: theme.bgAlt, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="chevronRight" size={16} color={theme.text} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: theme.textMuted, padding: '6px 0' }}>{d}</div>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {[...Array(first)].map((_, i) => <div key={`e${i}`} />)}
              {[...Array(total)].map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSel = day === selected;
                const hasEv = hasEvent(day);
                return (
                  <motion.button key={day} whileTap={{ scale: 0.9 }} onClick={() => setSelected(day)}
                    style={{
                      position: 'relative', aspectRatio: '1', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: isSel ? '#FF7A00' : isToday ? 'rgba(255,122,0,0.14)' : 'transparent',
                      color: isSel ? '#fff' : isToday ? '#FF7A00' : theme.text,
                    }}>
                    {day}
                    {hasEv && <span style={{ position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: '50%', background: isSel ? '#fff' : '#FF7A00' }} />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Painel de eventos */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }}
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.95rem', color: theme.text, marginBottom: 16 }}>{selected}/{month + 1}/{year}</h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[0, 1].map(i => <div key={i} style={{ height: 64, borderRadius: 14, background: theme.line, opacity: 0.5 }} />)}</div>
            ) : dayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <Icon name="inbox" size={26} color={theme.textMuted} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>Sem eventos neste dia</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence>
                  {dayEvents.map(ev => (
                    <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.25)', borderRadius: 14, padding: 14 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.83rem', color: theme.text }}>{ev.title}</p>
                      <p style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: 4 }}>{ev.time_start} – {ev.time_end}</p>
                      <p style={{ fontSize: '0.72rem', color: theme.textMuted }}>{ev.client_name}</p>
                      {ev.address && (
                        <p style={{ fontSize: '0.7rem', color: theme.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="mapPin" size={11} color={theme.textMuted} /> {ev.address}
                        </p>
                      )}
                      {ev.price && <p style={{ fontWeight: 800, color: '#FF7A00', fontSize: '0.85rem', marginTop: 8 }}>{formatCurrency(ev.price)}</p>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <style>{`@media (max-width: 800px) { .wk-cal-grid { grid-template-columns: 1fr !important; } }`}</style>
    </DashboardLayout>
  );
}
