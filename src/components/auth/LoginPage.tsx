import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Building2,
  Store,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface LoginPageProps {
  onOpenRegisterAdmin?: () => void;
  onOpenRegisterCompany?: () => void;
  onOpenPlans?: () => void;
}

const REMEMBERED_CREDENTIALS_KEY = 'multivariedades_remembered_credentials_v1';
const REMEMBER_PREF_KEY = 'multivariedades_remember_login_pref';

export const LoginPage: React.FC<LoginPageProps> = ({
  onOpenRegisterAdmin,
  onOpenRegisterCompany,
  onOpenPlans,
}) => {
  const { company, login, superAdminLogin, setActiveTab } = useStore();
  const handleOpenCompanyRegister = onOpenRegisterCompany || onOpenRegisterAdmin;

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_PREF_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Helper functions to get and set remembered credentials securely
  const getRememberedCredentials = (): Record<string, string> => {
    try {
      const saved = localStorage.getItem(REMEMBERED_CREDENTIALS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameInput.trim()) {
      setErrorMessage('Por favor, informe o nome de usuário ou e-mail.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check Super Admin special credential
      if (usernameInput.trim().toLowerCase() === 'dalmarsousa@gmail.com') {
        const ok = superAdminLogin('dalmarsousa@gmail.com', passwordInput);
        if (ok) {
          // Save or clear remembered credential according to rememberMe preference
          const creds = getRememberedCredentials();
          if (rememberMe && passwordInput) {
            creds['dalmarsousa@gmail.com'] = passwordInput;
          } else {
            delete creds['dalmarsousa@gmail.com'];
          }
          localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, JSON.stringify(creds));

          setSuccessMessage('Super Administrador autenticado com sucesso!');
          setTimeout(() => {
            setActiveTab('superadmin');
            setIsLoading(false);
          }, 400);
          return;
        } else {
          setErrorMessage('Senha incorreta para o Super Administrador.');
          setIsLoading(false);
          return;
        }
      }

      // Normal store user login
      const result = login(usernameInput.trim(), passwordInput);
      if (result.success) {
        // Save or remove remembered credentials according to user choice
        const creds = getRememberedCredentials();
        const key = usernameInput.trim().toLowerCase();
        if (rememberMe && passwordInput) {
          creds[key] = passwordInput;
        } else {
          delete creds[key];
        }
        localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, JSON.stringify(creds));

        setSuccessMessage('Login efetuado com sucesso! Carregando sistema...');
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas. Verifique o usuário e a senha digitados.');
        setIsLoading(false);
      }
    }, 250);
  };

  const handleQuickSuperAdmin = () => {
    setUsernameInput('dalmarsousa@gmail.com');
    const creds = getRememberedCredentials();
    const rememberedPass = creds['dalmarsousa@gmail.com'];
    if (rememberedPass) {
      setPasswordInput(rememberedPass);
    } else {
      setPasswordInput('');
    }
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 antialiased">
      {/* Top Header Bar - Solid Dark */}
      <header className="border-b border-slate-800 bg-slate-950 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.tradeName}
              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border-2 border-slate-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-md"
              style={{ backgroundColor: company.primaryColor || '#f59e0b' }}
            >
              <Store className="w-6 h-6" />
            </div>
          )}
          <div>
            <span className="text-base font-black tracking-tight text-white block leading-tight">
              {company.tradeName || 'Sistema Comercial ERP & PDV'}
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">
              {company.cnpj ? `CNPJ: ${company.cnpj}` : 'Acesso Seguro ao Balcão e Gestão'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPlans && (
            <button
              type="button"
              onClick={onOpenPlans}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-slate-800 border border-amber-500/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planos & Licenças</span>
            </button>
          )}

          {handleOpenCompanyRegister && (
            <button
              type="button"
              id="btn-header-new-company"
              onClick={handleOpenCompanyRegister}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Criar Nova Empresa</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Login Content - Centered Secure Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          {/* Login Form Card - Solid White Background with Extreme Contrast */}
          <div className="bg-white text-slate-900 rounded-3xl border-2 border-slate-200 shadow-2xl p-6 sm:p-8">
            <div className="mb-4 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-slate-950 shrink-0 shadow-xs"
                  style={{ backgroundColor: company.primaryColor || '#f59e0b' }}
                >
                  <Building2 className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-950 truncate block leading-tight">
                    {company.tradeName || 'Loja Comercial'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold block">
                    {company.cnpj ? `CNPJ: ${company.cnpj}` : 'CNPJ em configuração'}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Gravação Ativa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Autenticação Segura
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Entrar no Sistema
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-6 font-medium">
              Digite seu usuário ou e-mail e senha para acessar os módulos e o PDV.
            </p>

            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-semibold flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or Email Input */}
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5"
                >
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUsernameInput(val);
                      setErrorMessage('');

                      // Auto-fill password if remembered for this identifier
                      const creds = getRememberedCredentials();
                      const remembered = creds[val.trim().toLowerCase()];
                      if (remembered) {
                        setPasswordInput(remembered);
                      }
                    }}
                    placeholder="Ex: seu.usuario ou seu@email.com"
                    autoComplete="username"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border-2 border-slate-300 focus:border-amber-500 text-slate-950 font-bold text-base placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-black uppercase tracking-wider text-slate-800"
                  >
                    Senha de Acesso
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Protegida • Expor jamais
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white border-2 border-slate-300 focus:border-amber-500 text-slate-950 font-bold text-base placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha digitada'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Password Checkbox */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="checkbox-remember-password"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      try {
                        localStorage.setItem(REMEMBER_PREF_KEY, JSON.stringify(e.target.checked));
                      } catch {
                        // ignore
                      }
                    }}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Lembrar meu acesso e senha neste navegador
                  </span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  (Sem expor senha)
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-login-submit"
                disabled={isLoading}
                style={{ backgroundColor: company.primaryColor || '#f59e0b' }}
                className="w-full mt-3 py-4 px-4 rounded-xl text-slate-950 font-black text-base shadow-lg hover:shadow-xl hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>{isLoading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
              </button>
            </form>

            {/* Bottom Options and Super Admin Trigger */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
              <button
                type="button"
                onClick={handleQuickSuperAdmin}
                className="text-slate-500 hover:text-purple-700 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                <span>Super Administrador</span>
              </button>

              {handleOpenCompanyRegister && (
                <button
                  type="button"
                  id="btn-login-create-company"
                  onClick={handleOpenCompanyRegister}
                  className="text-amber-700 hover:text-amber-800 hover:underline font-black cursor-pointer flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Criar Nova Empresa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Solid Dark */}
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-3 text-center text-xs text-slate-400 font-medium">
        MultiVariedades ERP & PDV Balcão • Todos os direitos reservados
      </footer>
    </div>
  );
};
