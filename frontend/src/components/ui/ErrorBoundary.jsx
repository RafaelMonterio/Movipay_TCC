'use client';
import { Component } from 'react';
import { useTheme, getThemeColors } from '@/context/ThemeContext';

class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const { colors } = this.props;
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Algo deu errado</h2>
          <p className="text-sm mb-6 max-w-sm" style={{ color: colors.textMuted }}>
            {this.state.error?.message || 'Ocorreu um erro inesperado nesta página.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #FF7A00, #FF9A33)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary(props) {
  const { darkMode } = useTheme();
  const colors = getThemeColors(darkMode);
  return <ErrorBoundaryInner {...props} colors={colors} />;
}