import React, { useState } from 'react';
import {
  Search,
  Tag,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  FileText,
  Printer,
  CheckCircle2,
  MapPin,
  Barcode,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, Client } from '../../types';

export const SellerView: React.FC = () => {
  const { products, clients, currentUser, finalizeSale, activeSession } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Seller Order Draft
  const [orderItems, setOrderItems] = useState<
    Array<{ product: Product; quantity: number; unitPrice: number; discount: number; total: number }>
  >([]);
  const [clientName, setClientName] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [lastGeneratedQuote, setLastGeneratedQuote] = useState<{
    code: string;
    items: typeof orderItems;
    total: number;
    clientName: string;
    clientCpf: string;
    date: string;
  } | null>(null);

  const categories = [
    'Todas',
    'Ferragens',
    'Limpeza',
    'Construção',
    'Casa & Utilidades',
    'Papelaria',
    'Ferramentas',
    'Elétrica & Hidráulica',
    'Pintura',
  ];

  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addItemToOrder = (product: Product) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (product.salePrice - item.discount) * (item.quantity + 1),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.salePrice,
          discount: 0,
          total: product.salePrice,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setOrderItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: qty, total: (i.unitPrice - i.discount) * qty }
          : i
      )
    );
  };

  const orderSubtotal = orderItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const orderDiscount = orderItems.reduce((acc, i) => acc + i.discount * i.quantity, 0);
  const orderTotal = orderSubtotal - orderDiscount;

  const handleGenerateQuote = () => {
    if (orderItems.length === 0) return;
    const quoteCode = `PV-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastGeneratedQuote({
      code: quoteCode,
      items: [...orderItems],
      total: orderTotal,
      clientName: clientName || 'Cliente Balcão',
      clientCpf: clientCpf || '',
      date: new Date().toLocaleString('pt-BR'),
    });
    setOrderItems([]);
    setClientName('');
    setClientCpf('');
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Seller Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white">ÁREA DE VENDAS & BALCÃO</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                Vendedor: {currentUser?.name || 'Vendedor'}
              </span>
            </div>
            <div className="text-xs text-blue-200/80">
              Consulte estoque, localize produtos no corredor e gere Pré-Vendas / Orçamentos para o cliente pagar no Caixa.
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Catalog and Order Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search & Categories */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="seller-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto por nome, marca ou SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-28 rounded-lg overflow-hidden bg-white border border-slate-100 mb-2 relative flex items-center justify-center p-1">
                    {prod.photos && prod.photos[0] ? (
                      <img
                        src={prod.photos[0]}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                    <span
                      className={`absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        prod.stock <= prod.minStock
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Estoque: {prod.stock} {prod.unit}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                    {prod.name}
                  </h4>

                  {prod.location && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{prod.location}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900">
                      R$ {prod.salePrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addItemToOrder(prod)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Builder / Pré-Venda Balcão (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-md p-4 flex flex-col justify-between min-h-[640px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">Pedido de Balcão / Orçamento</h3>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                {orderItems.length} itens
              </span>
            </div>

            {/* Client Info */}
            <div className="my-3 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-700">Identificação do Cliente (Opcional):</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  id="seller-client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do Cliente..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <input
                  type="text"
                  id="seller-client-cpf"
                  value={clientCpf}
                  onChange={(e) => setClientCpf(e.target.value)}
                  placeholder="CPF (Nota Paulista)..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                />
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {orderItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhum produto adicionado ao pedido do cliente ainda.
                </div>
              ) : (
                orderItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        R$ {item.unitPrice.toFixed(2)} cada • Local: {item.product.location || 'Geral'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[65px] font-bold text-slate-900">
                      R$ {item.total.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Totals and Generate Button */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-extrabold text-sm text-slate-700">VALOR TOTAL:</span>
              <span className="text-2xl font-black text-blue-600">
                R$ {orderTotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              id="btn-generate-seller-quote"
              disabled={orderItems.length === 0}
              onClick={handleGenerateQuote}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Gerar Pré-Venda / Enviar ao Caixa PDV
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: PRE-VENDA GERADA */}
      {lastGeneratedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-blue-900 text-white flex justify-between items-center no-print">
              <span className="font-bold text-sm">Pré-Venda Emitida com Sucesso!</span>
              <button
                type="button"
                onClick={() => setLastGeneratedQuote(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 font-mono text-xs text-slate-900 space-y-3">
              <div className="text-center border-b pb-2">
                <h3 className="font-extrabold text-sm">PRÉ-VENDA / PEDIDO DE BALCÃO</h3>
                <p className="text-xl font-black text-blue-700 my-1">{lastGeneratedQuote.code}</p>
                <p className="text-[10px] text-slate-500">Apresente este código no Caixa PDV para pagamento</p>
              </div>

              <div>
                <p>Cliente: <strong>{lastGeneratedQuote.clientName}</strong></p>
                {lastGeneratedQuote.clientCpf && <p>CPF: <strong>{lastGeneratedQuote.clientCpf}</strong></p>}
                <p>Vendedor: <strong>{currentUser?.name}</strong></p>
                <p>Data: {lastGeneratedQuote.date}</p>
              </div>

              <div className="border-t border-b py-2 space-y-1">
                {lastGeneratedQuote.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate flex-1">{i.quantity}x {i.product.name}</span>
                    <span className="font-bold ml-2">R$ {i.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-base font-black pt-1">
                <span>TOTAL A PAGAR:</span>
                <span className="text-blue-700">R$ {lastGeneratedQuote.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Pré-Venda
              </button>
              <button
                type="button"
                onClick={() => setLastGeneratedQuote(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
