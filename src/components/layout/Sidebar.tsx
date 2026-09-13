import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Building2,
  UserCheck,
  Tag,
  Receipt,
  Settings,
  ShieldAlert,
  Award,
  Sparkles,
  GitBranch,
  Gift,
  LogOut,
  Clock,
  Layers,
  Syringe,
  Store,
  BookOpen,
  Dog,
  Landmark,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { RETAIL_NICHES } from '../../utils/retailNiches';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    company,
    companyNiche,
    isCompanyConfigured,
    logout,
    superAdminLogout,
  } = useStore();

  // Super Admin Exclusive Menu:
  // "o menu do super administrador deve ter apenas a lista dos clientes que aderir e ou afiliados que deverá ser criado"
  if (currentUser?.role === 'superadmin') {
    const superAdminItems = [
      {
        id: 'superadmin',
        label: 'Clientes & Afiliados',
        icon: ShieldAlert,
        badge: 'Super Admin',
      },
      {
        id: 'landing',
        label: 'Página de Planos (10 Dias)',
        icon: Gift,
        badge: 'SaaS',
      },
    ];

    return (
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 no-print hidden lg:flex">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-amber-400">
            Menu Super Administrador
          </div>

          {superAdminItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-sm transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-amber-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Controle de Licenças
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              dalmarsousa@gmail.com
            </p>
          </div>

          <button
            type="button"
            onClick={() => superAdminLogout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sair do Super Admin</span>
          </button>
        </div>
      </aside>
    );
  }

  // If company is not yet configured, hide all menus until company registration is completed
  if (!isCompanyConfigured) {
    return null;
  }

  // If user is Cashier, they only operate the PDV
  if (currentUser?.role === 'cashier') {
    return null;
  }

  // If user is Seller, they only operate the Sales/Catalog area
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
      id: 'filiais',
      label: 'Filiais & Lojas (PDVs)',
      icon: Building2,
      badge: 'Lojas',
    },
    {
      id: 'produtos',
      label: 'Produtos (Estoque)',
      icon: Package,
      badge: 'Custo/Venda',
    },
    {
      id: 'validades',
      label: 'Controle de Validades',
      icon: Clock,
      badge: 'Lotes',
    },
    {
      id: 'departamentos',
      label: 'Departamentos & Categorias',
      icon: Layers,
      badge: 'Nicho',
    },
    {
      id: 'petshop',
      label: 'Pet Shop & Veterinária',
      icon: Dog,
      badge: 'Serviços',
    },
    ...(RETAIL_NICHES[companyNiche]?.features.hasVaccineSchedule || companyNiche === 'farmacia' || companyNiche === 'petshop'
      ? [
          {
            id: 'vacinas',
            label: 'Agenda de Vacinas',
            icon: Syringe,
            badge: 'Saúde',
          },
        ]
      : []),
    {
      id: 'clientes',
      label: 'Clientes & Nota Paulista',
      icon: Users,
      badge: undefined,
    },
    {
      id: 'tesouraria',
      label: 'Tesouraria & Fechamentos',
      icon: Landmark,
      badge: 'Auditoria',
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
      label: 'Dados da Empresa',
      icon: Building2,
      badge: undefined,
    },
    {
      id: 'usuarios',
      label: 'Usuários & Perfis',
      icon: UserCheck,
      badge: 'RBAC',
    },
    {
      id: 'manual',
      label: 'Manual do Usuário',
      icon: BookOpen,
      badge: 'Guia',
    },
    {
      id: 'landing',
      label: 'Planos (10 Dias Grátis)',
      icon: Sparkles,
      badge: 'SaaS',
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
              style={isActive ? { backgroundColor: company?.primaryColor || '#f59e0b' } : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                isActive
                  ? 'text-slate-950 font-black shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-slate-950/15 text-slate-950 font-black'
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
      <div className="space-y-2">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-amber-600" />
            MultiVariedades ERP
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Multi-Filiais, PDVs com Fechamento 1x/Dia, Fiscal e Estoque.
          </p>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 font-bold text-xs transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

