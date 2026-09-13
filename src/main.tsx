import React, { ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-xl font-black text-white">MultiVariedades ERP</h1>
            <p className="text-sm text-slate-300">
              Ocorreu uma pequena instabilidade no carregamento inicial da interface.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl text-left font-mono text-xs text-rose-400 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Erro inesperado'}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    // Safe repair: keep users and company, clear large cache/duplicate snapshots
                    const usersSaved = localStorage.getItem('multivariedades_master_users_registry_v1');
                    const companySaved = localStorage.getItem('multivariedades_erp_state_v1_company');
                    const isRegistered = localStorage.getItem('multivariedades_is_registered');
                    const lastActiveCnpj = localStorage.getItem('multivariedades_last_active_cnpj');

                    // Clear redundant snapshots
                    const keysToRemove: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const k = localStorage.key(i);
                      if (k && (k.startsWith('multivariedades_store_cnpj_') || k.includes('snapshot') || k.endsWith('_sales'))) {
                        keysToRemove.push(k);
                      }
                    }
                    keysToRemove.forEach((k) => localStorage.removeItem(k));

                    // Re-set core keys to ensure user persistence
                    if (usersSaved) localStorage.setItem('multivariedades_master_users_registry_v1', usersSaved);
                    if (companySaved) localStorage.setItem('multivariedades_erp_state_v1_company', companySaved);
                    if (isRegistered) localStorage.setItem('multivariedades_is_registered', isRegistered);
                    if (lastActiveCnpj) localStorage.setItem('multivariedades_last_active_cnpj', lastActiveCnpj);
                  } catch (e) {
                    console.error('Erro na limpeza seletiva:', e);
                  }
                  window.location.reload();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg"
              >
                Otimizar Espaço e Recarregar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
