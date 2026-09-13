import React, { useState } from 'react';
import {
  DollarSign,
  Receipt,
  Printer,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  Banknote,
  Send,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Client } from '../../types';

interface ClientDebtCollectionModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientDebtCollectionModal: React.FC<ClientDebtCollectionModalProps> = ({
  client,
  onClose,
}) => {
  const { settleClientDebt, company, currentUser, activeSession, sales } = useStore();

  const totalDebt = client.currentDebt || 0;
  const [paymentAmount, setPaymentAmount] = useState<number>(totalDebt);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'debito' | 'credito'>('dinheiro');
  const [notes, setNotes] = useState('');
  const [completedReceipt, setCompletedReceipt] = useState<any | null>(null);

  // Filter past credit/prazo sales of this client
  const clientCreditSales = sales.filter(
    (s) =>
      s.clientId === client.id &&
      (s.paymentMethod === 'prazo' ||
        s.paymentMethod === 'mensalista' ||
        s.paymentMethod === 'crediario' ||
        s.payments?.some((p) => p.method === 'prazo' || p.method === 'mensalista' || p.method === 'crediario'))
  );

  const handleConfirmSettlement = () => {
    if (paymentAmount <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    try {
      const res = settleClientDebt(
        client.id,
        paymentAmount,
        paymentMethod,
        notes || 'Pagamento de conta a prazo / crediário'
      );
      setCompletedReceipt(res.receiptData);
    } catch (err: any) {
      alert('Erro ao registrar recebimento: ' + (err?.message || 'Erro desconhecido'));
    }
  };

  const handleSendWhatsAppReminder = () => {
    const cleanPhone = (client.whatsapp || client.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      alert('Cliente não possui WhatsApp ou telefone válido cadastrado.');
      return;
    }

    const companyTitle = company.tradeName || company.name || 'Nossa Loja';
    const pixKey = company.pixKey || company.cnpj || company.email || 'Chave cadastrada na loja';

    const msg = `Olá *${client.name}*, tudo bem? 😊\n\nAqui é da equipe *${companyTitle}*.\n\nConsta em nosso sistema um saldo em aberto no valor de *R$ ${totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}* referente ao seu crediário / compras a prazo / mensalidade.\n\nCaso deseje quitar via PIX, nossa chave é:\n🔑 *${pixKey}*\n\nSe já efetuou o pagamento, por favor desconsidere esta mensagem. Muito obrigado pela preferência!`;

    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Cobrança & Recebimento (Crediário / Mensalista)
              </h2>
              <p className="text-xs text-slate-400">
                Cliente: <strong className="text-slate-200">{client.name}</strong> • {client.documentType.toUpperCase()}: {client.document}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800 text-xs">
          {completedReceipt ? (
            /* Printable Receipt View */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm">Recebimento Registrado com Sucesso!</h4>
                  <p className="text-xs text-emerald-800">
                    O valor foi adicionado ao financeiro e lançado no movimento do caixa.
                  </p>
                </div>
              </div>

              {/* Thermal Paper Receipt Layout */}
              <div
                id="thermal-receipt"
                className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-300 font-mono text-[11px] text-slate-900 space-y-2.5 shadow-xs"
              >
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <div className="font-black text-xs uppercase tracking-wider">{completedReceipt.companyName}</div>
                  <div className="text-[10px] text-slate-500">CNPJ: {completedReceipt.companyCnpj}</div>
                  {completedReceipt.companyPhone && (
                    <div className="text-[10px] text-slate-500">Tel: {completedReceipt.companyPhone}</div>
                  )}
                  <div className="font-bold text-[11px] mt-1 text-slate-800">
                    COMPROVANTE DE QUITAÇÃO DE CONTA / CREDIÁRIO
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Documento Nº: {completedReceipt.receiptCode}
                  </div>
                </div>

                <div className="space-y-1">
                  <div>Data/Hora: {completedReceipt.date}</div>
                  <div>Cliente: <strong>{completedReceipt.clientName}</strong></div>
                  <div>Documento: {completedReceipt.clientDoc}</div>
                  <div>Forma de Pagamento: <strong>{completedReceipt.paymentMethod}</strong></div>
                  <div>Operador(a): {completedReceipt.operatorName}</div>
                </div>

                <div className="py-2 border-y border-dashed border-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Saldo Devedor Anterior:</span>
                    <span>R$ {completedReceipt.previousDebt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs text-emerald-800">
                    <span>VALOR PAGO / RECEBIDO:</span>
                    <span>R$ {completedReceipt.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Saldo Restante a Pagar:</span>
                    <span>R$ {completedReceipt.remainingDebt.toFixed(2)}</span>
                  </div>
                </div>

                {completedReceipt.notes && (
                  <div className="text-[10px] text-slate-600 italic">
                    Observações: {completedReceipt.notes}
                  </div>
                )}

                <div className="text-center pt-3 text-[10px] text-slate-500">
                  Obrigado pela pontualidade e preferência!
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Comprovante de Pagamento
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            /* Payment Input View */
            <>
              {/* Financial Balance Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                    Saldo Devedor Atual
                  </span>
                  <div className="text-xl font-black text-amber-950">
                    R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-amber-700 block mt-1">
                    {totalDebt > 0 ? 'Débito acumulado a prazo/mensalista' : 'Sem débito pendente'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
                    Limite de Crédito Aprovado
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    R$ {(client.creditLimit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Disponível:{' '}
                    <strong>
                      R$ {Math.max(0, (client.creditLimit || 0) - totalDebt).toFixed(2)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* WhatsApp Cobrança Quick Action */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-emerald-950 text-xs block">
                    Cobrança Amigável via WhatsApp
                  </span>
                  <p className="text-[11px] text-emerald-800">
                    Envie mensagem com resumo do débito e chave PIX para o cliente pagar online.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendWhatsAppReminder}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Cobrar no Zap
                </button>
              </div>

              {/* Form to Receive Payment */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Registrar Pagamento / Baixa no Débito:
                </h3>

                {/* Amount to receive */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700 text-xs">Valor a Receber (R$):</label>
                    {totalDebt > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(totalDebt)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                      >
                        Quitar Valor Total (R$ {totalDebt.toFixed(2)})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="font-bold text-slate-700 text-xs block mb-1.5">
                    Forma de Pagamento Recebida:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('dinheiro')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'dinheiro'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      Dinheiro
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      PIX
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('debito')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'debito'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Cartão Débito
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credito')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'credito'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Cartão Crédito
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="font-bold text-slate-700 text-xs block mb-1">
                    Observações / Referência:
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Mensalidade mês vigente, quitação parcial, etc."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                {/* Active Cashier Notice */}
                {activeSession ? (
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Caixa aberto (Operador: <strong>{activeSession.cashierName}</strong>). O valor entrará diretamente no saldo do caixa.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Nenhum caixa do PDV aberto no momento. O valor será computado diretamente no Contas a Receber financeiro.
                    </span>
                  </div>
                )}
              </div>

              {/* History of credit sales */}
              {clientCreditSales.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Vendas a Prazo / Mensalistas Anteriores:
                  </h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {clientCreditSales.map((s) => (
                      <div
                        key={s.id}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            Cupom {s.code} • {new Date(s.timestamp).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            {s.items?.length || 0} item(ns) • {s.paymentMethod?.toUpperCase()}
                          </div>
                        </div>
                        <div className="font-black text-slate-900">
                          R$ {s.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSettlement}
                  className="flex-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  Confirmar Recebimento (R$ {paymentAmount.toFixed(2)})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
