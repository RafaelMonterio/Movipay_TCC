'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import OnboardingModal from '@/components/feedback/Onboarding';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import NotificationBell from '@/components/feedback/NotificationBell';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-3">
        <p className="text-4xl animate-bounce">🐜</p>
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const profileHref = user?.mode === 'worker' ? '/worker/profile' : '/client/profile';

  return (
    <div className="relative min-h-screen bg-slate-50 lg:pl-[88px]">
      <Sidebar />

      <div className="flex flex-col min-w-0 w-full">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-end gap-2 px-4 md:px-6 h-14 flex-shrink-0">
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-lg transition-all"
            aria-label="Buscar"
          >
            🔍
          </button>

          <NotificationBell />

          <Link
            href={profileHref}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <span className="text-base">👤</span>
            <span className="hidden sm:inline">Perfil</span>
          </Link>
        </header>

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="w-full max-w-[1220px] mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <OnboardingModal />
    </div>
  );
}
