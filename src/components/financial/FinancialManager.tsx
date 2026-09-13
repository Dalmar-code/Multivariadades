import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Plus,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { FinancialEntry } from '../../types';
import { BackButton } from '../common/BackButton';

export const FinancialManager: React.FC = () => {
  const { financialEntries, addFinancialEntry, updateFinancialEntry, calculateDRE, company } =
    useStore();

  const [activeTab, setActiveTab] = useState<'dre' | 'entries' | 'charts'>('dre');
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // New Entry Modal
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'receita' | 'despesa'>('despesa');
  const [entryCategory, setEntryCategory] = useState<FinancialEntry['category']>(
    'Fornecedores / Estoque'
  );
  const [entryDescription, setEntryDescription] = useState('');
  const [entryAmount, setEntryAmount] = useState<number>(0);
  const [entryDueDate, setEntryDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryPaymentMethod, setEntryPaymentMethod] = useState('PIX');
  const [entryStatus, setEntryStatus] = useState<'paid' | 'pending'>('paid');

  // Filter entries
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const dre = calculateDRE(monthOffset);

  const filteredEntries = financialEntries.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  const totalReceitas = financialEntries
    .filter((e) => e.type === 'receita' && e.status === 'paid')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalDespesas = financialEntries
    .filter((e) => e.type === 'despesa' && e.status === 'paid')
    .reduce((acc, e) => acc + e.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryDescription || entryAmount <= 0) {
      alert('Informe a descrição e um valor válido.');
      return;
    }

    addFinancialEntry({
      type: entryType,
      category: entryCategory,
      description: entryDescription,
      amount: Number(entryAmount),
      dueDate: entryDueDate,
      paymentDate: entryStatus === 'paid' ? entryDueDate : undefined,
      status: entryStatus,
      paymentMethod: entryPaymentMethod,
    });

    setIsEntryModalOpen(false);
    setEntryDescription('');
    setEntryAmount(0);
  };

  const handlePrintDRE = () => {
    window.print();
  };

  // Chart data
  const chartData = [
    {
      name: 'Receita Bruta',
      valor: dre.receitaBrutaVendas,
    },
    {
      name: 'CMV (Custo Mercadorias)',
      valor: dre.cmvCustosMercadoria,
    },
    {
      name: 'Lucro Bruto',
      valor: dre.lucroBruto,
    },
    {
      name: 'Despesas Operacionais',
      valor: dre.despesasOperacionais,
    },
    {
      name: 'Lucro Líquido',
      valor: dre.lucroLiquido,
    },
  ];

  const pieColors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'];
  const expensePieData = [
    { name: 'Despesas Fixas', value: dre.despesasFixas },
    { name: 'Despesas Variáveis', value: dre.despesasVariaveis },
    { name: 'Impostos / Tributos', value: dre.deducoesImpostos },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Gestão Financeira & DRE</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              Contabilidade Gerencial
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Demonstrativo do Resultado do Exercício (DRE), Fluxo de Caixa, Contas a Pagar e Receber.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <BackButton variant="light" label="Voltar ao Menu" className="px-3.5 py-2 text-xs" />
          <button
            type="button"
            onClick={handlePrintDRE}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimir Relatório DRE (PDF)
          </button>
          <button
            type="button"
            onClick={() => setIsEntryModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento Financeiro
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('dre')}
          className={`pb-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dre'
              ? 'border-amber-500 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          DRE Gerencial (Simples Nacional)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('entries')}
          className={`pb-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'entries'
              ? 'border-amber-500 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Contas a Pagar & Receber ({filteredEntries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`pb-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'charts'
              ? 'border-amber-500 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Gráficos & Margens
        </button>
      </div>

      {/* TAB 1: DRE OFICIAL */}
      {activeTab === 'dre' && (
        <div className="space-y-6">
          {/* Month Selector Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Competência do Exercício:</span>
              <select
                value={monthOffset}
                onChange={(e) => setMonthOffset(Number(e.target.value))}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
              >
                <option value={0}>Mês Atual ({dre.periodLabel})</option>
                <option value={1}>Mês Anterior (-1 Mês)</option>
                <option value={2}>Dois Meses Atrás (-2 Meses)</option>
              </select>
            </div>
            <div className="text-xs text-slate-500">
              Regime Tributário: <strong>{company.taxRegimeName}</strong> (Alíquota:{' '}
              {company.aliquotaSimples}%)
            </div>
          </div>

          {/* DRE Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Receita Bruta Total</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                R$ {dre.receitaBrutaVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Custo das Mercadorias (CMV)</span>
                <ArrowDownRight className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">
                R$ {dre.cmvCustosMercadoria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Lucro Bruto Operacional</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                R$ {dre.lucroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">
                Margem Bruta: {dre.margemBrutaPercent.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Resultado Líquido (Lucro)</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div
                className={`text-2xl font-black ${
                  dre.lucroLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                R$ {dre.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-600 font-bold">
                Margem Líquida: {dre.margemLiquidaPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* OFFICIAL DRE STATEMENT TABLE */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-base font-extrabold uppercase text-slate-900">{company.corporateName}</h2>
              <p className="text-xs text-slate-500">
                CNPJ: {company.cnpj} • Inscrição Estadual: {company.stateRegistration}
              </p>
              <h3 className="text-sm font-black text-slate-900 mt-2">
                DEMONSTRATIVO DO RESULTADO DO EXERCÍCIO (DRE) - COMPETÊNCIA: {dre.periodLabel.toUpperCase()}
              </h3>
            </div>

            <div className="space-y-1 text-xs">
              {/* 1. Receita Bruta */}
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 font-extrabold text-slate-900 text-sm">
                <span>(+) RECEITA BRUTA DE VENDAS</span>
                <span className="text-emerald-700 font-black">R$ {dre.receitaBrutaVendas.toFixed(2)}</span>
              </div>

              {/* 2. Deduções */}
              <div className="flex justify-between px-4 py-2 text-rose-700 font-semibold">
                <span>(-) Deduções da Receita Bruta (Tributos Simples Nacional)</span>
                <span>- R$ {dre.deducoesImpostos.toFixed(2)}</span>
              </div>

              {/* 3. Receita Líquida */}
              <div className="flex justify-between p-2.5 rounded-lg bg-emerald-50/60 font-bold text-slate-900">
                <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
                <span>R$ {dre.receitaLiquida.toFixed(2)}</span>
              </div>

              {/* 4. CMV */}
              <div className="flex justify-between px-4 py-2 text-amber-900 font-semibold">
                <span>(-) Custo das Mercadorias Vendidas (CMV)</span>
                <span>- R$ {dre.cmvCustosMercadoria.toFixed(2)}</span>
              </div>

              {/* 5. Lucro Bruto */}
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-100 font-extrabold text-slate-900">
                <span>(=) LUCRO BRUTO (Margem: {dre.margemBrutaPercent.toFixed(1)}%)</span>
                <span className="text-emerald-700 font-black">R$ {dre.lucroBruto.toFixed(2)}</span>
              </div>

              {/* 6. Despesas Operacionais */}
              <div className="py-2 px-4 space-y-1">
                <div className="font-bold text-slate-700">(-) DESPESAS OPERACIONAIS FIXAS E VARIÁVEIS:</div>
                <div className="flex justify-between pl-4 text-slate-600 text-[11px]">
                  <span>• Despesas Fixas (Aluguel, Salários, Energia, Telecom)</span>
                  <span className="text-rose-600 font-semibold">- R$ {dre.despesasFixas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600 text-[11px]">
                  <span>• Despesas Variáveis & Outras Despesas</span>
                  <span className="text-rose-600 font-semibold">- R$ {dre.despesasVariaveis.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pl-4 font-bold text-rose-800 text-xs pt-1 border-t border-slate-200">
                  <span>Total de Despesas Operacionais:</span>
                  <span>- R$ {dre.despesasOperacionais.toFixed(2)}</span>
                </div>
              </div>

              {/* 7. Resultado Líquido Final */}
              <div className="flex justify-between p-3.5 rounded-xl bg-slate-900 text-white font-black text-base mt-4 shadow-md">
                <span>(=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO LÍQUIDO)</span>
                <span className="text-emerald-400 text-lg">R$ {dre.lucroLiquido.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-300 flex justify-between text-[11px] text-slate-500">
              <span>Relatório emitido em conformidade com as normas contábeis do Simples Nacional.</span>
              <span>Emissão: {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LANÇAMENTOS FINANCEIROS */}
      {activeTab === 'entries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filtrar por:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  statusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Pagos / Recebidos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Pendentes
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Saldo Líquido Realizado: <strong className="text-emerald-700">R$ {saldoLiquido.toFixed(2)}</strong>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Descrição do Lançamento</th>
                    <th className="py-3 px-4">Vencimento / Pagto</th>
                    <th className="py-3 px-4">Forma</th>
                    <th className="py-3 px-4 text-right">Valor (R$)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold">
                        {e.type === 'receita' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowUpRight className="w-3 h-3" /> Receita
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full text-[10px]">
                            <ArrowDownRight className="w-3 h-3" /> Despesa
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">{e.category}</td>

                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {e.description}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>Venc: {new Date(e.dueDate).toLocaleDateString('pt-BR')}</div>
                        {e.paymentDate && (
                          <div className="text-[10px] text-emerald-600">
                            Pago: {new Date(e.paymentDate).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {e.paymentMethod || 'Outro'}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-sm">
                        <span className={e.type === 'receita' ? 'text-emerald-600' : 'text-rose-600'}>
                          {e.type === 'receita' ? '+' : '-'} R$ {e.amount.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            e.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {e.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {e.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() =>
                              updateFinancialEntry(e.id, {
                                status: 'paid',
                                paymentDate: new Date().toISOString().split('T')[0],
                              })
                            }
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Dar Baixa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GRÁFICOS E INDICADORES */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Fluxo da DRE: Da Receita Bruta ao Lucro Líquido
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) =>
                      typeof val === 'number' ? `R$ ${val.toFixed(2)}` : val
                    }
                  />
                  <Bar dataKey="valor" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Composição de Gastos & Custos</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {expensePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => (typeof val === 'number' ? `R$ ${val.toFixed(2)}` : val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* NEW FINANCIAL ENTRY MODAL */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Novo Lançamento Financeiro</h3>
              <button
                type="button"
                onClick={() => setIsEntryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType('receita')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer ${
                    entryType === 'receita'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  (+) Receita (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('despesa')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer ${
                    entryType === 'despesa'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  (-) Despesa (Saída)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                <select
                  value={entryCategory}
                  onChange={(e) => setEntryCategory(e.target.value as FinancialEntry['category'])}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="Fornecedores / Estoque">Fornecedores / Estoque</option>
                  <option value="Aluguel & Condomínio">Aluguel & Condomínio</option>
                  <option value="Energia & Água">Energia & Água</option>
                  <option value="Folha de Pagamento">Folha de Pagamento</option>
                  <option value="Impostos & Tributos">Impostos & Tributos</option>
                  <option value="Software & Telecom">Software & Telecom</option>
                  <option value="Manutenção & Limpeza">Manutenção & Limpeza</option>
                  <option value="Taxas de Cartão / Bancárias">Taxas de Cartão / Bancárias</option>
                  <option value="Marketing & Embalagens">Marketing & Embalagens</option>
                  <option value="Venda de Mercadorias">Venda de Mercadorias</option>
                  <option value="Outras Despesas">Outras Despesas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  placeholder="Ex: Pagamento Fornecedor Tintas Coral"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={entryAmount}
                    onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={entryDueDate}
                    onChange={(e) => setEntryDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={entryPaymentMethod}
                    onChange={(e) => setEntryPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro (Caixa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={entryStatus}
                    onChange={(e) => setEntryStatus(e.target.value as 'paid' | 'pending')}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="paid">Já Pago / Liquidado</option>
                    <option value="pending">Pendente / A Vencer</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
