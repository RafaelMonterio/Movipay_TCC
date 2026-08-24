'use client';
import { useTheme, getThemeColors } from '@/context/ThemeContext';

// Skeleton base — bloco animado
export function Skeleton({ className = '', style = {} }) {
  const { darkMode } = useTheme();
  const colors = getThemeColors(darkMode);

  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{
        backgroundColor: darkMode ? 'rgba(243,239,226,0.12)' : 'rgba(23,36,26,0.08)',
        ...style,
      }}
    />
  );
}

// Skeleton de card genérico
export function CardSkeleton({ lines = 2 }) {
  const { darkMode } = useTheme();
  const colors = getThemeColors(darkMode);

  return (
    <div className="card p-5 rounded-2xl space-y-3" style={{ borderColor: colors.cardBorder }}>
      <Skeleton className="h-4 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

// Skeleton de lista de cards
export function ListSkeleton({ count = 4, lines = 2 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={lines} />
      ))}
    </div>
  );
}

// Skeleton de grid de cards
export function GridSkeleton({ count = 6, cols = 3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6 rounded-2xl space-y-3" style={{ borderColor: 'var(--card-border)' }}>
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-8 w-1/3 mt-2" />
        </div>
      ))}
    </div>
  );
}

// Skeleton de perfil
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="card p-6 rounded-2xl flex items-center gap-5" style={{ borderColor: 'var(--card-border)' }}>
        <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="card p-5 rounded-2xl space-y-2 text-center" style={{ borderColor: 'var(--card-border)' }}>
            <Skeleton className="h-8 w-8 rounded-full mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-3 w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}