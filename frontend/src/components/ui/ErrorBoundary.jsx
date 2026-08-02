'use client';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
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
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Algo deu errado</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            {this.state.error?.message || 'Ocorreu um erro inesperado nesta página.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-client text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-all"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
