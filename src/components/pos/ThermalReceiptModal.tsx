import React from 'react';
import { Printer, Download, CheckCircle2, X, Copy, QrCode, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Sale, FiscalInvoice } from '../../types';

interface ThermalReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ sale, onClose }) => {
  const { company, fiscalConfig, fiscalInvoices } = useStore();

  if (!sale) return null;

  const invoice = fiscalInvoices.find((inv) => inv.saleId === sale.id || inv.id === sale.fiscalInvoiceId);

  const handlePrint = () => {
    window.print();
  };

  // Format 44-digit key with spaces
  const formatAccessKey = (key?: string) => {
    if (!key) return '';
    return key.replace(/(\d{4})/g, '$1 ').trim();
  };

  const copyKey = () => {
    if (invoice?.accessKey) {
      navigator.clipboard.writeText(invoice.accessKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">Comprovante Fiscal / Recibo 80mm</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-print-receipt"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Recibo (80mm)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="p-6 max-h-[80vh] overflow-y-auto font-mono text-xs text-slate-900 bg-white printable-receipt leading-tight">
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
            <h2 className="font-extrabold text-sm uppercase tracking-tight">{company.tradeName}</h2>
            <p className="text-[11px]">{company.corporateName}</p>
            <p className="text-[10px]">CNPJ: {company.cnpj} • IE: {company.stateRegistration}</p>
            <p className="text-[10px]">
              {company.address.street}, {company.address.number} - {company.address.neighborhood}, {company.address.city}/{company.address.state}
            </p>
            <p className="text-[10px]">Tel: {company.phone}</p>
          </div>

          {/* Document Type Badge */}
          <div className="text-center py-2 border-b border-dashed border-slate-400 space-y-0.5">
            <p className="font-bold text-[11px]">
              {invoice ? 'NFC-e - NOTA FISCAL DE CONSUMIDOR ELETRÔNICA' : 'CUPOM NÃO FISCAL / VENDA BALCÃO'}
            </p>
            <p className="text-[10px] text-slate-600">
              Não permite aproveitamento de crédito de ICMS
            </p>
            <p className="text-[10px]">
              Venda: <strong>{sale.code}</strong> • {new Date(sale.createdAt).toLocaleDateString('pt-BR')} às{' '}
              {new Date(sale.createdAt).toLocaleTimeString('pt-BR')}
            </p>
            <p className="text-[10px]">
              Operador: {sale.cashierName} {sale.sellerName ? `• Vendedor: ${sale.sellerName}` : ''}
            </p>
          </div>

          {/* Consumer / Nota Fiscal Paulista info */}
          <div className="py-2 border-b border-dashed border-slate-400 text-[11px]">
            <span className="font-bold">CONSUMIDOR: </span>
            {sale.cpfNaNota || sale.clientDocument ? (
              <span className="font-bold bg-amber-100 text-amber-950 px-1 rounded">
                CPF/CNPJ: {sale.cpfNaNota || sale.clientDocument} (Nota Fiscal Paulista)
              </span>
            ) : (
              <span>CONSUMIDOR NÃO IDENTIFICADO</span>
            )}
            {sale.clientName && (
              <div className="text-[10px] text-slate-600 mt-0.5">Nome: {sale.clientName}</div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="py-2 border-b border-dashed border-slate-400">
            <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-200">
              <span className="w-8"># CÓD</span>
              <span className="flex-1 px-1">DESCRIÇÃO</span>
              <span className="w-10 text-right">QTD</span>
              <span className="w-14 text-right">VL.UN</span>
              <span className="w-14 text-right">TOTAL</span>
            </div>

            <div className="space-y-1.5 pt-1.5">
              {sale.items.map((item, idx) => (
                <div key={idx} className="text-[10px]">
                  <div className="font-bold truncate">{item.product.name}</div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[9px]">
                      {item.product.sku || item.product.barcode} ({item.product.unit})
                    </span>
                    <span>
                      {item.quantity} x R$ {item.unitPrice.toFixed(2)}
                    </span>
                    <span className="font-bold text-slate-900">
                      R$ {item.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Payments */}
          <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Qtd. Total de Itens:</span>
              <span>{sale.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Desconto Total:</span>
                <span>- R$ {sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
              <span>VALOR A PAGAR:</span>
              <span>R$ {sale.total.toFixed(2)}</span>
            </div>

            {/* Payments list */}
            <div className="pt-1.5 space-y-0.5 text-[10px] text-slate-700">
              <div className="font-bold text-slate-900">FORMA DE PAGAMENTO:</div>
              {sale.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="uppercase">{p.method} {p.installments ? `(${p.installments}x)` : ''}</span>
                  <span className="font-bold">R$ {p.amount.toFixed(2)}</span>
                </div>
              ))}
              {sale.changeAmount && sale.changeAmount > 0 ? (
                <div className="flex justify-between font-bold text-emerald-700 pt-0.5">
                  <span>Troco:</span>
                  <span>R$ {sale.changeAmount.toFixed(2)}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Tax Information (Lei 12.741 / IBPT) */}
          <div className="py-2 border-b border-dashed border-slate-400 text-[9px] text-slate-600 leading-tight">
            <p>
              Tributos Totais Incidentes (Lei Federal 12.741/2012 - IBPT):
            </p>
            <p className="font-bold text-slate-800">
              R$ {((sale.total * fiscalConfig.ibptEstimatedTaxPercent) / 100).toFixed(2)} ({fiscalConfig.ibptEstimatedTaxPercent}%)
            </p>
            <p>Empresa optante pelo Simples Nacional - ICMS recolhido no DAS.</p>
          </div>

          {/* Fiscal Key & Protocol (If issued) */}
          {invoice && (
            <div className="py-3 text-center space-y-2">
              <div>
                <p className="font-bold text-[10px]">CHAVE DE ACESSO DA NFC-e:</p>
                <p className="text-[9px] font-mono font-bold tracking-tight select-all break-all bg-slate-100 p-1.5 rounded border border-slate-200">
                  {formatAccessKey(invoice.accessKey)}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-24 h-24 bg-white border border-slate-300 p-1 rounded flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <span className="text-[8px] text-slate-500 mt-1">Consulte pela chave ou QR Code na SEFAZ</span>
              </div>

              <div className="text-[9px] text-slate-600">
                <p>Protocolo de Autorização: <strong>{invoice.protocol}</strong></p>
                <p>Data de Autorização: {new Date(invoice.emissionDate).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          )}

          {/* Footer Receipt */}
          <div className="text-center pt-2 text-[10px] text-slate-500 font-sans">
            <p>Obrigado pela preferência! Volte sempre.</p>
            <p className="text-[9px] font-bold text-slate-400">MultiVariedades ERP & PDV</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center no-print">
          <div className="text-xs text-slate-500">
            {invoice ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" /> NFC-e Autorizada
              </span>
            ) : (
              <span>Venda Concluída</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Concluir & Nova Venda
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir Recibo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
