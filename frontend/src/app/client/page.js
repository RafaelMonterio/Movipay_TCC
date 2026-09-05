'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useInView, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import WorkersMap from '@/components/map/WorkersMap';
import { useTheme, getThemeColors } from '@/context/ThemeContext';
import AccessibilityControls from '@/components/accessibility/AccessibilityControls';
import FallingLeaves, { FooterLeafPile, LeafProvider } from '@/components/effects/FallingLeaves';
import api from '@/services/api';
import orderService from '@/services/orderService';
import { formatCurrency, formatDate } from '@/utils/formatters';

/* ─── FOLHAS (moedas de desconto do MoviPay) ─────────────────────────
   1 folha = R$ 0,04 em desconto acumulado. */
const FOLHA_VALUE = 0.04;

const FAVORITE_WORKERS_DATA = [
  { id: 1, profileId: 'barbeiro-1', name: 'Marina Souza', role: 'Cabeleireira', emoji: '✂️', photo: '/img/cabeleireiro.jpg', avg_rating: 4.9, completed_jobs: 142, distance_km: 0.3, specialty: 'Cortes & Visagismo' },
  { id: 2, profileId: 'faxina-1', name: 'Eduardo Ramos', role: 'Eletricista', emoji: '⚡', photo: '/img/eletricista.jpg', avg_rating: 4.8, completed_jobs: 98, distance_km: 0.7, specialty: 'Instalações & Quadros' },
  { id: 4, profileId: 'faxina-2', name: 'Maria Oliveira', role: 'Diarista', emoji: '🧹', photo: '/img/faxineira.jpg', avg_rating: 5.0, completed_jobs: 215, distance_km: 0.5, specialty: 'Limpeza Residencial' },
  { id: 3, profileId: 'pintura-1', name: 'Thiago Alves', role: 'Pedreiro', emoji: '🧱', photo: '/img/pedreiro.jpg', avg_rating: 4.7, completed_jobs: 83, distance_km: 1.1, specialty: 'Reformas & Alvenaria' },
];

const CLIENT_MAP_WORKERS = [
  {
    id: 1,
    profileId: 'barbeiro-1',
    name: 'Marina Souza',
    role: 'Cabeleireira',
    specialty: 'Cortes e styling',
    service: 'Barbearia',
    category: 'cabelo',
    emoji: '✂️',
    photo: '/img/cabeleireiro.jpg',
    neighborhood: 'Centro',
    distance_km: 0.3,
    avg_rating: 4.9,
    is_available: true,
    lat: -23.7048,
    lng: -46.3671,
  },
  {
    id: 2,
    profileId: 'faxina-1',
    name: 'Eduardo Ramos',
    role: 'Eletricista',
    specialty: 'Instalações e revisões',
    service: 'Elétrica',
    category: 'eletrica',
    emoji: '⚡',
    photo: '/img/eletricista.jpg',
    neighborhood: 'Vila Nova',
    distance_km: 0.7,
    avg_rating: 4.8,
    is_available: true,
    lat: -23.7032,
    lng: -46.3642,
  },
  {
    id: 3,
    profileId: 'pintura-1',
    name: 'Thiago Alves',
    role: 'Pedreiro',
    specialty: 'Reformas e acabamento',
    service: 'Pedreiro',
    category: 'pedreiro',
    emoji: '🧱',
    photo: '/img/pedreiro.jpg',
    neighborhood: 'Jardim das Flores',
    distance_km: 1.1,
    avg_rating: 4.7,
    is_available: true,
    lat: -23.7073,
    lng: -46.3709,
  },
  {
    id: 4,
    profileId: 'faxina-2',
    name: 'Maria Oliveira',
    role: 'Diarista',
    specialty: 'Limpeza e Higienização',
    service: 'Limpeza',
    category: 'limpeza',
    emoji: '🧹',
    photo: '/img/faxineira.jpg',
    neighborhood: 'Centro',
    distance_km: 0.5,
    avg_rating: 5.0,
    is_available: true,
    lat: -23.7055,
    lng: -46.3662,
  },
  {
    id: 5,
    profileId: 'jardim-1',
    name: 'Carlos Mendes',
    role: 'Jardineiro',
    specialty: 'Paisagismo & Poda',
    service: 'Jardinagem',
    category: 'jardim',
    emoji: '🌿',
    photo: '/img/jardineiro.jpg',
    neighborhood: 'Bela Vista',
    distance_km: 1.4,
    avg_rating: 4.9,
    is_available: true,
    lat: -23.7082,
    lng: -46.3638,
  },
  {
    id: 6,
    profileId: 'mudanca-1',
    name: 'Roberto Santos',
    role: 'Mudanças & Fretes',
    specialty: 'Transporte e Montagem',
    service: 'Mudança',
    category: 'mudanca',
    emoji: '📦',
    photo: '/img/mudanca.jpg',
    neighborhood: 'Vila Suíça',
    distance_km: 1.8,
    avg_rating: 4.8,
    is_available: true,
    lat: -23.7020,
    lng: -46.3715,
  },
];

/* ─── SVG ICONS ─────────────────────────────────────────────────────── */
function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 1.8, style, className }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style, className };
  switch (name) {
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case 'star': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" style={style} className={className}><polygon points="12 2 15.09 8.63 22 9.24 16.5 14.14 18.18 21 12 17.27 5.82 21 7.5 14.14 2 9.24 8.91 8.63 12 2" /></svg>;
    case 'arrowRight': return <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case 'bolt': return <svg {...p}><polygon points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" /></svg>;
    case 'broom': return <svg {...p}><line x1="13" y1="2" x2="7" y2="15" /><path d="M7 15l-3.5 6.5 9-2.5 3.5-6.5z" /></svg>;
    case 'leaf': return <svg {...p}><path d="M5 21c0-9 6-15 15-15-1 9-7 15-15 15z" /><path d="M5 21c3-3 6-6 9-9" /></svg>;
    case 'box': return <svg {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><line x1="12" y1="13" x2="12" y2="21" /></svg>;
    case 'scissors': return <svg {...p}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>;
    case 'hammer': return <svg {...p}><path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" /><path d="M17.64 15L22 10.64" /><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" /></svg>;
    case 'motorcycle': return <svg {...p}><circle cx="5" cy="16" r="3" /><circle cx="19" cy="16" r="3" /><path d="M3 16L8.5 6h4l4 4h4v2h-2.5l-3-3H12l-4 7" /></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 2l1.5 5h5L14 10.5l1.5 5L12 13l-3.5 2.5L10 10.5 5.5 7h5z" /></svg>;
    case 'shield': return <svg {...p}><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" /></svg>;
    case 'lock': return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>;
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4.5" /><line x1="12" y1="1.5" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22.5" /><line x1="4.2" y1="4.2" x2="6" y2="6" /><line x1="18" y1="18" x2="19.8" y2="19.8" /><line x1="1.5" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22.5" y2="12" /></svg>;
    case 'moon': return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
    case 'x': return <svg {...p}><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>;
    case 'mapPin': return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case 'checkCircle': return <svg {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
    case 'trendingUp': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    case 'users': return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'paint': return <svg {...p}><rect x="3" y="4" width="12" height="6" rx="1" /><line x1="9" y1="10" x2="9" y2="16" /><rect x="6" y="16" width="6" height="5" rx="1" /></svg>;
    case 'gift': return <svg {...p}><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>;
    case 'calculator': return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>;
    case 'phone': return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
    default: return null;
  }
}

/* ─── PARTICLE FIELD ─────────────────────────────────────────────────── */
function ParticleField({ themeColors }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.parentElement?.clientWidth || 1200;
    const H = 680;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const pts = Array.from({ length: 36 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1.5 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.45,
      color: Math.random() > 0.5 ? '255,122,0' : '34,211,27',
    }));

    let animId;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });
      pts.forEach((a, i) => {
        pts.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,122,0,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(animId);
  }, [themeColors]);

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
  );
}

/* ─── ANIMATED COUNTER ───────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', decimal = false }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const steps = 40;
    const duration = 1400;
    const inc = target / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(cur);
    }, duration / steps);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{decimal ? count.toFixed(1) : Math.floor(count).toLocaleString('pt-BR')}{suffix}</span>;
}

/* ─── MAPA REPOSICIONADO À ESQUERDA COM DESIGN ORGÂNICO FUTURISTA ─────── */
function OrganicMap({ themeColors, selectedCategory, onSelectCategory, searchQuery, setSearchQuery, onSearchSubmit }) {
  const router = useRouter();
  const [selectedWorker, setSelectedWorker] = useState(null);

  const filteredWorkers = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'todos') return CLIENT_MAP_WORKERS;
    return CLIENT_MAP_WORKERS.filter(w => w.category === selectedCategory);
  }, [selectedCategory]);

  const onlineCount = filteredWorkers.filter(w => w.is_available).length;

  return (
    <div className="hero-split-grid">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* COLUNA ESQUERDA: INFORMAÇÕES, BUSCA & TELEMETRIA             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}
      >
        {/* Eyebrow Badge com Efeito Neon */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.35)', padding: '6px 14px', borderRadius: 999, width: 'fit-content', marginBottom: 16 }}>
          <Icon name="sparkle" size={14} color="#FF7A00" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', fontWeight: 800, color: '#FF7A00', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MAPA MOVIPAY
          </span>
        </div>

        {/* Título Principal de Impacto */}
        <h1 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)', lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: 14 }}>
          Encontre os melhores profissionais{' '}
          <span style={{ background: 'linear-gradient(135deg, #FF7A00 0%, #22D31B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic' }}>
            ao vivo perto de você
          </span>
        </h1>

        {/* Subtítulo explicativo */}
        <p style={{ fontSize: '0.98rem', color: themeColors.textMuted, lineHeight: 1.6, marginBottom: 22, maxWidth: 540 }}>
          Localize profissionais próximos no mapa, combine orçamentos instantâneos com proteção de pagamento e ganhe <strong>Folhas de desconto</strong> a cada serviço.
        </p>

        {/* Últimos Serviços */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 8 }}>
          {[
            { name: 'Diarista', time: 'Hoje · 14:40', price: 'R$ 180', icon: 'broom' },
            { name: 'Eletricista', time: 'Ontem · 18:10', price: 'R$ 240', icon: 'bolt' },
            { name: 'Pintura', time: 'Seg · 09:30', price: 'R$ 520', icon: 'paint' },
            { name: 'Cabeleireiro', time: 'Qua · 13:20', price: 'R$ 95', icon: 'scissors' },
          ].map(service => (
            <div
              key={service.name + service.time}
              style={{
                background: themeColors.cardBg,
                border: `1.5px solid ${themeColors.cardBorder}`,
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,122,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={service.icon} size={17} color="#FF7A00" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: '0.8rem', color: themeColors.text, lineHeight: 1.1 }}>{service.name}</p>
                <p style={{ fontSize: '0.64rem', color: themeColors.textMuted, marginTop: 2 }}>{service.time}</p>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', fontWeight: 800, color: '#22D31B' }}>{service.price}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* COLUNA DIREITA: MAPA / VISUALIZAÇÃO GEOGRÁFICA               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="map-orbit-wrapper"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left', width: '100%', maxWidth: 620, aspectRatio: '1 / 1', alignSelf: 'center', justifySelf: 'end', minWidth: 0, flexShrink: 0 }}
      >
        
        {/* Anel LED Giratório Conic-Gradient (Laranja & Verde) — contorno do mapa redondo.
            BUG CORRIGIDO: faltava position:'relative' no container pai acima, então esse
            anel (position:absolute) perdia a referência do mapa e "flutuava" girando em
            outro lugar da tela em vez de ficar encaixado ao redor do círculo do mapa. */}
        {/* Halo Neon de Fundo com Pulso Suave */}
        <motion.div
          aria-hidden="true"
          animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: -14,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,122,0,0.22) 0%, rgba(34,211,27,0.14) 55%, transparent 75%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Contorno circular externo do mapa */}
        <motion.div
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #FF7A00, transparent 20%, #22D31B 50%, transparent 70%, #FF7A00 100%)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
            opacity: 0.88,
            pointerEvents: 'none',
            boxShadow: '0 0 35px rgba(255,122,0,0.3)',
            zIndex: 1,
          }}
        />

        {/* Badge de status removido per request */}

        {/* CONTAINER PRINCIPAL DO MAPA (100% REDONDO / CIRCULAR) */}
        <div
          className="map-frame"
          style={{
            position: 'absolute',
            inset: 7,
            borderRadius: '50%',
            overflow: 'hidden',
            background: themeColors.cardBg,
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            zIndex: 2,
          }}
          >
          {/* Componente do Mapa Leaflet */}
          <WorkersMap
            workers={filteredWorkers}
            center={[-23.7058, -46.3685]}
            onSelectWorker={setSelectedWorker}
            selectedWorkerId={selectedWorker?.id}
            height="100%"
          />

          {/* Card Flutuante com Efeito Glassmorphism do Profissional Selecionado */}
          <AnimatePresence>
            {selectedWorker && (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.94 }}
                transition={{ duration: 0.22 }}
                style={{
                  position: 'absolute',
                  bottom: 18,
                  left: 24,
                  right: 24,
                  background: 'rgba(15, 23, 14, 0.94)',
                  border: '2px solid #FF7A00',
                  borderRadius: 18,
                  boxShadow: '0 20px 45px rgba(0,0,0,0.5), 0 0 20px rgba(255,122,0,0.3)',
                  padding: 12,
                  backdropFilter: 'blur(16px)',
                  zIndex: 50,
                  color: '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#FF7A00', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {selectedWorker.role} · {selectedWorker.distance_km} km
                  </span>
                  <button
                    onClick={() => setSelectedWorker(null)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#bbb' }}
                  >
                    <Icon name="x" size={15} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={selectedWorker.photo}
                    alt={selectedWorker.name}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FF7A00' }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedWorker.name} {selectedWorker.emoji}
                    </h4>
                    <p style={{ fontSize: '0.7rem', color: '#ccc', marginTop: 1 }}>{selectedWorker.specialty}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => router.push(`/client/workers/${selectedWorker.profileId}`)}
                    style={{
                      flex: 1,
                      border: 'none',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #FF7A00, #FF9A33)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      padding: '7px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Ver Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/client/chat?worker=${selectedWorker.profileId}`)}
                    style={{
                      border: '1.5px solid rgba(255,255,255,0.25)',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      padding: '7px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    💬 Chat
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── MINI-GAME / BÔNUS DIÁRIO DE FOLHAS (CRIATIVO & INTERATIVO) ─────── */
function DailyFolhasBonusCard({ themeColors, onCollectBonus }) {
  const [claimed, setClaimed] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(null);
  const [isOpening, setIsOpening] = useState(false);

  function handleClaim() {
    if (claimed || isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      const bonus = Math.floor(Math.random() * 15) + 10; // 10 a 25 folhas
      setRewardAmount(bonus);
      setIsOpening(false);
      setClaimed(true);
      if (onCollectBonus) onCollectBonus(bonus);
    }, 900);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="neon-glow-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${themeColors.cardBg} 0%, rgba(255,122,0,0.06) 100%)`,
        border: '1.5px solid rgba(255,122,0,0.35)',
        borderRadius: 20,
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 10px 35px rgba(255,122,0,0.12)',
      }}
    >
      {/* Luz ambiente de LED de fundo */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 140,
        height: 140,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,27,0.22), transparent 70%)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260, flex: '1 1 300px' }}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: [0, -6, 6, 0] }}
          animate={isOpening ? { rotate: [0, -15, 15, -15, 0], scale: 1.2 } : {}}
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #FF7A00, #FF9A33)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255,122,0,0.45)',
            flexShrink: 0,
            cursor: claimed ? 'default' : 'pointer',
          }}
          onClick={handleClaim}
        >
          <span style={{ fontSize: '1.8rem' }}>{claimed ? '🎉' : '🎁'}</span>
        </motion.div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', fontWeight: 800, color: '#22D31B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              BÔNUS DIÁRIO
            </span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D31B', boxShadow: '0 0 6px #22D31B' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', fontWeight: 800, color: themeColors.text, marginTop: 2 }}>
            {claimed ? `Você resgatou +${rewardAmount} Folhas hoje!` : 'Resgate suas Folhas da Sorte Diárias'}
          </h3>
          <p style={{ fontSize: '0.78rem', color: themeColors.textMuted, marginTop: 4 }}>
            {claimed ? 'Volte amanhã para uma nova caixa misteriosa e mais descontos!' : 'Clique na caixa para abrir seu presente e acumular cupons instantâneos.'}
          </p>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed || isOpening}
        style={{
          background: claimed
            ? 'rgba(34,211,27,0.15)'
            : 'linear-gradient(135deg, #22D31B, #16A34A)',
          color: claimed ? '#22D31B' : '#fff',
          border: `1.5px solid ${claimed ? '#22D31B' : 'transparent'}`,
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 800,
          fontSize: '0.86rem',
          cursor: claimed ? 'default' : 'pointer',
          boxShadow: claimed ? 'none' : '0 0 20px rgba(34,211,27,0.4)',
          transition: 'all 0.2s',
        }}
      >
        {isOpening ? 'Abrindo...' : claimed ? '✓ Resgatado Hoje' : '🎁 Abrir Caixa Surpresa'}
      </button>
    </motion.div>
  );
}

/* ─── SIMULADOR DE ORÇAMENTO INTELIGENTE (CRIATIVO) ──────────────────── */
function InstantQuoteSimulator({ themeColors }) {
  const [category, setCategory] = useState('limpeza');
  const [urgency, setUrgency] = useState('urgente');
  const [hours, setHours] = useState(3);

  const baseRates = {
    limpeza: 35,
    eletrica: 65,
    cabelo: 45,
    pedreiro: 55,
    jardim: 40,
    mudanca: 70,
  };

  const multiplier = urgency === 'urgente' ? 1.25 : urgency === 'hoje' ? 1.1 : 1.0;
  const rawPrice = (baseRates[category] || 40) * hours * multiplier;
  const minPrice = Math.round(rawPrice * 0.9);
  const maxPrice = Math.round(rawPrice * 1.15);
  const estimatedLeavesBonus = Math.floor(rawPrice * 0.4);

  return (
    <div
      style={{
        background: themeColors.cardBg,
        border: `1.5px solid ${themeColors.cardBorder}`,
        borderRadius: 24,
        padding: '32px 28px',
        boxShadow: '0 16px 45px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="calculator" size={16} color="#FF7A00" />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', fontWeight: 800, color: '#FF7A00', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SIMULADOR INTELIGENTE
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.45rem', fontWeight: 800, color: themeColors.text, marginTop: 4 }}>
            Estime seu orçamento em segundos
          </h3>
        </div>
        <span style={{ fontSize: '0.76rem', color: themeColors.textMuted, background: themeColors.line, padding: '4px 12px', borderRadius: 999 }}>
          Valores médios calculados em Ribeirão Pires
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {/* Escolher Categoria */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: themeColors.text, display: 'block', marginBottom: 8 }}>
            1. Tipo de Serviço
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 10,
              border: `1.5px solid ${themeColors.line}`,
              background: themeColors.inputBg,
              color: themeColors.text,
              fontSize: '0.88rem',
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="limpeza">🧹 Limpeza / Diarista</option>
            <option value="eletrica">⚡ Eletricista</option>
            <option value="cabelo">✂️ Cabelo & Estética</option>
            <option value="pedreiro">🧱 Pedreiro & Reformas</option>
            <option value="jardim">🌿 Jardinagem</option>
            <option value="mudanca">📦 Mudanças & Frete</option>
          </select>
        </div>

        {/* Escolher Urgência */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: themeColors.text, display: 'block', marginBottom: 8 }}>
            2. Quando você precisa?
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'urgente', label: '⚡ Em 1 hora' },
              { id: 'hoje', label: '📅 Hoje' },
              { id: 'semana', label: '🗓️ Esta semana' },
            ].map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUrgency(u.id)}
                style={{
                  flex: 1,
                  padding: '9px 6px',
                  borderRadius: 10,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1.5px solid ${urgency === u.id ? '#FF7A00' : themeColors.line}`,
                  background: urgency === u.id ? 'rgba(255,122,0,0.12)' : 'transparent',
                  color: urgency === u.id ? '#FF7A00' : themeColors.textMuted,
                  transition: 'all 0.2s',
                }}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantidade de Horas */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: themeColors.text }}>
              3. Estimativa de Tempo
            </label>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF7A00' }}>
              {hours} hora{hours > 1 ? 's' : ''}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#FF7A00', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Resultado do Orçamento com LED */}
      <div
        style={{
          marginTop: 24,
          padding: '20px 24px',
          borderRadius: 18,
          background: `linear-gradient(135deg, rgba(255,122,0,0.08), rgba(34,211,27,0.08))`,
          border: `1.5px solid rgba(255,122,0,0.25)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: '0.76rem', color: themeColors.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Faixa Estimada de Investimento
          </p>
          <p style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 800, color: themeColors.text, lineHeight: 1.1, marginTop: 4 }}>
            R$ {minPrice} – R$ {maxPrice}
          </p>
          <p style={{ fontSize: '0.74rem', color: '#22D31B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon name="leaf" size={14} color="#22D31B" />
            Você acumulará aprox. +{estimatedLeavesBonus} Folhas neste pedido
          </p>
        </div>

        <Link
          href={`/client/services?category=${category}`}
          className="btn-primary"
          style={{ fontSize: '0.88rem', padding: '12px 24px' }}
        >
          Ver Profissionais Disponíveis <Icon name="arrowRight" size={15} className="arrow-icon" />
        </Link>
      </div>
    </div>
  );
}

/* ─── LIVE ACTIVITY TICKER ───────────────────────────────────────────── */
const LIVE_ACTIVITY = [
  { icon: 'checkCircle', text: 'Ana Paula acabou de contratar uma diarista no Centro', color: '#22D31B' },
  { icon: 'bolt', text: 'Eduardo Ramos concluiu um serviço de elétrica com nota 5.0', color: '#FF7A00' },
  { icon: 'star', text: 'Marina Souza recebeu uma avaliação 5 estrelas em Visagismo', color: '#22D31B' },
  { icon: 'leaf', text: 'Carla Souza resgatou R$ 12,00 em desconto usando Folhas', color: '#FF7A00' },
  { icon: 'mapPin', text: '4 novos profissionais entraram online na sua região agora', color: '#22D31B' },
  { icon: 'checkCircle', text: 'Thiago Alves fechou um orçamento de alvenaria', color: '#FF7A00' },
];

function LiveActivityTicker({ theme }) {
  return (
    <div style={{ height: 1, background: theme.line, width: '100%', opacity: 0.8 }} />
  );
}

const CATEGORIES = [
  { icon: 'broom',      name: 'Limpeza',       img: '/img/faxineira.jpg', description: 'Casa, escritório e higienização com cuidado.' },
  { icon: 'bolt',       name: 'Elétrica',      img: '/img/eletricista.jpg', description: 'Instalações, quadros e reparos rápidos.' },
  { icon: 'leaf',       name: 'Jardinagem',    img: '/img/jardineiro.jpg', description: 'Manutenção de jardins, corte e poda.' },
  { icon: 'box',        name: 'Mudança',       img: '/img/mudanca.jpg', description: 'Transporte e montagem com segurança.' },
  { icon: 'scissors',   name: 'Cabeleireiro',  img: '/img/cabeleireiro.jpg', description: 'Cortes, hidratação e estética pessoal.' },
  { icon: 'hammer',     name: 'Pedreiro',      img: '/img/pedreiro.jpg', description: 'Reformas, pisos, alvenaria e acabamento.' },
  { icon: 'paint',      name: 'Pintor',        img: '/img/pintor.jpg', description: 'Pintura residencial e texturas modernas.' },
  { icon: 'motorcycle', name: 'Motoboy',       img: '/img/motoboy.jpg', description: 'Entregas expressas locais e compras.' },
  { icon: 'sparkle',    name: 'Manicure',      img: '/img/manicure.jpg', description: 'Cuidados com unhas, spa e beleza.' },
];

const TESTIMONIALS = [
  { name: 'Ana Paula', role: 'Cliente · Centro', avatar: 'A', rating: 5, text: 'Encontrei um eletricista em 5 minutos. O mapa em tempo real facilitou muito e ainda ganhei Folhas de desconto!' },
  { name: 'Bruno Silva', role: 'Cliente · Vila Nova', avatar: 'B', rating: 5, text: 'Chamei uma diarista ontem e o atendimento foi nota 10. O pagamento protegido dá uma segurança enorme.' },
  { name: 'Carla Souza', role: 'Cliente · Ouro Fino', avatar: 'C', rating: 5, text: 'Já usei quatro vezes para serviços diferentes. Todos pontuais e prestativos. Melhor plataforma da região!' },
];

const HOW_STEPS = [
  { n: '01', icon: 'search', title: 'Localize no mapa', body: 'Veja no mapa os profissionais disponíveis perto da sua casa em tempo real.' },
  { n: '02', icon: 'users',  title: 'Negocie no Chat', body: 'Combine valores, horários e detalhes diretamente com o especialista sem intermediários.' },
  { n: '03', icon: 'star',   title: 'Avalie & Ganhe Folhas', body: 'Ao finalizar, avalie o atendimento e ganhe Folhas para descontos futuros.' },
];

/* ══════════════════════════════════════════════════════════════════════ */
/* ── MAIN CLIENT COMPONENT ───────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════ */
export default function ClientDashboardPage() {
  const { user, loading, logout } = useAuth();
  const { darkMode, toggleTheme: globalToggleTheme } = useTheme();
  const colors = getThemeColors(darkMode);
  const router = useRouter();
  const { scrollY, scrollYProgress } = useScroll();
  const [navSolid, setNavSolid] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapCategory, setSelectedMapCategory] = useState('todos');

  /* Indicação de amigos & cupom */
  const [referralCopied, setReferralCopied] = useState(false);
  function handleCopyReferral() {
    const code = (user?.name || 'cliente').split(/\s+/)[0].toLowerCase() + '2026';
    const link = `https://movipay.com.br/register?ref=${code}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2400);
  }

  function handleShareWhatsApp() {
    const code = (user?.name || 'cliente').split(/\s+/)[0].toLowerCase() + '2026';
    const text = encodeURIComponent(`Olá! Estou usando o MoviPay para contratar serviços rápidos e de confiança. Cadastre-se pelo meu link para ganhar R$ 2,00 em Folhas de desconto no seu 1º serviço: https://movipay.com.br/register?ref=${code}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  /* Favoritos */
  const [favoriteIds, setFavoriteIds] = useState([1, 2, 4]);
  function toggleFavorite(id) {
    setFavoriteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  const favorites = FAVORITE_WORKERS_DATA.filter(w => favoriteIds.includes(w.id));

  /* Panorama */
  const [folhasBalance, setFolhasBalance] = useState(85);
  const [recentOrders, setRecentOrders] = useState([]);
  const [panoramaLoading, setPanoramaLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPanoramaLoading(false); return; }
    Promise.all([
      api.get('/points/balance').then(r => {
        if (r.data?.balance !== undefined) setFolhasBalance(r.data.balance);
      }).catch(() => {}),
      orderService.getAll().then(d => {
        setRecentOrders((d.orders || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }).catch(() => {}),
    ]).finally(() => setPanoramaLoading(false));
  }, [user]);

  function handleAddDailyBonus(amount) {
    setFolhasBalance(prev => prev + amount);
  }

  const totalGasto = recentOrders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + parseFloat(o.price || 0), 0);
  const folhasDesconto = folhasBalance * FOLHA_VALUE;
  const lastServices = recentOrders.slice(0, 3);

  useEffect(() => {
    if (!loading && user && user.mode === 'worker') {
      router.push('/worker');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const u = scrollY.on('change', v => setNavSolid(v > 40));
    return u;
  }, [scrollY]);

  function getInitials(name = '') {
    if (!name) return 'MP';
    return name.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  const theme = {
    bg: colors.bg,
    bgAlt: darkMode ? '#0D130B' : '#F7F7F5',
    bgAlt2: darkMode ? '#0F1A0C' : '#FAFAFA',
    text: colors.text,
    textMuted: colors.textMuted,
    cardBg: colors.cardBg,
    cardBorder: colors.cardBorder,
    navBg: darkMode ? 'rgba(18,26,15,0.95)' : 'rgba(255,255,255,0.95)',
    navBorder: darkMode ? 'rgba(243,239,226,0.08)' : 'rgba(23,36,26,0.08)',
    line: colors.line,
    mono: colors.mono,
    orange: colors.orange,
    green: colors.green,
    inputBg: darkMode ? '#1A2417' : '#FFFFFF',
  };

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/client/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/client/services');
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
        <motion.img src="/img/logo.png" alt="MoviPay" style={{ width: 64, height: 64, borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  return (
    <LeafProvider count={36}>
      <div style={{ minHeight: '100vh', overflowX: 'hidden', background: theme.bg, color: theme.text, fontFamily: 'var(--body)', transition: 'background 0.4s, color 0.4s', position: 'relative' }}>
        <Sidebar />

        {/* Efeitos Globais */}
        <FallingLeaves count={36} />

        {/* ── ESTILOS GLOBAIS ─────────────────────────────────────────── */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;0,900;1,500;1,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
          :root { --display: 'Fraunces', serif; --body: 'Inter', sans-serif; --mono: 'IBM Plex Mono', monospace; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }

          /* Layout adaptativo com a Sidebar */
          .client-main-wrapper {
            margin-left: 0px;
            transition: margin-left 0.26s ease;
          }
          @media (min-width: 1024px) {
            .client-main-wrapper {
              margin-left: 88px;
            }
            .client-category-grid {
              grid-template-columns: repeat(9, minmax(0, 1fr)) !important;
              gap: 18px !important;
            }
          }
          @media (max-width: 1023px) {
            .client-category-grid {
              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            }
          }

          /* Split Grid do Hero (Campo à Esquerda, Mapa à Direita) */
          .hero-split-grid {
            display: grid;
            grid-template-columns: 1fr 1.18fr;
            gap: 48px;
            align-items: center;
            width: 100%;
            max-width: none;
            margin: 0 auto;
          }
          @media (max-width: 1060px) {
            .hero-split-grid {
              grid-template-columns: 1fr;
              gap: 36px;
            }
          }

          .btn-primary {
            position: relative; overflow: hidden;
            background: linear-gradient(135deg, #FF7A00, #FF9A33);
            color: #fff; font-weight: 800;
            border-radius: 10px; padding: 14px 28px; font-size: 0.92rem;
            border: none; cursor: pointer; display: inline-flex; align-items: center;
            justify-content: center; gap: 8px; text-decoration: none; font-family: var(--body);
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 20px rgba(255,122,0,0.32);
          }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,122,0,0.48); }
          .btn-primary .arrow-icon { transition: transform 0.22s; }
          .btn-primary:hover .arrow-icon { transform: translateX(4px); }

          .btn-ghost {
            background: transparent; border: 1.5px solid ${theme.line};
            color: ${theme.text}; font-weight: 700; border-radius: 10px;
            padding: 13px 24px; font-size: 0.9rem; cursor: pointer;
            display: inline-flex; align-items: center; justify-content: center;
            text-decoration: none; font-family: var(--body);
            transition: border-color 0.2s, color 0.2s, background 0.2s;
          }
          .btn-ghost:hover { border-color: #FF7A00; color: #FF7A00; background: rgba(255,122,0,0.06); }

          .eyebrow {
            font-family: var(--mono); font-size: 0.72rem; font-weight: 700;
            letter-spacing: 0.14em; text-transform: uppercase; color: ${theme.mono};
            display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px;
          }
          .eyebrow::before { content: ''; width: 18px; height: 2px; background: ${theme.orange}; display: inline-block; }

          .cat-card-item {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
            padding: 22px 14px; border-radius: 18px;
            border: 1.5px solid ${theme.cardBorder}; background: ${theme.cardBg};
            cursor: pointer; text-decoration: none; transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
            color: ${theme.textMuted}; text-align: center;
          }
          .cat-card-item:hover {
            border-color: #FF7A00; transform: translateY(-5px);
            box-shadow: 0 14px 36px rgba(255,122,0,0.18);
          }
          .cat-card-item img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid transparent; transition: border-color 0.2s; }
          .cat-card-item:hover img { border-color: #FF7A00; }

          /* Correção do Leaflet attribution e centralização */
          .map-frame .leaflet-control-container .leaflet-bottom {
            left: 0 !important; right: 0 !important;
            display: flex !important; justify-content: center !important;
            bottom: 14px !important; pointer-events: none !important;
          }
          .map-frame .leaflet-control-attribution {
            float: none !important; margin: 0 auto !important; text-align: center !important;
            font-family: var(--mono); font-size: 9px !important; line-height: 1.4;
            background: rgba(255,255,255,0.92) !important; color: #334 !important;
            border-radius: 999px !important; padding: 2px 12px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15); pointer-events: auto !important;
          }
          .map-frame .leaflet-control-zoom {
            border: none !important; box-shadow: 0 6px 20px rgba(0,0,0,0.18) !important;
            border-radius: 12px !important; overflow: hidden;
          }
          .map-orbit-wrapper {
            width: min(620px, calc(100vw - 64px)) !important;
            height: min(620px, calc(100vw - 64px)) !important;
            aspect-ratio: 1 / 1 !important;
          }
          @media (min-width: 1061px) {
            .hero-copy { padding-left: 100px; }
            .map-orbit-wrapper { justify-self: center !important; left: -24px; }
          }

          /* Ticker contínuo */
          .ticker-track { animation: ticker-scroll 32s linear infinite; }
          .ticker-wrap:hover .ticker-track { animation-play-state: paused; }
          @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

          @media (max-width: 860px) {
            .hide-mobile { display: none !important; }
          }
        `}</style>

        {/* Barra de progresso de rolagem */}
        <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, transformOrigin: '0%', zIndex: 500, background: 'linear-gradient(90deg, #FF7A00, #22D31B)', scaleX: scrollYProgress }} />

        {/* Menu de Acessibilidade */}
        <AccessibilityControls />

        {/* WRAPPER PRINCIPAL QUE RESPEITA A SIDEBAR */}
        <div className="client-main-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>

          {/* ── NAVBAR SUPERIOR ──────────────────────────────────────────── */}
          <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: navSolid ? `1px solid ${theme.navBorder}` : '1px solid transparent', background: navSolid ? theme.navBg : 'transparent', backdropFilter: 'blur(12px)', transition: 'all 0.35s' }}>
            <div style={{ maxWidth: 'none', margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

              {/* Logo / Título de boas-vindas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.25rem' }}>👋</span>
                <div>
                  <p style={{ fontSize: '0.92rem', fontWeight: 800, color: theme.text, lineHeight: 1.1 }}>
                    Olá, {user?.name ? user.name.split(' ')[0] : 'Cliente'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: theme.textMuted }}>O que vamos resolver hoje?</p>
                </div>
              </div>

              {/* Controles da Navbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Saldo de Folhas rápido */}
                <Link
                  href="/client/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(34,211,27,0.12)',
                    border: '1px solid rgba(34,211,27,0.3)',
                    borderRadius: 999,
                    padding: '6px 14px',
                    textDecoration: 'none',
                    color: '#22D31B',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                  }}
                >
                  <Icon name="leaf" size={14} color="#22D31B" />
                  <span>{folhasBalance} Folhas</span>
                </Link>

                {/* Alternar Tema */}
                <button
                  onClick={globalToggleTheme}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  aria-label="Alternar tema"
                >
                  <Icon name={colors.darkMode ? 'sun' : 'moon'} size={16} color={theme.mono} />
                </button>

                {/* Avatar do Usuário com Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF7A00, #FF9A33)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 4px 14px rgba(255,122,0,0.25)' }}
                    aria-label="Menu do perfil"
                  >
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#173C17', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', border: '2px solid #fff' }}>
                      {getInitials(user?.name || 'Cliente')}
                    </span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        style={{ position: 'absolute', top: 52, right: 0, width: 250, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: 16, zIndex: 220, boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: `1px solid ${theme.line}` }}>
                          <span style={{ width: 38, height: 38, borderRadius: '50%', background: '#FF7A00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            {getInitials(user?.name || 'Cliente')}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.text, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user?.name || 'Cliente MoviPay'}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: theme.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user?.email || 'conta@movipay.com'}
                            </p>
                          </div>
                        </div>

                        <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <Link href="/client/profile" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: theme.text, fontSize: '0.8rem', fontWeight: 700, padding: '8px 10px', borderRadius: 8, background: 'transparent' }}>👤 Meu Perfil</Link>
                          <Link href="/client/orders" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: theme.text, fontSize: '0.8rem', fontWeight: 700, padding: '8px 10px', borderRadius: 8, background: 'transparent' }}>🛒 Meus Pedidos</Link>
                          <Link href="/client/quotes" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: theme.text, fontSize: '0.8rem', fontWeight: 700, padding: '8px 10px', borderRadius: 8, background: 'transparent' }}>📋 Orçamentos</Link>
                          <Link href="/client/services" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: theme.text, fontSize: '0.8rem', fontWeight: 700, padding: '8px 10px', borderRadius: 8, background: 'transparent' }}>🔍 Buscar Serviços</Link>
                          <button onClick={() => { setProfileOpen(false); logout(); }} style={{ marginTop: 6, width: '100%', padding: '9px 10px', borderRadius: 8, border: `1px solid ${theme.line}`, background: 'rgba(255,122,0,0.08)', color: '#FF7A00', cursor: 'pointer', fontWeight: 800, fontSize: '0.78rem' }}>
                            Sair da conta
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </nav>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── HERO SECTION: MAPA À ESQUERDA & INFORMAÇÕES À DIREITA ───── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section style={{ position: 'relative', overflow: 'hidden', padding: '40px 32px 72px' }}>
            <ParticleField themeColors={colors} />

            {/* Halos Neon de Fundo */}
            <div style={{ position: 'absolute', top: '15%', left: '5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,0,0.15), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '30%', right: '10%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,27,0.12), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* O NOVO LAYOUT HARMONIOSO: MAPA À ESQUERDA, INFO À DIREITA */}
              <OrganicMap
                themeColors={colors}
                selectedCategory={selectedMapCategory}
                onSelectCategory={setSelectedMapCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
              />
            </div>
          </section>

          {/* Ticker de Atividade ao Vivo */}
          <LiveActivityTicker theme={theme} />

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── SEUS PROFISSIONAIS FAVORITOS ────────────────────────────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section style={{ padding: '40px 32px 0', maxWidth: 'none', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>profissionais salvos</div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                  Seus Favoritos de Confiança
                </h2>
              </div>
              <Link href="/client/workers" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FF7A00', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Explorar todos os profissionais <Icon name="arrowRight" size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {favorites.map(w => (
                <motion.div
                  key={w.id}
                  whileHover={{ y: -4 }}
                  style={{
                    background: theme.cardBg,
                    border: `1.5px solid ${theme.cardBorder}`,
                    borderRadius: 18,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF7A00', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {w.role}
                      </span>
                      <button
                        onClick={() => toggleFavorite(w.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#FF3B5C' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <img src={w.photo} alt={w.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FF7A00' }} />
                      <div>
                        <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: theme.text }}>{w.name} {w.emoji}</h4>
                        <p style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: 2 }}>{w.specialty}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: theme.textMuted, paddingTop: 10, borderTop: `1px solid ${theme.line}` }}>
                      <span>⭐ {w.avg_rating} ({w.completed_jobs} serviços)</span>
                      <span>📍 {w.distance_km} km</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => router.push(`/client/workers/${w.profileId}`)}
                      style={{
                        flex: 1,
                        border: 'none',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #FF7A00, #FF9A33)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        padding: '9px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      Ver perfil para agendar
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/client/workers/${w.profileId}`)}
                      style={{
                        flex: 1,
                        border: `1.5px solid ${theme.cardBorder}`,
                        borderRadius: 10,
                        background: theme.inputBg,
                        color: theme.text,
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        padding: '9px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      Ver perfil
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── PANORAMA DO CLIENTE (FOLHAS, GASTOS & RECOMPENSAS) ──────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section style={{ padding: '64px 32px', maxWidth: 'none', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>seu panorama</div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
                  Resumo da sua conta
                </h2>
              </div>
              <Link href="/client/profile" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FF7A00', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Ver perfil completo <Icon name="arrowRight" size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 28 }}>

              {/* Saldo de Folhas */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 20,
                  padding: 24,
                  background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #22D31B 100%)',
                  color: '#fff',
                  boxShadow: '0 12px 30px rgba(34,211,27,0.22)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="leaf" size={18} color="#fff" />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>Saldo de Folhas</p>
                </div>
                <p style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '2.2rem', lineHeight: 1 }}>
                  {panoramaLoading ? '···' : <AnimatedCounter target={folhasBalance} />} <span style={{ fontSize: '1.1rem', opacity: 0.9 }}>🍃</span>
                </p>
                <p style={{ fontSize: '0.78rem', opacity: 0.95, marginTop: 8 }}>
                  ≈ {formatCurrency(folhasDesconto)} garantidos em cupons de desconto
                </p>
              </motion.div>

              {/* Total Investido */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.cardBorder}`,
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,122,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trendingUp" size={18} color="#FF7A00" />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.text }}>Total investido</p>
                </div>
                <p style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '2.2rem', color: theme.text, lineHeight: 1 }}>
                  {panoramaLoading ? '···' : formatCurrency(totalGasto)}
                </p>
                <p style={{ fontSize: '0.78rem', color: theme.textMuted, marginTop: 8 }}>
                  em {recentOrders.filter(o => o.status === 'completed').length} serviço{recentOrders.filter(o => o.status === 'completed').length !== 1 ? 's' : ''} concluído{recentOrders.filter(o => o.status === 'completed').length !== 1 ? 's' : ''}
                </p>
              </motion.div>

              {/* Últimos Serviços */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.cardBorder}`,
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,211,27,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="checkCircle" size={18} color="#22D31B" />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.text }}>Últimos pedidos</p>
                </div>
                {lastServices.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>Você ainda não possui pedidos recentes.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                    {lastServices.map(o => (
                      <div
                        key={o.id}
                        style={{
                          background: theme.cardBg,
                          border: `1.5px solid ${theme.cardBorder}`,
                          borderRadius: 16,
                          padding: '14px 12px',
                          minHeight: 120,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(255,122,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="checkCircle" size={15} color="#FF7A00" />
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#22D31B' }}>{formatCurrency(o.price)}</span>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 800, color: theme.text, lineHeight: 1.3, marginBottom: 6 }}>{o.service_title}</p>
                          <p style={{ fontSize: '0.66rem', color: theme.textMuted, margin: 0 }}>{new Date(o.created_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Nível da Comunidade */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }}
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.cardBorder}`,
                  borderRadius: 20,
                  padding: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    position: 'relative', width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                    background: `conic-gradient(#FF7A00 ${Math.min(100, folhasBalance % 100)}%, ${theme.line} 0)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: theme.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.1rem', color: theme.text, lineHeight: 1 }}>
                      {Math.floor(folhasBalance / 100) + 1}
                    </span>
                    <span style={{ fontSize: '0.52rem', color: theme.textMuted, fontWeight: 800, textTransform: 'uppercase' }}>nível</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.text }}>Formiga VIP 🐜</p>
                  <p style={{ fontSize: '0.74rem', color: theme.textMuted, marginTop: 2 }}>
                    Faltam {100 - (folhasBalance % 100)} folhas para o nível {Math.floor(folhasBalance / 100) + 2}
                  </p>
                </div>
              </motion.div>

            </div>

            {/* BÔNUS DIÁRIO INTERATIVO */}
            <DailyFolhasBonusCard
              themeColors={colors}
              onCollectBonus={handleAddDailyBonus}
            />
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── CATEGORIAS DE SERVIÇOS ──────────────────────────────────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section id="servicos" style={{ background: theme.bgAlt, padding: '80px 32px', transition: 'background 0.4s' }}>
            <div style={{ maxWidth: 'none', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 44 }}>
                <div className="eyebrow" style={{ justifyContent: 'center' }}>todas as categorias</div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  O que você precisa resolver hoje?
                </h2>
                <p style={{ color: theme.textMuted, fontSize: '0.95rem' }}>Profissionais verificados e com garantia em todas as áreas.</p>
              </div>

              <div className="client-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {CATEGORIES.map((c, i) => (
                  <motion.div key={c.name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                    <Link href={`/client/services?category=${c.name.toLowerCase()}`} className="cat-card-item">
                      <img src={c.img} alt={c.name} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.text }}>{c.name}</span>
                      <span style={{ fontSize: '0.72rem', color: theme.textMuted, lineHeight: 1.4 }}>{c.description}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── COMO FUNCIONA ───────────────────────────────────────────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section style={{ padding: '88px 32px', maxWidth: 'none', margin: '0 auto', textAlign: 'center' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>fluxo simples</div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.02em', marginBottom: 50 }}>
              Do pedido ao serviço pronto em 3 passos
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              {HOW_STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  viewport={{ once: true }}
                  style={{
                    background: theme.cardBg,
                    border: `1.5px solid ${theme.cardBorder}`,
                    borderRadius: 20,
                    padding: '30px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: i % 2 === 0 ? 'rgba(255,122,0,0.12)' : 'rgba(34,211,27,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon name={s.icon} size={28} color={i % 2 === 0 ? '#FF7A00' : '#22D31B'} />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', fontWeight: 800, color: i % 2 === 0 ? '#FF7A00' : '#22D31B', marginBottom: 8 }}>{s.n}</span>
                  <h3 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.15rem', color: theme.text, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: theme.textMuted, lineHeight: 1.6 }}>{s.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── CENTRAL DE VANTAGENS, SUPORTE 24H & INDIQUE UM AMIGO ───── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section style={{ padding: '72px 32px', maxWidth: 'none', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 28,
                background: 'linear-gradient(135deg, #FF7A00 0%, #FF9A33 60%, #22D31B 100%)',
                color: '#fff',
                padding: '48px 36px',
                boxShadow: '0 20px 50px rgba(255,122,0,0.3)',
              }}
            >
              <div style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.15, pointerEvents: 'none' }}>
                <img src="/img/logo.png" alt="" style={{ width: 260, height: 260, filter: 'brightness(0) invert(1)' }} />
              </div>

              <div style={{ position: 'relative', zIndex: 2, maxWidth: 680 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.25)', padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                  <span>🍃</span> CLUBE DE VANTAGENS MOVIPAY
                </div>

                <h2 style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: 1.1, marginBottom: 12 }}>
                  Indique amigos e ganhe 50 Folhas de bônus por indicação!
                </h2>

                <p style={{ fontSize: '0.98rem', opacity: 0.95, lineHeight: 1.6, marginBottom: 28 }}>
                  Compartilhe seu link exclusivo. Assim que seu amigo concluir o primeiro serviço, ambos ganham 50 Folhas direto na carteira para usar como desconto real.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {/* Botão Copiar Link */}
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    style={{
                      background: '#fff',
                      color: '#FF7A00',
                      fontWeight: 800,
                      borderRadius: 12,
                      padding: '14px 26px',
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    {referralCopied ? (
                      <>
                        <Icon name="checkCircle" size={18} color="#22D31B" />
                        <span>Link Copiado com Sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Icon name="sparkle" size={18} color="#FF7A00" />
                        <span>Copiar Meu Link de Indicação</span>
                      </>
                    )}
                  </button>

                  {/* Botão Compartilhar WhatsApp */}
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    style={{
                      background: '#25D366',
                      color: '#fff',
                      fontWeight: 800,
                      borderRadius: 12,
                      padding: '14px 24px',
                      fontSize: '0.92rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
                    }}
                  >
                    <span>💬 Compartilhar no WhatsApp</span>
                  </button>

                  {/* Botão Suporte / Ajuda 24h */}
                  <Link
                    href="/client/chat"
                    style={{
                      background: 'rgba(0,0,0,0.22)',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 12,
                      padding: '14px 22px',
                      fontSize: '0.92rem',
                      border: '1.5px solid rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Icon name="phone" size={16} color="#fff" />
                    <span>Suporte 24h & Ajuda</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── FOOTER COM O CAMINHÃOZINHO COLETOR DE FOLHAS ────────────── */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <footer
            style={{
              position: 'relative',
              background: '#FFFFFF',
              borderTop: `1.5px solid ${theme.line}`,
              padding: '52px 32px 56px',
              transition: 'background 0.4s',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            {/* O CAMINHÃOZINHO 60FPS QUE ASPIRA AS FOLHAS DO FOOTER */}
            <FooterLeafPile />

            <div style={{ position: 'relative', zIndex: 10, maxWidth: 'none', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/img/logo.png" alt="MoviPay" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span style={{ color: '#FF7A00' }}>Movi</span><span style={{ color: '#22D31B' }}>Pay</span>
                </span>
              </div>

              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.74rem', color: theme.textMuted }}>
                © 2026 MoviPay — TCC ETEC Maria Cristina Medeiros · Área do Cliente
              </p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <Link href="/client/profile" style={{ fontSize: '0.82rem', color: theme.textMuted, textDecoration: 'none', fontWeight: 700 }}>
                  Meu Perfil
                </Link>
                <Link href="/client/orders" style={{ fontSize: '0.82rem', color: theme.textMuted, textDecoration: 'none', fontWeight: 700 }}>
                  Meus Pedidos
                </Link>
                <Link href="/client/quotes" style={{ fontSize: '0.82rem', color: theme.textMuted, textDecoration: 'none', fontWeight: 700 }}>
                  Orçamentos
                </Link>
                <Link href="/client/services" style={{ fontSize: '0.82rem', color: theme.textMuted, textDecoration: 'none', fontWeight: 700 }}>
                  Buscar Serviços
                </Link>
                <Link href="/client/chat" style={{ fontSize: '0.82rem', color: theme.textMuted, textDecoration: 'none', fontWeight: 700 }}>
                  Suporte
                </Link>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </LeafProvider>
  );
}
