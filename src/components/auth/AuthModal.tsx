import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Database,
  Building2,
  Store,
  FileText,
  Briefcase,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { RetailNicheId } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register_admin' | 'create_company' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'create_company',
}) => {
  const {
    registerAdminCleanSlate,
    login,
    switchUserRole,
    resetToCleanSlate,
    superAdminLogin,
    setActiveTab,
  } = useStore();

  const [mode, setMode] = useState<'create_company' | 'login' | 'superadmin'>(
    initialMode === 'login' ? 'login' : 'create_company'
  );

  // Registration Form State - Company Details
  const [corporateName, setCorporateName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [niche, setNiche] = useState<RetailNicheId>('farmacia');

  // Registration Form State - Admin Details
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [startBlank, setStartBlank] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form State
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  if (!isOpen) return null;

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12)
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!corporateName.trim()) {
      setErrorMsg('Por favor, informe a Razão Social ou Nome da Empresa.');
      return;
    }

    if (!adminName.trim() || !adminEmail.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios do Administrador.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem. Use o olho mágico para conferir.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    registerAdminCleanSlate({
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      password,
      startBlank,
      companyData: {
        corporateName: corporateName.trim(),
        tradeName: tradeName.trim() || corporateName.trim(),
        cnpj: cnpj.trim(),
        niche: niche,
      },
    });

    setSuccessMsg(
      'Empresa e Administrador cadastrados com sucesso! Redirecionando para os Dados da Empresa...'
    );

    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginInput.trim()) {
      setErrorMsg('Informe o usuário ou e-mail.');
      return;
    }

    // Check if it is Super Admin
    if (loginInput.trim().toLowerCase() === 'dalmarsousa@gmail.com') {
      const ok = superAdminLogin(loginInput.trim(), loginPassword);
      if (ok) {
        setSuccessMsg('Autenticado como Super Administrador com sucesso!');
        setTimeout(() => {
          setActiveTab('superadmin');
          onClose();
        }, 500);
        return;
      } else {
        setErrorMsg('Senha incorreta para o Super Administrador.');
        return;
      }
    }

    const result = login(loginInput.trim(), loginPassword);
    if (result.success) {
      onClose();
    } else {
      setErrorMsg(
        result.error ||
          'Usuário não encontrado. Você pode selecionar um perfil de demonstração abaixo ou criar uma nova empresa.'
      );
    }
  };

  const handleQuickSuperAdmin = () => {
    const ok = superAdminLogin('dalmarsousa@gmail.com', 'Djs09101967?');
    if (ok) {
      setActiveTab('superadmin');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 relative pr-10">
          <div className="flex flex-1">
            <button
              type="button"
              id="tab-btn-create-company"
              onClick={() => {
                setMode('create_company');
                setErrorMsg('');
              }}
              className={`flex-1 py-3.5 px-4 text-center font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'create_company'
                  ? 'border-amber-500 text-amber-900 bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              Criar Nova Empresa
            </button>
            <button
              type="button"
              id="tab-btn-login"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-3.5 px-4 text-center font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'border-amber-500 text-amber-900 bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-600" />
              Entrar / Perfis
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-2.5 top-2.5 w-7 h-7 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              {successMsg}
            </div>
          )}

          {mode === 'create_company' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Informative Guidance Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-black block text-sm text-slate-950">
                    Abertura de Nova Empresa & Administrador
                  </strong>
                  <p className="mt-0.5 text-slate-700 leading-relaxed">
                    Cadastre os dados da nova empresa e o Administrador responsável. Para criar novos usuários (operadores de caixa e vendedores), você deverá usar o sistema após o cadastro de todos os dados da empresa.
                  </p>
                </div>
              </div>

              {/* Group 1: Company Profile */}
              <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <Store className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    1. Dados da Nova Empresa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Razão Social / Nome da Empresa <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="reg-company-corporate"
                      required
                      value={corporateName}
                      onChange={(e) => setCorporateName(e.target.value)}
                      placeholder="Ex: Comercial Silva e Filhos Ltda"
                      className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome Fantasia (Letreiro)
                    </label>
                    <input
                      type="text"
                      id="reg-company-trade"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      placeholder="Ex: Farmácia & Variedades Silva"
                      className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CNPJ da Empresa
                    </label>
                    <input
                      type="text"
                      id="reg-company-cnpj"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Segmento / Ramo de Atuação
                    </label>
                    <select
                      id="reg-company-niche"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value as RetailNicheId)}
                      className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 bg-white shadow-xs cursor-pointer"
                    >
                      <option value="farmacia">Farmácia & Drogaria (Medicamentos, Lotes & Vacinas)</option>
                      <option value="variedades">Varejo Geral & Loja de Variedades</option>
                      <option value="supermercado">Supermercado & Mercearia (Balança & Fracionados)</option>
                      <option value="petshop">Pet Shop & Clínica Veterinária</option>
                      <option value="construcao">Materiais de Construção & Ferramentas</option>
                      <option value="moda">Moda, Calçados & Vestuário (Grade de Cores/Tamanhos)</option>
                      <option value="eletronicos">Eletrônicos & Informática (Seriais & IMEI)</option>
                      <option value="autopecas">Autopeças & Motopeças (Aplicação Veicular)</option>
                      <option value="otica">Ótica & Acessórios</option>
                      <option value="restaurante">Restaurante, Lanchonete & Conveniência</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Group 2: Administrator Details */}
              <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    2. Administrador Responsável (Primeiro Acesso)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome Completo do Administrador <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="reg-admin-name"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail / Usuário de Acesso do Administrador <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="reg-admin-email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@minhaloja.com.br"
                      className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                    />
                  </div>

                  {/* Password Fields with Eye Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Senha <span className="text-amber-600">*</span></span>
                      <span className="text-[11px] text-slate-500 font-normal">Olho mágico</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="reg-admin-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 4 dígitos"
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                      />
                      <button
                        type="button"
                        id="btn-eye-pass-1"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Alternar visualização da senha"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Confirmar Senha <span className="text-amber-600">*</span></span>
                      <span className="text-[11px] text-slate-500 font-normal">Repetir</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="reg-admin-confirm"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                      />
                      <button
                        type="button"
                        id="btn-eye-pass-2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Alternar visualização da confirmação de senha"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Option: Clean Slate */}
                <div className="mt-2 p-3 rounded-xl border border-amber-300/80 bg-amber-50/60 space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      id="checkbox-start-blank"
                      checked={startBlank}
                      onChange={(e) => setStartBlank(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 block flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-amber-600" />
                        Iniciar sistema 100% em branco para esta empresa
                      </span>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Começa com o catálogo de produtos e caixa limpos para a nova empresa.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  id="btn-cancel-modal"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-create-company"
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Criar Nova Empresa e Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Login & Fast Role Switcher */
            <div className="space-y-5">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                    E-mail ou Usuário
                  </label>
                  <input
                    type="text"
                    id="input-login-user"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="admin, caixa01, carla.vendas ou seu e-mail"
                    className="w-full px-3.5 py-3 text-base font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>Senha de Acesso</span>
                    <span className="text-xs text-slate-500 font-normal">Olho mágico</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="input-login-pass"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-3.5 pr-11 py-3 text-base font-bold text-slate-950 rounded-xl border-2 border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 bg-white placeholder-slate-400 shadow-xs"
                    />
                    <button
                      type="button"
                      id="btn-toggle-login-pass"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-5 h-5 text-amber-600" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm sm:text-base shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Entrar no Sistema
                </button>
              </form>

              {/* Perfis Pré-configurados para Demonstração Fácil */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Acesso Rápido por Perfil (Demo):
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Deseja iniciar uma nova loja 100% em branco agora?')) {
                        resetToCleanSlate();
                        onClose();
                      }
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Resetar p/ Loja em Branco
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    id="btn-role-admin"
                    onClick={() => {
                      switchUserRole('admin');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                        ADM
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-amber-900">
                          Administrador (Acesso Total)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Painel, Empresa, Usuários, Fiscal, PDV e Estoque
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">
                      Acessar →
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-role-cashier"
                    onClick={() => {
                      switchUserRole('cashier');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        PDV
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-900">
                          Operador de Caixa (Frente de Caixa)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Apenas Caixa PDV: Abertura/Fechamento e Vendas
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">
                      Acessar →
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-role-seller"
                    onClick={() => {
                      switchUserRole('seller');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        VEN
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-blue-900">
                          Vendedor Balcão (Área de Vendas)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Apenas Catálogo de Produtos e Pedidos/Pré-Venda
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded">
                      Acessar →
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-role-superadmin"
                    onClick={handleQuickSuperAdmin}
                    className="p-2.5 rounded-xl border border-purple-300 bg-purple-50/80 hover:bg-purple-100 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        SUP
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs group-hover:text-purple-900 flex items-center gap-1.5">
                          <span>Super Administrador</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-extrabold">
                            dalmarsousa@gmail.com
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Liberação de Clientes (Mensal, Vitalício, Dias extras) & Afiliados
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-200/80 px-2 py-0.5 rounded">
                      Acessar →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
