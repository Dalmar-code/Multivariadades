import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  Calendar,
  Clock,
  User,
  FileText,
  HeartPulse,
  Thermometer,
  Activity,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Syringe,
  Pill,
} from 'lucide-react';
import {
  VeterinaryConsultation,
  CustomVeterinaryService,
  Pet,
  PetService,
} from '../../types';
import { useStore } from '../../context/StoreContext';

interface VeterinaryConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationToEdit?: VeterinaryConsultation | null;
  defaultPetId?: string;
  defaultClientId?: string;
}

export const VeterinaryConsultationModal: React.FC<VeterinaryConsultationModalProps> = ({
  isOpen,
  onClose,
  consultationToEdit,
  defaultPetId,
  defaultClientId,
}) => {
  const {
    clients,
    pets,
    petServices,
    addVeterinaryConsultation,
    updateVeterinaryConsultation,
    currentUser,
  } = useStore();

  // Basic info
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [veterinarianName, setVeterinarianName] = useState('Dra. Camila Vasconcelos');
  const [crmv, setCrmv] = useState('SP-34891');
  const [type, setType] = useState<VeterinaryConsultation['type']>('consulta_geral');
  const [status, setStatus] = useState<VeterinaryConsultation['status']>('concluido');
  const [paymentStatus, setPaymentStatus] = useState<VeterinaryConsultation['paymentStatus']>('pendente');

  // Clinical evaluation & Vitals
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [temperatureCelsius, setTemperatureCelsius] = useState<number | undefined>(38.5);
  const [heartRateBpm, setHeartRateBpm] = useState<number | undefined>(100);
  const [respiratoryRateRpm, setRespiratoryRateRpm] = useState<number | undefined>(24);
  const [mucousMembranes, setMucousMembranes] = useState<VeterinaryConsultation['mucousMembranes']>('normocoradas');
  const [hydrationStatus, setHydrationStatus] = useState<VeterinaryConsultation['hydrationStatus']>('hidratado');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [prescription, setPrescription] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Standard services selected from catalog
  const [selectedStandardServiceIds, setSelectedStandardServiceIds] = useState<string[]>([]);

  // Ad-hoc / Custom unlisted veterinary services (Requisito fundamental do usuário!)
  const [customServices, setCustomServices] = useState<CustomVeterinaryService[]>([]);

  // Quick form for adding a custom unlisted service
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<CustomVeterinaryService['category']>('procedimento');
  const [customPrice, setCustomPrice] = useState<number>(50.0);
  const [customDesc, setCustomDesc] = useState('');

  // Filter veterinary services from catalog
  const catalogVetServices = petServices.filter(
    (s) => s.category === 'veterinario' || s.serviceType === 'veterinario' || s.active
  );

  useEffect(() => {
    if (consultationToEdit) {
      setSelectedClientId(consultationToEdit.clientId);
      setSelectedPetId(consultationToEdit.petId);
      setDate(consultationToEdit.date);
      setTime(consultationToEdit.time);
      setVeterinarianName(consultationToEdit.veterinarianName);
      setCrmv(consultationToEdit.crmv);
      setType(consultationToEdit.type);
      setStatus(consultationToEdit.status);
      setPaymentStatus(consultationToEdit.paymentStatus);
      setChiefComplaint(consultationToEdit.chiefComplaint);
      setAnamnesis(consultationToEdit.anamnesis || '');
      setTemperatureCelsius(consultationToEdit.temperatureCelsius);
      setHeartRateBpm(consultationToEdit.heartRateBpm);
      setRespiratoryRateRpm(consultationToEdit.respiratoryRateRpm);
      setMucousMembranes(consultationToEdit.mucousMembranes || 'normocoradas');
      setHydrationStatus(consultationToEdit.hydrationStatus || 'hidratado');
      setDiagnosis(consultationToEdit.diagnosis || '');
      setTreatmentPlan(consultationToEdit.treatmentPlan || '');
      setPrescription(consultationToEdit.prescription || '');
      setReturnDate(consultationToEdit.returnDate || '');
      setNotes(consultationToEdit.notes || '');
      setSelectedStandardServiceIds(consultationToEdit.standardServices.map((s) => s.serviceId));
      setCustomServices(consultationToEdit.customServices || []);
    } else {
      const initialClient = defaultClientId || clients[0]?.id || '';
      setSelectedClientId(initialClient);

      const clientPets = pets.filter((p) => p.clientId === initialClient);
      const initialPet = defaultPetId || clientPets[0]?.id || pets[0]?.id || '';
      setSelectedPetId(initialPet);

      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:00');
      setVeterinarianName(currentUser?.name ? `Dr(a). ${currentUser.name}` : 'Dra. Camila Vasconcelos');
      setCrmv('SP-34891');
      setType('consulta_geral');
      setStatus('concluido');
      setPaymentStatus('pendente');
      setChiefComplaint('');
      setAnamnesis('');
      setTemperatureCelsius(38.5);
      setHeartRateBpm(100);
      setRespiratoryRateRpm(24);
      setMucousMembranes('normocoradas');
      setHydrationStatus('hidratado');
      setDiagnosis('');
      setTreatmentPlan('');
      setPrescription('');
      setReturnDate('');
      setNotes('');

      // Default to general vet consult if exists
      const generalConsult = petServices.find(
        (s) => s.id === 'srv-consulta-veterinaria' || (s.category === 'veterinario' && !s.isExtraService)
      );
      setSelectedStandardServiceIds(generalConsult ? [generalConsult.id] : []);
      setCustomServices([]);
    }
  }, [consultationToEdit, isOpen, defaultPetId, defaultClientId]);

  // When client changes, auto-select first pet of that client
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const clientPets = pets.filter((p) => p.clientId === clientId);
    if (clientPets.length > 0) {
      setSelectedPetId(clientPets[0].id);
    } else {
      setSelectedPetId('');
    }
  };

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId);
  const clientPets = pets.filter((p) => p.clientId === selectedClientId);
  const currentPet = pets.find((p) => p.id === selectedPetId);

  // Toggle standard service selection
  const toggleStandardService = (serviceId: string) => {
    setSelectedStandardServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Add custom unlisted service
  const handleAddCustomService = () => {
    if (!customName.trim()) {
      alert('Por favor, informe o nome do procedimento ou serviço veterinário.');
      return;
    }

    const newCustom: CustomVeterinaryService = {
      id: 'cst_' + Date.now(),
      name: customName.trim(),
      category: customCategory,
      price: Number(customPrice) || 0,
      description: customDesc.trim() || undefined,
    };

    setCustomServices((prev) => [...prev, newCustom]);
    setCustomName('');
    setCustomPrice(50.0);
    setCustomDesc('');
  };

  // Remove custom service
  const handleRemoveCustomService = (id: string) => {
    setCustomServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Calculate total amount
  const standardTotal = selectedStandardServiceIds.reduce((sum, id) => {
    const srv = petServices.find((s) => s.id === id);
    if (!srv) return sum;
    const price = currentPet?.size ? (srv.priceBySize?.[currentPet.size] ?? srv.price ?? srv.basePrice) : (srv.price ?? srv.basePrice);
    return sum + price;
  }, 0);

  const customTotal = customServices.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalAmount = standardTotal + customTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      alert('Selecione o tutor do animal.');
      return;
    }

    if (!selectedPetId) {
      alert('Selecione o pet para o atendimento.');
      return;
    }

    if (!chiefComplaint.trim() && !diagnosis.trim()) {
      alert('Informe ao menos a queixa principal ou o diagnóstico clínico.');
      return;
    }

    const standardServicesPayload = selectedStandardServiceIds.map((id) => {
      const srv = petServices.find((s) => s.id === id);
      const price = currentPet?.size ? (srv?.priceBySize?.[currentPet.size] ?? srv?.price ?? srv?.basePrice ?? 0) : (srv?.price ?? srv?.basePrice ?? 0);
      return {
        serviceId: id,
        serviceName: srv?.name || 'Serviço Veterinário',
        price,
      };
    });

    const payload: Omit<VeterinaryConsultation, 'id' | 'createdAt' | 'code'> = {
      clientId: selectedClientId,
      clientName: currentClient?.name || 'Cliente',
      clientPhone: currentClient?.phone || '',
      clientEmail: currentClient?.email,
      petId: selectedPetId,
      petName: currentPet?.name || 'Pet',
      petSpecies: currentPet?.species || 'cao',
      petBreed: currentPet?.breed || 'SRD',
      petAgeYears: currentPet?.ageYears,
      petWeightKg: currentPet?.weightKg,
      date,
      time,
      veterinarianName,
      crmv,
      type,
      chiefComplaint: chiefComplaint.trim(),
      anamnesis: anamnesis.trim() || undefined,
      temperatureCelsius: temperatureCelsius ? Number(temperatureCelsius) : undefined,
      heartRateBpm: heartRateBpm ? Number(heartRateBpm) : undefined,
      respiratoryRateRpm: respiratoryRateRpm ? Number(respiratoryRateRpm) : undefined,
      mucousMembranes,
      hydrationStatus,
      diagnosis: diagnosis.trim() || undefined,
      treatmentPlan: treatmentPlan.trim() || undefined,
      prescription: prescription.trim() || undefined,
      standardServices: standardServicesPayload,
      customServices,
      vaccinesApplied: [],
      returnDate: returnDate || undefined,
      totalAmount,
      status,
      paymentStatus,
      notes: notes.trim() || undefined,
    };

    if (consultationToEdit) {
      updateVeterinaryConsultation(consultationToEdit.id, payload);
    } else {
      addVeterinaryConsultation(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-6 my-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {consultationToEdit ? 'Editar Prontuário & Atendimento Clínico' : 'Novo Atendimento Clínico Veterinário'}
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  CRMV Veterinário
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Anamnese, sinais vitais, procedimentos do catálogo e informe de serviços especiais não listados
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

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[78vh] overflow-y-auto pr-1">
          {/* Section 1: Tutor, Pet & Professional */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                1. Identificação do Paciente, Tutor e Médico Veterinário
              </span>
              <span className="text-[11px] text-slate-400">Válido para todo o sistema</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tutor / Cliente Responsável *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Selecione o cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} - CPF: {c.document || 'N/I'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Animal / Pet Paciente *
                </label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold text-amber-300"
                  required
                  disabled={clientPets.length === 0}
                >
                  {clientPets.length === 0 ? (
                    <option value="">Nenhum pet cadastrado para este cliente</option>
                  ) : (
                    clientPets.map((p) => (
                      <option key={p.id} value={p.id}>
                        🐾 {p.name} ({p.species.toUpperCase()} - {p.breed}, {p.weightKg ? `${p.weightKg}kg` : 'Peso N/I'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Data do Atendimento *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Médico(a) Veterinário(a) *
                </label>
                <input
                  type="text"
                  value={veterinarianName}
                  onChange={(e) => setVeterinarianName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  CRMV / UF *
                </label>
                <input
                  type="text"
                  placeholder="Ex: SP-34891"
                  value={crmv}
                  onChange={(e) => setCrmv(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tipo de Atendimento
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="consulta_geral">Consulta Geral de Rotina</option>
                  <option value="retorno">Consulta de Retorno</option>
                  <option value="emergencia">Urgência / Emergência</option>
                  <option value="vacinacao">Aplicação de Vacina & Imunização</option>
                  <option value="cirurgia">Procedimento Cirúrgico / Sedação</option>
                  <option value="exame">Coleta de Exames / Triagem</option>
                  <option value="outro">Outro Atendimento</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Status do Atendimento
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="agendado">Agendado / Recepção</option>
                  <option value="em_atendimento">Em Atendimento Clínico</option>
                  <option value="concluido">Atendimento Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Status do Pagamento
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="pendente">Pendente (Faturar no PDV)</option>
                  <option value="pago">Já Pago no Caixa</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Assessment & Vitals */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              2. Avaliação Clínica, Sinais Vitais & Diagnóstico
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  Temp. (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperatureCelsius ?? ''}
                  onChange={(e) => setTemperatureCelsius(parseFloat(e.target.value) || undefined)}
                  placeholder="38.5"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-rose-400" />
                  FC (bpm)
                </label>
                <input
                  type="number"
                  value={heartRateBpm ?? ''}
                  onChange={(e) => setHeartRateBpm(parseInt(e.target.value, 10) || undefined)}
                  placeholder="100"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1">
                  FR (rpm)
                </label>
                <input
                  type="number"
                  value={respiratoryRateRpm ?? ''}
                  onChange={(e) => setRespiratoryRateRpm(parseInt(e.target.value, 10) || undefined)}
                  placeholder="24"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-emerald-500 text-center"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Mucosas
                </label>
                <select
                  value={mucousMembranes}
                  onChange={(e) => setMucousMembranes(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="normocoradas">Normocoradas (Rosa)</option>
                  <option value="palidas">Pálidas</option>
                  <option value="congestas">Congestas / Avermelhadas</option>
                  <option value="cianoticas">Cianóticas (Azuladas)</option>
                  <option value="ictéricas">Ictéricas (Amareladas)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Hidratação
                </label>
                <select
                  value={hydrationStatus}
                  onChange={(e) => setHydrationStatus(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="hidratado">Hidratado (Normal)</option>
                  <option value="desidratado_leve">Desidratação Leve (5%)</option>
                  <option value="desidratado_moderado">Moderada (7-8%)</option>
                  <option value="desidratado_grave">Grave (+10%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Queixa Principal Relatada pelo Tutor *
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Prurido em orelhas há 3 dias, perda de apetite, claudicação de membro anterior..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Anamnese & Histórico Clínico
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Animal castrado, vermifugação em dia, alimentação com ração premium, sem episódios prévios..."
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Diagnóstico Clínico / Suspeita
                </label>
                <input
                  type="text"
                  placeholder="Ex: Otite externa ceruminosa mista / Dermatite alérgica"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Data para Retorno Clínico (Opcional)
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Receituário / Prescrição de Medicamentos
              </label>
              <textarea
                rows={3}
                placeholder="1. Medicação X (mg) - Administrar 1 comprimido a cada 12h durante 7 dias por via oral.&#10;2. Pomada tópica Y - Aplicar 2x ao dia após higienização..."
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Section 3: Standard Catalog Veterinary Services */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                3. Serviços Veterinários Cadastrados no Catálogo
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                Subtotal: R$ {standardTotal.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {catalogVetServices.map((srv) => {
                const isSelected = selectedStandardServiceIds.includes(srv.id);
                const srvPrice = currentPet?.size
                  ? (srv.priceBySize?.[currentPet.size] ?? srv.price ?? srv.basePrice)
                  : (srv.price ?? srv.basePrice);

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => toggleStandardService(srv.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-xs font-bold line-clamp-1">{srv.name}</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400 text-[10px]">{srv.durationMinutes || 30} min</span>
                      <span className="font-bold text-emerald-400">R$ {srvPrice.toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Ad-hoc / Unlisted Veterinary Services (O Requisito do Usuário!) */}
          <div className="bg-slate-950 p-4 rounded-xl border-2 border-dashed border-amber-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  4. Informar Serviço ou Procedimento Não Mencionado no Catálogo (Avulso)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Permite ao médico veterinário lançar qualquer procedimento especial realizado na hora sem precisar cadastrá-lo previamente.
                </p>
              </div>
              <span className="text-xs text-amber-400 font-bold shrink-0">
                Subtotal Avulsos: R$ {customTotal.toFixed(2)}
              </span>
            </div>

            {/* Form to add custom unlisted service */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Nome do Procedimento / Serviço Avulso *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sutura de ferida superficial / Lavagem gástrica / Curativo complexo..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="procedimento">Procedimento Ambulatorial</option>
                    <option value="medicacao">Medicação Injetável / Dose</option>
                    <option value="exame">Exame Rápido / Triagem</option>
                    <option value="cirurgia">Pequena Cirurgia</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Valor Cobrado (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="0.00"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-10">
                  <input
                    type="text"
                    placeholder="Justificativa ou descrição técnica breve do procedimento (opcional)..."
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of custom services already added */}
            {customServices.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Procedimentos Avulsos Inclusos Neste Atendimento ({customServices.length}):
                </span>
                <div className="divide-y divide-slate-800 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                  {customServices.map((cst) => (
                    <div
                      key={cst.id}
                      className="p-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{cst.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase font-semibold">
                            {cst.category}
                          </span>
                        </div>
                        {cst.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{cst.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-extrabold text-amber-400 text-xs">
                          R$ {cst.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomService(cst.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remover procedimento avulso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-slate-500 italic">
                Nenhum procedimento veterinário avulso adicionado até o momento.
              </div>
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Total Geral do Atendimento Veterinário</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400">
                  R$ {totalAmount.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">
                  ({selectedStandardServiceIds.length} do catálogo + {customServices.length} avulso(s))
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{consultationToEdit ? 'Salvar Alterações' : 'Concluir Atendimento'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
