import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  FileCheck,
  Search,
  DollarSign,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  X,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CashRegisterSession } from '../../types';
import { BackButton } from '../common/BackButton';

export const TreasuryReconciliation: React.FC = () => {
  const {
    sessionsHistory,
    auditTreasurySession,
    currentUser,
    company,
    pdvRegisters,
    branches,
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'divergent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<CashRegisterSession | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [printTermModalOpen, setPrintTermModalOpen] = useState(false);

  // Form states for audit
  const [auditStatus, setAuditStatus] = useState<'approved' | 'divergent' | 'adjusted'>('approved');
  const [treasuryNotes, setTreasuryNotes] = useState('');

  // Filtered closed sessions
  const closedSessions = sessionsHistory.filter((s) => s.status === 'closed');

  const filteredSessions = closedSessions.filter((s) => {
    const matchesSearch =
      s.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.pdvName && s.pdvName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.pdvCode && s.pdvCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const isAudited = s.treasuryAudit?.audited;
    const isDivergent = (s.difference || 0) !== 0;

    if (filterStatus === 'pending') return matchesSearch && !isAudited;
    if (filterStatus === 'approved') return matchesSearch && isAudited && s.treasuryAudit?.status === 'approved';
    if (filterStatus === 'divergent') return matchesSearch && (isDivergent || s.treasuryAudit?.status === 'divergent');

    return matchesSearch;
  });

  // Metrics
  const totalSessions = closedSessions.length;
  const pendingAudit = closedSessions.filter((s) => !s.treasuryAudit?.audited).length;
  const approvedAudit = closedSessions.filter((s) => s.treasuryAudit?.status === 'approved').length;
  const withDivergence = closedSessions.filter((s) => (s.difference || 0) !== 0).length;

  const handleOpenAudit = (session: CashRegisterSession) => {
    setSelectedSession(session);
    setAuditStatus((session.difference || 0) === 0 ? 'approved' : 'divergent');
    setTreasuryNotes(session.treasuryAudit?.treasuryNotes || '');
    setAuditModalOpen(true);
  };

  const handleConfirmAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    auditTreasurySession(selectedSession.id, {
      status: auditStatus,
      treasuryNotes: treasuryNotes.trim() || 'Conferência de batida de caixa realizada e homologada pela Tesouraria.',
      auditorName: currentUser?.name || 'Chefe da Tesouraria',
    });

    setAuditModalOpen(false);
  };

  const handlePrintAuditTerm = (session: CashRegisterSession) => {
    setSelectedSession(session);
    setPrintTermModalOpen(true);
  };

  const executePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Tesouraria — Conferência e Batida de Caixa
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Módulo exclusivo da chefia de tesouraria para auditoria, conciliação e homologação dos fechamentos dos operadores de caixa PDV.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <BackButton variant="light" label="Voltar" />
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Responsável: {currentUser?.name} ({currentUser?.jobTitle || 'Chefe de Tesouraria'})
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fechamentos Totais</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalSessions} turnos</div>
            <span className="text-[11px] text-slate-500">Registrados pelos caixas</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pendentes de Batida</span>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">{pendingAudit} caixas</div>
            <span className="text-[11px] text-amber-700 font-semibold">Aguardando tesouraria</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Batidas Aprovadas</span>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">{approvedAudit} caixas</div>
            <span className="text-[11px] text-emerald-700 font-semibold">100% auditados</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Divergências / Sobra / Falta</span>
            <div className="text-2xl font-extrabold text-rose-900 mt-1">{withDivergence} turnos</div>
            <span className="text-[11px] text-rose-700 font-semibold">Requerem apuração</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por operador, código ou terminal PDV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600">Filtrar Batida:</span>
          {(
            [
              { id: 'all', label: 'Todos os Fechamentos' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'approved', label: 'Aprovados' },
              { id: 'divergent', label: 'Com Diferença' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Sessions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h2 className="font-extrabold text-sm text-slate-900">
              Registros de Fechamento de Caixa para Conferência
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredSessions.length} turno(s) exibido(s)
          </span>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Nenhum fechamento pendente encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Quando os operadores de caixa realizarem o fechamento definitivo de seus turnos no PDV, os relatórios para conferência aparecerão listados aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 overflow-x-auto">
            {filteredSessions.map((session) => {
              const diff = session.difference || 0;
              const isZero = Math.abs(diff) < 0.01;
              const isSobra = diff > 0.01;
              const isFalta = diff < -0.01;
              const isAudited = session.treasuryAudit?.audited;

              return (
                <div
                  key={session.id}
                  className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {session.pdvName || 'Caixa PDV'} ({session.pdvCode || 'CX'})
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Operador: {session.cashierName}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(session.openedAt).toLocaleDateString('pt-BR')} • {new Date(session.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} até {session.closedAt ? new Date(session.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'}
                      </span>
                      {session.closedDefinitive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          Fechado em Definitivo
                        </span>
                      )}
                    </div>

                    {/* Breakdown of Values */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Dinheiro Físico</span>
                        <div className="font-bold text-slate-800">
                          Declarado: R$ {session.declaredBalance?.dinheiro.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Sistema: R$ {session.calculatedBalance?.dinheiro.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Cartões & PIX</span>
                        <div className="font-bold text-slate-800">
                          Declarado: R$ {((session.declaredBalance?.cartaoDebito || 0) + (session.declaredBalance?.cartaoCredito || 0) + (session.declaredBalance?.pix || 0)).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Sistema: R$ {((session.calculatedBalance?.cartaoDebito || 0) + (session.calculatedBalance?.cartaoCredito || 0) + (session.calculatedBalance?.pix || 0)).toFixed(2)}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Geral do Caixa</span>
                        <div className="font-extrabold text-slate-900 text-sm">
                          R$ {session.declaredBalance?.total.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Calculado: R$ {session.calculatedBalance?.total.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      <div
                        className={`p-2 rounded-lg border ${
                          isZero
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : isSobra
                            ? 'bg-blue-50 border-blue-300 text-blue-950'
                            : 'bg-rose-50 border-rose-300 text-rose-950'
                        }`}
                      >
                        <span className="text-[10px] font-bold block uppercase">Batida de Caixa</span>
                        <div className="font-extrabold text-sm">
                          {isZero && 'R$ 0,00 (Exato)'}
                          {isSobra && `+ R$ ${diff.toFixed(2)} (Sobra)`}
                          {isFalta && `- R$ ${Math.abs(diff).toFixed(2)} (Falta)`}
                        </div>
                        <span className="text-[10px] font-semibold block">
                          {isZero ? 'Caixa 100% Batido' : isSobra ? 'Sobra de Valores' : 'Quebra de Caixa'}
                        </span>
                      </div>
                    </div>

                    {session.notes && (
                      <div className="text-xs text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                        <strong>Nota do Operador:</strong> {session.notes}
                      </div>
                    )}

                    {session.treasuryAudit?.treasuryNotes && (
                      <div className="text-xs text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-200 mt-1">
                        <strong>Auditoria da Tesouraria ({session.treasuryAudit.auditorName}):</strong> {session.treasuryAudit.treasuryNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                    <div>
                      {isAudited ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Batida Homologada
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          Pendente de Batida
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrintAuditTerm(session)}
                        className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Imprimir Termo de Conferência de Batida"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Termo 80mm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAudit(session)}
                        className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                          isAudited
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <FileCheck className="w-4 h-4" />
                        {isAudited ? 'Revisar Batida' : 'Realizar Batida'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AUDIT MODAL FOR CHIEF OF TREASURY */}
      {auditModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base">
                  Conferência e Batida de Caixa — Tesouraria
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAudit} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Terminal: {selectedSession.pdvName} ({selectedSession.pdvCode})</span>
                  <span>Turno: {selectedSession.sessionDate}</span>
                </div>
                <div className="text-slate-600">
                  Operador do Caixa: <strong>{selectedSession.cashierName}</strong>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Modalidade</th>
                      <th className="p-2.5 text-right">Declarado Caixa</th>
                      <th className="p-2.5 text-right">Calculado Sistema</th>
                      <th className="p-2.5 text-right">Diferença</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="p-2.5 flex items-center gap-1.5 text-slate-800">
                        <Banknote className="w-4 h-4 text-emerald-600" /> Dinheiro
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-800">
                        R$ {selectedSession.declaredBalance?.dinheiro.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right text-slate-600">
                        R$ {selectedSession.calculatedBalance?.dinheiro.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        R$ {((selectedSession.declaredBalance?.dinheiro || 0) - (selectedSession.calculatedBalance?.dinheiro || 0)).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 flex items-center gap-1.5 text-slate-800">
                        <QrCode className="w-4 h-4 text-emerald-600" /> PIX
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-800">
                        R$ {selectedSession.declaredBalance?.pix.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right text-slate-600">
                        R$ {selectedSession.calculatedBalance?.pix.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        R$ {((selectedSession.declaredBalance?.pix || 0) - (selectedSession.calculatedBalance?.pix || 0)).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 flex items-center gap-1.5 text-slate-800">
                        <CreditCard className="w-4 h-4 text-blue-600" /> Cartão Débito
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-800">
                        R$ {selectedSession.declaredBalance?.cartaoDebito.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right text-slate-600">
                        R$ {selectedSession.calculatedBalance?.cartaoDebito.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        R$ {((selectedSession.declaredBalance?.cartaoDebito || 0) - (selectedSession.calculatedBalance?.cartaoDebito || 0)).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 flex items-center gap-1.5 text-slate-800">
                        <CreditCard className="w-4 h-4 text-blue-600" /> Cartão Crédito
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-800">
                        R$ {selectedSession.declaredBalance?.cartaoCredito.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right text-slate-600">
                        R$ {selectedSession.calculatedBalance?.cartaoCredito.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        R$ {((selectedSession.declaredBalance?.cartaoCredito || 0) - (selectedSession.calculatedBalance?.cartaoCredito || 0)).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2.5 text-slate-900">TOTAL GERAL</td>
                      <td className="p-2.5 text-right text-slate-900">
                        R$ {selectedSession.declaredBalance?.total.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2.5 text-right text-slate-900">
                        R$ {selectedSession.calculatedBalance?.total.toFixed(2) || '0.00'}
                      </td>
                      <td
                        className={`p-2.5 text-right text-sm ${
                          Math.abs(selectedSession.difference || 0) < 0.01
                            ? 'text-emerald-700'
                            : (selectedSession.difference || 0) > 0
                            ? 'text-blue-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {selectedSession.difference === 0
                          ? 'R$ 0,00'
                          : `${(selectedSession.difference || 0) > 0 ? '+' : ''} R$ ${(selectedSession.difference || 0).toFixed(2)}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status Decision */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Parecer da Tesouraria:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuditStatus('approved')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                      auditStatus === 'approved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Aprovado / Batido
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditStatus('divergent')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                      auditStatus === 'divergent'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Com Divergência
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditStatus('adjusted')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer ${
                      auditStatus === 'adjusted'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Ajuste Justificado
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações e Justificativas da Tesouraria:
                </label>
                <textarea
                  rows={3}
                  value={treasuryNotes}
                  onChange={(e) => setTreasuryNotes(e.target.value)}
                  placeholder="Ex: Cédulas conferidas, comprovantes de cartão POS batidos com o relatório da adquirente..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAuditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Homologar Batida de Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE AUDIT TERM MODAL (80mm) */}
      {printTermModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-bold text-sm">Termo de Batida de Caixa — 80mm</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={executePrint}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Termo
                </button>
                <button
                  type="button"
                  onClick={() => setPrintTermModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto font-mono text-xs text-slate-900 bg-white printable-receipt leading-tight">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
                <h2 className="font-extrabold text-sm uppercase">{company.tradeName}</h2>
                <p className="text-[10px]">CNPJ: {company.cnpj}</p>
                <p className="text-[11px] font-bold mt-1 bg-slate-100 p-1 rounded">
                  TERMO DE CONFERÊNCIA E BATIDA DE CAIXA
                </p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[11px]">
                <p>Data do Turno: <strong>{selectedSession.sessionDate}</strong></p>
                <p>Terminal: <strong>{selectedSession.pdvName} ({selectedSession.pdvCode})</strong></p>
                <p>Operador: <strong>{selectedSession.cashierName}</strong></p>
                <p>Fechamento: {selectedSession.closedAt ? new Date(selectedSession.closedAt).toLocaleString('pt-BR') : '---'}</p>
                <p>Auditor Tesouraria: <strong>{selectedSession.treasuryAudit?.auditorName || currentUser?.name}</strong></p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="font-bold">RESUMO DA CONFERÊNCIA:</div>
                <div className="flex justify-between">
                  <span>Dinheiro Informado:</span>
                  <span>R$ {selectedSession.declaredBalance?.dinheiro.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PIX Informado:</span>
                  <span>R$ {selectedSession.declaredBalance?.pix.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartões Débito/Crédito:</span>
                  <span>R$ {((selectedSession.declaredBalance?.cartaoDebito || 0) + (selectedSession.declaredBalance?.cartaoCredito || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-300 pt-1">
                  <span>TOTAL DECLARADO:</span>
                  <span>R$ {selectedSession.declaredBalance?.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Sistema:</span>
                  <span>R$ {selectedSession.calculatedBalance?.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm border-t border-slate-400 pt-1">
                  <span>DIFERENÇA (SOBRA/FALTA):</span>
                  <span>
                    {(selectedSession.difference || 0) === 0
                      ? 'R$ 0,00 (EXATO)'
                      : `R$ ${(selectedSession.difference || 0).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 text-[10px]">
                <p className="font-bold">PARECER DA TESOURARIA:</p>
                <p>{selectedSession.treasuryAudit?.treasuryNotes || 'Valores conferidos fisicamente e homologados pelo chefe de tesouraria.'}</p>
              </div>

              {/* Signatures */}
              <div className="pt-6 space-y-6 text-center text-[10px]">
                <div>
                  <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
                  <p className="font-bold">{selectedSession.cashierName}</p>
                  <p className="text-[9px] text-slate-500">Operador de Caixa PDV</p>
                </div>

                <div>
                  <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
                  <p className="font-bold">{selectedSession.treasuryAudit?.auditorName || currentUser?.name}</p>
                  <p className="text-[9px] text-slate-500">Chefe da Tesouraria / Auditor Financeiro</p>
                </div>

                <p className="text-[8px] text-slate-400">
                  Documento emitido em {new Date().toLocaleString('pt-BR')} • MultiVariedades ERP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
