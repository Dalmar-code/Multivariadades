import React, { useState } from 'react';
import {
  Printer,
  FileText,
  TrendingUp,
  Download,
  Calendar,
  Package,
  Users,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const OperationalReports: React.FC = () => {
  const { sales, products, clients, fiscalInvoices, cashSessions, company, calculateDRE } = useStore();

  const [selectedReport, setSelectedReport] = useState<
    'sales_summary' | 'stock_abc' | 'cashier_audit' | 'fiscal_book' | 'clients_ranking'
  >('sales_summary');

  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');

  const dre = calculateDRE('2026-08');

  const handlePrint = () => {
    window.print();
  };

  const totalSalesAmount = sales.reduce((acc, s) => acc + s.finalTotal, 0);
  const totalItemsSold = sales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Relatórios Operacionais & PDF</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Auditoria Completa
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Geração de relatórios gerenciais e fiscais para exportação em PDF e conferência contábil.
          </p>
        </div>

        <button
          type="button"
          id="btn-print-report"
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          Imprimir Relatório Selecionado (PDF)
        </button>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 no-print">
        <button
          type="button"
          onClick={() => setSelectedReport('sales_summary')}
          className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
            selectedReport === 'sales_summary'
              ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-600 mb-1" />
          1. Vendas & Faturamento
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('stock_abc')}
          className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
            selectedReport === 'stock_abc'
              ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4 text-amber-600 mb-1" />
          2. Estoque & Curva ABC
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('cashier_audit')}
          className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
            selectedReport === 'cashier_audit'
              ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-600 mb-1" />
          3. Auditoria de Caixas
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('fiscal_book')}
          className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
            selectedReport === 'fiscal_book'
              ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-600 mb-1" />
          4. Livro Fiscal SEFAZ
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport('clients_ranking')}
          className={`p-3 rounded-2xl border text-left font-bold text-xs transition-all ${
            selectedReport === 'clients_ranking'
              ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600 mb-1" />
          5. Ranking de Clientes
        </button>
      </div>

      {/* REPORT CONTENT (A4 Print styled) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-6 printable-document">
        {/* Report Company Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 gap-2">
          <div>
            <h2 className="text-base font-extrabold uppercase text-slate-900">{company.corporateName}</h2>
            <p className="text-xs text-slate-600">
              Nome Fantasia: <strong>{company.tradeName}</strong> • CNPJ: {company.cnpj} • IE: {company.stateRegistration}
            </p>
            <p className="text-[11px] text-slate-500">
              {company.address.street}, {company.address.number} - {company.address.city}/{company.address.state} • Fone: {company.phone}
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <div>Data do Relatório: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></div>
            <div>Horário: {new Date().toLocaleTimeString('pt-BR')}</div>
            <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
              DOCUMENTO OFICIAL ERP
            </span>
          </div>
        </div>

        {/* 1. RELATÓRIO DE VENDAS & FATURAMENTO */}
        {selectedReport === 'sales_summary' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h3 className="font-extrabold text-sm uppercase">Relatório Analítico de Vendas & Faturamento Balcão</h3>
              <p className="text-xs text-slate-500">Listagem de cupons fiscais e pedidos de venda emitidos</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
              <div>
                <span className="text-slate-500 block">Total de Vendas:</span>
                <span className="font-black text-sm">{sales.length} vendas</span>
              </div>
              <div>
                <span className="text-slate-500 block">Itens Comercializados:</span>
                <span className="font-black text-sm">{totalItemsSold} unidades</span>
              </div>
              <div>
                <span className="text-slate-500 block">Faturamento Bruto:</span>
                <span className="font-black text-sm text-emerald-700">R$ {totalSalesAmount.toFixed(2)}</span>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2">Cupom / Cód</th>
                  <th className="p-2">Data / Hora</th>
                  <th className="p-2">Operador / Vendedor</th>
                  <th className="p-2">Cliente / CPF</th>
                  <th className="p-2">Forma Pagto</th>
                  <th className="p-2 text-right">Total (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2 font-mono font-bold">{s.code}</td>
                    <td className="p-2">{new Date(s.createdAt).toLocaleString('pt-BR')}</td>
                    <td className="p-2">{s.cashierName}</td>
                    <td className="p-2">{s.cpfNaNota ? `CPF: ${s.cpfNaNota}` : 'Consumidor Final'}</td>
                    <td className="p-2 uppercase font-mono text-[10px]">{s.payments.map((p) => p.method).join(', ')}</td>
                    <td className="p-2 text-right font-black">R$ {s.finalTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. RELATÓRIO DE ESTOQUE & CURVA ABC */}
        {selectedReport === 'stock_abc' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h3 className="font-extrabold text-sm uppercase">Posição Geral de Estoque, Localização e Custos</h3>
              <p className="text-xs text-slate-500">Conferência física de prateleiras e valuation patrimonial</p>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2">SKU / EAN-13</th>
                  <th className="p-2">Descrição do Produto</th>
                  <th className="p-2">Categoria</th>
                  <th className="p-2">Localização</th>
                  <th className="p-2 text-center">Qtd Estoque</th>
                  <th className="p-2 text-right">Custo Unit</th>
                  <th className="p-2 text-right">Preço Venda</th>
                  <th className="p-2 text-right">Total Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 font-mono text-[10px]">{p.sku}</td>
                    <td className="p-2 font-bold">{p.name}</td>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2">{p.location || 'Geral'}</td>
                    <td className="p-2 text-center font-bold">{p.stock} {p.unit}</td>
                    <td className="p-2 text-right">R$ {p.costPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-bold">R$ {p.salePrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-black text-emerald-700">
                      R$ {(p.salePrice * p.stock).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. AUDITORIA DE CAIXAS */}
        {selectedReport === 'cashier_audit' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h3 className="font-extrabold text-sm uppercase">Auditoria e Fechamento de Sessões de Caixa (PDV)</h3>
              <p className="text-xs text-slate-500">Histórico de abertura, troco inicial, sangrias e suprimentos</p>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2">Operador</th>
                  <th className="p-2">Abertura</th>
                  <th className="p-2">Fechamento</th>
                  <th className="p-2 text-right">Fundo Troco</th>
                  <th className="p-2 text-right">Total Vendas</th>
                  <th className="p-2 text-right">Sangrias</th>
                  <th className="p-2 text-right">Saldo Final</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cashSessions.map((cs) => {
                  const sangrias = cs.movements.filter((m) => m.type === 'sangria').reduce((a, m) => a + m.amount, 0);
                  const totalVendas = cs.movements.filter((m) => m.type === 'venda').reduce((a, m) => a + m.amount, 0);
                  return (
                    <tr key={cs.id}>
                      <td className="p-2 font-bold">{cs.cashierName}</td>
                      <td className="p-2">{new Date(cs.openedAt).toLocaleString('pt-BR')}</td>
                      <td className="p-2">{cs.closedAt ? new Date(cs.closedAt).toLocaleString('pt-BR') : 'Turno Aberto'}</td>
                      <td className="p-2 text-right">R$ {cs.initialBalance.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">R$ {totalVendas.toFixed(2)}</td>
                      <td className="p-2 text-right text-rose-700">R$ {sangrias.toFixed(2)}</td>
                      <td className="p-2 text-right font-black">R$ {(cs.finalBalance || 0).toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cs.status === 'aberto' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                          {cs.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. LIVRO FISCAL SEFAZ */}
        {selectedReport === 'fiscal_book' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h3 className="font-extrabold text-sm uppercase">Livro Registro de Saídas e Emissões Fiscais (SEFAZ)</h3>
              <p className="text-xs text-slate-500">Transmissões de NF-e Mod 55 e NFC-e Mod 65 para apuração do DAS</p>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2">Mod / Série / Nº</th>
                  <th className="p-2">Chave de Acesso (44 Dígitos)</th>
                  <th className="p-2">Protocolo SEFAZ</th>
                  <th className="p-2">Destinatário</th>
                  <th className="p-2 text-right">Valor Total</th>
                  <th className="p-2 text-center">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fiscalInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-2 font-bold">{inv.type} {inv.series}-{inv.number}</td>
                    <td className="p-2 font-mono text-[9px]">{inv.accessKey}</td>
                    <td className="p-2 font-mono text-[10px]">{inv.protocol}</td>
                    <td className="p-2">{inv.recipientName || 'Consumidor Final'}</td>
                    <td className="p-2 text-right font-black">R$ {inv.totalInvoice.toFixed(2)}</td>
                    <td className="p-2 text-center font-bold text-[10px] text-emerald-700">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. RANKING DE CLIENTES */}
        {selectedReport === 'clients_ranking' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <h3 className="font-extrabold text-sm uppercase">Ranking de Compras & Histórico de Clientes Cadastrados</h3>
              <p className="text-xs text-slate-500">Volume de compras, limite concedido e adesão à Nota Paulista</p>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2">Cliente / Razão Social</th>
                  <th className="p-2">CPF / CNPJ</th>
                  <th className="p-2">Cidade/UF</th>
                  <th className="p-2">Nota Paulista</th>
                  <th className="p-2 text-right">Limite Crediário</th>
                  <th className="p-2 text-right">Total Comprado (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td className="p-2 font-bold">{c.name}</td>
                    <td className="p-2 font-mono">{c.document}</td>
                    <td className="p-2">{c.city}/{c.state}</td>
                    <td className="p-2 font-semibold text-amber-800">
                      {c.notaFiscalPaulistaEnabled ? 'Sim (Ativo)' : 'Não'}
                    </td>
                    <td className="p-2 text-right">R$ {c.creditLimit.toFixed(2)}</td>
                    <td className="p-2 text-right font-black text-emerald-700">
                      R$ {(c.totalPurchases || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Signature */}
        <div className="pt-8 border-t border-slate-400 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-slate-400 pt-1 w-48 mx-auto font-bold">Responsável Operacional</div>
            <span className="text-[10px] text-slate-500">MultiVariedades ERP</span>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 w-48 mx-auto font-bold">Contador / Administrador</div>
            <span className="text-[10px] text-slate-500">CRC/SP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
