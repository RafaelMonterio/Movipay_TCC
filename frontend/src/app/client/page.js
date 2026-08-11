  'use client';
  import { useEffect, useRef, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import Link from 'next/link';
  import { motion, useScroll, useInView, AnimatePresence } from 'framer-motion';
  import { useAuth } from '@/context/AuthContext';
  import Sidebar from '@/components/layout/Sidebar';

  /* ─── SVG ICONS ─────────────────────────────────────────────────────── */
  function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 1.8, style }) {
    const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style };
    switch (name) {
      case 'search': return <svg {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
      case 'star': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" style={style}><polygon points="12 2 15.09 8.63 22 9.24 16.5 14.14 18.18 21 12 17.27 5.82 21 7.5 14.14 2 9.24 8.91 8.63 12 2" /></svg>;
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
      default: return null;
    }
  }

  /* ─── ANIMATED COUNTER ───────────────────────────────────────────────── */
  function AnimatedCounter({ target, suffix = '', decimal = false }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
      if (!inView) return;
      const steps = 60, duration = 1600;
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

  /* ─── FLOATING LEAF ──────────────────────────────────────────────────── */
  function FloatingLeaf({ delay, x, size, color, duration }) {
    return (
      <motion.div
        className="pointer-events-none absolute top-0"
        style={{ left: x + '%', position: 'absolute', top: 0, zIndex: 1 }}
        initial={{ y: -40, opacity: 0, rotate: 0 }}
        animate={{ y: '110vh', opacity: [0, 0.85, 0.85, 0], rotate: [0, 160, 320, 480] }}
        transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      >
        <span aria-hidden="true" style={{ fontSize: size, color }}>{'🍃'}</span>
      </motion.div>
    );
  }

  /* ─── RADAR CANVAS — o coração visual da landing ─────────────────────── */
  function RadarCanvas({ darkMode }) {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = 560, H = 560;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const cx = W / 2, cy = H / 2;

      const ORANGE = '#FF7A00';
      const GREEN = '#22D31B';
      const BG = darkMode ? '#121A0F' : '#FAF6EC';
      const RING = darkMode ? 'rgba(255,122,0,0.15)' : 'rgba(255,122,0,0.12)';
      const RING_STROKE = darkMode ? 'rgba(255,122,0,0.25)' : 'rgba(255,122,0,0.2)';
      const TEXT_COL = darkMode ? 'rgba(243,239,226,0.5)' : 'rgba(23,36,26,0.4)';

      /* dots representing workers/services in the radar */
      const dots = [
        { r: 95,  angle: 0.4,  label: 'Limpeza',    icon: '🧹', color: ORANGE,  size: 7,  pulse: true  },
        { r: 140, angle: 1.9,  label: 'Elétrica',   icon: '⚡',  color: GREEN,  size: 6,  pulse: false },
        { r: 78,  angle: 3.3,  label: 'Jardim',     icon: '🌿',  color: ORANGE, size: 5,  pulse: false },
        { r: 170, angle: 4.7,  label: 'Mudança',    icon: '📦',  color: GREEN,  size: 8,  pulse: true  },
        { r: 120, angle: 5.8,  label: 'Motoboy',    icon: '🏍',  color: ORANGE, size: 6,  pulse: false },
        { r: 55,  angle: 2.5,  label: 'Manicure',   icon: '✨',  color: GREEN,  size: 5,  pulse: false },
        { r: 195, angle: 0.9,  label: 'Pedreiro',   icon: '🔨',  color: ORANGE, size: 7,  pulse: true  },
        { r: 160, angle: 3.9,  label: 'Cabelo',     icon: '✂️', color: GREEN,  size: 5,  pulse: false },
      ].map(d => ({ ...d, x: cx + Math.cos(d.angle) * d.r, y: cy + Math.sin(d.angle) * d.r, baseAngle: d.angle, baseR: d.r, pulsePhase: Math.random() * Math.PI * 2 }));

      /* sweep angle */
      let sweep = 0;
      /* trail — last 180° of sweep */
      const TRAIL_STEPS = 80;
      const trailFade = (i) => i / TRAIL_STEPS;

      /* "pings" that appear when sweep crosses a dot */
      const pings = [];

      let frame = 0;
      let animId;

      function drawRings() {
        [220, 170, 120, 70].forEach((r, i) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = RING_STROKE;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          /* distance label */
          ctx.fillStyle = TEXT_COL;
          ctx.font = '500 10px "IBM Plex Mono", monospace';
          ctx.fillText(`${(i === 3 ? 0.3 : i === 2 ? 0.6 : i === 1 ? 1.0 : 1.5).toFixed(1)}km`, cx + r + 4, cy - 4);
        });
        /* crosshairs */
        [0, Math.PI / 2].forEach(a => {
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 220, cy + Math.sin(a) * 220);
          ctx.lineTo(cx - Math.cos(a) * 220, cy - Math.sin(a) * 220);
          ctx.strokeStyle = RING_STROKE;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      }

      function drawSweepTrail() {
        for (let i = 0; i < TRAIL_STEPS; i++) {
          const a = sweep - (i / TRAIL_STEPS) * (Math.PI * 0.7);
          const alpha = (1 - i / TRAIL_STEPS) * 0.25;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 220, a, a + (Math.PI * 0.7) / TRAIL_STEPS);
          ctx.closePath();
          ctx.fillStyle = darkMode ? `rgba(255,122,0,${alpha * 0.7})` : `rgba(255,122,0,${alpha * 0.5})`;
          ctx.fill();
        }
        /* sweep line */
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweep) * 222, cy + Math.sin(sweep) * 222);
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        /* tip glow */
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sweep) * 222, cy + Math.sin(sweep) * 222, 3, 0, Math.PI * 2);
        ctx.fillStyle = ORANGE;
        ctx.fill();
      }

      function drawDots() {
        dots.forEach(d => {
          /* tiny orbital drift */
          const drift = Math.sin(frame * 0.008 + d.pulsePhase) * 3;
          const dx = d.x + Math.cos(d.baseAngle + Math.PI / 2) * drift;
          const dy = d.y + Math.sin(d.baseAngle + Math.PI / 2) * drift;

          /* glow ring if pulse */
          if (d.pulse) {
            const pulseScale = 1 + 0.5 * Math.abs(Math.sin(frame * 0.04 + d.pulsePhase));
            ctx.beginPath();
            ctx.arc(dx, dy, d.size * pulseScale + 4, 0, Math.PI * 2);
            ctx.strokeStyle = d.color + '44';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          /* dot */
          ctx.beginPath();
          ctx.arc(dx, dy, d.size, 0, Math.PI * 2);
          ctx.fillStyle = d.color;
          ctx.fill();
          ctx.strokeStyle = darkMode ? '#121A0F' : '#FAF6EC';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      function drawPings() {
        for (let i = pings.length - 1; i >= 0; i--) {
          const p = pings[i];
          p.life--;
          p.r += 1.4;
          const alpha = p.life / p.maxLife;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34,211,27,${alpha * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          if (p.life <= 0) pings.splice(i, 1);
        }
      }

      function drawCenter() {
        /* center circle */
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fillStyle = darkMode ? '#1A2417' : '#fff';
        ctx.fill();
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = 2;
        ctx.stroke();
        /* "NEST" label inside */
        ctx.fillStyle = ORANGE;
        ctx.font = '700 8px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', cx, cy + 3);
        ctx.textAlign = 'left';
      }

      function loop() {
        frame++;
        ctx.clearRect(0, 0, W, H);

        /* subtle bg fill */
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, H);

        drawRings();
        drawSweepTrail();

        /* check if sweep crosses any dot → spawn ping */
        dots.forEach(d => {
          const da = ((sweep - d.baseAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          if (da < 0.06) {
            pings.push({ x: d.x, y: d.y, r: d.size, life: 48, maxLife: 48 });
          }
        });

        drawPings();
        drawDots();
        drawCenter();

        sweep += 0.018;
        if (sweep > Math.PI * 2) sweep -= Math.PI * 2;

        animId = requestAnimationFrame(loop);
      }
      loop();

      const resize = () => {
        const cw = Math.min(canvas.parentElement?.clientWidth || W, W);
        canvas.style.width = cw + 'px';
        canvas.style.height = cw + 'px';
      };
      window.addEventListener('resize', resize); resize();

      return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, [darkMode]);

    return (
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '50%', maxWidth: 560 }}
      />
    );
  }

  /* ─── PARTICLE FIELD — fundo do hero ──────────────────────────────────── */
  function ParticleField({ darkMode }) {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = canvas.parentElement?.clientWidth || 1200;
      const H = 520;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      const PARTICLE_COLOR = darkMode ? 'rgba(255,122,0,' : 'rgba(255,122,0,';
      const LINE_COLOR = darkMode ? 'rgba(34,211,27,' : 'rgba(34,211,27,';

      const pts = Array.from({ length: 42 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.5 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.5,
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
          ctx.fillStyle = PARTICLE_COLOR + p.alpha + ')';
          ctx.fill();
        });
        pts.forEach((a, i) => {
          pts.slice(i + 1).forEach(b => {
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = LINE_COLOR + (0.12 * (1 - dist / 110)) + ')';
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          });
        });
        animId = requestAnimationFrame(loop);
      }
      loop();
      return () => cancelAnimationFrame(animId);
    }, [darkMode]);

    return (
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
    );
  }

  /* ─── FLOATING SERVICE CARD ───────────────────────────────────────────── */
  function FloatingCard({ icon, label, rating, dist, delay, x, y, theme }) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{ delay, duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', type: 'spring', stiffness: 120 }}
        style={{
          position: 'absolute', left: x, top: y,
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: `0 8px 32px rgba(0,0,0,0.10)`,
          minWidth: 160, zIndex: 3,
          backdropFilter: 'blur(6px)',
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FF7A0018', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={17} color="#FF7A00" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.82rem', color: theme.text }}>{label}</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="star" size={10} color="#FF7A00" />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: theme.textMuted }}>{rating} · {dist}</span>
          </div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22D31B', marginLeft: 'auto', flexShrink: 0 }} />
      </motion.div>
    );
  }

  /* ─── ACCESSIBILITY MENU ─────────────────────────────────────────────── */
  function AccessibilityButton({ isOpen, onClick, theme }) {
    return (
      <motion.div
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, cursor: 'pointer', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: theme.cardBg, border: `1.5px solid ${theme.cardBorder}`, backdropFilter: 'blur(8px)' }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onClick} role="button" aria-label="Acessibilidade"
      >
        <motion.img src="/img/logo.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} animate={isOpen ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 0.35 }} draggable={false} />
      </motion.div>
    );
  }

  function AccessibilityMenu({ isOpen, onClose, darkMode, setDarkMode, theme }) {
    const [hc, setHc] = useState(false);
    const [fs, setFs] = useState(100);
    const [proto, setProto] = useState(false);
    const [deut, setDeut] = useState(false);
    const [trit, setTrit] = useState(false);

    useEffect(() => {
      if (typeof document === 'undefined') return;
      const html = document.documentElement;
      html.dataset.darkMode = String(darkMode);
      html.dataset.highContrast = String(hc);
      html.dataset.daltonism = proto ? 'protanopia' : deut ? 'deuteranopia' : trit ? 'tritanopia' : 'none';

      let filters = [];
      if (hc) filters.push('contrast(1.8)');
      if (proto) filters.push('url(#protanopia)');
      else if (deut) filters.push('url(#deuteranopia)');
      else if (trit) filters.push('url(#tritanopia)');
      html.style.filter = filters.join(' ');
      html.style.fontSize = fs !== 100 ? fs + '%' : '';
      return () => { html.style.filter = ''; html.style.fontSize = ''; };
    }, [hc, proto, deut, trit, fs, darkMode]);

    useEffect(() => {
      if (typeof document === 'undefined') return;
      let svg = document.getElementById('cb-filters-lp');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'cb-filters-lp';
        svg.style.cssText = 'position:absolute;width:0;height:0;';
        svg.innerHTML = `<filter id="protanopia"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/></filter><filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/></filter><filter id="tritanopia"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/></filter>`;
        document.body.prepend(svg);
      }
    }, []);

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', zIndex: 150 }} onClick={onClose} />
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ position: 'fixed', top: 78, right: 20, width: 290, background: theme.cardBg, borderRadius: 12, border: `1px solid ${theme.cardBorder}`, padding: 20, zIndex: 160, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.mono }}>Acessibilidade</span>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textMuted }}><Icon name="x" size={15} color={theme.textMuted} /></button>
              </div>
              {[
                { label: `Modo ${darkMode ? 'Claro' : 'Escuro'}`, active: darkMode, toggle: () => setDarkMode(d => !d) },
                { label: 'Alto Contraste', active: hc, toggle: () => setHc(v => !v) },
                { label: 'Protanopia', active: proto, toggle: () => { setProto(v => !v); setDeut(false); setTrit(false); } },
                { label: 'Deuteranopia', active: deut, toggle: () => { setDeut(v => !v); setProto(false); setTrit(false); } },
                { label: 'Tritanopia', active: trit, toggle: () => { setTrit(v => !v); setProto(false); setDeut(false); } },
              ].map((item, i) => (
                <div key={i} onClick={item.toggle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: item.active ? '#FF7A0014' : 'transparent', border: `1px solid ${item.active ? '#FF7A0044' : 'transparent'}` }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: item.active ? 700 : 500, color: theme.text }}>{item.label}</span>
                  {item.active && <Icon name="checkCircle" size={14} color="#FF7A00" />}
                </div>
              ))}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.line}` }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: theme.textMuted, marginBottom: 8, fontWeight: 600 }}>TAMANHO DA FONTE</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[{ v: 80, l: 'A', s: 11 }, { v: 100, l: 'A', s: 13 }, { v: 120, l: 'A', s: 16 }, { v: 140, l: 'A', s: 19 }].map(o => (
                    <button key={o.v} onClick={() => setFs(o.v)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: `1px solid ${fs === o.v ? '#FF7A00' : theme.line}`, background: fs === o.v ? '#FF7A0014' : 'transparent', color: fs === o.v ? '#FF7A00' : theme.text, fontSize: o.s, fontWeight: fs === o.v ? 800 : 600, cursor: 'pointer' }}>{o.l}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => { setHc(false); setProto(false); setDeut(false); setTrit(false); setFs(100); if (darkMode) setDarkMode(false); }} style={{ marginTop: 12, width: '100%', padding: '8px', borderRadius: 8, border: `1px solid ${theme.line}`, background: 'transparent', color: theme.textMuted, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                Restaurar padrões
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  /* ─── DATA ───────────────────────────────────────────────────────────── */
  const CATEGORIES = [
    { icon: 'broom',      name: 'Limpeza',       img: '/img/faxineira.jpg', description: 'Casa, escritório e espaços com cuidado.' },
    { icon: 'bolt',       name: 'Elétrica',      img: '/img/eletricista.jpg', description: 'Instalações e pequenos reparos em minutos.' },
    { icon: 'leaf',       name: 'Jardinagem',    img: '/img/jardineiro.jpg', description: 'Manutenção de jardins e áreas verdes.' },
    { icon: 'box',        name: 'Mudança',       img: '/img/mudanca.jpg', description: 'Montagem e transporte com planejamento.' },
    { icon: 'scissors',   name: 'Cabeleireiro',  img: '/img/cabeleireiro.jpg', description: 'Cortes, hidratação e estética pessoal.' },
    { icon: 'hammer',     name: 'Pedreiro',      img: '/img/pedreiro.jpg', description: 'Reformas, reparos e acabamento local.' },
    { icon: 'paint',      name: 'Pintor',        img: '/img/pintor.jpg', description: 'Pintura de ambientes e retoques rápidos.' },
    { icon: 'motorcycle', name: 'Motoboy',       img: '/img/motoboy.jpg', description: 'Entregas locais com rapidez e confiança.' },
    { icon: 'sparkle',    name: 'Manicure',      img: '/img/manicure.jpg', description: 'Cuidados com unhas e beleza pessoal.' },
  ];

  const TESTIMONIALS = [
    { name: 'Ana Paula', role: 'Cliente · São Paulo', avatar: 'A', rating: 5, text: 'Encontrei um eletricista em 5 minutos. Serviço impecável e ainda ganhei pontos!' },
    { name: 'Bruno Silva', role: 'Trabalhador · ABC', avatar: 'B', rating: 5, text: 'Minha agenda encheu em uma semana. A plataforma é simples e os pagamentos são rápidos.' },
    { name: 'Carla Souza', role: 'Cliente · Guarulhos', avatar: 'C', rating: 5, text: 'Já usei três vezes. Todo profissional foi pontual e competente. Recomendo demais!' },
  ];

  const HOW_STEPS = [
    { n: '01', icon: 'search',    title: 'Descreva o que precisa',       body: 'Digite o serviço e o radar localiza profissionais disponíveis perto de você em tempo real.' },
    { n: '02', icon: 'users',     title: 'Escolha o profissional certo', body: 'Compare avaliações, preços e tempo de resposta. Confirmação em segundos, sem burocracia.' },
    { n: '03', icon: 'star',      title: 'Avalie e ganhe pontos',        body: 'Após o serviço, sua nota ajuda a comunidade. Cada avaliação rende pontos para a próxima contratação.' },
  ];

  const BENEFITS = [
    { icon: 'shield',     title: 'Verificado e avaliado',   body: 'Cada profissional passa por verificação e é avaliado por clientes reais após cada serviço.', accent: '#FF7A00' },
    { icon: 'clock',      title: 'Resposta em até 15 min',  body: 'Sistema de notificação em tempo real. O profissional mais próximo recebe seu pedido primeiro.', accent: '#22D31B' },
    { icon: 'trendingUp', title: 'Preço transparente',      body: 'Orçamento fechado antes de confirmar. Sem surpresa no final, sem cobranças extras.', accent: '#FF7A00' },
    { icon: 'mapPin',     title: 'Sempre perto de você',    body: 'O radar prioriza profissionais no seu bairro. Quanto mais perto, menor o deslocamento e o custo.', accent: '#22D31B' },
  ];

  /* ─── MAIN ───────────────────────────────────────────────────────────── */
  export default function LandingPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const { scrollY, scrollYProgress } = useScroll();
    const [navSolid, setNavSolid] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [accessibilityOpen, setAccessibilityOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { if (!loading && user) router.push(user.mode === 'worker' ? '/worker' : '/client'); }, [user, loading]);
    useEffect(() => { const u = scrollY.on('change', v => setNavSolid(v > 40)); return u; }, [scrollY]);
    useEffect(() => {
      if (typeof window === 'undefined') return;
      const saved = window.localStorage.getItem('movipay-theme');
      if (saved === 'dark') setDarkMode(true);
    }, []);

    function toggleTheme() {
      setDarkMode(prev => {
        const next = !prev;
        if (typeof window !== 'undefined') window.localStorage.setItem('movipay-theme', next ? 'dark' : 'light');
        return next;
      });
    }

    function getInitials(name = '') {
      if (!name) return 'MP';
      return name.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    }

    const theme = darkMode ? {
      bg: '#121A0F', bgAlt: '#0D130B', bgAlt2: '#0F1A0C',
      text: '#F3EFE2', textMuted: '#8AA085',
      cardBg: 'rgba(26,36,23,0.85)', cardBorder: 'rgba(243,239,226,0.09)',
      navBg: 'rgba(18,26,15,0.94)', navBorder: 'rgba(243,239,226,0.07)',
      line: 'rgba(243,239,226,0.13)', mono: '#FFB627',
      orange: '#FF7A00', green: '#22D31B', inputBg: '#1A2417',
    } : {
      bg: '#FAF6EC', bgAlt: '#F1EAD9', bgAlt2: '#F5F1E5',
      text: '#17241A', textMuted: '#5B6B57',
      cardBg: 'rgba(255,255,255,0.90)', cardBorder: 'rgba(23,36,26,0.09)',
      navBg: 'rgba(250,246,236,0.92)', navBorder: 'rgba(23,36,26,0.07)',
      line: 'rgba(23,36,26,0.13)', mono: '#8A4A00',
      orange: '#FF7A00', green: '#22D31B', inputBg: '#FFFFFF',
    };

    if (loading) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
        <motion.img src="/img/logo.png" alt="MoviPay" style={{ width: 64, height: 64, borderRadius: '50%' }} animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
      </div>
    );

    const leaves = Array.from({ length: 18 }, (_, i) => ({
      delay: i * 0.9,
      x: (i * 6.1) % 100,
      size: 14 + (i % 4) * 4,
      color: i % 2 === 0 ? '#22D31B' : '#FF9A33',
      duration: 7 + (i % 5)
    }));

    function handleSearch(e) {
      e.preventDefault();
      router.push(searchQuery.trim() ? `/register?q=${encodeURIComponent(searchQuery.trim())}` : '/register');
    }

    return (
      <div style={{ minHeight: '100vh', overflowX: 'hidden', background: theme.bg, color: theme.text, fontFamily: 'var(--body)', transition: 'background 0.4s, color 0.4s' }}>
        <Sidebar />

        {leaves.map((l, i) => <FloatingLeaf key={i} delay={l.delay} x={l.x} size={l.size} color={l.color} duration={l.duration} />)}

        {/* ── GLOBAL STYLES ─────────────────────────────────────────── */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;0,900;1,500;1,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
          :root { --display: 'Fraunces', serif; --body: 'Inter', sans-serif; --mono: 'IBM Plex Mono', monospace; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }

          .btn-primary {
            position: relative; overflow: hidden;
            background: #FF7A00; color: #fff; font-weight: 700;
            border-radius: 6px; padding: 14px 28px; font-size: 0.92rem;
            border: none; cursor: pointer; display: inline-flex; align-items: center;
            gap: 8px; text-decoration: none; font-family: var(--body);
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 20px rgba(255,122,0,0.32);
          }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,122,0,0.44); }
          .btn-primary .arrow-icon { transition: transform 0.22s; }
          .btn-primary:hover .arrow-icon { transform: translateX(5px); }

          .btn-ghost {
            background: transparent; border: 1.5px solid ${theme.line};
            color: ${theme.text}; font-weight: 700; border-radius: 6px;
            padding: 13px 26px; font-size: 0.92rem; cursor: pointer;
            display: inline-block; text-decoration: none; font-family: var(--body);
            transition: border-color 0.2s, color 0.2s;
          }
          .btn-ghost:hover { border-color: #FF7A00; color: #FF7A00; }

          .eyebrow {
            font-family: var(--mono); font-size: 0.7rem; font-weight: 600;
            letter-spacing: 0.14em; text-transform: uppercase; color: ${theme.mono};
            display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px;
          }
          .eyebrow::before { content: ''; width: 20px; height: 1.5px; background: ${theme.orange}; display: inline-block; }

          .nav-link { color: ${theme.textMuted}; font-weight: 600; font-size: 0.86rem; text-decoration: none; padding: 8px 14px; transition: color 0.2s; border-radius: 4px; }
          .nav-link:hover { color: #FF7A00; }

          .section-divider {
            display: flex; align-items: center; gap: 14px;
            margin: 0 auto 48px; max-width: 320px; text-align: center;
          }
          .section-divider::before, .section-divider::after {
            content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, ${theme.line}, transparent);
          }

          .cat-pill {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
            padding: 24px 14px; border-radius: 16px;
            border: 1px solid ${theme.cardBorder}; background: ${theme.cardBg};
            cursor: pointer; text-decoration: none; transition: all 0.22s;
            color: ${theme.textMuted}; font-size: 0.82rem; font-weight: 800;
            min-height: 160px;
          }
          .cat-pill:hover {
            border-color: rgba(255,122,0,0.4); color: #FF7A00;
            transform: translateY(-4px) scale(1.03); box-shadow: 0 12px 36px rgba(255,122,0,0.12);
          }
          .cat-pill img { width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 2px solid transparent; transition: border-color 0.2s; }
          .cat-pill:hover img { border-color: rgba(255,122,0,0.45); }

          .cat-pill-title { font-size: 0.82rem; font-weight: 800; color: ${theme.text}; }
          .cat-pill-subtitle { font-size: 0.68rem; color: ${theme.textMuted}; margin-top: 2px; line-height: 1.5; }

          .benefit-card {
            background: ${theme.cardBg}; border: 1px solid ${theme.cardBorder};
            border-radius: 12px; padding: 26px;
            transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          }
          .benefit-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.07); border-color: rgba(255,122,0,0.28); }

          .testimonial-card {
            background: ${theme.cardBg}; border: 1px solid ${theme.cardBorder};
            border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 16px;
            transition: transform 0.22s, box-shadow 0.22s;
          }
          .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(0,0,0,0.08); }

          .search-wrap {
            display: flex; align-items: center; gap: 8px;
            background: ${theme.inputBg}; border: 1.5px solid ${theme.line};
            border-radius: 8px; padding: 4px 6px 4px 16px; max-width: 480px;
            transition: border-color 0.2s;
          }
          .search-wrap:focus-within { border-color: #FF7A00; }
          .search-input { flex: 1; background: transparent; border: none; outline: none; font-size: 0.94rem; color: ${theme.text}; font-family: var(--body); padding: 12px 4px; }
          .search-input::placeholder { color: ${theme.textMuted}; }

          @media (max-width: 900px) { .hero-split { flex-direction: column !important; } .radar-col { display: none !important; } }
          @media (max-width: 768px) {
            .hero-title { font-size: 2.6rem !important; }
            .hide-mobile { display: none !important; }
            .cats-grid { grid-template-columns: repeat(4, 1fr) !important; }
            .benefits-grid { grid-template-columns: 1fr 1fr !important; }
            .how-row { flex-direction: column !important; }
            .steps-connector { display: none !important; }
            .test-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 480px) { .cats-grid { grid-template-columns: repeat(2, 1fr) !important; } .benefits-grid { grid-template-columns: 1fr !important; } }
        `}</style>

        {/* scroll progress */}
        <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, transformOrigin: '0%', zIndex: 400, background: 'linear-gradient(90deg, #FF7A00, #22D31B)', scaleX: scrollYProgress }} />

        {/* accessibility */}
        <AccessibilityButton isOpen={accessibilityOpen} onClick={() => setAccessibilityOpen(o => !o)} theme={theme} />
        <AccessibilityMenu isOpen={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />

        {/* ── NAVBAR ──────────────────────────────────────────────────── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: navSolid ? `1px solid ${theme.navBorder}` : '1px solid transparent', background: navSolid ? theme.navBg : 'transparent', transition: 'all 0.35s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="#servicos" className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.83rem' }}>Buscar serviço</Link>
              <button onClick={toggleTheme} style={{ width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }} aria-label="Alternar tema">
                <Icon name={darkMode ? 'sun' : 'moon'} size={16} color={theme.mono} />
              </button>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setProfileOpen(v => !v)} style={{ width: 38, height: 38, borderRadius: '50%', background: '#FF7A00', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 6px 14px rgba(255,122,0,0.16)' }} aria-label="Abrir perfil">
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#173C17', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.76rem', border: '2px solid #fff' }}>{getInitials(user?.name || 'Cliente')}</span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      style={{ position: 'absolute', top: 52, right: 0, width: 240, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: 14, zIndex: 220, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: `1px solid ${theme.line}` }}>
                        <span style={{ width: 38, height: 38, borderRadius: '50%', background: '#FF7A00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{getInitials(user?.name || 'Cliente')}</span>
                        <div>
                          <p style={{ fontSize: '0.84rem', fontWeight: 800, color: theme.text, lineHeight: 1.1 }}>{user?.name || 'Cliente MoviPay'}</p>
                          <p style={{ fontSize: '0.71rem', color: theme.textMuted, marginTop: 3 }}>{user?.email || 'conta@movipay.com'}</p>
                        </div>
                      </div>
                      <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Link href="/client/profile" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: theme.text, fontSize: '0.78rem', fontWeight: 700, padding: '8px 10px', borderRadius: 8, background: 'transparent' }}>Meu perfil</Link>
                        <Link href="/client/orders" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: theme.text, fontSize: '0.78rem', fontWeight: 700, padding: '8px 10px', borderRadius: 8, background: 'transparent' }}>Meus pedidos</Link>
                        <Link href="/client/services" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none', color: theme.text, fontSize: '0.78rem', fontWeight: 700, padding: '8px 10px', borderRadius: 8, background: 'transparent' }}>Buscar serviços</Link>
                        <button onClick={() => { setProfileOpen(false); logout(); }} style={{ marginTop: 5, width: '100%', padding: '9px 10px', borderRadius: 8, border: `1px solid ${theme.line}`, background: 'rgba(255,122,0,0.08)', color: '#B83A08', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem' }}>Sair da conta</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── HERO — split layout: texto esquerda, radar direita ─────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
          <ParticleField darkMode={darkMode} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '64px 24px', width: '100%' }}>
            <div className="hero-split" style={{ display: 'flex', alignItems: 'center', gap: 60 }}>

              {/* LEFT */}
              <motion.div style={{ flex: '1 1 460px' }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
                <div className="eyebrow">MoviPay · serviços locais</div>

                <h1 className="hero-title" style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '3.8rem', lineHeight: 1.04, letterSpacing: '-0.025em', marginBottom: 22 }}>
                  O profissional<br />
                  certo aparece<br />
                  <span style={{ color: '#FF7A00', fontStyle: 'italic' }}>no seu radar.</span>
                </h1>

                <p style={{ fontSize: '1.05rem', color: theme.textMuted, maxWidth: 440, marginBottom: 32, lineHeight: 1.7 }}>
                  Descreva o serviço e conectamos você ao profissional mais próximo — verificado, avaliado e disponível agora.
                </p>

                <form onSubmit={handleSearch} className="search-wrap" style={{ marginBottom: 28 }}>
                  <Icon name="search" size={16} color={theme.textMuted} />
                  <input className="search-input" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Elétrica, limpeza, pintura…" />
                  <button type="submit" className="btn-primary" style={{ padding: '11px 18px', fontSize: '0.85rem', borderRadius: 5 }}>
                    Buscar <Icon name="arrowRight" size={15} className="arrow-icon" />
                  </button>
                </form>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 44 }}>
                  {[
                    { icon: 'lock',  label: 'Pagamento seguro' },
                    { icon: 'clock', label: 'Resposta em 15min' },
                    { icon: 'star',  label: 'Nota 4.9/5' },
                  ].map((b, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: theme.textMuted, fontWeight: 600 }}>
                      <Icon name={b.icon} size={13} color="#22D31B" />{b.label}
                    </span>
                  ))}
                </div>

                {/* stats strip */}
                <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}`, paddingTop: 16, paddingBottom: 16 }}>
                  {[
                    { v: 500,  s: '+',   l: 'profissionais',     d: false },
                    { v: 2000, s: '+',   l: 'pedidos feitos',    d: false },
                    { v: 4.9,  s: '/5',  l: 'avaliação média',   d: true  },
                  ].map((s, i) => (
                    <div key={i} style={{ flex: 1, paddingRight: i < 2 ? 20 : 0, borderRight: i < 2 ? `1px solid ${theme.line}` : 'none', paddingLeft: i > 0 ? 20 : 0 }}>
                      <p style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', fontWeight: 700, color: '#FF7A00', lineHeight: 1 }}>
                        <AnimatedCounter target={s.v} suffix={s.s} decimal={s.d} />
                      </p>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: theme.textMuted, marginTop: 4 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* RIGHT — radar + floating cards */}
              <motion.div
                className="radar-col"
                style={{ flex: '0 0 560px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
              >
                <RadarCanvas darkMode={darkMode} />

                {/* floating service cards */}
                <FloatingCard icon="broom"  label="Limpeza"  rating="4.9" dist="0.3km" delay={1.2} x="-150px" y="60px"  theme={theme} />
                <FloatingCard icon="bolt"   label="Elétrica" rating="4.8" dist="0.7km" delay={1.5} x="490px"  y="100px" theme={theme} />
                <FloatingCard icon="hammer" label="Pedreiro" rating="4.7" dist="1.1km" delay={1.8} x="-140px" y="360px" theme={theme} />
              </motion.div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── SERVIÇOS — grid de categorias ────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section id="servicos" style={{ background: theme.bgAlt, padding: '80px 0', transition: 'background 0.4s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>categorias</div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '2.3rem', letterSpacing: '-0.02em', marginBottom: 10 }}>
                O que você <span style={{ color: '#FF7A00', fontStyle: 'italic' }}>precisa</span> hoje?
              </h2>
              <p style={{ color: theme.textMuted, fontSize: '0.95rem' }}>Toque em qualquer categoria e encontre quem pode ajudar agora.</p>
            </div>

            <div className="cats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(210px, 1fr))', gap: 14 }}>
              {CATEGORIES.map((c, i) => (
                <motion.div key={c.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} viewport={{ once: true }}>
                  <Link href="/register" className="cat-pill">
                    <img src={c.img} alt={c.name} />
                    <span className="cat-pill-title">{c.name}</span>
                    <span className="cat-pill-subtitle">{c.description}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── COMO FUNCIONA — timeline horizontal ──────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section id="como-funciona" style={{ background: theme.bg, padding: '88px 0', transition: 'background 0.4s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>o processo</div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '2.3rem', letterSpacing: '-0.02em' }}>
                Do pedido ao <span style={{ color: '#FF7A00', fontStyle: 'italic' }}>serviço pronto</span>
              </h2>
            </div>

            <div className="how-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
              {HOW_STEPS.map((s, i) => (
                <>
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.13 }}
                    viewport={{ once: true }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: -4 }}
                      style={{ width: 72, height: 72, borderRadius: 20, background: i % 2 === 0 ? 'rgba(255,122,0,0.1)' : 'rgba(34,211,27,0.1)', border: `2px solid ${i % 2 === 0 ? 'rgba(255,122,0,0.3)' : 'rgba(34,211,27,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}
                    >
                      <Icon name={s.icon} size={28} color={i % 2 === 0 ? '#FF7A00' : '#22D31B'} />
                    </motion.div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', fontWeight: 700, color: i % 2 === 0 ? '#FF7A00' : '#22D31B', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>{s.n}</span>
                    <h3 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10, color: theme.text }}>{s.title}</h3>
                    <p style={{ fontSize: '0.87rem', color: theme.textMuted, lineHeight: 1.68, maxWidth: 260 }}>{s.body}</p>
                  </motion.div>
                  {i < HOW_STEPS.length - 1 && (
                    <div className="steps-connector" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-start', paddingTop: 34 }}>
                      <svg width="60" height="28" viewBox="0 0 60 28">
                        <path d="M0 14 Q30 0 60 14" stroke={`${theme.orange}55`} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
                        <circle cx="60" cy="14" r="3" fill={theme.orange} opacity="0.5" />
                      </svg>
                    </div>
                  )}
                </>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 56 }}>
              <Link href="/register" className="btn-primary" style={{ fontSize: '0.95rem' }}>
                Quero começar agora <Icon name="arrowRight" size={16} className="arrow-icon" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── VANTAGENS — 2×2 grid de benefícios ──────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ background: theme.bgAlt2, padding: '84px 0', transition: 'background 0.4s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 52, alignItems: 'flex-start' }}>
              {/* left — headline */}
              <motion.div style={{ flex: '0 1 340px' }} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="eyebrow">por que aqui</div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '2.3rem', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 18 }}>
                  A plataforma que<br /><span style={{ color: '#FF7A00', fontStyle: 'italic' }}>trabalha por você</span>
                </h2>
                <p style={{ fontSize: '0.93rem', color: theme.textMuted, lineHeight: 1.7, marginBottom: 28 }}>
                  Segurança, velocidade e transparência em cada pedido. Sem surpresas, sem burocracia.
                </p>
                <Link href="/register" className="btn-primary" style={{ fontSize: '0.88rem', padding: '12px 22px' }}>
                  Criar conta grátis <Icon name="arrowRight" size={14} className="arrow-icon" />
                </Link>
              </motion.div>

              {/* right — 2×2 benefits */}
              <div className="benefits-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {BENEFITS.map((b, i) => (
                  <motion.div key={b.title} className="benefit-card" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: b.accent + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <Icon name={b.icon} size={20} color={b.accent} />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 8, color: theme.text }}>{b.title}</h3>
                    <p style={{ fontSize: '0.83rem', color: theme.textMuted, lineHeight: 1.65 }}>{b.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ── DEPOIMENTOS ──────────────────────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section id="depoimentos" style={{ background: theme.bg, padding: '84px 0', transition: 'background 0.4s' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>quem usa</div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '2.3rem', letterSpacing: '-0.02em' }}>
                A comunidade <span style={{ color: '#22D31B', fontStyle: 'italic' }}>fala</span>
              </h2>
            </div>

            <div className="test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} className="testimonial-card" initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: t.rating }).map((_, j) => <Icon key={j} name="star" size={13} color="#FF7A00" />)}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: theme.textMuted, lineHeight: 1.72, flex: 1 }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, paddingTop: 12, borderTop: `1px solid ${theme.line}` }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #FF7A00, #22D31B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: theme.text }}>{t.name}</p>
                      <p style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: 2 }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── CTA FINAL — dark/orange band ──────────────────────────────── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section style={{ background: '#FF7A00', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
          {/* subtle pattern */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ctaDots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaDots)" />
          </svg>

          <motion.div
            style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/img/logo.png" alt="" style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 0, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '2.5rem', color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 14 }}>
              Seu próximo serviço a<br />um toque de distância.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.02rem', marginBottom: 34, lineHeight: 1.65 }}>
              Grátis para buscar, contratar e avaliar. Sem mensalidade, sem letra miúda.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ background: '#fff', color: '#FF7A00', fontWeight: 800, borderRadius: 6, padding: '14px 30px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Criar conta grátis <Icon name="arrowRight" size={16} color="#FF7A00" />
              </Link>
              <Link href="/login" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, borderRadius: 6, padding: '14px 28px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              >
                Já tenho conta
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer style={{ background: theme.bgAlt, borderTop: `1px solid ${theme.line}`, padding: '28px 24px', transition: 'background 0.4s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <img src="/img/logo.png" alt="MoviPay" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '0.92rem' }}>
                <span style={{ color: '#FF7A00' }}>Movi</span><span style={{ color: '#22D31B' }}>Pay</span>
              </span>
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: theme.textMuted }}>
              © 2026 MoviPay — TCC ETEC Maria Cristina Medeiros
            </p>
            <div style={{ display: 'flex', gap: 18 }}>
              {[{ href: '/register', l: 'Cadastrar' }, { href: '/login', l: 'Entrar' }].map(x => (
                <Link key={x.href} href={x.href} style={{ fontSize: '0.8rem', color: theme.textMuted, textDecoration: 'none', fontWeight: 600 }}>{x.l}</Link>
              ))}
            </div>
          </div>
        </footer>

      </div>
    );
  }