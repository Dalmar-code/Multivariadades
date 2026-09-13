import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { VaccineAppointment } from '../../types';
import { RETAIL_NICHES } from '../../utils/retailNiches';
import {
  Syringe,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Printer,
  X,
  User,
  ShieldCheck,
  Building2,
  FileCheck2,
  CalendarCheck,
  Dog,
  Sparkles,
  Info,
} from 'lucide-react';

export const VaccineManager: React.FC = () => {
  const {
    company,
    companyNiche,
    vaccineAppointments,
    addVaccineAppointment,
    completeVaccineAppointment,
    deleteVaccineAppointment,
    clients,
    products,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [patientTypeFilter, setPatientTypeFilter] = useState<'all' | 'humano' | 'pet'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentForPrint, setSelectedAppointmentForPrint] = useState<VaccineAppointment | null>(null);

  // Form State
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [patientType, setPatientType] = useState<'humano' | 'pet'>(
    companyNiche === 'petshop' ? 'pet' : 'humano'
  );
  const [patientName, setPatientName] = useState('');
  const [patientDocument, setPatientDocument] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [applicationTime, setApplicationTime] = useState('10:00');
  const [doseNumber, setDoseNumber] = useState<'1ª Dose' | '2ª Dose' | '3ª Dose' | 'Reforço Anual' | 'Dose Única'>('Dose Única');
  const [applicationSite, setApplicationSite] = useState<'Deltoide Esquerdo' | 'Deltoide Direito' | 'Vasto Lateral' | 'Glúteo' | 'Subcutânea' | 'Oral'>('Deltoide Esquerdo');
  const [professionalName, setProfessionalName] = useState(
    companyNiche === 'petshop' ? 'Dr. Leonardo Paiva' : 'Dra. Juliana Mendes'
  );
  const [professionalRegistry, setProfessionalRegistry] = useState(
    companyNiche === 'petshop' ? 'CRMV-SP 28.400' : 'CRF-SP 45.120'
  );
  const [price, setPrice] = useState<number>(98.0);
  const [notes, setNotes] = useState('');

  // Handle client select auto-fill
  const handleClientSelect = (selectedId: string) => {
    setClientId(selectedId);
    const client = clients.find((c) => c.id === selectedId);
    if (client) {
      setClientName(client.name);
      setClientPhone(client.phone || client.whatsapp || '');
      setPatientName(client.name);
      setPatientDocument(client.document);
    }
  };

  // Handle product select auto-fill (when selecting a vaccine product from stock)
  const handleVaccineProductSelect = (productName: string) => {
    setVaccineName(productName);
    const prod = products.find((p) => p.name === productName);
    if (prod) {
      if (prod.brand) setManufacturer(prod.brand);
      if (prod.batchNumber) setBatchNumber(prod.batchNumber);
      if (prod.expirationDate) setExpirationDate(prod.expirationDate);
      if (prod.salePrice) setPrice(prod.salePrice);
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !vaccineName || !applicationDate) {
      alert('Preencha os campos obrigatórios: Cliente, Vacina e Data.');
      return;
    }

    addVaccineAppointment({
      clientId: clientId || 'cli_' + Date.now(),
      clientName,
      clientPhone,
      patientType,
      patientName: patientName || clientName,
      patientDocument,
      patientBirthDate,
      vaccineName,
      manufacturer,
      batchNumber: batchNumber || 'LOTE-' + Math.floor(1000 + Math.random() * 9000),
      expirationDate: expirationDate || '2027-12-31',
      applicationDate,
      applicationTime,
      doseNumber,
      applicationSite,
      professionalName,
      professionalRegistry,
      status: 'scheduled',
      price: Number(price) || 0,
      notes,
    });

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setClientId('');
    setClientName('');
    setClientPhone('');
    setPatientName('');
    setPatientDocument('');
    setPatientBirthDate('');
    setVaccineName('');
    setManufacturer('');
    setBatchNumber('');
    setExpirationDate('');
    setNotes('');
  };

  const filteredAppointments = vaccineAppointments.filter((item) => {
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.patientName && item.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPatientType = patientTypeFilter === 'all' || item.patientType === patientTypeFilter;

    return matchesSearch && matchesStatus && matchesPatientType;
  });

  const scheduledCount = vaccineAppointments.filter((a) => a.status === 'scheduled').length;
  const completedCount = vaccineAppointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Syringe className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Agenda de Vacinas & Imunobiológicos
            </h1>
          </div>
          <p className="text-slate-600 text-sm">
            Controle clínico de vacinação humana e veterinária, rastreabilidade de lote/validade, dosagens e emissão de comprovante oficial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            id="btn-new-vaccine-appointment"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento / Aplicação</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{scheduledCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aguardando Aplicação
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{completedCount}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vacinas Aplicadas / Concluídas
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{vaccineAppointments.length}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total em Histórico Clínico
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, paciente, vacina ou lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>

            {companyNiche !== 'petshop' && (
              <select
                value={patientTypeFilter}
                onChange={(e) => setPatientTypeFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
              >
                <option value="all">Todos os Registros</option>
                <option value="humano">Atendimento Geral</option>
                <option value="pet">Pets (Veterinária)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Syringe className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-bold text-base text-slate-700">Nenhum agendamento de vacina encontrado</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Clique no botão "Novo Agendamento" acima para cadastrar a aplicação de vacinas para seus clientes ou pets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Paciente & Cliente</th>
                  <th className="py-3 px-4">Imunobiológico / Vacina</th>
                  <th className="py-3 px-4">Lote & Validade</th>
                  <th className="py-3 px-4">Dose & Local</th>
                  <th className="py-3 px-4">Responsável Técnico</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {new Date(item.applicationDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.applicationTime || 'Horário livre'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {item.patientType === 'pet' ? (
                          <span className="p-1 bg-amber-100 text-amber-800 rounded-md">
                            <Dog className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 bg-blue-100 text-blue-800 rounded-md">
                            <User className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span>{item.patientName || item.clientName}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Resp: {item.clientName} {item.clientPhone && `• ${item.clientPhone}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-950">{item.vaccineName}</div>
                      <div className="text-xs text-slate-500">
                        {item.manufacturer ? `Fabricante: ${item.manufacturer}` : 'Vacina Regulamentada'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                        Lote: {item.batchNumber}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Val: {item.expirationDate ? new Date(item.expirationDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Indeterminado'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      <span className="font-bold text-slate-800">{item.doseNumber}</span>
                      <div className="text-slate-500">{item.applicationSite}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{item.professionalName}</div>
                      <div className="text-slate-500">{item.professionalRegistry}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aplicado
                        </span>
                      ) : item.status === 'scheduled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          Agendado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          Cancelado
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'scheduled' && (
                          <button
                            type="button"
                            title="Confirmar Aplicação"
                            onClick={() => completeVaccineAppointment(item.id, 'Aplicação realizada sem intercorrências')}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Imprimir Carteira / Comprovante de Vacinação"
                          onClick={() => setSelectedAppointmentForPrint(item)}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Excluir Registro"
                          onClick={() => {
                            if (confirm('Deseja realmente remover este agendamento?')) {
                              deleteVaccineAppointment(item.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Novo Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Agendar / Registrar Aplicação de Vacina</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
              {/* Seleção Rápida de Cliente Cadastrado */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular a Cliente Cadastrado (Opcional)
                </label>
                <select
                  value={clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Selecione ou digite manualmente abaixo --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.document}) {c.preferredNiche ? `[${c.preferredNiche}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Paciente */}
              {companyNiche !== 'petshop' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPatientType('humano')}
                    className={`py-2 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      patientType === 'humano'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Paciente / Atendimento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPatientType('pet')}
                    className={`py-2 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      patientType === 'pet'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Dog className="w-4 h-4" />
                    <span>Animal / Pet (Veterinária)</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                  <Dog className="w-4 h-4 text-amber-600" />
                  <span>Atendimento Veterinário Pet</span>
                </div>
              )}

              {/* Dados do Paciente e Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Responsável / Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Mariana Duarte Souza"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp para Avisos
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Paciente (ou Nome do Pet)
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Ex: Mariana ou Thor (Golden)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF ou RG do Paciente
                  </label>
                  <input
                    type="text"
                    value={patientDocument}
                    onChange={(e) => setPatientDocument(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={patientBirthDate}
                    onChange={(e) => setPatientBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Informações da Vacina e Estoque */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Dados do Imunobiológico & Lote
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Rastreabilidade Sanitária
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Vacina / Medicamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    placeholder="Ex: Gripe Tetravalente 2026, Febre Amarela, V10 Canina..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fabricante / Laboratório
                    </label>
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="Ex: Sanofi, GSK, Pfizer, Butantan"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número do Lote *
                    </label>
                    <input
                      type="text"
                      required
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="Ex: LOT-269B"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data de Validade do Frasco *
                    </label>
                    <input
                      type="date"
                      required
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Data, Horário, Dose e Local de Aplicação */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data da Aplicação *
                  </label>
                  <input
                    type="date"
                    required
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={applicationTime}
                    onChange={(e) => setApplicationTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dose
                  </label>
                  <select
                    value={doseNumber}
                    onChange={(e) => setDoseNumber(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Dose Única">Dose Única</option>
                    <option value="1ª Dose">1ª Dose</option>
                    <option value="2ª Dose">2ª Dose</option>
                    <option value="3ª Dose">3ª Dose</option>
                    <option value="Reforço Anual">Reforço Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Local de Aplicação
                  </label>
                  <select
                    value={applicationSite}
                    onChange={(e) => setApplicationSite(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Deltoide Esquerdo">Deltoide Esquerdo</option>
                    <option value="Deltoide Direito">Deltoide Direito</option>
                    <option value="Glúteo">Glúteo</option>
                    <option value="Vasto Lateral">Vasto Lateral</option>
                    <option value="Subcutânea">Subcutânea</option>
                    <option value="Oral">Oral</option>
                  </select>
                </div>
              </div>

              {/* Responsável Técnico & Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profissional Aplicador
                  </label>
                  <input
                    type="text"
                    value={professionalName}
                    onChange={(e) => setProfessionalName(e.target.value)}
                    placeholder="Nome do Farmacêutico ou Veterinário"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registro Profissional (CRF/CRMV)
                  </label>
                  <input
                    type="text"
                    value={professionalRegistry}
                    onChange={(e) => setProfessionalRegistry(e.target.value)}
                    placeholder="CRF-SP 00.000 ou CRMV-SP 00.000"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Cobrado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações / Histórico de Alergias
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Paciente relata sem alergia a ovo ou componentes. Recomendado retorno para reforço em 1 ano."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprovante / Carteira de Vacinação (Modal de Impressão) */}
      {selectedAppointmentForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header do Comprovante */}
            <div className="text-center border-b pb-4 border-slate-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Comprovante de Aplicação de Vacina
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {company.tradeName || company.corporateName} • CNPJ: {company.cnpj}
              </p>
              <p className="text-[11px] text-slate-400">
                {company.address?.street ? `${company.address.street}, ${company.address.number || 'S/N'} - ${company.address.city || ''}/${company.address.state || 'SP'}` : 'Endereço Comercial'}
              </p>
            </div>

            {/* Informações do Paciente */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Paciente:</span>
                <span className="font-bold text-slate-900">{selectedAppointmentForPrint.patientName || selectedAppointmentForPrint.clientName}</span>
              </div>
              {selectedAppointmentForPrint.patientDocument && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">CPF / Documento:</span>
                  <span className="font-mono text-slate-900">{selectedAppointmentForPrint.patientDocument}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Responsável:</span>
                <span className="text-slate-800">{selectedAppointmentForPrint.clientName}</span>
              </div>
            </div>

            {/* Detalhes do Imunobiológico */}
            <div className="space-y-3 text-xs border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl">
              <div className="flex justify-between border-b border-emerald-100 pb-2">
                <span className="text-emerald-900 font-semibold">Vacina / Imunobiológico:</span>
                <strong className="text-emerald-950 font-black">{selectedAppointmentForPrint.vaccineName}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-500 block">Laboratório / Fabricante:</span>
                  <strong>{selectedAppointmentForPrint.manufacturer || 'Oficial'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Número do Lote:</span>
                  <strong className="font-mono">{selectedAppointmentForPrint.batchNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Data de Aplicação:</span>
                  <strong>{new Date(selectedAppointmentForPrint.applicationDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Validade do Frasco:</span>
                  <strong>{selectedAppointmentForPrint.expirationDate ? new Date(selectedAppointmentForPrint.expirationDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Dose:</span>
                  <strong>{selectedAppointmentForPrint.doseNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Via / Local:</span>
                  <strong>{selectedAppointmentForPrint.applicationSite}</strong>
                </div>
              </div>
            </div>

            {/* Responsável Técnico */}
            <div className="pt-4 border-t border-slate-200 text-center space-y-1">
              <div className="w-48 h-0.5 bg-slate-300 mx-auto mt-6 mb-2"></div>
              <div className="text-xs font-bold text-slate-900">{selectedAppointmentForPrint.professionalName}</div>
              <div className="text-[11px] text-slate-500">{selectedAppointmentForPrint.professionalRegistry}</div>
              <div className="text-[10px] text-slate-400 mt-2">
                Documento emitido nos termos da RDC nº 197/2017 da ANVISA para serviços de vacinação em farmácias e drogarias.
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAppointmentForPrint(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Gerar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
