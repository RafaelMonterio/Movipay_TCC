'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTheme, getThemeColors } from '@/context/ThemeContext';
import Sidebar from './Sidebar';
import OnboardingModal from '@/components/feedback/Onboarding';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import NotificationBell from '@/components/feedback/NotificationBell';
import AccessibilityControls from '@/components/accessibility/AccessibilityControls';
import FallingLeaves from '@/components/effects/FallingLeaves';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { darkMode } = useTheme();
  const themeColors = getThemeColors(darkMode);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: themeColors.bg, transition: 'background 0.4s' }}>
      <div style={{ textAlign: 'center', spaceY: '12px' }}>
        <p style={{ fontSize: '64px', animation: 'bounce 1s infinite' }}>🐜</p>
        <p style={{ fontSize: '0.875rem', color: themeColors.textMuted }}>Carregando...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const bg = themeColors.bg;
  const headerBg = themeColors.headerBg;
  const headerBorder = themeColors.headerBorder;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: bg, transition: 'background 0.4s', color: themeColors.text }}>
      <FallingLeaves />
      <Sidebar />

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-shell { width: calc(100% - 88px) !important; margin-left: 88px; }
          .dashboard-content { max-width: none !important; }
          .dashboard-content > div { max-width: none !important; margin-left: 0 !important; margin-right: 0 !important; }
        }
      `}</style>
      <div className="dashboard-shell" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 8, padding: '0 16px 0 24px', height: 56, flexShrink: 0,
          transition: 'background 0.4s, border-color 0.4s',
        }}>
          <NotificationBell />
        </header>

        <main style={{ flex: 1, overflow: 'auto', paddingBottom: 0 }}>
          <div className="dashboard-content" style={{ width: '100%', maxWidth: 'none', margin: '0 auto' }}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <OnboardingModal />
      <AccessibilityControls />
    </div>
  );
}
