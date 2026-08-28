'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ─── ÍCONE SVG DA FOLHA COM TRAÇO DELICADO E NATURAL ───────────────────── */
export function LeafIcon({ size = 20, color = '#22D31B', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M5 21c0-9 6-15 15-15-1 9-7 15-15 15z" />
      <path d="M5 21c3-3 6-6 9-9" />
    </svg>
  );
}

const LEAF_COLORS = ['#22D31B', '#FF9A33'];
const MAX_STOPPED_LEAVES = 250;

/**
 * FooterLeafPile
 * ──────────────
 * As folhas caem de cima em direção ao Footer e, ao chegarem nele,
 * PARAM FISICAMENTE no rodapé e NUNCA SOMEM.
 * Ficam paradas formando um monte acumulado que vai crescendo cada vez mais.
 */
export function FooterLeafPile({ initialCount = 42, activeFalling = 6 }) {
  // 1. Folhas que já pousaram e estão PARADAS no footer (NUNCA SOMEM)
  const [stoppedLeaves, setStoppedLeaves] = useState(() => {
    const initial = [];
    for (let i = 0; i < initialCount; i++) {
      const x = (i / initialCount) * 96 + (Math.sin(i * 1.9) * 2 + 1);
      const size = 14 + (i % 4) * 4;
      const color = LEAF_COLORS[i % 2];
      const layer = Math.floor(i / 8);
      const bottom = Math.max(-2, layer * 5.2 + Math.sin(i * 2.7) * 3 - 2);
      const rotate = -35 + ((i * 43) % 70);

      initial.push({
        id: `init-stopped-${i}`,
        x: Math.max(1, Math.min(97, x)),
        bottom,
        size,
        color,
        rotate,
      });
    }
    return initial;
  });

  const nextId = useRef(initialCount + 100);
  const heightMapRef = useRef(new Array(40).fill(0));

  useEffect(() => {
    heightMapRef.current.fill(0);
    stoppedLeaves.forEach((l) => {
      const bucket = Math.floor((l.x / 100) * 40);
      if (bucket >= 0 && bucket < 40) {
        heightMapRef.current[bucket] = Math.max(heightMapRef.current[bucket], l.bottom + 6);
      }
    });
  }, []);

  // 2. Folhas que estão caindo em direção ao footer para parar nele
  const [incomingLeaves, setIncomingLeaves] = useState(() => {
    return Array.from({ length: activeFalling }, (_, i) => {
      const x = (Math.random() * 94) + 3;
      const size = 14 + Math.floor(Math.random() * 4) * 4;
      const color = LEAF_COLORS[i % 2];
      const bucket = Math.floor((x / 100) * 40);
      const targetBottom = Math.min(75, (heightMapRef.current[bucket] || 0) + Math.random() * 4);
      const rotDir = Math.random() > 0.5 ? 1 : -1;

      return {
        id: `incoming-${i}`,
        x,
        size,
        color,
        targetBottom,
        duration: 3.2 + Math.random() * 2.4,
        delay: i * 0.7,
        swayX: [0, Math.sin(i * 2) * 25, -Math.cos(i * 2) * 25, 0],
        rotate: [0, 180 * rotDir, 360 * rotDir, -30 + Math.random() * 60],
        finalRotate: -35 + Math.random() * 70,
      };
    });
  });

  // Quando a folha atinge o footer, ela PARA e fica fixa no monte
  const handleLeafLanded = (landedLeaf) => {
    setStoppedLeaves((prev) => {
      if (prev.length >= MAX_STOPPED_LEAVES) return prev;
      return [
        ...prev,
        {
          id: `stopped-${landedLeaf.id}-${Date.now()}`,
          x: landedLeaf.x,
          bottom: landedLeaf.targetBottom,
          size: landedLeaf.size,
          color: landedLeaf.color,
          rotate: landedLeaf.finalRotate,
        },
      ];
    });

    // Atualiza a altura do monte na posição
    const bucket = Math.floor((landedLeaf.x / 100) * 40);
    if (bucket >= 0 && bucket < 40) {
      heightMapRef.current[bucket] = Math.min(75, (heightMapRef.current[bucket] || 0) + 4.5);
    }

    // Inicia imediatamente uma nova folha caindo de cima em direção ao footer
    const newX = Math.random() * 94 + 3;
    const newSize = 14 + Math.floor(Math.random() * 4) * 4;
    const newColor = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
    const newBucket = Math.floor((newX / 100) * 40);
    const newTargetBottom = Math.min(75, (heightMapRef.current[newBucket] || 0) + Math.random() * 4);
    const newRotDir = Math.random() > 0.5 ? 1 : -1;

    setIncomingLeaves((prev) =>
      prev.map((l) =>
        l.id === landedLeaf.id
          ? {
              id: `incoming-${nextId.current++}`,
              x: newX,
              size: newSize,
              color: newColor,
              targetBottom: newTargetBottom,
              duration: 3.2 + Math.random() * 2.4,
              delay: 0.1,
              swayX: [0, (Math.random() - 0.5) * 45, (Math.random() - 0.5) * 45, 0],
              rotate: [0, 180 * newRotDir, 360 * newRotDir, -30 + Math.random() * 60],
              finalRotate: -35 + Math.random() * 70,
            }
          : l
      )
    );
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* ── 1. FOLHAS QUE ESTÃO CAINDO EM DIREÇÃO AO FOOTER ──────────────── */}
      {incomingLeaves.map((l) => (
        <motion.div
          key={l.id}
          className="pointer-events-none absolute"
          style={{ left: `${l.x}%` }}
          initial={{ top: -70, opacity: 0, rotate: 0 }}
          animate={{
            top: `calc(100% - ${l.targetBottom + l.size}px)`,
            x: l.swayX,
            opacity: [0, 0.95, 0.95, 1],
            rotate: l.rotate,
          }}
          transition={{
            duration: l.duration,
            delay: l.delay,
            ease: 'easeIn',
          }}
          onAnimationComplete={() => handleLeafLanded(l)}
        >
          <LeafIcon size={l.size} color={l.color} />
        </motion.div>
      ))}

      {/* ── 2. FOLHAS PARADAS NO MONTE DO FOOTER (NUNCA SOMEM) ───────────── */}
      {stoppedLeaves.map((l) => (
        <div
          key={l.id}
          style={{
            position: 'absolute',
            left: `${l.x}%`,
            bottom: `${l.bottom}px`,
            transform: `rotate(${l.rotate}deg)`,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.12))',
            pointerEvents: 'none',
          }}
        >
          <LeafIcon size={l.size} color={l.color} />
        </div>
      ))}
    </div>
  );
}

/**
 * FallingLeaves
 * ──────────────
 * Queda suave e contínua de folhas em loop infinito para o fundo das páginas.
 */
export default function FallingLeaves({ count = 24 }) {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const list = Array.from({ length: count }, (_, i) => {
      const x = ((i * 37.3 + Math.sin(i * 9.1) * 23) % 96 + 96) % 96 + 2;
      const size = 13 + ((i * 7) % 11);
      const color = LEAF_COLORS[i % 2];
      const duration = 8 + ((i * 3.7) % 7);
      const delay = (i * 1.3) % 9;
      const rotDir = i % 2 === 0 ? 1 : -1;
      const sway1 = Math.sin(i * 1.5) * 28;
      const sway2 = Math.cos(i * 2.1) * 32;

      return {
        id: i,
        x,
        size,
        color,
        duration,
        delay,
        swayX: [0, sway1, sway2, 0],
        rotate: [0, 160 * rotDir, 340 * rotDir, 520 * rotDir],
      };
    });
    setLeaves(list);
  }, [count]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {leaves.map((l) => (
        <motion.div
          key={l.id}
          className="pointer-events-none absolute top-0"
          style={{ left: `${l.x}%` }}
          initial={{ y: -50, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: '115vh',
            x: l.swayX,
            opacity: [0, 0.85, 0.85, 0],
            rotate: l.rotate,
          }}
          transition={{
            duration: l.duration,
            delay: l.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
        >
          <LeafIcon size={l.size} color={l.color} />
        </motion.div>
      ))}
    </div>
  );
}
