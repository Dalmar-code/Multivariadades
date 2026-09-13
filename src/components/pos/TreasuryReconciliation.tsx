import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Calendar,
  DollarSign,
  Receipt,
  User,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CashRegisterSession } from '../../types';

export const TreasuryReconciliation: React.FC = () => {
  const {
    sessionsHistory,
    auditTreasurySession,
    currentUser,
    company,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'divergent'>('all');
  const [selectedSession, setSelectedSession] = useState<CashRegisterSession | null>(null);
  const [auditStatus, setAuditStatus] = useState<'approved' | 'divergent' | 'adjusted'>('approved');
  const [auditNotes, setAuditNotes] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);

  const filteredSessions = sessionsHistory.filter((sess) => {
    const matchesSearch =
      sess.pdvCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.pdvName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.cashierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.sessionDate?.includes(searchTerm);

    const isAudited = sess.treasuryAudit?.audited;
    const currentAuditStatus = sess.treasuryAudit?.status || 'pending';

    if (filterStatus === 'pending') {
      return matchesSearch && !isAudited;
    }
    if (filterStatus === 'approved') {
      return matchesSearch && isAudited && currentAuditStatus === 'approved';
    }
    if (filterStatus === 'divergent') {
      return matchesSearch && isAudited && currentAuditStatus === 'divergent';
    }

    return matchesSearch;
  });

  const handleOpenAudit = (session: CashRegisterSession) => {
    setSelectedSession(session);
    setAuditStatus(session.treasuryAudit?.status === 'divergent' ? 'divergent' : 'approved');
    setAuditNotes(session.treasuryAudit?.treasuryNotes || '');
    setShowAuditModal(true);
  };

  const handleSaveAudit = () => {
    if (!selectedSession) return;
    auditTreasurySession(selectedSession.id, {
      status: auditStatus,
      treasuryNotes: auditNotes.trim() || 'Conferência realizada pela chefia da tesouraria sem ressalvas.',
      auditorName: currentUser?.name || 'Chefe da Tesouraria',
    });
    setShowAuditModal(false);
    setSelectedSession(null);
  };

  const printConferenceReport = (session: CashRegisterSession) => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Conferência da Tesouraria & Fechamentos de Caixa
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Chefe da Tesouraria
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Auditoria, conciliação de diferenças físicas e homologação dos fechamentos dos operadores de PDV
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total de Sessões Registradas</span>
            <span className="text-lg font-bold text-white">{sessionsHistory.length} fechamentos</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por caixa, operador ou data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos ({sessionsHistory.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Pendentes ({sessionsHistory.filter((s) => !s.treasuryAudit?.audited).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Aprovados ({sessionsHistory.filter((s) => s.treasuryAudit?.status === 'approved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('divergent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterStatus === 'divergent'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Com Divergência ({sessionsHistory.filter((s) => s.treasuryAudit?.status === 'divergent').length})
          </button>
        </div>
      </div>

      {/* Sessions Grid / Table */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Landmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Nenhum fechamento encontrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Quando os operadores fecharem seus caixas no PDV, os relatórios de fechamento com conferência física aparecerão aqui para homologação pela tesouraria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => {
            const diff = session.difference ?? 0;
            const isExact = Math.abs(diff) < 0.01;
            const isShortage = diff < -0.01; // Falta
            const isSurplus = diff > 0.01; // Sobra
            const isAudited = session.treasuryAudit?.audited;

            return (
              <div
                key={session.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-5 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800 rounded-xl text-amber-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {session.pdvCode} - {session.pdvName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {session.sessionDate}
                        </span>
                        {isAudited ? (
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              session.treasuryAudit?.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : session.treasuryAudit?.status === 'divergent'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {session.treasuryAudit?.status === 'approved'
                              ? 'Auditoria Aprovada'
                              : session.treasuryAudit?.status === 'divergent'
                              ? 'Divergência Registrada'
                              : 'Ajustado pela Tesouraria'}
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Aguardando Auditoria
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Operador: <strong className="text-slate-300">{session.cashierName}</strong>
                        <span className="mx-1">•</span>
                        Abertura: {new Date(session.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {session.closedAt && (
                          <>
                            <span className="mx-1">•</span>
                            Fechamento: {new Date(session.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAudit(session)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{isAudited ? 'Revisar Auditoria' : 'Auditar Fechamento'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => printConferenceReport(session)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Imprimir Comprovante de Conferência"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Balances breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fundo Inicial</span>
                    <span className="text-sm font-bold text-white">
                      R$ {(session.initialBalance || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Vendas Dinheiro</span>
                    <span className="text-sm font-bold text-white">
                      R$ {(session.calculatedBalance?.dinheiro || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cartão Débito/Créd.</span>
                    <span className="text-sm font-bold text-white">
                      R$ {((session.calculatedBalance?.cartaoDebito || 0) + (session.calculatedBalance?.cartaoCredito || 0)).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">PIX Instantâneo</span>
                    <span className="text-sm font-bold text-white">
                      R$ {(session.calculatedBalance?.pix || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Declarado no Caixa</span>
                    <span className="text-sm font-bold text-amber-400">
                      R$ {(session.declaredBalance?.total ?? session.declaredBalance?.dinheiro ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      isExact
                        ? 'bg-blue-950/20 border-blue-800/40 text-blue-300'
                        : isShortage
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block">Diferença Física</span>
                    <span className="text-sm font-bold">
                      {isExact
                        ? 'R$ 0,00 (Exato)'
                        : isShortage
                        ? `- R$ ${Math.abs(diff).toFixed(2)} (Falta)`
                        : `+ R$ ${Math.abs(diff).toFixed(2)} (Sobra)`}
                    </span>
                  </div>
                </div>

                {/* Audit notes and operator comments if any */}
                {(session.notes || session.treasuryAudit?.treasuryNotes) && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs space-y-1.5">
                    {session.notes && (
                      <p className="text-slate-400">
                        <strong className="text-slate-300">Justificativa do Operador:</strong> {session.notes}
                      </p>
                    )}
                    {session.treasuryAudit?.treasuryNotes && (
                      <p className="text-amber-300/90">
                        <strong className="text-amber-400">Parecer da Tesouraria:</strong> {session.treasuryAudit.treasuryNotes}
                        {session.treasuryAudit.auditorName && (
                          <span className="text-[11px] text-slate-400 ml-1">
                            (por {session.treasuryAudit.auditorName} em{' '}
                            {new Date(session.treasuryAudit.auditedAt || '').toLocaleDateString('pt-BR')})
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Audit Modal */}
      {showAuditModal && selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Auditar Fechamento de Caixa: {selectedSession.pdvCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Operador:</span>
                <strong className="text-white">{selectedSession.cashierName}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Data da Sessão:</span>
                <strong className="text-white">{selectedSession.sessionDate}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Saldo em Dinheiro Calculado:</span>
                <strong className="text-white">R$ {(selectedSession.calculatedBalance?.dinheiro || 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Declarado em Dinheiro:</span>
                <strong className="text-amber-400">
                  R$ {(selectedSession.declaredBalance?.dinheiro ?? selectedSession.declaredBalance?.total ?? 0).toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                <span>Diferença Apurada:</span>
                <strong
                  className={
                    (selectedSession.difference || 0) < 0
                      ? 'text-rose-400'
                      : (selectedSession.difference || 0) > 0
                      ? 'text-emerald-400'
                      : 'text-blue-400'
                  }
                >
                  R$ {(selectedSession.difference || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Status da Conciliação</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAuditStatus('approved')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    auditStatus === 'approved'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Aprovado
                </button>
                <button
                  type="button"
                  onClick={() => setAuditStatus('divergent')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    auditStatus === 'divergent'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Divergente
                </button>
                <button
                  type="button"
                  onClick={() => setAuditStatus('adjusted')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    auditStatus === 'adjusted'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Ajustado
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Parecer / Observação da Tesouraria
              </label>
              <textarea
                rows={3}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Insira as observações sobre a conferência física do dinheiro, comprovantes de cartão ou pix..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAudit}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvar Homologação</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
