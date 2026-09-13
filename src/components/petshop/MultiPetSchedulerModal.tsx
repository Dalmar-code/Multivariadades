import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Dog,
  Plus,
  X,
  Check,
  Truck,
  Sparkles,
  Scissors,
  DollarSign,
  AlertCircle,
  User,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { Pet, PetAppointment, PetAppointmentItem, PetService, PetSize } from '../../types';
import { useStore } from '../../context/StoreContext';
import { PetFormModal } from './PetFormModal';

interface MultiPetSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultDate?: string;
}

interface PetConfigState {
  selected: boolean;
  primaryServiceId: string;
  primaryServiceName: string;
  primaryServicePrice: number;
  selectedExtraIds: string[];
  assignedStaff: string;
  observations: string;
}

export const MultiPetSchedulerModal: React.FC<MultiPetSchedulerModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  defaultDate,
}) => {
  const {
    clients,
    pets,
    petServices,
    addPetAppointment,
    currentUser,
  } = useStore();

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [needsTaxiDog, setNeedsTaxiDog] = useState<boolean>(false);
  const [transportType, setTransportType] = useState<'cliente_traz' | 'leva_e_traz' | 'apenas_leva' | 'apenas_traz'>('cliente_traz');
  const [transportAddress, setTransportAddress] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [showAddPetModal, setShowAddPetModal] = useState(false);

  // Per-pet selection configuration: { [petId]: PetConfigState }
  const [petConfigs, setPetConfigs] = useState<{ [petId: string]: PetConfigState }>({});

  // Active services from catalog
  const mainServices = petServices.filter((s) => !s.isExtraService && s.active);
  const extraServicesCatalog = petServices.filter((s) => s.isExtraService && s.active);

  // Default extra services fallback if none in extra list
  const availableExtras = extraServicesCatalog.length > 0 ? extraServicesCatalog : [
    { id: 'ext_hidrata', name: 'Hidratação Profunda Ojon/Argan', price: 25.0 },
    { id: 'ext_unhas', name: 'Corte de Unhas & Lixamento', price: 15.0 },
    { id: 'ext_ouvido', name: 'Limpeza de Ouvidos com Loção', price: 15.0 },
    { id: 'ext_dente', name: 'Escovação de Dentes', price: 20.0 },
    { id: 'ext_tosa_hig', name: 'Tosa Higiênica Adicional', price: 30.0 },
    { id: 'ext_lacos', name: 'Kit Laços de Luxo & Bandana', price: 12.0 },
  ];

  // Helper to compute service price by pet size
  const getServicePrice = (service: PetService | undefined, size: PetSize = 'medio') => {
    if (!service) return 65.0;
    return service.priceBySize?.[size] ?? service.basePrice ?? 65.0;
  };

  // When opening or defaultClientId changes
  useEffect(() => {
    if (isOpen) {
      const initClient = defaultClientId || (clients[0]?.id ?? '');
      setSelectedClientId(initClient);
      if (defaultDate) setScheduledDate(defaultDate);
    }
  }, [isOpen, defaultClientId, clients, defaultDate]);

  // Client's pets
  const clientPets = pets.filter((p) => p.clientId === selectedClientId);

  // Whenever client or clientPets change, setup initial config for each pet
  useEffect(() => {
    if (!selectedClientId) return;

    const defaultService = mainServices[0] || petServices[0];
    const initialConfigs: { [petId: string]: PetConfigState } = {};

    clientPets.forEach((pet, index) => {
      const petPrice = getServicePrice(defaultService, pet.size);
      initialConfigs[pet.id] = {
        selected: index === 0, // Select first pet by default
        primaryServiceId: defaultService?.id || 'srv_banho',
        primaryServiceName: defaultService?.name || 'Banho Completo',
        primaryServicePrice: petPrice,
        selectedExtraIds: [],
        assignedStaff: 'Banhista Especializado',
        observations: pet.medicalNotes || '',
      };
    });

    setPetConfigs(initialConfigs);

    // Auto-fill address if transport is leva e traz
    const curClient = clients.find((c) => c.id === selectedClientId);
    if (curClient?.address) {
      setTransportAddress(`${curClient.address}, ${curClient.city || ''}`);
    }
  }, [selectedClientId, pets.length]);

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId);

  // Toggle selection for a pet
  const togglePetSelection = (petId: string) => {
    setPetConfigs((prev) => ({
      ...prev,
      [petId]: {
        ...prev[petId],
        selected: !prev[petId]?.selected,
      },
    }));
  };

  // Change primary service for a pet
  const handleServiceChange = (pet: Pet, serviceId: string) => {
    const srv = petServices.find((s) => s.id === serviceId);
    const price = getServicePrice(srv, pet.size);

    setPetConfigs((prev) => ({
      ...prev,
      [pet.id]: {
        ...prev[pet.id],
        primaryServiceId: serviceId,
        primaryServiceName: srv?.name || 'Serviço',
        primaryServicePrice: price,
      },
    }));
  };

  // Toggle extra service for a pet
  const toggleExtraService = (petId: string, extraId: string) => {
    setPetConfigs((prev) => {
      const currentExtras = prev[petId]?.selectedExtraIds || [];
      const newExtras = currentExtras.includes(extraId)
        ? currentExtras.filter((id) => id !== extraId)
        : [...currentExtras, extraId];

      return {
        ...prev,
        [petId]: {
          ...prev[petId],
          selectedExtraIds: newExtras,
        },
      };
    });
  };

  // Calculate totals
  const selectedPetsList = clientPets.filter((p) => petConfigs[p.id]?.selected);

  const calculatePetSubtotal = (pet: Pet) => {
    const config = petConfigs[pet.id];
    if (!config) return 0;
    const base = config.primaryServicePrice || 0;
    const extrasTotal = config.selectedExtraIds.reduce((sum, extraId) => {
      const extra = availableExtras.find((e) => e.id === extraId);
      const extraPrice = (extra as any)?.basePrice ?? (extra as any)?.price ?? 15.0;
      return sum + extraPrice;
    }, 0);
    return base + extrasTotal;
  };

  const taxiFee = transportType === 'leva_e_traz' ? 35.0 : transportType === 'apenas_leva' || transportType === 'apenas_traz' ? 20.0 : 0;
  const servicesTotal = selectedPetsList.reduce((sum, pet) => sum + calculatePetSubtotal(pet), 0);
  const grandTotal = servicesTotal + taxiFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPetsList.length === 0) {
      alert('Por favor, selecione pelo menos 1 pet para o agendamento.');
      return;
    }

    const items: PetAppointmentItem[] = selectedPetsList.map((pet) => {
      const config = petConfigs[pet.id];
      const extraObjs = config.selectedExtraIds.map((extraId) => {
        const extra = availableExtras.find((e) => e.id === extraId);
        const price = (extra as any)?.basePrice ?? (extra as any)?.price ?? 15.0;
        return {
          id: extraId,
          name: extra?.name || 'Serviço Adicional',
          price,
        };
      });

      return {
        petId: pet.id,
        petName: pet.name,
        petSpecies: pet.species,
        petBreed: pet.breed,
        petSize: pet.size,
        primaryServiceId: config.primaryServiceId,
        primaryServiceName: config.primaryServiceName,
        primaryServicePrice: config.primaryServicePrice,
        extraServices: extraObjs,
        subtotal: calculatePetSubtotal(pet),
        assignedStaff: config.assignedStaff || 'Banhista/Tosador',
        observations: config.observations,
      };
    });

    const newAppointment: Omit<PetAppointment, 'id' | 'createdAt' | 'code'> = {
      clientId: selectedClientId,
      clientName: currentClient?.name || 'Cliente',
      clientPhone: currentClient?.phone || '(11) 99999-0000',
      clientEmail: currentClient?.email,
      date: scheduledDate,
      time: scheduledTime,
      transportType,
      transportAddress: transportAddress.trim() || undefined,
      items,
      totalAmount: grandTotal,
      currentStep: 'aguardando',
      stepTimestamps: {
        aguardandoAt: new Date().toISOString(),
      },
      paymentStatus: 'pendente',
      generalNotes: generalNotes.trim() || undefined,
      createdBy: currentUser?.name || 'Atendente',
    };

    addPetAppointment(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header (Fixed) */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 shrink-0 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Agendamento
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Banho, Tosa & Vet
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione o tutor, escolha os pets e configure os serviços com cálculo integrado
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Step 1: Client selection & Separated Info */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    1. Tutor / Cliente Responsável *
                  </label>
                  <span className="text-[11px] text-amber-400 font-medium">
                    {clientPets.length} pet(s) cadastrado(s)
                  </span>
                </div>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.document ? `(CPF: ${c.document})` : ''} {c.phone ? `- Tel: ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Cadastrar Outro Pet</span>
                </button>
              </div>
            </div>

            {/* Separated CPF, Contact & Address badges */}
            {currentClient && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    CPF do Tutor
                  </span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                    {currentClient.document ? currentClient.document : 'CPF não informado'}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Contato / WhatsApp
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">
                    {currentClient.phone || currentClient.whatsapp || 'Telefone não informado'}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Endereço de Transporte
                  </span>
                  <span className="text-xs text-slate-300 mt-0.5 truncate block" title={currentClient.address}>
                    {currentClient.address ? `${currentClient.address}, ${currentClient.number || 'S/N'} (${currentClient.neighborhood || ''})` : 'Endereço não cadastrado'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Multi-Pet Selection & Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Dog className="w-4 h-4 text-amber-400" />
                2. Selecione os Pets e Configure os Serviços (Multi-Pets):
              </label>
              <span className="text-xs text-slate-400">
                {selectedPetsList.length} de {clientPets.length} pet(s) selecionado(s)
              </span>
            </div>

            {clientPets.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl space-y-2">
                <Dog className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">
                  Este tutor ainda não possui pets cadastrados no sistema.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Primeiro Pet do Tutor</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {clientPets.map((pet) => {
                  const isSelected = !!petConfigs[pet.id]?.selected;
                  const config = petConfigs[pet.id];

                  return (
                    <div
                      key={pet.id}
                      className={`border rounded-2xl p-4 transition-all ${
                        isSelected
                          ? 'bg-slate-950 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                          : 'bg-slate-950/40 border-slate-800 opacity-75'
                      }`}
                    >
                      {/* Pet top header checkbox */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePetSelection(pet.id)}
                            className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{pet.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 uppercase font-semibold">
                                {pet.species} • {pet.breed}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                Porte: {pet.size.toUpperCase()} ({pet.weightKg}kg)
                              </span>
                            </div>
                            {pet.allergies && (
                              <span className="text-[11px] text-rose-400 font-medium block mt-0.5">
                                ⚠ Alergia/Cuidado: {pet.allergies}
                              </span>
                            )}
                          </div>
                        </label>

                        {isSelected && config && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase">Subtotal do Pet</span>
                            <span className="text-sm font-bold text-emerald-400">
                              R$ {calculatePetSubtotal(pet).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pet service configurations if selected */}
                      {isSelected && config && (
                        <div className="pt-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                Serviço Principal *
                              </label>
                              <select
                                value={config.primaryServiceId}
                                onChange={(e) => handleServiceChange(pet, e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                              >
                                {petServices.map((s) => {
                                  const pr = getServicePrice(s, pet.size);
                                  return (
                                    <option key={s.id} value={s.id}>
                                      {s.name} - R$ {pr.toFixed(2)}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                Profissional / Banhista / Vet
                              </label>
                              <select
                                value={config.assignedStaff}
                                onChange={(e) =>
                                  setPetConfigs((prev) => ({
                                    ...prev,
                                    [pet.id]: {
                                      ...prev[pet.id],
                                      assignedStaff: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                              >
                                <option value="Banhista Especializado">Banhista Especializado</option>
                                <option value="Tosador Master (Tesoura & Raça)">Tosador Master (Tesoura & Raça)</option>
                                <option value="Dr. Veterinário (Clínica)">Dr. Veterinário (Clínica)</option>
                                <option value="Assistente de Estética">Assistente de Estética</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                Observação Especial para {pet.name}
                              </label>
                              <input
                                type="text"
                                placeholder="Ex: Cuidado com ouvidos; tosa na 4..."
                                value={config.observations}
                                onChange={(e) =>
                                  setPetConfigs((prev) => ({
                                    ...prev,
                                    [pet.id]: {
                                      ...prev[pet.id],
                                      observations: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Extra Services Checklist */}
                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              Serviços Adicionais / Extras (Opcional):
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {availableExtras.map((extra) => {
                                const isExtraChecked = config.selectedExtraIds.includes(extra.id);
                                const price = (extra as any).basePrice ?? (extra as any).price ?? 15.0;

                                return (
                                  <label
                                    key={extra.id}
                                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                      isExtraChecked
                                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isExtraChecked}
                                      onChange={() => toggleExtraService(pet.id, extra.id)}
                                      className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                                    />
                                    <span className="truncate flex-1">{extra.name}</span>
                                    <strong className="text-white shrink-0">+R$ {price.toFixed(2)}</strong>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Date, Time & Non-Redundant Táxi Dog Logistics */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                3. Data, Horário & Logística de Táxi Dog:
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Data do Agendamento *
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Horário de Entrada *
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Táxi Dog Selection: Direct & Non-Redundant */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={needsTaxiDog}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setNeedsTaxiDog(isChecked);
                    if (isChecked) {
                      setTransportType('leva_e_traz');
                      if (currentClient?.address) {
                        setTransportAddress(`${currentClient.address}, ${currentClient.number || 'S/N'} - ${currentClient.neighborhood || ''}`);
                      }
                    } else {
                      setTransportType('cliente_traz');
                    }
                  }}
                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">
                      Solicitar Táxi Dog (Buscar e/ou Levar)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Lançado apenas 1x por endereço
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Ao marcar, o transporte completo já vem selecionado automaticamente sem perguntas redundantes.
                  </span>
                </div>
              </label>

              {needsTaxiDog && (
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransportType('leva_e_traz')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                        transportType === 'leva_e_traz'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Leva e Traz (Buscar & Entregar)</span>
                      <strong className="text-white">+ R$ 35,00 (Taxa Única)</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransportType('apenas_leva')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                        transportType === 'apenas_leva'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Apenas Buscar</span>
                      <strong className="text-white">+ R$ 20,00</strong>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransportType('apenas_traz')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                        transportType === 'apenas_traz'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Apenas Entregar</span>
                      <strong className="text-white">+ R$ 20,00</strong>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Endereço do Transporte (Busca / Devolução)
                    </label>
                    <div className="relative">
                      <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Rua, número, bairro, referências..."
                        value={transportAddress}
                        onChange={(e) => setTransportAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Instruções Gerais para a Recepção
              </label>
              <input
                type="text"
                placeholder="Ex: Cliente vai pagar no débito; devolver coleiras separadas..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </form>

        {/* Grand Total Summary & Submit (Fixed Footer) */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-3 text-slate-300">
              <span>Pets Selecionados: <strong className="text-white">{selectedPetsList.length}</strong></span>
              <span>•</span>
              <span>Serviços: <strong className="text-white">R$ {servicesTotal.toFixed(2)}</strong></span>
              {taxiFee > 0 && (
                <>
                  <span>•</span>
                  <span>Táxi Dog: <strong className="text-amber-400">R$ {taxiFee.toFixed(2)}</strong> (Taxa única)</span>
                </>
              )}
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span>Total Estimado:</span>
              <span className="text-amber-400 font-extrabold text-xl">R$ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedPetsList.length === 0}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Pet Registration Modal */}
      {showAddPetModal && (
        <PetFormModal
          isOpen={showAddPetModal}
          onClose={() => setShowAddPetModal(false)}
          defaultClientId={selectedClientId}
          onPetSaved={(newPet) => {
            setShowAddPetModal(false);
          }}
        />
      )}
    </div>
  );
};
