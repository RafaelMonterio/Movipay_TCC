'use client';
import { useEffect } from 'react';
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — notificação no canto superior direito */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-end px-4 md:px-6 h-14 flex-shrink-0">
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <OnboardingModal />
    </div>
  );
}
