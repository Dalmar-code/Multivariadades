import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CreditCard,
  Tag,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

export const UserManager: React.FC = () => {
  const { users, addUser, deleteUser, currentUser } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    if (password.length < 4) {
      alert('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    addUser({
      name,
      email,
      role,
      password,
    });

    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleDelete = (id: string, userName: string) => {
    if (id === currentUser?.id) {
      alert('Você não pode excluir o seu próprio usuário logado.');
      return;
    }
    if (window.confirm(`Deseja realmente remover o usuário "${userName}"?`)) {
      deleteUser(id);
    }
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Shield className="w-3.5 h-3.5 text-amber-700" /> Administrador (Acesso Total)
          </span>
        );
      case 'cashier':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" /> Operador de Caixa (Apenas PDV)
          </span>
        );
      case 'seller':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Tag className="w-3.5 h-3.5 text-blue-700" /> Vendedor (Apenas Catálogo & Vendas)
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Gerenciamento de Usuários & Perfis</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Controle de Acesso RBAC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastre Administradores, Operadores de Caixa (com restrição ao PDV) e Vendedores (com restrição a vendas).
          </p>
        </div>

        <button
          type="button"
          id="btn-new-user"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Role Explanations Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-xs mb-1">
            <Shield className="w-4 h-4 text-amber-600" />
            Perfil Administrador
          </div>
          <p className="text-[11px] text-amber-800">
            Acesso irrestrito a todos os menus: Gestão Financeira, DRE, Configurações Fiscais da Receita Federal, Estoque e Relatórios.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs mb-1">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Perfil Operador de Caixa
          </div>
          <p className="text-[11px] text-emerald-800">
            Visualiza <strong>apenas o Caixa PDV</strong>. Pode abrir caixa com fundo de troco, passar itens no leitor, receber pagamentos e fechar o caixa.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-xs mb-1">
            <Tag className="w-4 h-4 text-blue-600" />
            Perfil Vendedor
          </div>
          <p className="text-[11px] text-blue-800">
            Visualiza <strong>apenas a Área de Vendas & Catálogo</strong>. Pode consultar estoque nos corredores e emitir pedidos de balcão / pré-venda.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Nome do Usuário</th>
              <th className="py-3.5 px-4">E-mail de Acesso</th>
              <th className="py-3.5 px-4">Nível de Permissão (Perfil)</th>
              <th className="py-3.5 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div>{u.name}</div>
                    {u.id === currentUser?.id && (
                      <span className="text-[10px] text-amber-700 font-bold">(Você - Sessão Atual)</span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{u.email}</td>

                <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                <td className="py-3.5 px-4 text-center">
                  {u.id !== currentUser?.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: New User Registration with Dual Password & Olho Mágico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">Cadastrar Novo Usuário</span>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    id="user-form-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silveira"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de Login</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    id="user-form-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@lojamulti.com.br"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil de Acesso</label>
                <select
                  value={role}
                  id="user-form-role"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="cashier">Operador de Caixa (Acesso Exclusivo ao Caixa PDV)</option>
                  <option value="seller">Vendedor (Acesso Exclusivo à Área de Vendas)</option>
                  <option value="admin">Administrador (Acesso Total ao ERP e Fiscal)</option>
                </select>
              </div>

              {/* Olho Mágico - Senha 1 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="user-form-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Olho mágico: Mostrar/Ocultar Senha"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Olho Mágico - Senha 2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmação da Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    id="user-form-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a mesma senha..."
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Olho mágico: Mostrar/Ocultar Senha"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-save-new-user"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
