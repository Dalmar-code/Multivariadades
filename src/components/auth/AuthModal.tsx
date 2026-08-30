import React, { useState } from 'react';
import { Eye, EyeOff, Building2, User, Lock, Mail, Phone, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register_company' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'register_company' }) => {
  const { registerCompanyAndAdmin, login, users, switchUserRole } = useStore();
  const [mode, setMode] = useState<'register_company' | 'login'>(initialMode);

  // Registration Form State
  const [tradeName, setTradeName] = useState('MULTI TUDO - Variedades & Construção');
  const [corporateName, setCorporateName] = useState('MULTIVARIEDADES COMERCIO VAREJISTA LTDA');
  const [cnpj, setCnpj] = useState('34.567.890/0001-22');
  const [stateRegistration, setStateRegistration] = useState('123.456.789.110');
  const [phone, setPhone] = useState('(11) 3456-7890');
  const [cep, setCep] = useState('01310-100');
  const [street, setStreet] = useState('Avenida Paulista');
  const [number, setNumber] = useState('1578');
  const [neighborhood, setNeighborhood] = useState('Bela Vista');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [adminName, setAdminName] = useState('Administrador da Loja');
  const [adminEmail, setAdminEmail] = useState('admin@multivariedades.com.br');
  
  // Passwords with "olho mágico" (eye toggle)
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form State
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  if (!isOpen) return null;

  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!tradeName || !cnpj || !adminEmail || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem. Verifique com o olho mágico.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    registerCompanyAndAdmin(
      {
        tradeName,
        corporateName,
        cnpj,
        stateRegistration,
        phone,
        email: adminEmail,
        address: {
          cep,
          street,
          number,
          neighborhood,
          city,
          state,
        },
      },
      adminName,
      adminEmail,
      password
    );

    setSuccessMsg('Empresa e Administrador cadastrados com sucesso! Acesso liberado imediatamente.');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginInput) {
      setErrorMsg('Informe o usuário ou e-mail.');
      return;
    }

    const success = login(loginInput);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Usuário não encontrado. Selecione um perfil de demonstração abaixo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80">
          <button
            type="button"
            id="tab-register-company"
            onClick={() => {
              setMode('register_company');
              setErrorMsg('');
            }}
            className={`flex-1 py-3.5 px-4 text-center font-semibold text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'register_company'
                ? 'border-amber-500 text-amber-900 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            Cadastrar Nova Empresa (Acesso Imediato)
          </button>
          <button
            type="button"
            id="tab-login"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-3.5 px-4 text-center font-semibold text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'login'
                ? 'border-amber-500 text-amber-900 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 text-amber-600" />
            Entrar / Trocar Usuário
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
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

          {mode === 'register_company' ? (
            <form onSubmit={handleRegisterCompany} className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-sm">Liberação Imediata sem confirmação de e-mail</strong>
                  Preencha os dados da sua loja de multi variedades e defina sua senha com confirmação e olho mágico para liberar o sistema na hora!
                </div>
              </div>

              {/* Dados da Empresa */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  1. Dados da Empresa (Loja de Variedades)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Fantasia da Loja *
                    </label>
                    <input
                      type="text"
                      id="input-trade-name"
                      required
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      placeholder="Ex: Multi Tudo Variedades & Ferragens"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Razão Social *
                    </label>
                    <input
                      type="text"
                      id="input-corporate-name"
                      required
                      value={corporateName}
                      onChange={(e) => setCorporateName(e.target.value)}
                      placeholder="Ex: Multicoisas Comercio Varejista Ltda"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      id="input-cnpj"
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inscrição Estadual (IE) *
                    </label>
                    <input
                      type="text"
                      id="input-state-reg"
                      value={stateRegistration}
                      onChange={(e) => setStateRegistration(e.target.value)}
                      placeholder="Ex: 123.456.789.110"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      id="input-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="input-cep"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cidade / UF
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="input-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="São Paulo"
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                      <input
                        type="text"
                        id="input-state"
                        maxLength={2}
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        placeholder="SP"
                        className="w-14 px-2 py-2 text-sm text-center font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados do Administrador e Senhas com Olho Mágico */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  2. Administrador & Senhas (Com Olho Mágico)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome do Administrador *
                    </label>
                    <input
                      type="text"
                      id="input-admin-name"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail de Acesso *
                    </label>
                    <input
                      type="email"
                      id="input-admin-email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@multivariedades.com.br"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                    />
                  </div>
                </div>

                {/* Duas Senhas com Olho Mágico */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Senha de Acesso *</span>
                      <span className="text-[10px] text-slate-500 font-normal">Use o olho mágico</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="input-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                      />
                      <button
                        type="button"
                        id="btn-toggle-password-1"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Ver senha"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Confirmar Senha *</span>
                      <span className="text-[10px] text-slate-500 font-normal">Repita a senha</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="input-confirm-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                      />
                      <button
                        type="button"
                        id="btn-toggle-password-2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Ver confirmação de senha"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-register"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-register-company"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Cadastrar e Liberar Acesso Imediato
                </button>
              </div>
            </form>
          ) : (
            /* Login & Fast Role Switcher */
            <div className="space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail ou Usuário
                  </label>
                  <input
                    type="text"
                    id="input-login-user"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="admin, caixa01, carla.vendas ou seu e-mail"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Senha</span>
                    <span className="text-[10px] text-slate-500">Com olho mágico</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="input-login-pass"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                    <button
                      type="button"
                      id="btn-toggle-login-pass"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Entrar no Sistema
                </button>
              </form>

              {/* Perfis Pré-configurados para Demonstração Fácil */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Ou alterne instantaneamente por perfil de usuário:
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    id="btn-role-admin"
                    onClick={() => {
                      switchUserRole('admin');
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center shadow-xs">
                        ADM
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-amber-900">
                          Administrador (Acesso Total)
                        </div>
                        <div className="text-xs text-slate-500">
                          Empresa, Usuários, Fiscal, Estoque, DRE, Financeiro e Relatórios
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-200/60 px-2 py-1 rounded-md">
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
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs">
                        PDV
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-900">
                          Operador de Caixa (Caixa PDV Exclusivo)
                        </div>
                        <div className="text-xs text-slate-500">
                          Apenas Frente de Caixa PDV: Abertura/Fechamento e Vendas
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-200/60 px-2 py-1 rounded-md">
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
                    className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
                        VEN
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-blue-900">
                          Vendedor Balcão (Área de Vendas)
                        </div>
                        <div className="text-xs text-slate-500">
                          Apenas Catálogo de Produtos e Pedidos/Pré-Venda
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-200/60 px-2 py-1 rounded-md">
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
