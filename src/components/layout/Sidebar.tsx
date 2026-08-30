import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Building2,
  UserCheck,
  Tag,
  Receipt,
  Settings,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Sidebar: React.FC = () => {
  const { currentUser, activeTab, setActiveTab } = useStore();

  // If user is Cashier, they only see the PDV
  if (currentUser?.role === 'cashier') {
    return null;
  }

  // If user is Seller, they only see the Sales/Catalog area
  if (currentUser?.role === 'seller') {
    return null;
  }

  // Admin menu
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'pdv',
      label: 'Frente de Caixa (PDV)',
      icon: ShoppingCart,
      badge: 'Caixa',
    },
    {
      id: 'vendas',
      label: 'Área de Vendas',
      icon: Tag,
      badge: undefined,
    },
    {
      id: 'produtos',
      label: 'Produtos (Shopee / ML)',
      icon: Package,
      badge: '8 Fotos',
    },
    {
      id: 'clientes',
      label: 'Clientes (Nota Paulista)',
      icon: Users,
      badge: undefined,
    },
    {
      id: 'fiscal',
      label: 'Fiscal (NF-e / NFC-e)',
      icon: Receipt,
      badge: 'SEFAZ',
    },
    {
      id: 'financeiro',
      label: 'Financeiro & DRE',
      icon: DollarSign,
      badge: 'DRE',
    },
    {
      id: 'relatorios',
      label: 'Relatórios em PDF',
      icon: BarChart3,
      badge: 'PDF',
    },
    {
      id: 'empresa',
      label: 'Dados da Empresa & Logo',
      icon: Building2,
      badge: undefined,
    },
    {
      id: 'usuarios',
      label: 'Usuários & Perfis',
      icon: UserCheck,
      badge: undefined,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 no-print hidden lg:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Principal (Admin)
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                isActive
                  ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info in Sidebar */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="font-bold text-slate-700 flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-amber-600" />
          Sistema Multi Variedades
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Ferragens, Limpeza, Construção, Utilidades e Papelaria.
        </p>
      </div>
    </aside>
  );
};
