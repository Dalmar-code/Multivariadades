import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Store,
  CreditCard,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreBranch, PDVRegister } from '../../types';
import { BackButton } from '../common/BackButton';
import {
  fetchAddressByCep,
  searchCepByAddress,
  formatCep,
  cleanCep,
  AddressData,
} from '../../utils/cepAddressService';
import { CepAddressSearchModal } from '../common/CepAddressSearchModal';

export const BranchManager: React.FC = () => {
  const {
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
    pdvRegisters,
    addPDVRegister,
    updatePDVRegister,
    deletePDVRegister,
    users,
    currentBranchId,
    setCurrentBranchId,
    company,
    setActiveTab,
  } = useStore();

  const [search, setSearch] = useState('');
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<StoreBranch | null>(null);

  const [isPdvModalOpen, setIsPdvModalOpen] = useState(false);
  const [editingPdv, setEditingPdv] = useState<PDVRegister | null>(null);
  const [pdvTargetBranchId, setPdvTargetBranchId] = useState<string>('');

  // Form states for Branch
  const [branchCep, setBranchCep] = useState('');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isCepModalOpen, setIsCepModalOpen] = useState(false);

  const [branchForm, setBranchForm] = useState({
    storeNumber: '',
    name: '',
    tradeName: '',
    cnpj: '',
    stateRegistration: '',
    phone: '',
    email: '',
    address: '',
    city: 'São Paulo',
    state: 'SP',
    isHeadquarter: false,
    active: true,
  });

  // CEP handling for Branch
  const handleBranchCepChange = async (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? raw.replace(/^(\d{5})(\d{1,3})/, '$1-$2') : raw;
    setBranchCep(formatted);

    if (raw.length === 8) {
      await lookupBranchAddressByCep(raw);
    }
  };

  const lookupBranchAddressByCep = async (cepToQuery?: string) => {
    const target = cepToQuery || branchCep;
    const clean = cleanCep(target);
    if (clean.length !== 8) {
      setCepFeedback({ type: 'error', message: 'Digite os 8 dígitos do CEP para buscar o endereço.' });
      return;
    }

    setIsSearchingCep(true);
    setCepFeedback(null);
    try {
      const data = await fetchAddressByCep(clean);
      if (data) {
        setBranchCep(data.cep || formatCep(clean));
        setBranchForm((prev) => ({
          ...prev,
          address: data.street ? `${data.street}${data.neighborhood ? ` - ${data.neighborhood}` : ''}` : prev.address,
          city: data.city || prev.city,
          state: data.state || prev.state,
        }));
        setCepFeedback({ type: 'success', message: 'Endereço preenchido automaticamente pelos Correios!' });
        setTimeout(() => setCepFeedback(null), 4000);
      } else {
        setCepFeedback({ type: 'error', message: 'CEP não encontrado na base oficial dos Correios.' });
      }
    } catch {
      setCepFeedback({ type: 'error', message: 'Erro ao consultar CEP.' });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSearchBranchCepFromAddress = async () => {
    if (!branchForm.address || branchForm.address.trim().length < 3) {
      setIsCepModalOpen(true);
      return;
    }

    setIsSearchingAddress(true);
    setCepFeedback(null);
    try {
      const results = await searchCepByAddress(branchForm.state || 'SP', branchForm.city || 'São Paulo', branchForm.address);
      if (results.length === 1) {
        const found = results[0];
        setBranchCep(found.cep);
        setBranchForm((prev) => ({
          ...prev,
          address: found.street ? `${found.street}${found.neighborhood ? ` - ${found.neighborhood}` : ''}` : prev.address,
          city: found.city || prev.city,
          state: found.state || prev.state,
        }));
        setCepFeedback({ type: 'success', message: `CEP ${found.cep} identificado com sucesso!` });
        setTimeout(() => setCepFeedback(null), 4000);
      } else {
        setIsCepModalOpen(true);
      }
    } catch {
      setIsCepModalOpen(true);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectAddressForBranch = (addr: AddressData) => {
    setBranchCep(addr.cep);
    setBranchForm((prev) => ({
      ...prev,
      address: addr.street ? `${addr.street}${addr.neighborhood ? ` - ${addr.neighborhood}` : ''}` : prev.address,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
    }));
    setCepFeedback({ type: 'success', message: `CEP ${addr.cep} selecionado com sucesso!` });
    setTimeout(() => setCepFeedback(null), 4000);
  };

  // Form states for PDV
  const [pdvForm, setPdvForm] = useState({
    code: '',
    name: '',
    location: '',
    printerModel: 'Térmica 80mm ESC/POS Padrão',
    assignedUserId: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  });

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.storeNumber.includes(search) ||
      b.cnpj.includes(search) ||
      b.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenBranchModal = (branch?: StoreBranch) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        storeNumber: branch.storeNumber,
        name: branch.name,
        tradeName: branch.tradeName || '',
        cnpj: branch.cnpj,
        stateRegistration: branch.stateRegistration,
        phone: branch.phone,
        email: branch.email || '',
        address: branch.address,
        city: branch.city,
        state: branch.state,
        isHeadquarter: branch.isHeadquarter,
        active: branch.active,
      });
    } else {
      setEditingBranch(null);
      const nextNum = (branches.length + 1).toString().padStart(3, '0');
      setBranchForm({
        storeNumber: nextNum,
        name: `Loja ${nextNum} - Nova Filial`,
        tradeName: '',
        cnpj: '',
        stateRegistration: '',
        phone: '',
        email: '',
        address: '',
        city: 'São Paulo',
        state: 'SP',
        isHeadquarter: branches.length === 0,
        active: true,
      });
    }
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.storeNumber.trim() || !branchForm.name.trim()) return;

    if (editingBranch) {
      updateBranch(editingBranch.id, branchForm);
    } else {
      addBranch(branchForm);
    }
    setIsBranchModalOpen(false);
  };

  const handleOpenPdvModal = (branchId: string, pdv?: PDVRegister) => {
    setPdvTargetBranchId(branchId);
    if (pdv) {
      setEditingPdv(pdv);
      setPdvForm({
        code: pdv.code,
        name: pdv.name,
        location: pdv.location || '',
        printerModel: pdv.printerModel || 'Térmica 80mm ESC/POS Padrão',
        assignedUserId: pdv.assignedUserId || '',
        status: pdv.status,
      });
    } else {
      setEditingPdv(null);
      const branchPdvs = pdvRegisters.filter((p) => p.branchId === branchId);
      const nextCode = `CX-${(branchPdvs.length + 1).toString().padStart(2, '0')}`;
      setPdvForm({
        code: nextCode,
        name: `Caixa ${(branchPdvs.length + 1).toString().padStart(2, '0')} - Balcão`,
        location: 'Frente de Caixa',
        printerModel: 'Térmica 80mm - Epson / Bematech',
        assignedUserId: '',
        status: 'active',
      });
    }
    setIsPdvModalOpen(true);
  };

  const handleSavePdv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdvForm.code.trim() || !pdvForm.name.trim() || !pdvTargetBranchId) return;

    const branch = branches.find((b) => b.id === pdvTargetBranchId);
    const assignedUser = users.find((u) => u.id === pdvForm.assignedUserId);

    if (editingPdv) {
      updatePDVRegister(editingPdv.id, {
        ...pdvForm,
        branchId: pdvTargetBranchId,
        branchStoreNumber: branch?.storeNumber,
        branchName: branch?.name,
        assignedUserName: assignedUser?.name,
      });
    } else {
      addPDVRegister({
        ...pdvForm,
        branchId: pdvTargetBranchId,
        branchStoreNumber: branch?.storeNumber,
        branchName: branch?.name,
        assignedUserName: assignedUser?.name,
      });
    }
    setIsPdvModalOpen(false);
  };

  // Identify primary store (Matriz / Loja 001) linked to the registered company
  const mainBranch =
    branches.find((b) => b.isHeadquarter || b.id === 'branch_matriz' || b.storeNumber === '001') || {
      id: 'branch_matriz',
      storeNumber: '001',
      name: (company.tradeName || company.corporateName)
        ? `Loja 001 - ${company.tradeName || company.corporateName}`
        : 'Loja 001 - Matriz',
      tradeName: company.tradeName || company.corporateName || 'Matriz',
      cnpj: company.cnpj || '',
      stateRegistration: company.stateRegistration || 'ISENTO',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address?.street
        ? `${company.address.street}, ${company.address.number || 'S/N'}${company.address.neighborhood ? ' - ' + company.address.neighborhood : ''}`
        : 'Endereço Principal',
      city: company.address?.city || 'São Paulo',
      state: company.address?.state || 'SP',
      isHeadquarter: true,
      active: true,
      createdAt: new Date().toISOString(),
    };

  // Caixas PDV pertencentes à Loja Principal / Empresa Cadastrada
  const mainStorePdvs = pdvRegisters.filter(
    (p) => !p.branchId || p.branchId === mainBranch.id || p.branchStoreNumber === '001' || p.branchId === 'branch_matriz'
  );
  const mainStoreUsers = users.filter((u) => !u.branchId || u.branchId === mainBranch.id);

  // Filiais Secundárias: Não trazer a empresa cadastrada aqui!
  const secondaryBranches = branches.filter(
    (b) => !b.isHeadquarter && b.id !== 'branch_matriz' && b.storeNumber !== '001' && b.id !== mainBranch.id
  );

  const filteredSecondaryBranches = secondaryBranches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.storeNumber.includes(search) ||
      (b.cnpj && b.cnpj.includes(search)) ||
      (b.city && b.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Lojas & Terminais PDV
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Dados da empresa cadastrada, caixas PDVs da matriz e filiais adicionais
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <BackButton variant="light" label="Voltar ao Menu" className="px-3.5 py-2.5 text-xs sm:text-sm" />
          <button
            type="button"
            id="btn-add-branch"
            onClick={() => handleOpenBranchModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Nova Filial
          </button>
        </div>
      </div>

      {/* SEÇÃO 1: LOJA PRINCIPAL (EMPRESA CADASTRADA) */}
      <div className="bg-white rounded-3xl border-2 border-amber-400/40 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex flex-col items-center justify-center font-black shrink-0 shadow-md">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">LOJA</span>
              <span className="text-xl leading-none text-white font-mono">001</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {company.tradeName || company.corporateName || 'Loja Principal (Matriz)'}
                </h2>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 shadow-xs">
                  Empresa Cadastrada (Matriz)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Loja Ativa
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Razão Social: <strong>{company.corporateName || company.tradeName || 'Não informada'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              type="button"
              id="btn-edit-company-data"
              onClick={() => setActiveTab('empresa')}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              Editar Dados da Empresa
            </button>
            <button
              type="button"
              id="btn-add-pdv-main-store"
              onClick={() => handleOpenPdvModal(mainBranch.id)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              + Cadastrar Caixa PDV
            </button>
          </div>
        </div>

        {/* Company Details Strip */}
        <div className="p-6 bg-slate-50/60 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CNPJ da Loja</span>
              <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">
                {company.cnpj || 'Não cadastrado'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inscrição Estadual</span>
              <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">
                {company.stateRegistration || 'ISENTO'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contato & E-mail</span>
              <span className="text-xs font-bold text-slate-800 truncate mt-0.5 block" title={company.email}>
                {company.phone || company.whatsapp || 'Sem telefone'} • {company.email || 'Sem e-mail'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endereço da Sede</span>
              <span className="text-xs font-semibold text-slate-700 line-clamp-2 mt-0.5 block">
                {company.address?.street
                  ? `${company.address.street}, ${company.address.number || 'S/N'}${company.address.neighborhood ? ' - ' + company.address.neighborhood : ''}, ${company.address.city || 'São Paulo'} - ${company.address.state || 'SP'}`
                  : 'Endereço Principal não cadastrado'}
              </span>
            </div>
          </div>
        </div>

        {/* PDVs of the Main Store */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                Caixas PDVs Vinculados à Empresa / Loja Principal ({mainStorePdvs.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Terminais de frente de caixa autorizados para vendas, cupons fiscais e sangrias na loja principal
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenPdvModal(mainBranch.id)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar outro caixa
            </button>
          </div>

          {mainStorePdvs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-amber-50/50 border-2 border-dashed border-amber-300 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Nenhum Caixa PDV Cadastrado</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Para emitir vendas e operar a frente de loja, cadastre ao menos um terminal de caixa (ex: Caixa 01).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPdvModal(mainBranch.id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm cursor-pointer"
              >
                + Cadastrar Primeiro Caixa PDV
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {mainStorePdvs.map((pdv) => (
                <div
                  key={pdv.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400/80 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400">
                        {pdv.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          pdv.status === 'active'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {pdv.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-2.5">{pdv.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {pdv.location || 'Frente de Caixa'}
                    </p>

                    {pdv.assignedUserName && (
                      <div className="mt-2.5 text-xs text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Operador: <strong>{pdv.assignedUserName}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 truncate max-w-[140px] text-[11px]" title={pdv.printerModel}>
                      {pdv.printerModel || 'Térmica Padrão'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenPdvModal(mainBranch.id, pdv)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar Caixa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente remover o caixa "${pdv.name}"?`)) {
                            deletePDVRegister(pdv.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Excluir Caixa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users linked to main store */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Colaboradores da Loja Principal ({mainStoreUsers.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mainStoreUsers.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Nenhum operador vinculado exclusivamente.</span>
              ) : (
                mainStoreUsers.map((u) => (
                  <span
                    key={u.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {u.name} ({u.role === 'cashier' ? 'Caixa' : u.role === 'seller' ? 'Vendedor' : 'Admin'})
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: FILIAIS SECUNDÁRIAS (OUTRAS LOJAS DA REDE) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Filiais Secundárias (Outras Unidades da Rede)
            </h2>
            <p className="text-xs text-slate-500">
              Lojas secundárias e quiosques (Loja 002, Loja 003...) — A empresa cadastrada não é listada aqui para evitar duplicidade.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenBranchModal()}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Cadastrar Filial
          </button>
        </div>

        {/* Security Rule Card */}
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs leading-relaxed">
            <div className="font-bold text-indigo-950 flex items-center gap-2">
              <span>Isolamento Fiscal e Operacional por Filial</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-950 font-extrabold text-[10px]">
                CONFORMIDADE
              </span>
            </div>
            <p className="mt-0.5 text-indigo-800">
              Cada filial possui seu <strong>Número de Loja único</strong> e caixas próprios. Operadores vinculados a uma filial não misturam movimentações fiscais nem troco com outras filiais.
            </p>
          </div>
        </div>

        {/* Search Bar if secondary branches exist */}
        {secondaryBranches.length > 0 && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Buscar filiais por nome, número de loja (ex: 002), CNPJ ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>
        )}

        {/* Secondary Branches List */}
        {filteredSecondaryBranches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nenhuma Filial Secundária Cadastrada</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Todas as operações de caixa e vendas estão concentradas na <strong>Loja Principal (Empresa Cadastrada)</strong> acima.
                Caso sua empresa abra novas lojas ou pontos de venda, cadastre-os aqui.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenBranchModal()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Filial (Loja 002)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSecondaryBranches.map((branch) => {
              const branchPdvs = pdvRegisters.filter((p) => p.branchId === branch.id);
              const branchUsers = users.filter((u) => u.branchId === branch.id);
              const isSelected = currentBranchId === branch.id;

              return (
                <div
                  key={branch.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs ${
                    isSelected ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                  }`}
                >
                  {/* Branch Header */}
                  <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-indigo-400 flex flex-col items-center justify-center font-black shrink-0 shadow-md">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">LOJA</span>
                        <span className="text-base leading-none text-white font-mono">{branch.storeNumber}</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900">{branch.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              branch.active
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {branch.active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="font-mono">CNPJ: {branch.cnpj || 'Não informado'}</span>
                          <span>•</span>
                          <span className="font-mono">IE: {branch.stateRegistration || 'Isento'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {branch.address}, {branch.city} - {branch.state}
                          </span>
                          {branch.phone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {branch.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenPdvModal(branch.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Caixa PDV
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenBranchModal(branch)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="Editar Filial"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente remover a filial "${branch.name}"?`)) {
                            deleteBranch(branch.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Filial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Branch Content: PDVs & Users */}
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                          Terminais de Caixa PDV desta Filial ({branchPdvs.length})
                        </h4>
                      </div>

                      {branchPdvs.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                          Nenhum terminal de caixa cadastrado para esta filial. Clique em "Adicionar Caixa PDV".
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {branchPdvs.map((pdv) => (
                            <div
                              key={pdv.id}
                              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                    {pdv.code}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      pdv.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {pdv.status === 'active' ? 'Ativo' : 'Inativo'}
                                  </span>
                                </div>

                                <h5 className="font-bold text-sm text-slate-900 mt-2">{pdv.name}</h5>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {pdv.location || 'Frente de Caixa'}
                                </p>

                                {pdv.assignedUserName && (
                                  <div className="mt-2 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1">
                                    <Users className="w-3 h-3 text-indigo-500" />
                                    <span>Operador: <strong>{pdv.assignedUserName}</strong></span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px]">
                                <span className="text-slate-400 truncate max-w-[140px]" title={pdv.printerModel}>
                                  {pdv.printerModel || 'Térmica Padrão'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPdvModal(branch.id, pdv)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                                    title="Editar Caixa"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Remover caixa "${pdv.name}"?`)) {
                                        deletePDVRegister(pdv.id);
                                      }
                                    }}
                                    className="p-1 text-rose-400 hover:text-rose-700 rounded hover:bg-rose-50"
                                    title="Excluir Caixa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Users assigned to this branch */}
                    <div className="pt-2">
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Colaboradores Vinculados a esta Loja ({branchUsers.length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {branchUsers.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Nenhum operador vinculado diretamente.</span>
                        ) : (
                          branchUsers.map((u) => (
                            <span
                              key={u.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {u.name} ({u.role === 'cashier' ? 'Caixa' : u.role === 'seller' ? 'Vendedor' : 'Admin'})
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              {editingBranch ? 'Editar Dados da Filial' : 'Cadastrar Nova Filial / Loja'}
            </h3>

            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nº da Loja (Segurança)*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="001, 002..."
                    value={branchForm.storeNumber}
                    onChange={(e) => setBranchForm({ ...branchForm, storeNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:border-amber-500 outline-hidden font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome de Identificação da Loja*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Loja 02 - Shopping Norte"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ da Filial</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0002-00"
                    value={branchForm.cnpj}
                    onChange={(e) => setBranchForm({ ...branchForm, cnpj: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    placeholder="123.456.789.000"
                    value={branchForm.stateRegistration}
                    onChange={(e) => setBranchForm({ ...branchForm, stateRegistration: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone da Loja</label>
                  <input
                    type="text"
                    placeholder="(11) 3456-7890"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail da Filial</label>
                  <input
                    type="email"
                    placeholder="filial@empresa.com.br"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Endereço da Filial com CEP inteligente */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Endereço da Filial
                  </label>
                  <button
                    type="button"
                    onClick={handleSearchBranchCepFromAddress}
                    disabled={isSearchingAddress}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200"
                  >
                    {isSearchingAddress ? (
                      <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-600" />
                    )}
                    <span>Buscar CEP por Rua</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">CEP</label>
                      <button
                        type="button"
                        onClick={() => lookupBranchAddressByCep()}
                        disabled={isSearchingCep}
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        {isSearchingCep ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        <span>Buscar</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="00000-000"
                        value={branchCep}
                        onChange={(e) => handleBranchCepChange(e.target.value)}
                        onBlur={() => {
                          if (cleanCep(branchCep).length === 8 && !branchForm.address) {
                            lookupBranchAddressByCep();
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:border-amber-500 outline-hidden"
                      />
                      {isSearchingCep && (
                        <div className="absolute right-2.5 top-2.5 text-amber-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Logradouro / Rua e Bairro</label>
                    <input
                      type="text"
                      placeholder="Ex: Avenida Paulista, 1000 - Bela Vista"
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      onBlur={() => {
                        if (!branchCep && branchForm.address.trim().length >= 3 && branchForm.city && branchForm.state) {
                          handleSearchBranchCepFromAddress();
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-amber-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={branchForm.city}
                      onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={branchForm.state}
                      onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl uppercase font-mono focus:border-amber-500 outline-hidden font-bold"
                    />
                  </div>
                </div>

                {cepFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      cepFeedback.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {cepFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{cepFeedback.message}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branchForm.active}
                    onChange={(e) => setBranchForm({ ...branchForm, active: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  Filial Ativa
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branchForm.isHeadquarter}
                    onChange={(e) => setBranchForm({ ...branchForm, isHeadquarter: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  Definir como Matriz Principal
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Filial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDV Modal */}
      {isPdvModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              {editingPdv ? 'Editar Terminal PDV' : 'Novo Terminal de Caixa PDV'}
            </h3>

            <form onSubmit={handleSavePdv} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código PDV*</label>
                  <input
                    type="text"
                    required
                    placeholder="CX-01"
                    value={pdvForm.code}
                    onChange={(e) => setPdvForm({ ...pdvForm, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono uppercase focus:border-emerald-500 outline-hidden font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Caixa*</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Caixa 01 - Balcão Principal"
                    value={pdvForm.name}
                    onChange={(e) => setPdvForm({ ...pdvForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Localização no Estabelecimento</label>
                <input
                  type="text"
                  placeholder="Ex: Frente de Loja / Posição 01"
                  value={pdvForm.location}
                  onChange={(e) => setPdvForm({ ...pdvForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modelo de Impressora Térmica</label>
                <input
                  type="text"
                  placeholder="Ex: Térmica 80mm - Epson TM-T20X (ESC/POS)"
                  value={pdvForm.printerModel}
                  onChange={(e) => setPdvForm({ ...pdvForm, printerModel: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operador Preferencial / Padrão</label>
                <select
                  value={pdvForm.assignedUserId}
                  onChange={(e) => setPdvForm({ ...pdvForm, assignedUserId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 outline-hidden bg-white"
                >
                  <option value="">Nenhum operador fixo (Qualquer operador desta filial)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === 'cashier' ? 'Operador de Caixa' : u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPdvModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Busca de CEP por Nome da Rua para Filiais */}
      <CepAddressSearchModal
        isOpen={isCepModalOpen}
        onClose={() => setIsCepModalOpen(false)}
        onSelectAddress={handleSelectAddressForBranch}
        initialStreet={branchForm.address}
        initialCity={branchForm.city || 'São Paulo'}
        initialState={branchForm.state || 'SP'}
      />
    </div>
  );
};
