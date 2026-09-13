import React, { useState } from 'react';
import {
  User,
  FileCheck2,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Search,
  Loader2,
  Sparkles,
  AlertCircle,
  Syringe,
  Dog,
  Shirt,
  Store,
  Pill,
} from 'lucide-react';
import { Client, RetailNicheId } from '../../types';
import { RETAIL_NICHES } from '../../utils/retailNiches';
import {
  fetchAddressByCep,
  searchCepByAddress,
  formatCep,
  cleanCep,
  AddressData,
} from '../../utils/cepAddressService';
import { CepAddressSearchModal } from '../common/CepAddressSearchModal';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt' | 'totalPurchases'>) => void;
  initialClient?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialClient?.name || '');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>(
    initialClient?.documentType || 'cpf'
  );
  const [document, setDocument] = useState(initialClient?.document || '');
  const [rgIe, setRgIe] = useState(initialClient?.rgIe || '');
  const [email, setEmail] = useState(initialClient?.email || '');
  const [phone, setPhone] = useState(initialClient?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialClient?.whatsapp || '');
  const [cep, setCep] = useState(initialClient?.cep || '');
  const [address, setAddress] = useState(initialClient?.address || '');
  const [number, setNumber] = useState(initialClient?.number || '');
  const [complement, setComplement] = useState(initialClient?.complement || '');
  const [neighborhood, setNeighborhood] = useState(initialClient?.neighborhood || '');
  const [city, setCity] = useState(initialClient?.city || '');
  const [state, setState] = useState(initialClient?.state || '');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isCepModalOpen, setIsCepModalOpen] = useState(false);

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
        if (data.street) setAddress(data.street);
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
    if (!address || address.trim().length < 3) {
      setIsCepModalOpen(true);
      return;
    }

    setIsSearchingAddress(true);
    setCepFeedback(null);
    try {
      const results = await searchCepByAddress(state || 'SP', city || 'São Paulo', address);
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
    if (addr.street) setAddress(addr.street);
    if (addr.neighborhood) setNeighborhood(addr.neighborhood);
    if (addr.city) setCity(addr.city);
    if (addr.state) setState(addr.state);
    setCepFeedback({ type: 'success', message: `CEP ${addr.cep} e endereço selecionados com sucesso!` });
    setTimeout(() => setCepFeedback(null), 4000);
  };
  const [notaFiscalPaulistaEnabled, setNotaFiscalPaulistaEnabled] = useState<boolean>(
    initialClient?.notaFiscalPaulistaEnabled ?? true
  );
  const [creditLimit, setCreditLimit] = useState<number>(initialClient?.creditLimit || 1000.0);
  const [notes, setNotes] = useState(initialClient?.notes || '');

  // Niche Preference & Clinical/Niche Features
  const [preferredNiche, setPreferredNiche] = useState<RetailNicheId>(
    initialClient?.preferredNiche || 'farmacia'
  );
  const [hasVaccineInterest, setHasVaccineInterest] = useState<boolean>(
    initialClient?.vaccineInterest ?? true
  );
  const [chronicConditions, setChronicConditions] = useState<string>(
    initialClient?.chronicConditions || ''
  );
  const [allergies, setAllergies] = useState<string>(
    initialClient?.allergies || ''
  );
  const [petName, setPetName] = useState<string>(
    initialClient?.pets?.[0]?.name || ''
  );
  const [petSpecies, setPetSpecies] = useState<string>(
    initialClient?.pets?.[0]?.species || 'Cão'
  );
  const [petBreed, setPetBreed] = useState<string>(
    initialClient?.pets?.[0]?.breed || ''
  );
  const [clothingSize, setClothingSize] = useState<string>(
    initialClient?.clothingSizePreference || ''
  );
  const [shoeSize, setShoeSize] = useState<string>(
    initialClient?.shoeSizePreference || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !document) {
      alert('Nome e CPF/CNPJ são obrigatórios para a Nota Fiscal Paulista.');
      return;
    }

    onSave({
      name,
      documentType,
      document,
      rgIe,
      email,
      phone,
      whatsapp,
      cep,
      address,
      number,
      complement,
      neighborhood,
      city,
      state,
      notaFiscalPaulistaEnabled,
      creditLimit: Number(creditLimit) || 0,
      notes,
      preferredNiche,
      vaccineInterest: hasVaccineInterest,
      chronicConditions: chronicConditions || undefined,
      allergies: allergies || undefined,
      clothingSizePreference: clothingSize || undefined,
      shoeSizePreference: shoeSize || undefined,
      pets: petName ? [{ name: petName, species: petSpecies, breed: petBreed }] : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">
              {initialClient ? 'Editar Cadastro de Cliente' : 'Novo Cliente (Compatível Nota Fiscal Paulista & SEFAZ)'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
          {/* Nota Fiscal Paulista Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold block">Padrão Nota Fiscal Paulista (SP)</strong>
                Dados completos para emissão de cupom fiscal com CPF e NF-e Eletrônica.
              </div>
            </div>
            <label className="flex items-center gap-1.5 font-bold cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-amber-300">
              <input
                type="checkbox"
                id="checkbox-nf-paulista"
                checked={notaFiscalPaulistaEnabled}
                onChange={(e) => setNotaFiscalPaulistaEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span>Ativar CPF na Nota</span>
            </label>
          </div>

          {/* Nome e Documentos */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  id="client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Duarte Souza"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Pessoa
                </label>
                <select
                  value={documentType}
                  id="client-doc-type"
                  onChange={(e) => setDocumentType(e.target.value as 'cpf' | 'cnpj')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white font-bold"
                >
                  <option value="cpf">Pessoa Física (CPF)</option>
                  <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {documentType === 'cpf' ? 'CPF (Nota Paulista) *' : 'CNPJ *'}
                </label>
                <input
                  type="text"
                  required
                  id="client-document"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0001-00'}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {documentType === 'cpf' ? 'RG (Opcional)' : 'Inscrição Estadual (IE)'}
                </label>
                <input
                  type="text"
                  id="client-rg-ie"
                  value={rgIe}
                  onChange={(e) => setRgIe(e.target.value)}
                  placeholder="Ex: 12.345.678-9"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Limite de Crediário (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="client-credit-limit"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-700 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  id="client-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail para Envio da NF-e (XML/DANFE)
                </label>
                <input
                  type="email"
                  id="client-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Endereço Completo */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                Endereço de Entrega & Cobrança (SEFAZ)
              </h4>
              <button
                type="button"
                onClick={handleSearchCepFromAddress}
                disabled={isSearchingAddress}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                title="Se não souber o CEP, digite o nome da rua e clique aqui"
              >
                {isSearchingAddress ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Não sabe o CEP? Buscar por Rua</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">CEP</label>
                  <button
                    type="button"
                    onClick={() => lookupAddressByCep()}
                    disabled={isSearchingCep}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    {isSearchingCep ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                    <span>Buscar</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="client-cep"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={() => {
                      if (cleanCep(cep).length === 8 && !address) {
                        lookupAddressByCep();
                      }
                    }}
                    placeholder="00000-000"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  {isSearchingCep && (
                    <div className="absolute right-2.5 top-2.5 text-amber-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Rua</label>
                <input
                  type="text"
                  id="client-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => {
                    if (!cep && address.trim().length >= 3 && city && state) {
                      handleSearchCepFromAddress();
                    }
                  }}
                  placeholder="Ex: Rua das Flores"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
                <input
                  type="text"
                  id="client-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento / Apto</label>
                <input
                  type="text"
                  id="client-complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto 42 / Bloco B"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                <input
                  type="text"
                  id="client-neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Centro"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / Estado</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="client-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <input
                    type="text"
                    id="client-state"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-14 text-center font-bold px-2 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
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

            {/* Preferência de Nicho de Varejo do Cliente */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                    <Store className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      Nicho de Varejo & Perfil de Consumo do Cliente
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Personalize o atendimento, carteira de vacinas ou características do perfil
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nicho de Preferência do Cliente
                </label>
                <select
                  value={preferredNiche}
                  onChange={(e) => setPreferredNiche(e.target.value as RetailNicheId)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                >
                  {Object.values(RETAIL_NICHES).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} — {n.tagline}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos específicos quando o nicho for FARMÁCIA */}
              {preferredNiche === 'farmacia' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Syringe className="w-4 h-4 text-emerald-700" />
                      Módulo Clínico: Carteira de Vacinas & Atenção Farmacêutica
                    </span>
                    <label className="flex items-center gap-1 text-xs font-bold text-emerald-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasVaccineInterest}
                        onChange={(e) => setHasVaccineInterest(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Acompanhar Vacinas</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-emerald-900 mb-1">
                        Alergias a Medicamentos / Componentes
                      </label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Ex: Alergia a Dipirona, Penicilina..."
                        className="w-full px-2.5 py-1.5 rounded-md border border-emerald-300 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-emerald-900 mb-1">
                        Doenças Crônicas / Uso Contínuo
                      </label>
                      <input
                        type="text"
                        value={chronicConditions}
                        onChange={(e) => setChronicConditions(e.target.value)}
                        placeholder="Ex: Hipertensão, Diabetes Tipo 2..."
                        className="w-full px-2.5 py-1.5 rounded-md border border-emerald-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos quando o nicho for PET SHOP */}
              {preferredNiche === 'petshop' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Dog className="w-4 h-4 text-amber-700" />
                    Dados do Pet para Vacinação e Banho & Tosa
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block font-semibold text-amber-900 mb-1">Nome do Pet</label>
                      <input
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Ex: Thor, Mel..."
                        className="w-full px-2.5 py-1.5 rounded-md border border-amber-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-amber-900 mb-1">Espécie</label>
                      <select
                        value={petSpecies}
                        onChange={(e) => setPetSpecies(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-amber-300 bg-white"
                      >
                        <option value="Cão">Cão</option>
                        <option value="Gato">Gato</option>
                        <option value="Pássaro">Pássaro</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-amber-900 mb-1">Raça / Porte</label>
                      <input
                        type="text"
                        value={petBreed}
                        onChange={(e) => setPetBreed(e.target.value)}
                        placeholder="Ex: Golden Retriever"
                        className="w-full px-2.5 py-1.5 rounded-md border border-amber-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos quando o nicho for MODA */}
              {preferredNiche === 'moda' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-3 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-purple-700" />
                    Grade de Tamanhos & Medidas do Cliente
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-purple-900 mb-1">
                        Tamanho de Roupa Habitual
                      </label>
                      <input
                        type="text"
                        value={clothingSize}
                        onChange={(e) => setClothingSize(e.target.value)}
                        placeholder="Ex: M, G, 42, 44"
                        className="w-full px-2.5 py-1.5 rounded-md border border-purple-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-purple-900 mb-1">
                        Número de Calçado
                      </label>
                      <input
                        type="text"
                        value={shoeSize}
                        onChange={(e) => setShoeSize(e.target.value)}
                        placeholder="Ex: 38, 41"
                        className="w-full px-2.5 py-1.5 rounded-md border border-purple-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações do Cliente (Histórico / Preferências)
              </label>
              <textarea
                rows={2}
                id="client-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Exige entrega em horário comercial, sempre solicita CPF na nota fiscal paulista."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-client"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Cliente
            </button>
          </div>
        </form>

        {/* Modal de Busca de CEP por Nome da Rua */}
        <CepAddressSearchModal
          isOpen={isCepModalOpen}
          onClose={() => setIsCepModalOpen(false)}
          onSelectAddress={handleSelectAddressFromModal}
          initialStreet={address}
          initialCity={city || 'São Paulo'}
          initialState={state || 'SP'}
        />
      </div>
    </div>
  );
};
