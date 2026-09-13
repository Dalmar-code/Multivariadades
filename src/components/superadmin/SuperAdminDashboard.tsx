import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Award,
  DollarSign,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Gift,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Sparkles,
  Building2,
  Phone,
  Mail,
  Lock,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ClientLicense, Affiliate, PlanType } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const {
    clientLicenses,
    addClientLicense,
    updateClientLicense,
    activateClientLicense,
    extendClientDays,
    affiliates,
    addAffiliate,
    updateAffiliate,
    payAffiliateCommission,
    commissionLogs,
    currentUser,
    superAdminLogout,
    setActiveTab,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'affiliates' | 'commissions'>('clients');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedClientForExtend, setSelectedClientForExtend] = useState<ClientLicense | null>(null);
  const [extendDaysCount, setExtendDaysCount] = useState<number>(10);
  const [extendNotes, setExtendNotes] = useState<string>('');

  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [copiedLinkAffiliateId, setCopiedLinkAffiliateId] = useState<string | null>(null);
  const [affiliateForm, setAffiliateForm] = useState({
    name: '',
    email: '',
    phone: '',
    pixKey: '',
    pixKeyType: 'email' as 'email' | 'cpf' | 'cnpj' | 'phone' | 'random',
    referralCode: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    clientName: '',
    companyName: '',
    tradeName: '',
    document: '',
    email: '',
    phone: '',
    plan: 'trial_10_days' as PlanType,
    affiliateId: '',
  });

  // Pay Commission Modal
  const [isPayCommissionModalOpen, setIsPayCommissionModalOpen] = useState(false);
  const [payingAffiliate, setPayingAffiliate] = useState<Affiliate | null>(null);
  const [pixTxReceipt, setPixTxReceipt] = useState('');

  // Filtering clients
  const filteredClients = clientLicenses.filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.document.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  // Filtering affiliates
  const filteredAffiliates = affiliates.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  // Metrics
  const totalClients = clientLicenses.length;
  const activeMonthlyClients = clientLicenses.filter((c) => c.status === 'active_monthly').length;
  const activeLifetimeClients = clientLicenses.filter((c) => c.status === 'active_lifetime').length;
  const trialClients = clientLicenses.filter((c) => c.status === 'trial_active').length;
  const totalRevenue = clientLicenses.reduce((acc, c) => acc + (c.amountPaid || 0), 0);
  const totalPendingCommissions = affiliates.reduce((acc, a) => acc + a.pendingCommission, 0);

  const handleCopyAffiliateLink = (aff: Affiliate) => {
    const link = `https://multitudo.app/?ref=${aff.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLinkAffiliateId(aff.id);
    setTimeout(() => setCopiedLinkAffiliateId(null), 2500);
  };

  const handleOpenExtendModal = (client: ClientLicense) => {
    setSelectedClientForExtend(client);
    setExtendDaysCount(10);
    setExtendNotes('Cliente solicitou prazo temporário adicional para regularização.');
    setIsExtendModalOpen(true);
  };

  const handleConfirmExtend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForExtend) return;
    extendClientDays(selectedClientForExtend.id, Number(extendDaysCount), extendNotes);
    setIsExtendModalOpen(false);
    setSelectedClientForExtend(null);
  };

  const handleSaveAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateForm.name.trim() || !affiliateForm.email.trim()) return;

    addAffiliate({
      name: affiliateForm.name,
      email: affiliateForm.email,
      phone: affiliateForm.phone,
      pixKey: affiliateForm.pixKey || affiliateForm.email,
      pixKeyType: affiliateForm.pixKeyType,
      referralCode: affiliateForm.referralCode || affiliateForm.name.split(' ')[0].toUpperCase() + '2026',
      status: affiliateForm.status,
    });
    setIsAffiliateModalOpen(false);
    setAffiliateForm({
      name: '',
      email: '',
      phone: '',
      pixKey: '',
      pixKeyType: 'email',
      referralCode: '',
      status: 'active',
    });
  };

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.clientName.trim() || !newClientForm.email.trim()) return;

    const today = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(today.getDate() + 10);

    const affiliate = affiliates.find((a) => a.id === newClientForm.affiliateId);

    addClientLicense({
      clientName: newClientForm.clientName,
      companyName: newClientForm.companyName || newClientForm.clientName,
      tradeName: newClientForm.tradeName,
      document: newClientForm.document || '00.000.000/0001-00',
      email: newClientForm.email,
      phone: newClientForm.phone,
      plan: newClientForm.plan,
      status: 'trial_active',
      trialStartDate: today.toISOString().split('T')[0],
      trialEndDate: trialEnd.toISOString().split('T')[0],
      licenseExpiryDate: trialEnd.toISOString().split('T')[0],
      isLifetime: false,
      amountPaid: 0,
      affiliateId: affiliate?.id,
      affiliateCode: affiliate?.referralCode,
      affiliateName: affiliate?.name,
      affiliateCommissionPaid: false,
      affiliateCommissionAmount: 0,
    });

    setIsNewClientModalOpen(false);
    setNewClientForm({
      clientName: '',
      companyName: '',
      tradeName: '',
      document: '',
      email: '',
      phone: '',
      plan: 'trial_10_days',
      affiliateId: '',
    });
  };

  const handleOpenPayCommission = (aff: Affiliate) => {
    setPayingAffiliate(aff);
    setPixTxReceipt('PIX-' + Date.now().toString().slice(-8));
    setIsPayCommissionModalOpen(true);
  };

  const handleConfirmPayCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingAffiliate || payingAffiliate.pendingCommission <= 0) return;
    payAffiliateCommission(payingAffiliate.id, payingAffiliate.pendingCommission, pixTxReceipt);
    setIsPayCommissionModalOpen(false);
    setPayingAffiliate(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Super Admin Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ACESSO EXCLUSIVO SUPER ADMINISTRADOR
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Central de Liberação de Clientes & Afiliados
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Conectado como: <strong>dalmarsousa@gmail.com</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            Acessar ERP Loja
          </button>
          <button
            type="button"
            onClick={superAdminLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair do Super Admin
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Total Clientes</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalClients}</div>
          <div className="text-[10px] text-slate-400 mt-1">{trialClients} em teste de 10 dias</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Plano Mensal (49,90)</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{activeMonthlyClients}</div>
          <div className="text-[10px] text-slate-400 mt-1">Recorrência mensal</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Vitalício (1.699,90)</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700">{activeLifetimeClients}</div>
          <div className="text-[10px] text-slate-400 mt-1">Licenças perpétuas</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Receita Total</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">R$ {totalRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">Arrecadação recebida</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Comissões Pendentes</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-600">R$ {totalPendingCommissions.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-1">A pagar a afiliados</div>
        </div>
      </div>

      {/* Super Admin Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl max-w-xl">
        <button
          type="button"
          onClick={() => setActiveSubTab('clients')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'clients' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Lista de Clientes & Liberação ({clientLicenses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('affiliates')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'affiliates' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Afiliados & Links ({affiliates.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('commissions')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'commissions' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Comissões ({commissionLogs.length})
        </button>
      </div>

      {/* SECTION 1: CLIENTS & LICENSE RELEASE */}
      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por cliente, empresa, CNPJ/CPF ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-transparent outline-hidden font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 outline-hidden"
              >
                <option value="all">Todos os Status</option>
                <option value="trial_active">Período de Teste (10 Dias)</option>
                <option value="active_monthly">Mensalidade Ativa (R$ 49,90)</option>
                <option value="active_lifetime">Vitalício Ativo (R$ 1.699,90)</option>
                <option value="custom_extended">Carência / Dias Extras</option>
                <option value="expired">Acesso Expirado</option>
              </select>

              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Cliente
              </button>
            </div>
          </div>

          {/* Client Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Cliente / Razão Social</th>
                    <th className="p-4">Plano & Status</th>
                    <th className="p-4">Validade / Carência</th>
                    <th className="p-4">Afiliado Indicador</th>
                    <th className="p-4 text-right">Ações de Liberação Exclusiva</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredClients.map((client) => {
                    const isTrial = client.status === 'trial_active';
                    const isMonthly = client.status === 'active_monthly';
                    const isLifetime = client.status === 'active_lifetime';
                    const isExtended = client.status === 'custom_extended';

                    return (
                      <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{client.clientName}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {client.companyName}
                          </div>
                          <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                            Doc: {client.document} • {client.email}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold w-fit ${
                                isLifetime
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : isMonthly
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : isExtended
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {isLifetime && <Award className="w-3 h-3" />}
                              {isMonthly && <Calendar className="w-3 h-3" />}
                              {isTrial && <Clock className="w-3 h-3" />}
                              {isLifetime
                                ? 'VITALÍCIO ATIVO'
                                : isMonthly
                                ? 'MENSAL ATIVO'
                                : isExtended
                                ? 'CARÊNCIA / DIAS EXTRAS'
                                : 'TESTE 10 DIAS'}
                            </span>

                            {client.amountPaid > 0 && (
                              <span className="text-[11px] text-emerald-700 font-bold">
                                Pago: R$ {client.amountPaid.toFixed(2)} ({client.paymentMethod || 'PIX'})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-slate-800">
                            {isLifetime ? 'Acesso Permanente (Vitalício)' : `Até ${new Date(client.licenseExpiryDate).toLocaleDateString('pt-BR')}`}
                          </div>
                          {client.manualDaysGranted ? (
                            <div className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1 border border-blue-100">
                              +{client.manualDaysGranted} dias extras liberados
                            </div>
                          ) : isTrial ? (
                            <div className="text-[10px] text-amber-700">Período de teste inicial</div>
                          ) : null}
                          {client.manualNotes && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5">"{client.manualNotes}"</div>
                          )}
                        </td>

                        <td className="p-4">
                          {client.affiliateCode ? (
                            <div>
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {client.affiliateCode}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-1">{client.affiliateName}</div>
                              {client.affiliateCommissionAmount > 0 && (
                                <div className="text-[10px] text-emerald-600 font-bold">
                                  Comissão gerada: R$ {client.affiliateCommissionAmount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Sem afiliado</span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                            {/* Liberar Mensal */}
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Confirmar liberação do PLANO MENSAL (R$ 49,90) para o cliente "${client.clientName}"?\nSe houver afiliado, a comissão de R$ 49,90 (100%) será gerada.`
                                  )
                                ) {
                                  activateClientLicense(client.id, 'monthly_49_90', 'pix');
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                              title="Liberar Plano Mensal (R$ 49,90)"
                            >
                              Liberar Mensal (R$ 49,90)
                            </button>

                            {/* Liberar Vitalício */}
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Confirmar liberação do PLANO VITALÍCIO (R$ 1.699,90) para o cliente "${client.clientName}"?\nSe houver afiliado, a comissão de 10% (R$ 169,99) será creditada.`
                                  )
                                ) {
                                  activateClientLicense(client.id, 'lifetime_1699_90', 'pix');
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                              title="Liberar Plano Vitalício (R$ 1.699,90)"
                            >
                              Liberar Vitalício (R$ 1.699,90)
                            </button>

                            {/* Liberar Dias Extras / Carência */}
                            <button
                              type="button"
                              onClick={() => handleOpenExtendModal(client)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 font-bold text-[11px] cursor-pointer transition-colors"
                              title="Liberar dias de carência caso o cliente precise de mais tempo"
                            >
                              + Liberar Dias
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AFFILIATES & LINKS */}
      {activeSubTab === 'affiliates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar afiliado por nome, e-mail ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-transparent outline-hidden font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAffiliateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Novo Afiliado
            </button>
          </div>

          {/* Rule banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Percent className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-black text-slate-900">Regras de Comissionamento de Afiliados</div>
              <p className="text-slate-700 mt-0.5">
                • <strong>Plano Mensal (R$ 49,90):</strong> O afiliado ganha <strong>100% da 1ª mensalidade (R$ 49,90)</strong> após o pagamento do cliente.<br />
                • <strong>Plano Vitalício (R$ 1.699,90):</strong> O afiliado ganha <strong>10% do valor vitalício (R$ 169,99)</strong> após o pagamento do cliente.
              </p>
            </div>
          </div>

          {/* Affiliates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAffiliates.map((aff) => {
              const referralLink = `https://multitudo.app/?ref=${aff.referralCode}`;
              const isCopied = copiedLinkAffiliateId === aff.id;

              return (
                <div
                  key={aff.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-black text-slate-900">{aff.name}</h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {aff.email} • <Phone className="w-3 h-3 text-slate-400" /> {aff.phone}
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {aff.status === 'active' ? 'Afiliado Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* PIX Details */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Chave PIX para Pagamento:</span>
                        <span className="font-mono font-bold text-slate-800">{aff.pixKey}</span>
                      </div>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                        {aff.pixKeyType}
                      </span>
                    </div>

                    {/* Unique Referral Link */}
                    <div className="mt-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Link de Indicação Exclusivo:
                      </span>
                      <div className="flex items-center gap-2 bg-indigo-50/70 p-2 rounded-xl border border-indigo-100">
                        <span className="text-xs font-mono text-indigo-900 truncate flex-1 font-semibold">
                          {referralLink}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAffiliateLink(aff)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Copiado!' : 'Copiar Link'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Financial Balance & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Comissão Pendente a Pagar:
                      </div>
                      <div className="text-lg font-black text-emerald-700">
                        R$ {aff.pendingCommission.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Total Ganho: R$ {aff.totalCommissionEarned.toFixed(2)} • Pago: R$ {aff.totalCommissionPaid.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={aff.pendingCommission <= 0}
                      onClick={() => handleOpenPayCommission(aff)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        aff.pendingCommission > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Pagar PIX
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: COMMISSION LOGS */}
      {activeSubTab === 'commissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Extrato de Comissões e Pagamentos de Afiliados</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                <tr>
                  <th className="p-4">Afiliado</th>
                  <th className="p-4">Cliente Indicado</th>
                  <th className="p-4">Plano / Venda</th>
                  <th className="p-4">Regra de Comissão</th>
                  <th className="p-4">Valor da Comissão</th>
                  <th className="p-4">Status & Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {commissionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                      Nenhum registro de comissão gerado ainda.
                    </td>
                  </tr>
                ) : (
                  commissionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-bold text-slate-900">{log.affiliateName}</td>
                      <td className="p-4">{log.clientName}</td>
                      <td className="p-4">
                        <span className="font-bold">
                          {log.planType === 'lifetime_1699_90' ? 'Vitalício (R$ 1.699,90)' : 'Mensal (R$ 49,90)'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {log.commissionRule === '1st_month_100_percent'
                          ? '100% da 1ª Mensalidade'
                          : '10% do Plano Vitalício'}
                      </td>
                      <td className="p-4 font-black text-emerald-700 text-sm">
                        R$ {log.commissionAmount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {log.status === 'paid' ? 'Pago via PIX' : 'Pendente de Repasse'}
                        </span>
                        {log.pixTransactionId && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ID: {log.pixTransactionId}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXTEND DAYS MODAL */}
      {isExtendModalOpen && selectedClientForExtend && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Gift className="w-5 h-5 text-blue-600" />
              Liberar Dias Extras / Carência
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cliente: <strong>{selectedClientForExtend.clientName}</strong> ({selectedClientForExtend.companyName})
            </p>

            <form onSubmit={handleConfirmExtend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantidade de Dias a Adicionar:
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setExtendDaysCount(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        extendDaysCount === d
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      +{d} dias
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={extendDaysCount}
                  onChange={(e) => setExtendDaysCount(Number(e.target.value))}
                  className="mt-2 w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Observação da Liberação:
                </label>
                <textarea
                  rows={2}
                  value={extendNotes}
                  onChange={(e) => setExtendNotes(e.target.value)}
                  placeholder="Ex: Cliente sem fundos no momento, prazo de 10 dias concedido."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExtendModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Confirmar Liberação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW AFFILIATE MODAL */}
      {isAffiliateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Cadastrar Novo Afiliado Parceiro
            </h3>

            <form onSubmit={handleSaveAffiliate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo do Afiliado*</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={affiliateForm.name}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail*</label>
                  <input
                    type="email"
                    required
                    placeholder="afiliado@email.com"
                    value={affiliateForm.email}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-7777"
                    value={affiliateForm.phone}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chave PIX para Comissões*</label>
                  <input
                    type="text"
                    required
                    placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                    value={affiliateForm.pixKey}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, pixKey: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Chave</label>
                  <select
                    value={affiliateForm.pixKeyType}
                    onChange={(e) => setAffiliateForm({ ...affiliateForm, pixKeyType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white outline-hidden focus:border-amber-500"
                  >
                    <option value="email">E-mail</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Aleatória</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de Indicação Personalizado
                </label>
                <input
                  type="text"
                  placeholder="Ex: JOAO2026 (Deixe em branco para gerar automático)"
                  value={affiliateForm.referralCode}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, referralCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl uppercase font-mono font-bold outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAffiliateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Afiliado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CLIENT TRIAL MODAL */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Cadastrar Novo Cliente (10 Dias Grátis)
            </h3>

            <form onSubmit={handleSaveNewClient} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Responsável*</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={newClientForm.clientName}
                  onChange={(e) => setNewClientForm({ ...newClientForm, clientName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Empresa / Razão Social</label>
                  <input
                    type="text"
                    placeholder="Empresa LTDA"
                    value={newClientForm.companyName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={newClientForm.document}
                    onChange={(e) => setNewClientForm({ ...newClientForm, document: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail*</label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@email.com"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-0000"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Afiliado Indicador (Opcional)</label>
                <select
                  value={newClientForm.affiliateId}
                  onChange={(e) => setNewClientForm({ ...newClientForm, affiliateId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white outline-hidden focus:border-amber-500"
                >
                  <option value="">Nenhum (Cliente Direto)</option>
                  {affiliates.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.referralCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md cursor-pointer"
                >
                  Iniciar Teste de 10 Dias
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY COMMISSION MODAL */}
      {isPayCommissionModalOpen && payingAffiliate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Confirmar Pagamento de Comissão PIX
            </h3>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 my-3">
              <div>Afiliado: <strong>{payingAffiliate.name}</strong></div>
              <div>Chave PIX: <strong className="font-mono">{payingAffiliate.pixKey}</strong> ({payingAffiliate.pixKeyType})</div>
              <div className="text-base font-black text-emerald-800 mt-1">
                Valor do Repasse: R$ {payingAffiliate.pendingCommission.toFixed(2)}
              </div>
            </div>

            <form onSubmit={handleConfirmPayCommission} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ID / Código da Transação PIX (Comprovante):
                </label>
                <input
                  type="text"
                  required
                  value={pixTxReceipt}
                  onChange={(e) => setPixTxReceipt(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayCommissionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Confirmar Repasse PIX
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
