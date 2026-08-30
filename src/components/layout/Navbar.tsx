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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenAuthModal: (mode: 'login' | 'register_company') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const {
    company,
    currentUser,
    switchUserRole,
    activeSession,
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
      default:
        return {
          title: 'Visitante',
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          desc: 'Não logado',
        };
    }
  };

  const roleInfo = getRoleLabel(currentUser?.role);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Store Information */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Store className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">
                  {company?.tradeName || 'MultiVariedades'}
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                  ERP & PDV
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {company?.corporateName} • CNPJ: {company?.cnpj}
              </p>
            </div>
          </div>

          {/* Center Badges: Caixa Status & Segments */}
          <div className="hidden lg:flex items-center gap-3">
            {activeSession ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Caixa Aberto: <strong>R$ {activeSession.currentBalance.toFixed(2)}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>Caixa Fechado</span>
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

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      id="btn-open-auth-modal"
                      onClick={() => {
                        onOpenAuthModal('register_company');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Cadastrar Nova Empresa / Loja
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
                onClick={() => onOpenAuthModal('login')}
                title="Trocar usuário ou cadastrar empresa"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
