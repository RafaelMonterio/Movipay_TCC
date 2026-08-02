'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

function getMonthDays(year, month) {
  const first   = new Date(year, month, 1).getDay();
  const total   = new Date(year, month + 1, 0).getDate();
  return { first, total };
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export default function WorkerCalendarPage() {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(today.getDate());
  const [loading, setLoading]   = useState(true);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    api.get('/calendar/events', { params: { month: monthStr } })
      .then(r => setEvents(r.data.events))
      .finally(() => setLoading(false));
  }, [monthStr]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const { first, total } = getMonthDays(year, month);
  const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}`;
  const dayEvents    = events.filter(e => e.event_date === selectedDate);

  function hasEvent(day) {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(e => e.event_date === d);
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-800">Calendário 📅</h1>
          <p className="text-slate-500 mt-1">Seus compromissos do mês</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card p-6 lg:col-span-2"
          >
            {/* Nav */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">‹</button>
              <h2 className="text-lg font-bold text-slate-800">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">›</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {[...Array(first)].map((_, i) => <div key={`e${i}`} />)}
              {[...Array(total)].map((_, i) => {
                const day = i + 1;
                const isToday  = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSel    = day === selected;
                const hasEv    = hasEvent(day);
                return (
                  <button key={day} onClick={() => setSelected(day)}
                    className={`relative aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center transition-all ${
                      isSel   ? 'bg-amber-500 text-white shadow-md' :
                      isToday ? 'bg-amber-100 text-amber-700 font-bold' :
                      'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {day}
                    {hasEv && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-amber-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Events panel */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="font-bold text-slate-800 mb-4">
              {selected}/{month + 1}/{year}
            </h3>
            {loading ? (
              <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-slate-100" />)}</div>
            ) : dayEvents.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-slate-400 text-sm">Sem eventos neste dia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map(ev => (
                  <div key={ev.id} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="font-semibold text-slate-800 text-sm">{ev.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{ev.time_start} – {ev.time_end}</p>
                    <p className="text-xs text-slate-500">{ev.client_name}</p>
                    {ev.address && <p className="text-xs text-slate-400 mt-1">📍 {ev.address}</p>}
                    {ev.price && <p className="text-sm font-bold text-amber-600 mt-2">{formatCurrency(ev.price)}</p>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
