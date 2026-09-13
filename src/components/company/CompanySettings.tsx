import React, { useState, useRef } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Palette,
  Sparkles,
  RefreshCw,
  Trash2,
  Eye,
  Store,
  Layers,
  Search,
  Loader2,
  AlertCircle,
  Download,
  Database,
  HardDrive,
  FileJson,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CompanyProfile, RetailNicheId } from '../../types';
import { RETAIL_NICHES } from '../../utils/retailNiches';
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
import { BackButton } from '../common/BackButton';

export const CompanySettings: React.FC = () => {
  const {
    company,
    updateCompany,
    setActiveTab,
    exportStoreBackup,
    importStoreBackup,
    switchStoreByCnpj,
    getRegisteredStores,
  } = useStore();

  const [corporateName, setCorporateName] = useState(company.corporateName);
  const [tradeName, setTradeName] = useState(company.tradeName);
  const [niche, setNiche] = useState<RetailNicheId>(company.niche || 'farmacia');
  const [cnpj, setCnpj] = useState(company.cnpj);
  const [stateRegistration, setStateRegistration] = useState(company.stateRegistration);
  const [municipalRegistration, setMunicipalRegistration] = useState(company.municipalRegistration || '');
  const [crt, setCrt] = useState(company.crt);
  const [email, setEmail] = useState(company.email);
  const [phone, setPhone] = useState(company.phone);
  const [whatsapp, setWhatsapp] = useState(company.whatsapp || company.phone);

  // Logo & Theme Colors
  const [logoUrl, setLogoUrl] = useState(company.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(company.primaryColor || '#f59e0b');
  const [secondaryColor, setSecondaryColor] = useState(company.secondaryColor || '#0f172a');
  const [accentColor, setAccentColor] = useState(company.accentColor || '#d97706');
  const [detectedPalette, setDetectedPalette] = useState<string[]>([]);
  const [isExtractingColors, setIsExtractingColors] = useState(false);

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

  const [savedFeedback, setSavedFeedback] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setCorporateName(company.corporateName || '');
    setTradeName(company.tradeName || '');
    setNiche(company.niche || 'farmacia');
    setCnpj(company.cnpj || '');
    setStateRegistration(company.stateRegistration || '');
    setMunicipalRegistration(company.municipalRegistration || '');
    setCrt(company.crt || '1');
    setEmail(company.email || '');
    setPhone(company.phone || '');
    setWhatsapp(company.whatsapp || company.phone || '');
    setLogoUrl(company.logoUrl || '');
    setPrimaryColor(company.primaryColor || '#f59e0b');
    setSecondaryColor(company.secondaryColor || '#0f172a');
    setAccentColor(company.accentColor || '#d97706');
    setStreet(company.address?.street || '');
    setNumber(company.address?.number || '');
    setComplement(company.address?.complement || '');
    setNeighborhood(company.address?.neighborhood || '');
    setCity(company.address?.city || '');
    setState(company.address?.state || 'SP');
    setCep(company.address?.cep || '');
  }, [company]);

  const registeredStores = getRegisteredStores();

  const handleExportBackup = () => {
    exportStoreBackup();
    setBackupFeedback('Backup completo da loja exportado em arquivo JSON com sucesso!');
    setTimeout(() => setBackupFeedback(null), 4000);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importStoreBackup(content);
        if (ok) {
          setBackupFeedback('Dados da loja restaurados com sucesso a partir do arquivo JSON!');
          setTimeout(() => setBackupFeedback(null), 4000);
        } else {
          setBackupFeedback('Erro: O arquivo de backup selecionado é inválido ou está corrompido.');
          setTimeout(() => setBackupFeedback(null), 4000);
        }
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleSwitchStore = (targetCnpj: string) => {
    if (window.confirm(`Deseja carregar a loja com o CNPJ ${targetCnpj}?`)) {
      const ok = switchStoreByCnpj(targetCnpj);
      if (ok) {
        setBackupFeedback(`Loja com CNPJ ${targetCnpj} carregada com sucesso!`);
        setTimeout(() => setBackupFeedback(null), 4000);
      }
    }
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
        const found = results[0];
        setCep(found.cep);
        if (found.neighborhood) setNeighborhood(found.neighborhood);
        if (found.city) setCity(found.city);
        if (found.state) setState(found.state);
        setCepFeedback({ type: 'success', message: `CEP ${found.cep} identificado e preenchido com sucesso!` });
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

  const handleSelectAddressFromModal = (addr: AddressData) => {
    setCep(addr.cep);
    if (addr.street) setStreet(addr.street);
    if (addr.neighborhood) setNeighborhood(addr.neighborhood);
    if (addr.city) setCity(addr.city);
    if (addr.state) setState(addr.state);
    setCepFeedback({ type: 'success', message: `CEP ${addr.cep} e endereço selecionados com sucesso!` });
    setTimeout(() => setCepFeedback(null), 4000);
  };

  // Handle Logo Upload File (FileReader)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        // Automatically extract colors from the attached logo
        await autoDetectColors(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto extract dominant colors from logo
  const autoDetectColors = async (imageSrc: string) => {
    if (!imageSrc) return;
    setIsExtractingColors(true);
    try {
      const extracted = await extractColorsFromImage(imageSrc);
      setPrimaryColor(extracted.primary);
      setSecondaryColor(extracted.secondary);
      setAccentColor(extracted.accent);
      setDetectedPalette(extracted.palette);

      // Instantly apply colors to live preview
      applyThemeColors(extracted.primary, extracted.secondary, extracted.accent);
    } catch (err) {
      console.error('Erro ao extrair cores do logotipo:', err);
    } finally {
      setIsExtractingColors(false);
    }
  };

  // Handle manual color change
  const handleColorChange = (type: 'primary' | 'secondary' | 'accent', color: string) => {
    if (type === 'primary') {
      setPrimaryColor(color);
      applyThemeColors(color, secondaryColor, accentColor);
    } else if (type === 'secondary') {
      setSecondaryColor(color);
      applyThemeColors(primaryColor, color, accentColor);
    } else if (type === 'accent') {
      setAccentColor(color);
      applyThemeColors(primaryColor, secondaryColor, color);
    }
  };

  // Apply preset theme
  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
    applyThemeColors(preset.primary, preset.secondary, preset.accent);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany({
      corporateName,
      tradeName,
      niche,
      cnpj,
      stateRegistration,
      municipalRegistration,
      crt,
      email,
      phone,
      whatsapp,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      address: {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        cep,
      },
    });

    applyThemeColors(primaryColor, secondaryColor, accentColor);

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-brand-primary" style={{ color: primaryColor }} />
            Dados da Empresa & Identidade Visual
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personalize o logotipo, paleta de cores de preferência do site e dados fiscais da sua loja.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <BackButton variant="light" label="Voltar ao Menu" className="px-3.5 py-2.5 text-xs font-bold" />
          <button
            type="button"
            onClick={handleSave}
            id="btn-save-top-company"
            className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer text-slate-950"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Configurações da empresa, logotipo e cores do sistema atualizados com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SEÇÃO 0: NICHO DE ATUAÇÃO NO VAREJO BRASILEIRO */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2.5">
                <Store className="w-5 h-5 text-amber-500" />
                Nicho de Atuação no Varejo Brasileiro
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere o segmento da sua loja para ativar automaticamente os departamentos do mercado brasileiro e módulos especializados.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('departamentos')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Departamentos & Categorias
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('validades')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Controle de Validades
              </button>
              {(niche === 'farmacia' || niche === 'petshop' || RETAIL_NICHES[niche]?.features.hasVaccineSchedule) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('vacinas')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Agenda de Vacinas
                </button>
              )}
            </div>
          </div>

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
                      ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 text-amber-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}

                  <div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${item.primaryColor}20`, color: item.primaryColor }}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="font-extrabold text-xs text-slate-900 leading-tight">{item.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.tagline}</div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center gap-1 flex-wrap">
                    {item.features.hasVaccineSchedule && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Vacinas
                      </span>
                    )}
                    {item.features.hasBatchControl && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                        Validades
                      </span>
                    )}
                    {item.features.hasSizeColorGrid && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                        Grades
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEÇÃO 1: LOGOTIPO E CORES DE PREFERÊNCIA DO SITE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-brand-primary" style={{ color: primaryColor }} />
              1. Logotipo da Empresa & Cores de Preferência do Site
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
              Personalização Visual ERP
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Anexar Logotipo (Upload e Prévia) */}
            <div className="lg:col-span-6 space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Logotipo da Loja (Impressão no Cupom, DANFE e Topo)
              </label>

              {/* Upload Box */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 hover:border-slate-300 transition-all">
                {/* Logo Image Preview */}
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2 shrink-0 overflow-hidden relative group">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logotipo da Empresa"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                      <span className="text-[9px] block font-semibold mt-1">Sem Logo</span>
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Anexar Logotipo
                    </button>

                    {logoUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => autoDetectColors(logoUrl)}
                          disabled={isExtractingColors}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isExtractingColors ? 'animate-spin' : ''}`} />
                          {isExtractingColors ? 'Detectando...' : 'Extrair Cores do Logo'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
                          title="Remover logotipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Formatos recomendados: <strong>PNG transparente</strong>, JPG, SVG ou WebP (até 5MB).
                  </p>
                </div>
              </div>

              {/* URL alternativa */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ou informe uma URL direta da imagem:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/logotipo.png"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => autoDetectColors(logoUrl)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Detectar
                    </button>
                  )}
                </div>
              </div>

              {/* Paleta Extraída Automaticamente do Logo */}
              {detectedPalette.length > 0 && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Cores Detectadas no seu Logotipo:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {detectedPalette.map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleColorChange('primary', col)}
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-400 transition-all cursor-pointer"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: col }}
                        ></span>
                        <span className="text-[10px] font-mono font-bold text-slate-700 uppercase">
                          {col}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-800">
                    Clique em qualquer cor acima para defini-la como a cor primária do sistema!
                  </p>
                </div>
              )}
            </div>

            {/* Seleção de Cores do Sistema & Prévia */}
            <div className="lg:col-span-6 space-y-4">
              <label className="block text-xs font-bold text-slate-700">
                Paleta de Cores de Preferência do Site
              </label>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Cor Primária */}
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] font-mono font-bold uppercase rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Botões e destaques</span>
                </div>

                {/* Cor Secundária */}
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Cor Secundária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] font-mono font-bold uppercase rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Barras e fundos</span>
                </div>

                {/* Cor de Destaque */}
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">Cor de Acento</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] font-mono font-bold uppercase rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Badges e alertas</span>
                </div>
              </div>

              {/* Temas Pré-definidos */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600">
                  Ou escolha um tema de cores pré-configurado:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_THEMES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                        primaryColor === preset.primary
                          ? 'border-slate-900 bg-slate-100 font-black shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white"
                          style={{ backgroundColor: preset.primary }}
                        ></span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white"
                          style={{ backgroundColor: preset.secondary }}
                        ></span>
                      </div>
                      <span className="text-[10px] truncate leading-tight font-medium">
                        {preset.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card de Prévia Visual ao Vivo */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-white space-y-3 shadow-inner">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Prévia da Identidade Visual no Sistema</span>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-8 h-8 rounded-lg object-contain bg-white p-0.5"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-slate-950"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Store className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-xs text-white truncate max-w-[150px]">
                        {tradeName || 'Sua Loja'}
                      </div>
                      <span className="text-[10px] text-slate-400">Frente de Caixa (PDV)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-950 shadow-xs cursor-default"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Botão Ativo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: IDENTIFICAÇÃO JURÍDICA & TRIBUTÁRIA */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-primary" style={{ color: primaryColor }} />
            2. Identificação Jurídica & Tributária (DANFE / SEFAZ)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia (Marca da Loja)</label>
              <input
                type="text"
                required
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social Completa</label>
              <input
                type="text"
                required
                value={corporateName}
                onChange={(e) => setCorporateName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
              <input
                type="text"
                required
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Estadual (IE)</label>
              <input
                type="text"
                required
                value={stateRegistration}
                onChange={(e) => setStateRegistration(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Regime Tributário (CRT)</label>
              <select
                value={crt}
                onChange={(e) => setCrt(e.target.value as '1' | '2' | '3')}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="1">1 - Simples Nacional (ME / EPP)</option>
                <option value="2">2 - Simples Nacional - Excesso Sublimite</option>
                <option value="3">3 - Regime Normal (Lucro Presumido/Real)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Principal</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp de Atendimento</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Comercial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: ENDEREÇO DA SEDE / LOJA FÍSICA */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-primary" style={{ color: primaryColor }} />
              3. Endereço da Sede / Loja Física (Impresso nos Comprovantes)
            </h3>
            <button
              type="button"
              onClick={handleSearchCepFromAddress}
              disabled={isSearchingAddress}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 cursor-pointer bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200"
            >
              {isSearchingAddress ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>Buscar CEP pelo Nome da Rua</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">CEP</label>
                <button
                  type="button"
                  onClick={() => lookupAddressByCep()}
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
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  onBlur={() => {
                    if (cleanCep(cep).length === 8 && !street) {
                      lookupAddressByCep();
                    }
                  }}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
                {isSearchingCep && (
                  <div className="absolute right-2.5 top-2.5 text-amber-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Avenida / Rua</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                onBlur={() => {
                  if (!cep && street.trim().length >= 3 && city && state) {
                    handleSearchCepFromAddress();
                  }
                }}
                placeholder="Ex: Avenida Paulista"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: 1578"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Loja 01 / Galpão"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Bela Vista"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / UF</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <input
                  type="text"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="SP"
                  className="w-14 text-center font-bold px-2 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {cepFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
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

        {/* SEÇÃO: GRAVAÇÃO E ISOLAMENTO DE DADOS POR CNPJ */}
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-600" />
                Gravação & Isolamento de Dados por CNPJ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cada cliente possui uma loja independente com CNPJ próprio. Todos os lançamentos são gravados em tempo real no banco local.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              Isolamento Ativo
            </span>
          </div>

          {backupFeedback && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{backupFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CNPJ Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Loja & CNPJ Vinculado
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Seguro
                </span>
              </div>
              <div className="text-sm font-black text-slate-900">
                {tradeName || 'Nome da Loja em Configuração'}
              </div>
              <div className="text-xs font-mono font-bold text-amber-800">
                {cnpj ? `CNPJ: ${cnpj}` : 'CNPJ: Não preenchido'}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Ao cadastrar produtos, registrar vendas, fechar o caixa ou emitir cupons, tudo fica salvo sob este CNPJ sem misturar com outras empresas.
              </p>
            </div>

            {/* Backup and Safety Card */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <HardDrive className="w-4 h-4 text-amber-700" />
                  Backup e Exportação de Segurança
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Baixe a qualquer momento uma cópia completa de todos os dados da sua loja em arquivo JSON ou restaure um backup anterior.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exportar Backup (.JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => backupFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Restaurar Backup</span>
                </button>

                {/* Hidden File Input for Backup Restoration */}
                <input
                  ref={backupFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportBackupFile}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Registered Stores Registry (Multi-Store Switcher if multiple stores registered) */}
          {registeredStores.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                Lojas Registradas neste Navegador por CNPJ:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {registeredStores.map((st) => {
                  const isCurrent = company.cnpj && company.cnpj.replace(/\D/g, '') === st.cleanCnpj;
                  return (
                    <div
                      key={st.cleanCnpj}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                        isCurrent
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 truncate">{st.tradeName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{st.cnpj}</div>
                      </div>

                      {isCurrent ? (
                        <span className="shrink-0 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Ativa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwitchStore(st.cleanCnpj)}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 font-black text-[10px] transition-all cursor-pointer"
                        >
                          Carregar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="btn-save-company-settings"
            className="px-8 py-3 rounded-2xl text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="w-4 h-4" />
            Salvar Dados e Cores da Empresa
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
  );
};
