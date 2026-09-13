import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  HeartPulse,
  DollarSign,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Printer,
  Dog,
  Syringe,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { VeterinaryConsultation, Pet } from '../../types';
import { VeterinaryConsultationModal } from './VeterinaryConsultationModal';
import { VeterinaryRecordViewModal } from './VeterinaryRecordViewModal';

export const VeterinaryConsultationsManager: React.FC = () => {
  const {
    veterinaryConsultations,
    deleteVeterinaryConsultation,
    updateVeterinaryConsultation,
    billVeterinaryConsultationToPDV,
    pets,
  } = useStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modals state
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationToEdit, setConsultationToEdit] = useState<VeterinaryConsultation | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedConsultationForRecord, setSelectedConsultationForRecord] = useState<VeterinaryConsultation | null>(null);

  // Filter consultations
  const filteredConsultations = veterinaryConsultations.filter((c) => {
    const matchesSearch =
      c.petName.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.veterinarianName.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.diagnosis && c.diagnosis.toLowerCase().includes(search.toLowerCase())) ||
      (c.customServices && c.customServices.some((cs) => cs.name.toLowerCase().includes(search.toLowerCase())));

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || c.paymentStatus === paymentFilter;

    return matchesSearch && matchesType && matchesStatus && matchesPayment;
  });

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayConsultations = veterinaryConsultations.filter((c) => c.date === todayStr);
  const inProgressCount = veterinaryConsultations.filter((c) => c.status === 'em_atendimento').length;
  const completedCount = veterinaryConsultations.filter((c) => c.status === 'concluido').length;
  const totalRevenue = veterinaryConsultations
    .filter((c) => c.status !== 'cancelado')
    .reduce((sum, c) => sum + c.totalAmount, 0);
  const totalCustomServicesCount = veterinaryConsultations.reduce(
    (sum, c) => sum + (c.customServices?.length || 0),
    0
  );

  const getStatusBadge = (status: VeterinaryConsultation['status']) => {
    switch (status) {
      case 'agendado':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
            Agendado / Recepção
          </span>
        );
      case 'em_atendimento':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold animate-pulse">
            Em Atendimento
          </span>
        );
      case 'concluido':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            Atendimento Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
            Cancelado
          </span>
        );
    }
  };

  const getTypeLabel = (type: VeterinaryConsultation['type']) => {
    switch (type) {
      case 'consulta_geral':
        return 'Consulta Geral';
      case 'retorno':
        return 'Retorno Clínico';
      case 'emergencia':
        return 'Urgência / Emergência';
      case 'vacinacao':
        return 'Vacinação';
      case 'cirurgia':
        return 'Cirúrgico / Sedação';
      case 'exame':
        return 'Exames / Triagem';
      default:
        return 'Procedimento Clínico';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Banner */}
      <div className="bg-emerald-950/30 border border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                Consultório & Clínica Veterinária Especializada
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Área Clínica Separada
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Prontuários clínicos, histórico de saúde do pet, emissão de receitas com CRMV e lançamento ágil de <strong>procedimentos avulsos e serviços não listados</strong> com faturamento direto no PDV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setConsultationToEdit(null);
              setShowConsultationModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Atendimento Clínico</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block">Hoje no Consultório</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-white">{todayConsultations.length}</span>
            <span className="text-[10px] text-slate-500">atendimento(s)</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block">Em Atendimento</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-blue-400">{inProgressCount}</span>
            <span className="text-[10px] text-slate-500">em consultório</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block">Procedimentos Avulsos</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-amber-400">{totalCustomServicesCount}</span>
            <span className="text-[10px] text-slate-500">serviços informados</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 font-semibold block">Total em Procedimentos</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-emerald-400">
              R$ {totalRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por pet, tutor, CRMV ou diagnóstico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="consulta_geral">Consulta Geral</option>
            <option value="retorno">Retorno</option>
            <option value="emergencia">Emergência</option>
            <option value="vacinacao">Vacinação</option>
            <option value="cirurgia">Cirurgia / Sedação</option>
            <option value="exame">Exames</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="agendado">Agendado</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Pagamentos</option>
            <option value="pendente">Pendente no Caixa</option>
            <option value="pago">Pago</option>
          </select>
        </div>
      </div>

      {/* Consultations List / Cards */}
      {filteredConsultations.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum atendimento veterinário encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não há registros correspondentes aos filtros selecionados. Clique no botão abaixo para iniciar uma nova consulta clínica.
          </p>
          <button
            type="button"
            onClick={() => {
              setConsultationToEdit(null);
              setShowConsultationModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Atendimento Clínico</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((cons) => {
            const hasCustom = cons.customServices && cons.customServices.length > 0;

            return (
              <div
                key={cons.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4 shadow-md"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                      🐾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {cons.petName}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({cons.petSpecies.toUpperCase()} • {cons.petBreed}
                          {cons.petWeightKg ? `, ${cons.petWeightKg}kg` : ''})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                          {cons.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tutor(a): <strong className="text-slate-200">{cons.clientName}</strong>{' '}
                        {cons.clientPhone && `(${cons.clientPhone})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(cons.status)}
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {getTypeLabel(cons.type)}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        cons.paymentStatus === 'pago'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {cons.paymentStatus === 'pago' ? 'Pago' : 'Pendente no Caixa'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Vet & Schedule */}
                  <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Responsável Técnico
                    </span>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                      {cons.veterinarianName}
                    </div>
                    <div className="text-emerald-400 font-mono text-[11px] font-semibold">
                      CRMV: {cons.crmv}
                    </div>
                    <div className="text-slate-400 flex items-center gap-1 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(cons.date).toLocaleDateString('pt-BR')} às {cons.time}
                    </div>
                  </div>

                  {/* Column 2: Clinical Summary & Vitals */}
                  <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Diagnóstico & Sinais Vitais
                    </span>
                    <div className="text-slate-200">
                      <strong>Diagnóstico:</strong>{' '}
                      {cons.diagnosis || cons.chiefComplaint || 'Em avaliação'}
                    </div>
                    {(cons.temperatureCelsius || cons.heartRateBpm) && (
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        {cons.temperatureCelsius && (
                          <span>🌡️ {cons.temperatureCelsius}°C</span>
                        )}
                        {cons.heartRateBpm && (
                          <span>💓 {cons.heartRateBpm} bpm</span>
                        )}
                      </div>
                    )}
                    {cons.returnDate && (
                      <div className="text-blue-400 text-[11px] font-semibold">
                        Retorno agendado: {new Date(cons.returnDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Services & Values */}
                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Serviços & Procedimentos
                      </span>
                      <div className="space-y-1">
                        {cons.standardServices.map((s, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                            <span className="line-clamp-1">• {s.serviceName}</span>
                            <span className="font-semibold text-slate-400">R$ {s.price.toFixed(2)}</span>
                          </div>
                        ))}

                        {/* Ad-hoc / Custom unlisted services highlighted */}
                        {cons.customServices?.map((cs) => (
                          <div
                            key={cs.id}
                            className="flex justify-between text-[11px] text-amber-300 font-medium"
                          >
                            <span className="line-clamp-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                              {cs.name} (Avulso)
                            </span>
                            <span className="font-bold text-amber-400">R$ {cs.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                      <span className="text-slate-400 font-bold">Total:</span>
                      <span className="text-base font-black text-emerald-400">
                        R$ {cons.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {hasCustom && (
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {cons.customServices.length} procedimento(s) avulso(s) informado(s)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View/Print Medical Record & Prescription */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedConsultationForRecord(cons);
                        setShowRecordModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Prontuário / Receita</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        setConsultationToEdit(cons);
                        setShowConsultationModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Editar atendimento ou adicionar procedimentos"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Bill to PDV */}
                    {cons.paymentStatus !== 'pago' ? (
                      <button
                        type="button"
                        onClick={() => billVeterinaryConsultationToPDV(cons.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                        title="Enviar procedimentos e valores para a tela de PDV / Caixa"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Cobrar no PDV</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 px-2 py-1 bg-emerald-950/40 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pago
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir o atendimento de ${cons.petName}?`)) {
                          deleteVeterinaryConsultation(cons.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir prontuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showConsultationModal && (
        <VeterinaryConsultationModal
          isOpen={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
          consultationToEdit={consultationToEdit}
        />
      )}

      {showRecordModal && (
        <VeterinaryRecordViewModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          consultation={selectedConsultationForRecord}
          onBillToPDV={billVeterinaryConsultationToPDV}
        />
      )}
    </div>
  );
};
