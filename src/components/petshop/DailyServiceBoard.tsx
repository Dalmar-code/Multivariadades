import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Dog,
  CheckCircle2,
  AlertCircle,
  Truck,
  Scissors,
  DollarSign,
  Sparkles,
  MessageSquare,
  ShoppingCart,
  Printer,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  ArrowRight,
  User,
  Plus,
  Play,
  Check,
  Building2,
} from 'lucide-react';
import { PetAppointment, PetAppointmentStep } from '../../types';
import { useStore } from '../../context/StoreContext';
import { MultiPetSchedulerModal } from './MultiPetSchedulerModal';

const STEPS_ORDER: { step: PetAppointmentStep; label: string; shortLabel: string; color: string; bg: string; border: string }[] = [
  {
    step: 'aguardando',
    label: 'Aguardando Entrada',
    shortLabel: 'Aguardando',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    step: 'retirado',
    label: 'Na Loja / Recebido',
    shortLabel: 'Na Loja',
    color: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  {
    step: 'em_andamento',
    label: 'Em Andamento',
    shortLabel: 'Em Andamento',
    color: 'text-purple-300',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    step: 'pronto',
    label: 'Pronto (Aguardando Retirada)',
    shortLabel: 'Pronto',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    step: 'entregue',
    label: 'Entregue',
    shortLabel: 'Entregue',
    color: 'text-slate-400',
    bg: 'bg-slate-800/40',
    border: 'border-slate-700',
  },
];

export const DailyServiceBoard: React.FC = () => {
  const {
    petAppointments,
    updatePetAppointmentStep,
    deletePetAppointment,
    billAppointmentToPDV,
    company,
  } = useStore();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);

  // Filter appointments by selected date and search
  const dayAppointments = petAppointments.filter((apt) => {
    const isDateMatch = apt.date === selectedDate;
    const isSearchMatch =
      apt.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.items.some(
        (i) =>
          i.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.primaryServiceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const isStepMatch = filterStep === 'all' || apt.currentStep === filterStep;

    return isDateMatch && isSearchMatch && isStepMatch;
  });

  // Daily statistics
  const totalDayAppointments = petAppointments.filter((a) => a.date === selectedDate).length;
  const countAguardando = petAppointments.filter((a) => a.date === selectedDate && a.currentStep === 'aguardando').length;
  const countRetirado = petAppointments.filter((a) => a.date === selectedDate && a.currentStep === 'retirado').length;
  const countEmAndamento = petAppointments.filter((a) => a.date === selectedDate && a.currentStep === 'em_andamento').length;
  const countPronto = petAppointments.filter((a) => a.date === selectedDate && a.currentStep === 'pronto').length;
  const countEntregue = petAppointments.filter((a) => a.date === selectedDate && a.currentStep === 'entregue').length;
  const totalEstimatedRevenue = petAppointments
    .filter((a) => a.date === selectedDate)
    .reduce((sum, a) => sum + (a.totalAmount || 0), 0);

  // Navigate date by +/- 1 day
  const changeDateBy = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // WhatsApp notification trigger
  const sendWhatsAppNotification = (apt: PetAppointment) => {
    const cleanPhone = apt.clientPhone?.replace(/\D/g, '') || '';
    const petNames = apt.items.map((i) => i.petName).join(', ');
    const storeName = company?.tradeName || company?.corporateName || 'Nosso Pet Shop';

    let message = '';
    if (apt.currentStep === 'pronto') {
      message = `Olá ${apt.clientName}! 🐾\nInformamos que seu pet (${petNames}) já terminou os procedimentos no ${storeName} e está PRONTO, limpinho e cheiroso para retirada!\nValor total: R$ ${apt.totalAmount.toFixed(2)}.`;
    } else {
      message = `Olá ${apt.clientName}! 🐾\nPassando para confirmar o agendamento de ${petNames} no ${storeName} para ${apt.date} às ${apt.time}.`;
    }

    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Print voucher
  const printServiceOrder = (apt: PetAppointment) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action & date selector bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeDateBy(-1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => changeDateBy(1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Próximo dia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
          >
            Hoje
          </button>
        </div>

        {/* View Mode & New Appointment */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quadro Esteira
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lista Completa
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSchedulerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento Multi-Pet</span>
          </button>
        </div>
      </div>

      {/* Daily Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total do Dia</span>
          <span className="text-lg font-black text-white">{totalDayAppointments}</span>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
            R$ {totalEstimatedRevenue.toFixed(2)}
          </span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-amber-500/20 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Cliente Irá Trazer</span>
          <span className="text-lg font-black text-amber-300">{countAguardando}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Aguardando entrada</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-sky-500/20 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-sky-400 block">Na Loja / Retirado</span>
          <span className="text-lg font-black text-sky-300">{countRetirado}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Aguardando banhista</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-purple-500/20 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-purple-400 block">Em Atendimento</span>
          <span className="text-lg font-black text-purple-300">{countEmAndamento}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Banho/Tosa em curso</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-emerald-500/20 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Prontos!</span>
          <span className="text-lg font-black text-emerald-300">{countPronto}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Prontos p/ tutor</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Entregues</span>
          <span className="text-lg font-black text-slate-300">{countEntregue}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Concluídos com sucesso</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3.5 border border-slate-800 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, pet, código ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterStep('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              filterStep === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas as Etapas
          </button>
          {STEPS_ORDER.map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setFilterStep(s.step)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                filterStep === s.step
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Board View: Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {STEPS_ORDER.map((col) => {
            const colAppointments = dayAppointments.filter((a) => a.currentStep === col.step);

            return (
              <div
                key={col.step}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-3 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color.replace('text-', 'bg-')}`} />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</h4>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {colAppointments.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-0.5">
                  {colAppointments.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-slate-500 border border-dashed border-slate-800/80 rounded-xl my-4">
                      Nenhum animal nesta etapa
                    </div>
                  ) : (
                    colAppointments.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onUpdateStep={(step) => updatePetAppointmentStep(apt.id, step)}
                        onBillToPDV={() => billAppointmentToPDV(apt.id)}
                        onWhatsApp={() => sendWhatsAppNotification(apt)}
                        onPrint={() => printServiceOrder(apt)}
                        onDelete={() => deletePetAppointment(apt.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Nenhum agendamento encontrado para o dia {selectedDate}.
            </div>
          ) : (
            dayAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onUpdateStep={(step) => updatePetAppointmentStep(apt.id, step)}
                onBillToPDV={() => billAppointmentToPDV(apt.id)}
                onWhatsApp={() => sendWhatsAppNotification(apt)}
                onPrint={() => printServiceOrder(apt)}
                onDelete={() => deletePetAppointment(apt.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Multi-Pet Scheduler Modal */}
      {showSchedulerModal && (
        <MultiPetSchedulerModal
          isOpen={showSchedulerModal}
          onClose={() => setShowSchedulerModal(false)}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
};

interface AppointmentCardProps {
  appointment: PetAppointment;
  onUpdateStep: (step: PetAppointmentStep) => void;
  onBillToPDV: () => void;
  onWhatsApp: () => void;
  onPrint: () => void;
  onDelete: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdateStep,
  onBillToPDV,
  onWhatsApp,
  onPrint,
  onDelete,
}) => {
  const currentStep = appointment.currentStep;
  const currentStepConfig = STEPS_ORDER.find((s) => s.step === currentStep) || STEPS_ORDER[0];
  const currentIndex = STEPS_ORDER.findIndex((s) => s.step === currentStep);
  const nextStep = currentIndex >= 0 && currentIndex < STEPS_ORDER.length - 1 ? STEPS_ORDER[currentIndex + 1] : null;

  return (
    <div className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all rounded-xl p-2.5 space-y-2 shadow-md">
      {/* Card Header: Code, Time, and Price */}
      <div className="flex items-center justify-between gap-1.5 border-b border-slate-800/80 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            {appointment.code}
          </span>
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {appointment.time}
          </span>
        </div>

        <span className="text-xs font-black text-emerald-400">
          R$ {appointment.totalAmount.toFixed(2)}
        </span>
      </div>

      {/* Tutor and Transport badge */}
      <div className="flex items-center justify-between text-xs gap-1">
        <div className="truncate min-w-0">
          <strong className="text-white text-xs truncate block">{appointment.clientName}</strong>
          {appointment.clientPhone && (
            <span className="text-[10px] text-slate-400 block">{appointment.clientPhone}</span>
          )}
        </div>

        {appointment.transportType === 'leva_e_traz' && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1 shrink-0">
            <Truck className="w-2.5 h-2.5" />
            Táxi Dog
          </span>
        )}
      </div>

      {/* Pets and services in this appointment */}
      <div className="space-y-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
        {appointment.items.map((item, idx) => (
          <div key={idx} className="text-[11px] space-y-0.5 pb-1 border-b border-slate-800/40 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1 truncate">
                <Dog className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{item.petName}</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  ({item.petSpecies})
                </span>
              </span>
              <span className="text-[10px] text-slate-300 font-semibold shrink-0">
                R$ {item.subtotal.toFixed(2)}
              </span>
            </div>

            <p className="text-[10px] text-slate-300 pl-4 truncate">
              {item.primaryServiceName}
            </p>

            {item.extraServices.length > 0 && (
              <div className="pl-4 flex flex-wrap gap-1">
                {item.extraServices.map((extra) => (
                  <span
                    key={extra.id}
                    className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-amber-300/90"
                  >
                    +{extra.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Streamlined Status Management */}
      <div className="pt-0.5 space-y-1.5">
        <div className="flex items-center justify-between gap-1 text-[10px]">
          <span className="text-slate-400 font-bold uppercase text-[9px]">Status:</span>
          <select
            value={currentStep}
            onChange={(e) => onUpdateStep(e.target.value as PetAppointmentStep)}
            className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer focus:outline-none bg-slate-900 ${currentStepConfig.color} ${currentStepConfig.border}`}
          >
            {STEPS_ORDER.map((s) => (
              <option key={s.step} value={s.step} className="bg-slate-900 text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {nextStep && (
          <button
            type="button"
            onClick={() => onUpdateStep(nextStep.step)}
            className="w-full py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <span>Avançar para: {nextStep.shortLabel}</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Bottom Actions: WhatsApp, Print, Bill to PDV */}
      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800/80">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onWhatsApp}
            className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
            title="Avisar Tutor pelo WhatsApp"
          >
            <MessageSquare className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Imprimir Ficha"
          >
            <Printer className="w-3 h-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={onBillToPDV}
          className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
          title="Enviar para frente de caixa PDV"
        >
          <ShoppingCart className="w-3 h-3" />
          <span>Faturar PDV</span>
        </button>
      </div>
    </div>
  );
};
