import React, { useState } from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  Printer,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface StockValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockValuationModal: React.FC<StockValuationModalProps> = ({ isOpen, onClose }) => {
  const { products, company } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [sortBy, setSortBy] = useState<'cost_desc' | 'sale_desc' | 'qty_desc' | 'name'>('cost_desc');

  if (!isOpen) return null;

  // Global calculations
  const totalUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalCost = products.reduce((acc, p) => acc + ((p.costPrice || 0) * (Number(p.stock) || 0)), 0);
  const totalSale = products.reduce((acc, p) => acc + ((p.salePrice || 0) * (Number(p.stock) || 0)), 0);
  const projectedProfit = Math.max(0, totalSale - totalCost);
  const averageMargin = totalSale > 0 ? (projectedProfit / totalSale) * 100 : 0;
  const averageMarkup = totalCost > 0 ? (projectedProfit / totalCost) * 100 : 0;

  // Group by category
  const categorySummary: {
    [key: string]: {
      count: number;
      units: number;
      costTotal: number;
      saleTotal: number;
    };
  } = {};

  products.forEach((p) => {
    const cat = p.category || 'Outros';
    if (!categorySummary[cat]) {
      categorySummary[cat] = { count: 0, units: 0, costTotal: 0, saleTotal: 0 };
    }
    categorySummary[cat].count += 1;
    categorySummary[cat].units += Number(p.stock) || 0;
    categorySummary[cat].costTotal += (p.costPrice || 0) * (Number(p.stock) || 0);
    categorySummary[cat].saleTotal += (p.salePrice || 0) * (Number(p.stock) || 0);
  });

  const categoriesList = ['Todas', ...Object.keys(categorySummary)];

  // Filter & sort
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    return matchCat && matchSearch;
  });

  filteredProducts.sort((a, b) => {
    const costA = (a.costPrice || 0) * (a.stock || 0);
    const costB = (b.costPrice || 0) * (b.stock || 0);
    const saleA = (a.salePrice || 0) * (a.stock || 0);
    const saleB = (b.salePrice || 0) * (b.stock || 0);

    if (sortBy === 'cost_desc') return costB - costA;
    if (sortBy === 'sale_desc') return saleB - saleA;
    if (sortBy === 'qty_desc') return b.stock - a.stock;
    return a.name.localeCompare(b.name);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Posição Patrimonial de Estoque & Balanço Valorizado
              </h2>
              <p className="text-xs text-slate-400">
                {company.tradeName || 'Sua Empresa'} • Inventário Físico e Financeiro em Tempo Real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all text-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Relatório
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top 4 KPI Metrics Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Quantidade Total de Itens */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
              <div className="flex items-center justify-between text-blue-900 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Quantidade Total</span>
                <Boxes className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 font-mono">
                {totalUnits.toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">
                Unidades físicas ({products.length} SKUs cadastrados)
              </p>
            </div>

            {/* 2. Valor em Custo */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center justify-between text-amber-900 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Estoque em CUSTO</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-amber-800 font-semibold mt-1">
                Capital total imobilizado em mercadorias
              </p>
            </div>

            {/* 3. Valor em Venda */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between text-emerald-900 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Estoque em VENDA</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                R$ {totalSale.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                Potencial bruto realizável no varejo
              </p>
            </div>

            {/* 4. Lucro Projetado / Margem */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
              <div className="flex items-center justify-between text-purple-900 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Lucro Bruto Projetado</span>
                <PieChart className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-950 font-mono">
                R$ {projectedProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-purple-800 font-semibold mt-1">
                Margem média de {averageMargin.toFixed(1)}% (Markup {averageMarkup.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Resumo por Categoria */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-500" />
              Distribuição Financeira por Categoria de Produto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(categorySummary).map(([cat, data]) => {
                const percentOfTotalCost = totalCost > 0 ? (data.costTotal / totalCost) * 100 : 0;
                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{cat}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {data.units} itens ({data.count} SKUs)
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1.5">
                      <span className="text-slate-500">Custo Total:</span>
                      <strong className="font-mono text-amber-900">
                        R$ {data.costTotal.toFixed(2)}
                      </strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Venda Total:</span>
                      <strong className="font-mono text-emerald-700">
                        R$ {data.saleTotal.toFixed(2)}
                      </strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, percentOfTotalCost))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters & Sorting Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por produto, código ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    Categoria: {cat}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white"
              >
                <option value="cost_desc">Maior Custo Total</option>
                <option value="sale_desc">Maior Venda Total</option>
                <option value="qty_desc">Maior Quantidade</option>
                <option value="name">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Items Detail Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3">Item / SKU</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3 text-center">Qtde em Estoque</th>
                    <th className="py-3 px-3 text-right">Custo Unitário</th>
                    <th className="py-3 px-3 text-right">Venda Unitária</th>
                    <th className="py-3 px-3 text-right">Custo Total</th>
                    <th className="py-3 px-3 text-right">Venda Total</th>
                    <th className="py-3 px-3 text-right">Lucro Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Nenhum produto encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const costTotal = (p.costPrice || 0) * (p.stock || 0);
                      const saleTotal = (p.salePrice || 0) * (p.stock || 0);
                      const profit = Math.max(0, saleTotal - costTotal);
                      const isLowStock = p.stock <= p.minStock;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              SKU: {p.sku} • EAN: {p.barcode}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full ${
                                isLowStock
                                  ? 'bg-rose-100 text-rose-800 font-black'
                                  : 'bg-slate-100 text-slate-900'
                              }`}
                            >
                              {p.stock} {p.unit}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            R$ {(p.costPrice || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-semibold">
                            R$ {(p.salePrice || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/30">
                            R$ {costTotal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                            R$ {saleTotal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-900">
                            R$ {profit.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs">
          <div className="text-slate-500">
            Mostrando <strong>{filteredProducts.length}</strong> produtos • Posição gerada em{' '}
            {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
