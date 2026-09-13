import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Tag,
  ArrowDownCircle,
  Pill,
  ShoppingBag,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Percent,
} from 'lucide-react';

export const ExpirationControl: React.FC = () => {
  const { products, updateProduct, companyNiche } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'expired' | 'urgent30' | 'near90' | 'safe'>('all');

  const now = new Date();

  // Helper to calculate days until expiration
  const getDaysUntilExpiration = (dateStr?: string) => {
    if (!dateStr) return null;
    const exp = new Date(dateStr + 'T23:59:59');
    const diffTime = exp.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter only products that have expirationDate or batchNumber
  const productsWithExpiry = products.filter((p) => Boolean(p.expirationDate || p.batchNumber));

  const categorizedProducts = productsWithExpiry.map((prod) => {
    const days = getDaysUntilExpiration(prod.expirationDate);
    let status: 'expired' | 'urgent30' | 'near90' | 'safe' = 'safe';

    if (days !== null) {
      if (days < 0) status = 'expired';
      else if (days <= 30) status = 'urgent30';
      else if (days <= 90) status = 'near90';
      else status = 'safe';
    }

    return {
      product: prod,
      daysLeft: days,
      status,
    };
  });

  const expiredCount = categorizedProducts.filter((p) => p.status === 'expired').length;
  const urgent30Count = categorizedProducts.filter((p) => p.status === 'urgent30').length;
  const near90Count = categorizedProducts.filter((p) => p.status === 'near90').length;
  const safeCount = categorizedProducts.filter((p) => p.status === 'safe').length;

  const filteredItems = categorizedProducts.filter((item) => {
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product.batchNumber && item.product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.product.barcode.includes(searchTerm) ||
      (item.product.category && item.product.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUrgency = filterUrgency === 'all' || item.status === filterUrgency;

    return matchesSearch && matchesUrgency;
  });

  // Action: Apply quick discount for clearance sale
  const handleApplyDiscount = (productId: string, currentPrice: number, percent: number) => {
    const newPrice = Number((currentPrice * (1 - percent / 100)).toFixed(2));
    updateProduct(productId, { salePrice: newPrice });
    alert(`Preço promocional aplicado com sucesso: R$ ${newPrice.toFixed(2)} (-${percent}%)!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Clock className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Controle de Validades & Lotes Sanitários
            </h1>
          </div>
          <p className="text-slate-600 text-sm">
            Monitoramento preventivo para Farmácias, Supermercados e Varejo. Evite perdas por vencimento, planeje liquidações de queima e mantenha conformidade sanitária.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            {productsWithExpiry.length} Produtos com Rastreio de Lote/Validade
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vencidos */}
        <button
          type="button"
          onClick={() => setFilterUrgency(filterUrgency === 'expired' ? 'all' : 'expired')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            filterUrgency === 'expired'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-300'
              : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Vencidos</span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-900">{expiredCount}</div>
          <div className="text-xs text-rose-600 mt-1">Retirar imediatamente de exposição</div>
        </button>

        {/* Vence em 30 dias */}
        <button
          type="button"
          onClick={() => setFilterUrgency(filterUrgency === 'urgent30' ? 'all' : 'urgent30')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            filterUrgency === 'urgent30'
              ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-300'
              : 'bg-white border-slate-200 hover:border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Vence em até 30d</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-black text-orange-900">{urgent30Count}</div>
          <div className="text-xs text-orange-600 mt-1">Urgente: aplicar desconto promocional</div>
        </button>

        {/* Vence em até 90 dias */}
        <button
          type="button"
          onClick={() => setFilterUrgency(filterUrgency === 'near90' ? 'all' : 'near90')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            filterUrgency === 'near90'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Vence em até 90d</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-900">{near90Count}</div>
          <div className="text-xs text-amber-600 mt-1">Atenção no giro do estoque</div>
        </button>

        {/* Validade Segura */}
        <button
          type="button"
          onClick={() => setFilterUrgency(filterUrgency === 'safe' ? 'all' : 'safe')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            filterUrgency === 'safe'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Validade Segura</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-900">{safeCount}</div>
          <div className="text-xs text-emerald-600 mt-1">Mais de 90 dias de margem</div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar produto por nome, código de barras, lote ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value as any)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
        >
          <option value="all">Todas as Situações</option>
          <option value="expired">Apenas Vencidos</option>
          <option value="urgent30">Vencendo em 30 Dias</option>
          <option value="near90">Vencendo em 90 Dias</option>
          <option value="safe">Validade Segura (&gt; 90 dias)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Clock className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-bold text-base text-slate-700">Nenhum produto encontrado neste filtro</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ao cadastrar novos produtos no sistema, preencha a data de validade e número do lote para acompanhá-los nesta tela.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Produto & Categoria</th>
                  <th className="py-3 px-4">Lote & ANVISA</th>
                  <th className="py-3 px-4">Data de Validade</th>
                  <th className="py-3 px-4 text-center">Dias Restantes</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4 text-right">Preço de Venda</th>
                  <th className="py-3 px-4 text-right">Ação de Queima / Desconto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(({ product, daysLeft, status }) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-600">{product.barcode}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                        {product.batchNumber || 'S/ Lote'}
                      </div>
                      {product.anvisaRegister && (
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          {product.anvisaRegister}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {product.expirationDate ? (
                        <div className="font-bold text-slate-900">
                          {new Date(product.expirationDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Não informada</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {status === 'expired' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 animate-pulse">
                          <XCircle className="w-3.5 h-3.5" />
                          Vencido há {Math.abs(daysLeft || 0)} dias
                        </span>
                      ) : status === 'urgent30' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {daysLeft} dias restantes
                        </span>
                      ) : status === 'near90' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          {daysLeft} dias restantes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {daysLeft} dias (Seguro)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-slate-900">{product.stock}</span>
                      <span className="text-xs text-slate-500 ml-1">{product.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                      R$ {product.salePrice.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyDiscount(product.id, product.salePrice, 20)}
                          title="Aplicar 20% de Desconto de Queima"
                          className="px-2 py-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                        >
                          -20%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyDiscount(product.id, product.salePrice, 40)}
                          title="Aplicar 40% de Desconto de Queima"
                          className="px-2 py-1 text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200 transition-colors cursor-pointer"
                        >
                          -40%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyDiscount(product.id, product.salePrice, 60)}
                          title="Aplicar 60% de Desconto de Queima"
                          className="px-2 py-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                        >
                          -60%
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
    </div>
  );
};
