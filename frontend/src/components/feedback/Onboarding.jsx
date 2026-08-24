'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme, getThemeColors } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    icon: '🐜',
    title: 'Bem-vindo ao MoviPay!',
    body: 'A plataforma que conecta quem precisa de serviços com quem sabe fazer. Simples, rápido e seguro.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    icon: '🔍',
    title: 'Encontre profissionais',
    body: 'Busque por categoria, veja avaliações e contrate o trabalhador ideal em segundos.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: '⭐',
    title: 'Ganhe pontos',
    body: 'Cada pedido concluído gera pontos para você. Suba de nível e desbloqueie benefícios!',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: '🔧',
    title: 'Você também pode trabalhar',
    body: 'Alterne para o modo trabalhador a qualquer momento e ofereça seus serviços na plataforma.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function OnboardingModal() {
  const { isFirstLogin, dismissOnboarding } = useAuth();
  const { darkMode } = useTheme();
  const colors = getThemeColors(darkMode);
  const [step, setStep] = useState(0);
  const router = useRouter();

  if (!isFirstLogin) return null;

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      dismissOnboarding();
    } else {
      setStep(s => s + 1);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          {/* Gradient header */}
          <div className={`bg-gradient-to-br ${current.color} p-10 text-center`}>
            <motion.div key={step} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-6xl mb-4">{current.icon}</motion.div>
          </div>

          {/* Content */}
          <div className="p-7 text-center">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <h2 className="text-xl font-black mb-3" style={{ color: colors.text }}>{current.title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{current.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 my-6">
              {STEPS.map((_, i) => (
                <div key={i} className={`rounded-full transition-all ${
                  i === step ? 'w-6 h-2 bg-indigo-500' : 'w-2 h-2'
                }`}
                style={{ backgroundColor: i === step ? '#6366F1' : colors.line }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {!isLast && (
                <button onClick={dismissOnboarding}
                  className="flex-1 border font-semibold py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    borderColor: colors.line,
                    color: colors.textMuted,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? 'rgba(243,239,226,0.05)' : 'rgba(23,36,26,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Pular
                </button>
              )}
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all hover:opacity-90">
                {isLast ? 'Começar agora 🚀' : 'Próximo →'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
