import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Stethoscope,
  X,
  Save,
  DollarSign,
  Clock,
  Tag,
  FileText,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { PetService, PetSize } from '../../types';
import { useStore } from '../../context/StoreContext';

interface PetServiceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: PetService | null;
  defaultServiceType?: 'petshop' | 'veterinario';
}

export const PetServiceCatalogModal: React.FC<PetServiceCatalogModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
  defaultServiceType = 'petshop',
}) => {
  const { addPetService, updatePetService } = useStore();

  const [serviceType, setServiceType] = useState<'petshop' | 'veterinario'>(defaultServiceType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'banho_tosa' | 'estetica' | 'veterinario' | 'hotel_creche' | 'transporte' | 'outros'>('banho_tosa');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [basePrice, setBasePrice] = useState(65.0);

  // Size-specific pricing
  const [priceMini, setPriceMini] = useState(55.0);
  const [pricePequeno, setPricePequeno] = useState(65.0);
  const [priceMedio, setPriceMedio] = useState(80.0);
  const [priceGrande, setPriceGrande] = useState(110.0);
  const [priceGigante, setPriceGigante] = useState(150.0);

  const [isExtraService, setIsExtraService] = useState(false);
  const [observations, setObservations] = useState('');

  // Veterinary-specific fields
  const [requiresCRMV, setRequiresCRMV] = useState(false);
  const [returnDays, setReturnDays] = useState<number | undefined>(undefined);
  const [clinicalInstructions, setClinicalInstructions] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      const type = serviceToEdit.serviceType || (serviceToEdit.category === 'veterinario' ? 'veterinario' : 'petshop');
      setServiceType(type);
      setName(serviceToEdit.name);
      setCategory(serviceToEdit.category);
      setDescription(serviceToEdit.description || '');
      setDurationMinutes(serviceToEdit.durationMinutes || 60);
      const pr = serviceToEdit.price || serviceToEdit.basePrice || 65.0;
      setBasePrice(pr);
      setPriceMini(serviceToEdit.priceBySize?.mini ?? pr);
      setPricePequeno(serviceToEdit.priceBySize?.pequeno ?? pr);
      setPriceMedio(serviceToEdit.priceBySize?.medio ?? pr);
      setPriceGrande(serviceToEdit.priceBySize?.grande ?? pr);
      setPriceGigante(serviceToEdit.priceBySize?.gigante ?? pr);
      setIsExtraService(serviceToEdit.isExtraService || false);
      setObservations(serviceToEdit.observations || '');
      setRequiresCRMV(serviceToEdit.requiresCRMV ?? (type === 'veterinario'));
      setReturnDays(serviceToEdit.returnDays);
      setClinicalInstructions(serviceToEdit.clinicalInstructions || '');
    } else {
      setServiceType(defaultServiceType);
      setName('');
      setCategory(defaultServiceType === 'veterinario' ? 'veterinario' : 'banho_tosa');
      setDescription('');
      setDurationMinutes(defaultServiceType === 'veterinario' ? 45 : 60);
      const initPrice = defaultServiceType === 'veterinario' ? 120.0 : 65.0;
      setBasePrice(initPrice);
      setPriceMini(initPrice);
      setPricePequeno(initPrice);
      setPriceMedio(initPrice);
      setPriceGrande(initPrice);
      setPriceGigante(initPrice);
      setIsExtraService(false);
      setObservations('');
      setRequiresCRMV(defaultServiceType === 'veterinario');
      setReturnDays(defaultServiceType === 'veterinario' ? 30 : undefined);
      setClinicalInstructions('');
    }
  }, [serviceToEdit, isOpen, defaultServiceType]);

  // When switching service type tab
  const handleTypeSwitch = (type: 'petshop' | 'veterinario') => {
    setServiceType(type);
    if (type === 'veterinario') {
      setCategory('veterinario');
      setRequiresCRMV(true);
      if (!serviceToEdit) {
        setBasePrice(120.0);
        setPriceMini(120.0);
        setPricePequeno(120.0);
        setPriceMedio(120.0);
        setPriceGrande(120.0);
        setPriceGigante(120.0);
        setReturnDays(30);
      }
    } else {
      setCategory('banho_tosa');
      setRequiresCRMV(false);
      if (!serviceToEdit) {
        setBasePrice(65.0);
        setPriceMini(55.0);
        setPricePequeno(65.0);
        setPriceMedio(80.0);
        setPriceGrande(110.0);
        setPriceGigante(150.0);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Omit<PetService, 'id'> = {
      name: name.trim(),
      serviceType,
      category: serviceType === 'veterinario' ? 'veterinario' : category,
      targetSpecies: ['cao', 'gato', 'outro'],
      price: Number(basePrice) || 0,
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 30,
      basePrice: Number(basePrice) || 0,
      priceBySize: {
        mini: Number(priceMini) || Number(basePrice),
        pequeno: Number(pricePequeno) || Number(basePrice),
        medio: Number(priceMedio) || Number(basePrice),
        grande: Number(priceGrande) || Number(basePrice),
        gigante: Number(priceGigante) || Number(basePrice),
      },
      isExtraService,
      observations: observations.trim(),
      requiresCRMV: serviceType === 'veterinario' ? requiresCRMV : false,
      returnDays: serviceType === 'veterinario' && returnDays ? Number(returnDays) : undefined,
      clinicalInstructions: serviceType === 'veterinario' && clinicalInstructions ? clinicalInstructions.trim() : undefined,
      active: true,
    };

    if (serviceToEdit) {
      updatePetService(serviceToEdit.id, data);
    } else {
      addPetService(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 my-8 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                serviceType === 'veterinario'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              {serviceType === 'veterinario' ? (
                <Stethoscope className="w-6 h-6" />
              ) : (
                <Scissors className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {serviceToEdit
                  ? `Editar Serviço (${serviceType === 'veterinario' ? 'Veterinário' : 'Pet Shop'})`
                  : `Cadastrar Novo Serviço`}
              </h3>
              <p className="text-xs text-slate-400">
                Configure os detalhes, valores, porte e exigências técnicas do serviço
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle Selector: Pet Shop vs. Veterinário */}
        {!serviceToEdit && (
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeSwitch('petshop')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                serviceType === 'petshop'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Serviço de Pet Shop (Banho / Tosa / Estética)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeSwitch('veterinario')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                serviceType === 'veterinario'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Serviço Veterinário (Clínico / Consulta / Vacina)</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nome do Serviço *
              </label>
              <input
                type="text"
                placeholder={
                  serviceType === 'veterinario'
                    ? 'Ex: Consulta Clínica Geral / Vacina V10 / Ultrassom'
                    : 'Ex: Banho Completo + Tosa Higiênica'
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Categoria do Serviço *
              </label>
              {serviceType === 'veterinario' ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="veterinario">Veterinário Geral</option>
                  <option value="estetica">Terapêutico / Banho Medicamentoso</option>
                  <option value="outros">Exames & Procedimentos Clínicos</option>
                </select>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="banho_tosa">Banho & Tosa</option>
                  <option value="estetica">Estética & Spa (Hidratação, Penteados)</option>
                  <option value="transporte">Transporte (Táxi Dog Leva e Traz)</option>
                  <option value="hotel_creche">Hotel & Daycare</option>
                  <option value="outros">Outros Serviços</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Descrição do Procedimento
            </label>
            <input
              type="text"
              placeholder={
                serviceType === 'veterinario'
                  ? 'Ex: Avaliação clínica completa de mucosas, ausculta, palpação e prescrição...'
                  : 'Ex: Inclui corte de unhas, limpeza de ouvidos, banho térmico e secagem...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Pricing: General / Portes */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {serviceType === 'veterinario'
                  ? 'Valor do Procedimento (R$)'
                  : 'Valores por Porte do Animal (R$)'}
              </span>
              <span className="text-[11px] text-slate-400">
                {serviceType === 'veterinario' ? 'Preço padrão da consulta' : 'Preço diferenciado por peso'}
              </span>
            </div>

            {serviceType === 'veterinario' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Preço Base / Padrão (R$)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={basePrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setBasePrice(val);
                      setPriceMini(val);
                      setPricePequeno(val);
                      setPriceMedio(val);
                      setPriceGrande(val);
                      setPriceGigante(val);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <span className="text-xs text-slate-400">
                    Procedimentos veterinários geralmente têm valor fixo, independentemente do porte.
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Mini (até 4kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={priceMini}
                    onChange={(e) => setPriceMini(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Pequeno (4-10kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={pricePequeno}
                    onChange={(e) => setPricePequeno(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Médio (10-20kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={priceMedio}
                    onChange={(e) => setPriceMedio(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Grande (20-40kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={priceGrande}
                    onChange={(e) => setPriceGrande(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Gigante (+40kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={priceGigante}
                    onChange={(e) => setPriceGigante(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Duration & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Duração Estimada (Minutos)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  step="5"
                  min="5"
                  max="360"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 30)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isExtraService}
                  onChange={(e) => setIsExtraService(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                />
                <span>Pode ser contratado como serviço adicional / avulso</span>
              </label>
            </div>
          </div>

          {/* Veterinary-specific Clinical Controls */}
          {serviceType === 'veterinario' && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Configurações Clínicas Veterinárias
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={requiresCRMV}
                    onChange={(e) => setRequiresCRMV(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>Exige CRMV do Médico Veterinário</span>
                </label>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Prazo de Retorno Gratuito (Dias)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 30 dias"
                    value={returnDays ?? ''}
                    onChange={(e) => setReturnDays(parseInt(e.target.value, 10) || undefined)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Instruções Clínicas / Jejum Prévio (para o Tutor)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Jejum alimentar de 8 horas e hídrico de 2 horas para exames laboratoriais..."
                  value={clinicalInstructions}
                  onChange={(e) => setClinicalInstructions(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Não recomendado para filhotes menores de 45 dias; cuidados com animais idosos..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md ${
                serviceType === 'veterinario'
                  ? 'bg-emerald-500 hover:bg-emerald-400'
                  : 'bg-amber-500 hover:bg-amber-400'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{serviceToEdit ? 'Atualizar Serviço' : 'Salvar no Catálogo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
