import React, { useState, useRef } from 'react';
import {
  Building2,
  CheckCircle2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Palette,
  RefreshCw,
  Trash2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle,
  Search,
  Loader2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CompanyProfile, RetailNicheId } from '../../types';
import { RETAIL_NICHES } from '../../utils/retailNiches';
import {
  Pill,
  ShoppingBag,
  Shirt,
  Dog,
  Car,
  Hammer,
  Smartphone,
  Utensils,
  Eye,
  Store,
  CalendarCheck,
  Clock,
  Layers,
} from 'lucide-react';
import {
  extractColorsFromImage,
  PRESET_THEMES,
  applyThemeColors,
} from '../../utils/colorExtractor';
import {
  fetchAddressByCep,
  searchCepByAddress,
  formatCep,
  cleanCep,
  AddressData,
} from '../../utils/cepAddressService';
import { CepAddressSearchModal } from '../common/CepAddressSearchModal';

export const CompanyOnboarding: React.FC = () => {
  const {
    company,
    currentUser,
    completeCompanySetup,
    loadDemoData,
  } = useStore();

  const [corporateName, setCorporateName] = useState(company.corporateName || '');
  const [tradeName, setTradeName] = useState(company.tradeName || '');
  const [niche, setNiche] = useState<RetailNicheId>(company.niche || 'farmacia');
  const [cnpj, setCnpj] = useState(company.cnpj || '');
  const [stateRegistration, setStateRegistration] = useState(company.stateRegistration || '');
  const [municipalRegistration, setMunicipalRegistration] = useState(company.municipalRegistration || '');
  const [crt, setCrt] = useState<'1' | '2' | '3'>(company.crt || '1');
  const [taxRegimeName, setTaxRegimeName] = useState(company.taxRegimeName || 'Simples Nacional (ME/EPP - Anexo I Comércio)');
  const [aliquotaSimples, setAliquotaSimples] = useState<number>(company.aliquotaSimples || 4.0);
  const [email, setEmail] = useState(company.email || currentUser?.email || '');
  const [phone, setPhone] = useState(company.phone || '');
  const [whatsapp, setWhatsapp] = useState(company.whatsapp || '');

  // Address
  const [street, setStreet] = useState(company.address?.street || '');
  const [number, setNumber] = useState(company.address?.number || '');
  const [complement, setComplement] = useState(company.address?.complement || '');
  const [neighborhood, setNeighborhood] = useState(company.address?.neighborhood || '');
  const [city, setCity] = useState(company.address?.city || '');
  const [state, setState] = useState(company.address?.state || 'SP');
  const [cep, setCep] = useState(company.address?.cep || '');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isCepModalOpen, setIsCepModalOpen] = useState(false);

  // Logo & Theme Colors
  const [logoUrl, setLogoUrl] = useState(company.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(company.primaryColor || '#f59e0b');
  const [secondaryColor, setSecondaryColor] = useState(company.secondaryColor || '#0f172a');
  const [accentColor, setAccentColor] = useState(company.accentColor || '#d97706');
  const [detectedPalette, setDetectedPalette] = useState<string[]>([]);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (company) {
      if (company.corporateName) setCorporateName(company.corporateName);
      if (company.tradeName) setTradeName(company.tradeName);
      if (company.niche) setNiche(company.niche);
      if (company.cnpj) setCnpj(company.cnpj);
      if (company.email) setEmail(company.email);
      if (company.phone) setPhone(company.phone);
      if (company.whatsapp) setWhatsapp(company.whatsapp);
      if (company.address?.street) setStreet(company.address.street);
      if (company.address?.number) setNumber(company.address.number);
      if (company.address?.neighborhood) setNeighborhood(company.address.neighborhood);
      if (company.address?.city) setCity(company.address.city);
      if (company.address?.state) setState(company.address.state);
      if (company.address?.cep) setCep(company.address.cep);
    }
  }, [company]);

  // Format CNPJ as user types
  const handleCnpjChange = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 14);
    let formatted = raw;
    if (raw.length > 12) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    } else if (raw.length > 8) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    } else if (raw.length > 5) {
      formatted = raw.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (raw.length > 2) {
      formatted = raw.replace(/^(\d{2})(\d{1,3})/, '$1.$2');
    }
    setCnpj(formatted);
  };

  // Format and Auto-Lookup CEP
  const handleCepChange = async (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? raw.replace(/^(\d{5})(\d{1,3})/, '$1-$2') : raw;
    setCep(formatted);

    // If 8 digits completed, auto-trigger lookup
    if (raw.length === 8) {
      await lookupAddressByCep(raw);
    }
  };

  const lookupAddressByCep = async (cepToQuery?: string) => {
    const target = cepToQuery || cep;
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
        if (data.street) setStreet(data.street);
        if (data.neighborhood) setNeighborhood(data.neighborhood);
        if (data.city) setCity(data.city);
        if (data.state) setState(data.state);
        setCep(data.cep || formatCep(clean));
        setCepFeedback({ type: 'success', message: 'Endereço preenchido automaticamente pelos Correios!' });
        setTimeout(() => setCepFeedback(null), 4000);
      } else {
        setCepFeedback({ type: 'error', message: 'CEP não encontrado na base oficial dos Correios.' });
      }
    } catch {
      setCepFeedback({ type: 'error', message: 'Erro ao consultar CEP. Tente novamente.' });
    } finally {
      setIsSearchingCep(false);
    }
  };

  // Search CEP using the entered Street, City, and State
  const handleSearchCepFromAddress = async () => {
    if (!street || street.trim().length < 3) {
      setIsCepModalOpen(true);
      return;
    }

    setIsSearchingAddress(true);
    setCepFeedback(null);
    try {
      const results = await searchCepByAddress(state || 'SP', city || 'São Paulo', street);
      if (results.length === 1) {
        // Exactly one matching address
        const found = results[0];
        setCep(found.cep);
        if (found.neighborhood) setNeighborhood(found.neighborhood);
        if (found.city) setCity(found.city);
        if (found.state) setState(found.state);
        setCepFeedback({ type: 'success', message: `CEP ${found.cep} identificado e preenchido com sucesso!` });
        setTimeout(() => setCepFeedback(null), 4000);
      } else if (results.length > 1) {
        // Multiple matches, open picker modal
        setIsCepModalOpen(true);
      } else {
        // No direct match, open modal for refined search
        setIsCepModalOpen(true);
      }
    } catch {
      setIsCepModalOpen(true);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleSelectAddressFromModal = (addr: AddressData) => {
    setCep(addr.cep);
    if (addr.street) setStreet(addr.street);
    if (addr.neighborhood) setNeighborhood(addr.neighborhood);
    if (addr.city) setCity(addr.city);
    if (addr.state) setState(addr.state);
    setCepFeedback({ type: 'success', message: `CEP ${addr.cep} e endereço selecionados com sucesso!` });
    setTimeout(() => setCepFeedback(null), 4000);
  };

  // Handle Logo Upload File
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        await autoDetectColors(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const autoDetectColors = async (imageSrc: string) => {
    if (!imageSrc) return;
    setIsExtractingColors(true);
    try {
      const extracted = await extractColorsFromImage(imageSrc);
      setPrimaryColor(extracted.primary);
      setSecondaryColor(extracted.secondary);
      setAccentColor(extracted.accent);
      setDetectedPalette(extracted.palette);
      applyThemeColors(extracted.primary, extracted.secondary, extracted.accent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtractingColors(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
    applyThemeColors(preset.primary, preset.secondary, preset.accent);
  };

  const handleFillExampleData = () => {
    setCorporateName('MINHA NOVA EMPRESA COMERCIO E VAREJO LTDA');
    setTradeName('MINHA LOJA DE VARIEDADES');
    setCnpj('12.345.678/0001-90');
    setStateRegistration('123.456.789.000');
    setMunicipalRegistration('876543-1');
    setEmail(currentUser?.email || 'contato@minhaloja.com.br');
    setPhone('(11) 3322-1100');
    setWhatsapp('(11) 99887-7665');
    setCep('01310-200');
    setStreet('Avenida Paulista');
    setNumber('1000');
    setComplement('Conjunto 101');
    setNeighborhood('Bela Vista');
    setCity('São Paulo');
    setState('SP');
    setTaxRegimeName('Simples Nacional (ME/EPP)');
    setAliquotaSimples(4.0);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!tradeName.trim()) {
      setErrorMessage('Por favor, informe o Nome Fantasia da empresa.');
      return;
    }
    if (!corporateName.trim()) {
      setErrorMessage('Por favor, informe a Razão Social da empresa.');
      return;
    }
    if (!cnpj.trim() || cnpj.length < 14) {
      setErrorMessage('Por favor, informe um CNPJ válido.');
      return;
    }

    setIsSaving(true);

    const updatedData: Partial<CompanyProfile> = {
      corporateName: corporateName.trim(),
      tradeName: tradeName.trim(),
      niche,
      cnpj: cnpj.trim(),
      stateRegistration: stateRegistration.trim() || 'ISENTO',
      municipalRegistration: municipalRegistration.trim(),
      crt,
      taxRegimeName:
        crt === '1'
          ? 'Simples Nacional (ME/EPP)'
          : crt === '2'
          ? 'Simples Nacional - Excesso de Sublimite'
          : 'Regime Normal (Lucro Presumido / Real)',
      aliquotaSimples: Number(aliquotaSimples) || 4.0,
      email: email.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      address: {
        cep: cep.trim() || '00000-000',
        street: street.trim() || 'Rua Principal',
        number: number.trim() || 'S/N',
        complement: complement.trim(),
        neighborhood: neighborhood.trim() || 'Centro',
        city: city.trim() || 'São Paulo',
        state: state.trim() || 'SP',
      },
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      isConfigured: true,
    };

    setTimeout(() => {
      completeCompanySetup(updatedData);
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-4xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Welcome Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Etapa Obrigatória • Configuração Inicial do Sistema
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Cadastro da Empresa & Identidade Visual
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Olá, <strong className="text-amber-400">{currentUser?.name || 'Administrador'}</strong>! O sistema foi iniciado em branco. Preencha os dados da sua empresa abaixo para liberar o acesso a todos os menus (PDV, Vendas, Produtos, Clientes, Fiscal e Financeiro).
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-black text-lg">
              1
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Passo 1 de 1: Identificação Comercial & Fiscal
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Os menus do sistema serão liberados assim que salvar este cadastro.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-fill-example"
              onClick={handleFillExampleData}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-600 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              Preencher com Exemplo
            </button>
            <button
              type="button"
              id="btn-load-demo"
              onClick={() => {
                if (window.confirm('Deseja carregar dados demonstrativos completos (produtos, clientes, etc.)?')) {
                  loadDemoData();
                }
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
              title="Restaurar dados completos de teste"
            >
              Usar Demonstração
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Registration Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          
          {/* SECTION 0: NICHO DO VAREJO (MERCADO BRASILEIRO) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Nicho de Atuação no Varejo Brasileiro
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
                Personalização Instantânea
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Selecione o segmento da sua empresa para que o sistema ative automaticamente a estrutura mercadológica, departamentos oficiais e recursos especializados (Ex: Agenda de Vacinas e ANVISA para Farmácia, Grade de Tamanhos para Moda, Balança para Supermercado):
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.values(RETAIL_NICHES).map((item) => {
                const isSelected = niche === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setNiche(item.id);
                      setPrimaryColor(item.primaryColor);
                      setAccentColor(item.accentColor);
                      applyThemeColors(item.primaryColor, secondaryColor, item.accentColor);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-700/90 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                        : 'bg-slate-900/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 text-amber-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}

                    <div>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                        style={{ backgroundColor: `${item.primaryColor}25`, color: item.primaryColor }}
                      >
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="font-extrabold text-xs text-white leading-tight">{item.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{item.tagline}</div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center gap-1">
                      {item.features.hasVaccineSchedule && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                          Vacinas
                        </span>
                      )}
                      {item.features.hasBatchControl && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                          Validades
                        </span>
                      )}
                      {item.features.hasSizeColorGrid && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                          Grades
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 1: DADOS BÁSICOS & FISCAIS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                1. Identificação da Empresa & Dados Fiscais (SEFAZ)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome Fantasia (Aparece no topo e no cupom) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  id="onboarding-tradeName"
                  required
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Ex: MULTI TUDO - Variedades & Construção"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  CNPJ <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  id="onboarding-cnpj"
                  required
                  value={cnpj}
                  onChange={(e) => handleCnpjChange(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Razão Social Completa <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  id="onboarding-corporateName"
                  required
                  value={corporateName}
                  onChange={(e) => setCorporateName(e.target.value)}
                  placeholder="Ex: MULTIVARIEDADES COMERCIO DE VAREJO LTDA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Inscrição Estadual (IE)
                </label>
                <input
                  type="text"
                  id="onboarding-ie"
                  value={stateRegistration}
                  onChange={(e) => setStateRegistration(e.target.value)}
                  placeholder="Ex: 123.456.789.110 ou ISENTO"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Inscrição Municipal (IM)
                </label>
                <input
                  type="text"
                  id="onboarding-im"
                  value={municipalRegistration}
                  onChange={(e) => setMunicipalRegistration(e.target.value)}
                  placeholder="Ex: 987654-0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Regime Tributário (CRT)
                </label>
                <select
                  id="onboarding-crt"
                  value={crt}
                  onChange={(e) => setCrt(e.target.value as '1' | '2' | '3')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm"
                >
                  <option value="1">1 - Simples Nacional (ME / EPP)</option>
                  <option value="2">2 - Simples Nacional (Excesso Sublimite)</option>
                  <option value="3">3 - Regime Normal (Lucro Presumido/Real)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTATO & ENDEREÇO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                2. Contato & Localização da Matriz / Loja
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-mail Comercial
                </label>
                <input
                  type="email"
                  id="onboarding-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@minhaempresa.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Telefone da Loja
                </label>
                <input
                  type="text"
                  id="onboarding-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 3456-7890"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  WhatsApp de Atendimento
                </label>
                <input
                  type="text"
                  id="onboarding-whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    CEP
                  </label>
                  <button
                    type="button"
                    onClick={() => lookupAddressByCep()}
                    disabled={isSearchingCep}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {isSearchingCep ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3 h-3" />
                        <span>Buscar CEP</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="onboarding-cep"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={() => {
                      if (cleanCep(cep).length === 8 && !street) {
                        lookupAddressByCep();
                      }
                    }}
                    placeholder="00000-000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm font-mono"
                  />
                  {isSearchingCep && (
                    <div className="absolute right-3 top-3 text-amber-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Logradouro (Rua, Avenida, etc.)
                  </label>
                  <button
                    type="button"
                    onClick={handleSearchCepFromAddress}
                    disabled={isSearchingAddress}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    title="Se não souber o CEP, digite o nome da rua e clique para encontrar o CEP correspondente"
                  >
                    {isSearchingAddress ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Identificando CEP...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Não sabe o CEP? Buscar pelo Nome da Rua</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="onboarding-street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    onBlur={() => {
                      // If CEP is empty and street has 3+ chars, try auto-finding CEP
                      if (!cep && street.trim().length >= 3 && city && state) {
                        handleSearchCepFromAddress();
                      }
                    }}
                    placeholder="Ex: Avenida Paulista"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  id="onboarding-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="1578"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  id="onboarding-neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Bela Vista"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="onboarding-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    UF
                  </label>
                  <input
                    type="text"
                    id="onboarding-state"
                    value={state}
                    maxLength={2}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-sm font-bold uppercase text-center"
                  />
                </div>
              </div>
            </div>

            {cepFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  cepFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                }`}
              >
                {cepFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{cepFeedback.message}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: LOGO & IDENTIDADE VISUAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
              <Palette className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                3. Identidade Visual da Loja (Logotipo & Cores)
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Preview */}
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-600 flex items-center justify-center p-2 relative overflow-hidden shrink-0 shadow-md">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logotipo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center text-slate-400 flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-slate-500" />
                      <span className="text-[10px] mt-1 font-semibold">Sem logo</span>
                    </div>
                  )}
                  {isExtractingColors && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-amber-400">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      id="btn-upload-logo-onboarding"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Anexar Imagem do Logotipo
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrl('');
                          setDetectedPalette([]);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ao anexar o logo, o sistema extrai e aplica automaticamente a paleta de cores da sua marca em todos os botões e cabeçalhos!
                  </p>
                </div>
              </div>

              {/* Color Presets */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Ou escolha um tema de cores pronto para a sua loja:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_THEMES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                        primaryColor.toLowerCase() === preset.primary.toLowerCase()
                          ? 'border-amber-500 bg-slate-800 ring-1 ring-amber-500'
                          : 'border-slate-700 bg-slate-900/60 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-xs shrink-0"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 text-center sm:text-left flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Acesso imediato e seguro sem necessidade de validação por e-mail.</span>
            </div>

            <button
              type="submit"
              id="btn-submit-company-onboarding"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Salvando dados e liberando menus...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  Salvar Empresa e Desbloquear Sistema
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Modal de Busca de CEP por Nome da Rua */}
        <CepAddressSearchModal
          isOpen={isCepModalOpen}
          onClose={() => setIsCepModalOpen(false)}
          onSelectAddress={handleSelectAddressFromModal}
          initialStreet={street}
          initialCity={city || 'São Paulo'}
          initialState={state || 'SP'}
        />
      </div>
    </div>
  );
};
