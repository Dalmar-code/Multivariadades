import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Key,
  Server,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Settings,
  HelpCircle,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FiscalInvoice } from '../../types';
import { DanfeModal } from './DanfeModal';

export const FiscalManager: React.FC = () => {
  const {
    fiscalInvoices,
    fiscalConfig,
    updateFiscalConfig,
    company,
    cancelFiscalInvoice,
    selectedInvoiceForDanfe,
    setSelectedInvoiceForDanfe,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'invoices' | 'settings'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');

  // Settings State
  const [environment, setEnvironment] = useState(fiscalConfig.environment);
  const [nfeSeries, setNfeSeries] = useState(fiscalConfig.nfeSeries);
  const [nextNfeNumber, setNextNfeNumber] = useState(fiscalConfig.nextNfeNumber);
  const [nfceSeries, setNfceSeries] = useState(fiscalConfig.nfceSeries);
  const [nextNfceNumber, setNextNfceNumber] = useState(fiscalConfig.nextNfceNumber);
  const [cscToken, setCscToken] = useState(fiscalConfig.cscToken);
  const [cscId, setCscId] = useState(fiscalConfig.cscId);
  const [certificateExpiry, setCertificateExpiry] = useState(fiscalConfig.certificateExpiry);
  const [ibptEstimatedTaxPercent, setIbptEstimatedTaxPercent] = useState(
    fiscalConfig.ibptEstimatedTaxPercent
  );

  const [savedFeedback, setSavedFeedback] = useState(false);

  const filteredInvoices = fiscalInvoices.filter(
    (inv) =>
      inv.number.toString().includes(searchTerm) ||
      inv.accessKey.includes(searchTerm) ||
      (inv.recipientName && inv.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.recipientDocument && inv.recipientDocument.includes(searchTerm))
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFiscalConfig({
      environment,
      nfeSeries: Number(nfeSeries) || 1,
      nextNfeNumber: Number(nextNfeNumber) || 1,
      nfceSeries: Number(nfceSeries) || 1,
      nextNfceNumber: Number(nextNfceNumber) || 1,
      cscToken,
      cscId,
      certificateExpiry,
      ibptEstimatedTaxPercent: Number(ibptEstimatedTaxPercent) || 0,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleCancelInvoice = (id: string, num: number) => {
    const reason = window.prompt(
      `Informe a justificativa formal para cancelamento da NF-e/NFC-e Nº ${num} (mínimo 15 caracteres para SEFAZ):`,
      'Cancelamento por desistência do consumidor em balcão'
    );
    if (reason && reason.trim().length >= 15) {
      cancelFiscalInvoice(id, reason.trim());
      alert(`Nota fiscal Nº ${num} cancelada com sucesso na SEFAZ.`);
    } else if (reason) {
      alert('A justificativa de cancelamento deve possuir no mínimo 15 caracteres conforme regra da SEFAZ.');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('Chave de acesso copiada para a área de transferência!');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Módulo Fiscal & Receita Federal</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                fiscalConfig.environment === 'producao'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              SEFAZ: {fiscalConfig.environment === 'producao' ? 'PRODUÇÃO (Oficial)' : 'HOMOLOGAÇÃO (Testes)'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Emissão e transmissão de NF-e (Mod 55), NFC-e (Mod 65), Nota Paulista e integração com a Receita Federal.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Documentos Emitidos ({fiscalInvoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Configurações Fiscais & Certificado
          </button>
        </div>
      </div>

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:max-w-md relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por número, chave de acesso ou destinatário..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total Faturado em Notas: <strong>R$ {fiscalInvoices.reduce((acc, i) => acc + (i.status === 'AUTORIZADA' ? i.totalInvoice : 0), 0).toFixed(2)}</strong>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Modelo / Nº</th>
                    <th className="py-3 px-4">Chave de Acesso (44 Dígitos)</th>
                    <th className="py-3 px-4">Destinatário / CPF</th>
                    <th className="py-3 px-4">Data Emissão</th>
                    <th className="py-3 px-4 text-right">Valor Total</th>
                    <th className="py-3 px-4 text-center">Status SEFAZ</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono mr-1.5">
                          {inv.type}
                        </span>
                        Nº {inv.number} (Série {inv.series})
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[200px]">{inv.accessKey}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(inv.accessKey)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Copiar Chave"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-400">Prot: {inv.protocol}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{inv.recipientName || 'Consumidor Final'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {inv.recipientDocument || 'Não informado'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {new Date(inv.emissionDate).toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        R$ {inv.totalInvoice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {inv.status === 'AUTORIZADA' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> AUTORIZADA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3" /> CANCELADA
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForDanfe(inv)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1"
                            title="Visualizar DANFE"
                          >
                            <Printer className="w-3 h-3" /> DANFE
                          </button>

                          {inv.status === 'AUTORIZADA' && (
                            <button
                              type="button"
                              onClick={() => handleCancelInvoice(inv.id, inv.number)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50"
                              title="Cancelar Nota Fiscal na SEFAZ"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÃO FISCAL E RECEITA FEDERAL */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {savedFeedback && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Configurações fiscais atualizadas com sucesso!
            </div>
          )}

          {/* Section: Ambiente SEFAZ e Certificado */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-600" />
              1. Ambiente da SEFAZ & Certificado Digital A1
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambiente de Transmissão
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as 'homologacao' | 'producao')}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="homologacao">Homologação (Ambiente de Testes)</option>
                  <option value="producao">Produção (Validade Jurídica Real)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Validade do Certificado Digital A1
                </label>
                <input
                  type="date"
                  value={certificateExpiry}
                  onChange={(e) => setCertificateExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alíquota IBPT Estimada (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ibptEstimatedTaxPercent}
                  onChange={(e) => setIbptEstimatedTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Séries e Numerações */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              2. Séries e Numerações de Documentos Fiscais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Série NF-e (Mod 55)</label>
                <input
                  type="number"
                  value={nfeSeries}
                  onChange={(e) => setNfeSeries(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Próxima NF-e</label>
                <input
                  type="number"
                  value={nextNfeNumber}
                  onChange={(e) => setNextNfeNumber(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Série NFC-e (Mod 65)</label>
                <input
                  type="number"
                  value={nfceSeries}
                  onChange={(e) => setNfceSeries(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Próxima NFC-e</label>
                <input
                  type="number"
                  value={nextNfceNumber}
                  onChange={(e) => setNextNfceNumber(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section: CSC Token para QR Code NFC-e */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              3. Código de Segurança do Contribuinte (CSC) - SEFAZ SP
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID do Token CSC</label>
                <input
                  type="text"
                  value={cscId}
                  onChange={(e) => setCscId(e.target.value)}
                  placeholder="Ex: 000001"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Token CSC Alfa-numérico</label>
                <input
                  type="text"
                  value={cscToken}
                  onChange={(e) => setCscToken(e.target.value)}
                  placeholder="Chave gerada no Portal SEFAZ"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              id="btn-save-fiscal-settings"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Parâmetros Fiscais
            </button>
          </div>
        </form>
      )}

      {/* DANFE Full Screen Modal */}
      <DanfeModal
        invoice={selectedInvoiceForDanfe}
        onClose={() => setSelectedInvoiceForDanfe(null)}
      />
    </div>
  );
};
