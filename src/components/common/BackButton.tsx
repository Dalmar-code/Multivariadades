import React from 'react';
import { ArrowLeft, LayoutDashboard, Home } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface BackButtonProps {
  label?: string;
  targetTab?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'outline' | 'subtle';
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Voltar ao Menu',
  targetTab = 'dashboard',
  className = '',
  variant = 'outline',
}) => {
  const { setActiveTab, currentUser } = useStore();

  const handleBack = () => {
    if (currentUser?.role === 'superadmin') {
      setActiveTab('superadmin');
    } else if (currentUser?.role === 'cashier') {
      setActiveTab('pdv');
    } else if (currentUser?.role === 'seller') {
      setActiveTab('vendas');
    } else {
      setActiveTab(targetTab);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'dark':
        return 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700 shadow-sm';
      case 'light':
        return 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-xs';
      case 'subtle':
        return 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent';
      case 'outline':
      default:
        return 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs';
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      title="Voltar ao Painel Principal / Menu"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${getVariantClasses()} ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
};
