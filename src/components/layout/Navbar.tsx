import React, { useState } from 'react';
import {
  Building2,
  Store,
  User,
  LogOut,
  Shield,
  CreditCard,
  Tag,
  CircleDollarSign,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Clock,
  Printer,
  FileSpreadsheet,
  ArrowLeft,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenAuthModal: (mode: 'login' | 'create_company' | 'register_admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const {
    company,
    currentUser,
    activeTab,
    setActiveTab,
    switchUserRole,
    activeSession,
    isCompanyConfigured,
    logout,
  } = useStore();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrador',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          desc: 'Acesso Geral',
        };
      case 'cashier':
        return {
          title: 'Operador de Caixa',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          desc: 'Frente de Caixa PDV',
        };
      case 'seller':
        return {
          title: 'Vendedor',
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          desc: 'Área de Vendas',
        };
      case 'superadmin':
        return {
          title: 'Super Administrador',
          badge: 'bg-purple-100 text-purple-900 border-purple-300 font-black',
          desc: 'Gestão de Licenças & Afiliados',
        };
      default:
        return {
          title: 'Visitante',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          desc: 'Não logado',
        };
    }
  };

  const roleInfo = getRoleLabel(currentUser?.role);

  const sessionCurrentBalance = activeSession
    ? (activeSession.movements || []).reduce(
        (acc, m) => (m.type === 'sangria' || m.type === 'estorno' ? acc - m.amount : acc + m.amount),
        0
      ) || (activeSession.initialBalance || 0)
    : 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Store Information */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (currentUser?.role === 'superadmin') {
                  setActiveTab('superadmin');
                } else if (currentUser?.role === 'cashier') {
                  setActiveTab('pdv');
                } else if (currentUser?.role === 'seller') {
                  setActiveTab('vendas');
                } else {
                  setActiveTab('dashboard');
                }
              }}
              title="Ir para a Tela Inicial / Menu Principal"
              className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
            >
              {company?.logoUrl ? (
                <div className="w-11 h-11 rounded-xl bg-white p-1 border border-slate-700 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={company.logoUrl}
                    alt={company.tradeName || 'Logotipo da Loja'}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to store icon if image URL fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md shrink-0"
                  style={{ backgroundColor: company?.primaryColor || '#f59e0b' }}
                >
                  <Store className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white">
                    {company?.tradeName || 'MultiVariedades ERP'}
                  </span>
                  <span
                    className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border"
                    style={{
                      backgroundColor: `rgba(${company?.primaryColor ? 'var(--brand-primary-rgb, 245, 158, 11)' : '245, 158, 11'}, 0.15)`,
                      color: company?.primaryColor || '#f59e0b',
                      borderColor: `rgba(${company?.primaryColor ? 'var(--brand-primary-rgb, 245, 158, 11)' : '245, 158, 11'}, 0.3)`,
                    }}
                  >
                    {isCompanyConfigured ? 'ERP & PDV' : 'CONFIGURAÇÃO INICIAL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                  {isCompanyConfigured
                    ? `${company?.corporateName} • CNPJ: ${company?.cnpj}`
                    : 'Passo 1 Obrigatório: Cadastro da Empresa'}
                </p>
              </div>
            </button>
          </div>

          {/* Center Badges & Quick Back to Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Back to Menu button in Navbar when not on dashboard */}
            {isCompanyConfigured && currentUser?.role === 'admin' && activeTab !== 'dashboard' && (
              <button
                type="button"
                id="navbar-btn-back-menu"
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                title="Voltar ao Painel Geral / Menu Principal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voltar ao Menu</span>
                <span className="sm:hidden">Menu</span>
              </button>
            )}

            {/* Quick Manual / Help button */}
            <button
              type="button"
              id="navbar-btn-manual"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white'
              }`}
              title="Manual do Usuário Passo a Passo"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Manual do Usuário</span>
              <span className="md:hidden">Manual</span>
            </button>

            {isCompanyConfigured ? (
              activeSession ? (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Caixa Aberto: <strong>R$ {sessionCurrentBalance.toFixed(2)}</strong></span>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  <span>Caixa Fechado</span>
                </div>
              )
            ) : (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preencha os dados da empresa para liberar os menus</span>
              </div>
            )}
          </div>

          {/* Right Actions: Role Selector, User info & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Fast Role Switcher */}
            <div className="relative">
              <button
                type="button"
                id="btn-role-switcher"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${roleInfo.badge} shadow-xs cursor-pointer`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Perfil Ativo
                  </span>
                  <span>{roleInfo.title}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                    Alternar Perfil para Testar Acessos:
                  </div>

                  <button
                    type="button"
                    id="switch-to-admin"
                    onClick={() => {
                      switchUserRole('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-amber-50/70 transition-colors ${
                      currentUser?.role === 'admin' ? 'bg-amber-50 font-bold text-amber-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">Administrador Geral</div>
                      <div className="text-[11px] text-slate-500">Acesso a todos os menus e relatórios</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="switch-to-cashier"
                    onClick={() => {
                      switchUserRole('cashier');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-emerald-50/70 transition-colors ${
                      currentUser?.role === 'cashier' ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">Operador de Caixa</div>
                      <div className="text-[11px] text-slate-500">Apenas Caixa PDV (Abrir/Fechar/Vender)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="switch-to-seller"
                    onClick={() => {
                      switchUserRole('seller');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50/70 transition-colors ${
                      currentUser?.role === 'seller' ? 'bg-blue-50 font-bold text-blue-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold">Vendedor Balcão</div>
                      <div className="text-[11px] text-slate-500">Apenas Área de Vendas e Catálogo</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="switch-to-superadmin"
                    onClick={() => {
                      switchUserRole('superadmin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-purple-50/70 transition-colors ${
                      currentUser?.role === 'superadmin' ? 'bg-purple-50 font-bold text-purple-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-purple-950">Super Administrador (SaaS)</div>
                      <div className="text-[11px] text-purple-600">dalmarsousa@gmail.com</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1 space-y-0.5">
                    <button
                      type="button"
                      id="btn-open-auth-modal"
                      onClick={() => {
                        onOpenAuthModal('create_company');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-slate-50 flex items-center gap-2 rounded-lg cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Criar Nova Empresa
                    </button>

                    <button
                      type="button"
                      id="btn-dropdown-logout"
                      onClick={() => {
                        logout();
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 rounded-lg cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair do Sistema (Tela de Login)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {currentUser?.name || 'Usuário'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {currentUser?.email || 'user'}
                </div>
              </div>

              <button
                type="button"
                id="btn-logout"
                onClick={() => logout()}
                title="Sair do sistema e ir para a tela de Login"
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
