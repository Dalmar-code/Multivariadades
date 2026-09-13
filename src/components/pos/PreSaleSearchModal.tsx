import React, { useState } from 'react';
import {
  Search,
  FileText,
  User,
  Clock,
  ArrowRight,
  Package,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PreSale } from '../../types';

interface PreSaleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreSale: (preSale: PreSale) => void;
}

export const PreSaleSearchModal: React.FC<PreSaleSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPreSale,
}) => {
  const { preSales, updatePreSaleStatus, deletePreSale } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'billed' | 'all'>('pending');

  if (!isOpen) return null;

  const filteredPreSales = preSales.filter((ps) => {
    const matchesStatus = statusFilter === 'all' || ps.status === statusFilter;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      ps.code.toLowerCase().includes(query) ||
      (ps.clientName && ps.clientName.toLowerCase().includes(query)) ||
      (ps.clientCpf && ps.clientCpf.includes(query)) ||
      (ps.sellerName && ps.sellerName.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const pendingCount = preSales.filter((p) => p.status === 'pending').length;
  const billedCount = preSales.filter((p) => p.status === 'billed').length;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-indigo-900 text-white flex items-center justify-between border-b border-indigo-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-800/80 border border-indigo-700 flex items-center justify-center text-indigo-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Buscar Pré-Venda de Vendedor / Balcão
              </h3>
              <p className="text-xs text-indigo-200">
                Selecione o pedido gerado no balcão para puxar produtos e faturar no caixa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por Código (ex: PV-1234), Vendedor, Cliente ou CPF..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                autoFocus
              />
            </div>

            <div className="flex gap-1 bg-slate-200/80 p-1 rounded-xl shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendentes ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('billed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'billed'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faturadas ({billedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({preSales.length})
              </button>
            </div>
          </div>
        </div>

        {/* List of Pre-Sales */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 divide-y divide-slate-100">
          {filteredPreSales.length === 0 ? (
            <div className="text-center py-14 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">Nenhuma pré-venda encontrada</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {statusFilter === 'pending'
                  ? 'Não há pedidos de balcão pendentes aguardando faturamento no momento. Peça ao vendedor para emitir na Área de Vendas & Balcão.'
                  : 'Nenhum resultado com os filtros selecionados.'}
              </p>
            </div>
          ) : (
            filteredPreSales.map((ps) => {
              const isPending = ps.status === 'pending';

              return (
                <div
                  key={ps.id}
                  className={`pt-3 first:pt-0 rounded-xl p-3.5 border transition-all ${
                    isPending
                      ? 'border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-md'
                      : 'border-slate-200 bg-slate-50 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-indigo-800 font-mono">
                        {ps.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {isPending ? 'Pendente de Pagamento' : 'Já Faturada'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ps.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">Valor Total:</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatCurrency(ps.total)}
                      </span>
                    </div>
                  </div>

                  {/* Customer and Seller Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        Cliente: {ps.clientName || 'Cliente Balcão'}
                      </span>
                      {ps.clientCpf && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({ps.clientCpf})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>
                        Vendedor:{' '}
                        <strong className="text-slate-800">{ps.sellerName || 'Balcão'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {ps.notes && (
                    <div className="text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 rounded-lg p-1.5 px-2.5 mb-2">
                      <strong>Obs:</strong> {ps.notes}
                    </div>
                  )}

                  {/* Items list preview */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 mb-3 space-y-1 text-xs">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3 text-indigo-500" />
                      Itens do Pedido ({ps.items.length}):
                    </div>
                    {ps.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-slate-700 py-0.5"
                      >
                        <span className="truncate flex-1">
                          <strong>{item.quantity}x</strong> {item.product.name}
                          {item.variation && (
                            <span className="text-[10px] text-indigo-600 ml-1">
                              ({item.variation.name})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs font-semibold ml-2 text-slate-900">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja excluir a pré-venda ${ps.code}?`)) {
                          deletePreSale(ps.id);
                        }
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir Pré-Venda
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectPreSale(ps)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isPending
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:scale-[1.02]'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {isPending
                        ? 'Importar para o Carrinho do PDV'
                        : 'Re-importar Itens no PDV'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Total de {filteredPreSales.length} pré-venda(s) exibida(s)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-white cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
