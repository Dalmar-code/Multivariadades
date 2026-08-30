import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CashRegisterSession } from '../../types';

interface CashSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'open_session' | 'close_session' | 'sangria' | 'suprimento' | 'history';
}

export const CashSessionModal: React.FC<CashSessionModalProps> = ({ isOpen, onClose, mode }) => {
  const {
    activeSession,
    openCashSession,
    closeCashSession,
    addCashMovement,
    sessionsHistory,
    currentUser,
    sales,
    company,
  } = useStore();

  // Abertura
  const [initialBalance, setInitialBalance] = useState<number>(200.0);

  // Fechamento - Valores Declarados pelo Operador
  const [declaredDinheiro, setDeclaredDinheiro] = useState<number>(0);
  const [declaredPix, setDeclaredPix] = useState<number>(0);
  const [declaredDebito, setDeclaredDebito] = useState<number>(0);
  const [declaredCredito, setDeclaredCredito] = useState<number>(0);
  const [declaredPrazo, setDeclaredPrazo] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Sangria & Suprimento
  const [movementAmount, setMovementAmount] = useState<number>(50.0);
  const [movementReason, setMovementReason] = useState<string>('');

  const [selectedHistoricalSession, setSelectedHistoricalSession] = useState<CashRegisterSession | null>(null);

  if (!isOpen) return null;

  // Handler for Opening Cash Session
  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(Number(initialBalance) || 0);
    onClose();
  };

  // Handler for Closing Cash Session
  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total =
      Number(declaredDinheiro) +
      Number(declaredPix) +
      Number(declaredDebito) +
      Number(declaredCredito) +
      Number(declaredPrazo);

    closeCashSession(
      {
        dinheiro: Number(declaredDinheiro),
        pix: Number(declaredPix),
        cartaoDebito: Number(declaredDebito),
        cartaoCredito: Number(declaredCredito),
        prazo: Number(declaredPrazo),
        total,
      },
      notes
    );
    onClose();
  };

  // Handler for Sangria / Suprimento
  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementAmount || movementAmount <= 0) return;
    if (mode === 'sangria' || mode === 'suprimento') {
      addCashMovement(
        mode,
        Number(movementAmount),
        movementReason || (mode === 'sangria' ? 'Retirada para cofre / despesas' : 'Entrada de troco extra')
      );
      setMovementReason('');
      onClose();
    }
  };

  // Print current session summary
  const handlePrintSession = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {mode === 'open_session' && <Unlock className="w-5 h-5 text-emerald-400" />}
            {mode === 'close_session' && <Lock className="w-5 h-5 text-amber-400" />}
            {mode === 'sangria' && <ArrowDownRight className="w-5 h-5 text-rose-400" />}
            {mode === 'suprimento' && <ArrowUpRight className="w-5 h-5 text-emerald-400" />}
            {mode === 'history' && <Clock className="w-5 h-5 text-blue-400" />}

            <h3 className="font-bold text-base">
              {mode === 'open_session' && 'Abertura de Caixa (PDV)'}
              {mode === 'close_session' && 'Fechamento de Caixa & Prestação de Contas'}
              {mode === 'sangria' && 'Sangria de Caixa (Retirada de Dinheiro)'}
              {mode === 'suprimento' && 'Suprimento de Caixa (Entrada de Troco)'}
              {mode === 'history' && 'Histórico de Fechamentos de Caixa'}
            </h3>
          </div>
          <button
            type="button"
            id="btn-close-cash-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* MODE: OPEN SESSION */}
          {mode === 'open_session' && (
            <form onSubmit={handleOpenSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
                <p className="font-semibold mb-1">Iniciar Novo Turno de Caixa</p>
                <p className="text-xs text-emerald-700">
                  Operador:{' '}
                  <strong>{currentUser?.name || 'Operador de Caixa'}</strong> • Data:{' '}
                  {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Fundo de Troco Inicial (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-base">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    id="input-initial-balance"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-3 text-lg font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[100, 150, 200, 250, 300].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInitialBalance(val)}
                    className="flex-1 py-1.5 px-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700"
                  >
                    R$ {val}
                  </button>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-confirm-open-cash"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Abrir Caixa Agora
                </button>
              </div>
            </form>
          )}

          {/* MODE: CLOSE SESSION */}
          {mode === 'close_session' && activeSession && (
            <form onSubmit={handleCloseSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm font-bold">Conferência de Fechamento de Caixa</strong>
                  Conte os valores físicos na gaveta e maquinetas e informe abaixo. O sistema calculará a conciliação automaticamente.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dinheiro em Gaveta (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="input-close-dinheiro"
                    value={declaredDinheiro}
                    onChange={(e) => setDeclaredDinheiro(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total PIX Recebido (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="input-close-pix"
                    value={declaredPix}
                    onChange={(e) => setDeclaredPix(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cartão de Débito (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="input-close-debito"
                    value={declaredDebito}
                    onChange={(e) => setDeclaredDebito(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cartão de Crédito (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="input-close-credito"
                    value={declaredCredito}
                    onChange={(e) => setDeclaredCredito(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações do Fechamento (Opcional)
                </label>
                <textarea
                  rows={2}
                  id="input-close-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Turno encerrado sem divergências / gaveta entregue ao gerente."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  id="btn-confirm-close-cash"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Fechar Caixa e Emitir Relatório
                </button>
              </div>
            </form>
          )}

          {/* MODE: SANGRIA OU SUPRIMENTO */}
          {(mode === 'sangria' || mode === 'suprimento') && (
            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  mode === 'sangria'
                    ? 'bg-rose-50 border border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                }`}
              >
                {mode === 'sangria'
                  ? 'A Sangria remove dinheiro físico da gaveta do caixa para depósito ou cofre.'
                  : 'O Suprimento injeta moedas e notas adicionais como reforço de troco.'}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Valor da Movimentação (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-base">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.50"
                    required
                    id="input-movement-amount"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-2.5 text-base font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Justificativa *
                </label>
                <input
                  type="text"
                  required
                  id="input-movement-reason"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder={
                    mode === 'sangria'
                      ? 'Ex: Retirada de segurança para cofre'
                      : 'Ex: Troca de R$ 100 em moedas de 1 real'
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-confirm-movement"
                  className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center gap-2 ${
                    mode === 'sangria'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  {mode === 'sangria' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  Confirmar {mode === 'sangria' ? 'Sangria' : 'Suprimento'}
                </button>
              </div>
            </form>
          )}

          {/* MODE: HISTORY */}
          {mode === 'history' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Total de fechamentos registrados: <strong>{sessionsHistory.length}</strong>
              </div>

              {sessionsHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhum fechamento de caixa anterior registrado ainda.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {sessionsHistory.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Operador: {sess.cashierName}</span>
                        <span className="text-emerald-700 font-mono">
                          Total: R$ {sess.calculatedBalance?.total.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex justify-between">
                        <span>
                          Aberto: {new Date(sess.openedAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(sess.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {sess.closedAt && (
                          <span>
                            Fechado: {new Date(sess.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {sess.difference !== undefined && sess.difference !== 0 && (
                        <div
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] inline-block ${
                            sess.difference < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Diferença:{' '}
                          {sess.difference < 0
                            ? `Falta R$ ${Math.abs(sess.difference).toFixed(2)}`
                            : `Sobra R$ ${sess.difference.toFixed(2)}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
