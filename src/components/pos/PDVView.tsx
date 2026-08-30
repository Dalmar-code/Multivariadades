import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  QrCode,
  CreditCard,
  Banknote,
  Receipt,
  User,
  Tag,
  Percent,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, Client, PaymentMethod, PaymentEntry } from '../../types';
import { CashSessionModal } from './CashSessionModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';

export const PDVView: React.FC = () => {
  const {
    products,
    clients,
    currentCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartDiscount,
    clearCart,
    finalizeSale,
    activeSession,
    currentUser,
    selectedSaleForReceipt,
    setSelectedSaleForReceipt,
  } = useStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Client / Nota Fiscal Paulista State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cpfNaNota, setCpfNaNota] = useState('');
  const [showClientSelector, setShowClientSelector] = useState(false);

  // Cash Session Modal state
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashModalMode, setCashModalMode] = useState<
    'open_session' | 'close_session' | 'sangria' | 'suprimento' | 'history'
  >('open_session');

  // Payment Checkout Modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [cashAmountGiven, setCashAmountGiven] = useState<number>(0);
  const [installments, setInstallments] = useState<number>(1);
  const [discountOverall, setDiscountOverall] = useState<number>(0);
  const [issueNfce, setIssueNfce] = useState(true);

  // Barcode input ref for fast keyboard focus
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const categories: string[] = [
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

  // Calculate totals
  const subtotal = currentCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItemDiscounts = currentCart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - totalItemDiscounts - discountOverall);

  // Auto set cash amount given when opening checkout
  useEffect(() => {
    if (checkoutModalOpen) {
      setCashAmountGiven(finalTotal);
    }
  }, [checkoutModalOpen, finalTotal]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // Handle Barcode Scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(
      (p) =>
        p.barcode === barcodeInput.trim() ||
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (found) {
      addToCart(found, 1);
      setBarcodeInput('');
    } else {
      alert(`Produto com código ${barcodeInput} não encontrado no estoque.`);
    }
  };

  // Quick Client Selection
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    if (client.notaFiscalPaulistaEnabled && client.document) {
      setCpfNaNota(client.document);
    }
    setShowClientSelector(false);
  };

  // Finalize Sale Handler
  const handleCompleteSale = () => {
    if (currentCart.length === 0) return;

    const payments: PaymentEntry[] = [
      {
        method: paymentMethod,
        amount: finalTotal,
        installments: paymentMethod === 'credito' ? installments : undefined,
      },
    ];

    const change =
      paymentMethod === 'dinheiro' && cashAmountGiven > finalTotal
        ? cashAmountGiven - finalTotal
        : 0;

    const result = finalizeSale({
      payments,
      amountReceived: paymentMethod === 'dinheiro' ? cashAmountGiven : finalTotal,
      changeAmount: change,
      client: selectedClient,
      cpfNaNota: cpfNaNota || selectedClient?.document,
      issueFiscalDoc: issueNfce,
      fiscalDocType: 'NFCE',
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setCheckoutModalOpen(false);
    setSelectedClient(null);
    setCpfNaNota('');
    setDiscountOverall(0);
  };

  // If cash register session is closed, prompt to open
  if (!activeSession) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-5 shadow-inner">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Caixa Fechado no Momento</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          Para realizar vendas no balcão e emitir cupons fiscais e Nota Paulista, abra o caixa informando o fundo de troco inicial.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            id="btn-open-cash-main"
            onClick={() => {
              setCashModalMode('open_session');
              setCashModalOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Unlock className="w-5 h-5" />
            Abrir Caixa Agora (Fundo de Troco)
          </button>
          <button
            type="button"
            onClick={() => {
              setCashModalMode('history');
              setCashModalOpen(true);
            }}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Ver Histórico de Fechamentos
          </button>
        </div>

        <CashSessionModal
          isOpen={cashModalOpen}
          onClose={() => setCashModalOpen(false)}
          mode={cashModalMode}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4">
      {/* Session Top Status Bar */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <Unlock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">FRENTE DE CAIXA PDV</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Turno Ativo
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Operador: <strong className="text-slate-200">{activeSession.cashierName}</strong> • Aberto às{' '}
              {new Date(activeSession.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • Fundo: R${' '}
              {activeSession.initialBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action Buttons for Cashier */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-sangria"
            onClick={() => {
              setCashModalMode('sangria');
              setCashModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Sangria
          </button>

          <button
            type="button"
            id="btn-suprimento"
            onClick={() => {
              setCashModalMode('suprimento');
              setCashModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Suprimento
          </button>

          <button
            type="button"
            id="btn-fechar-caixa"
            onClick={() => {
              setCashModalMode('close_session');
              setCashModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            Fechar Caixa
          </button>
        </div>
      </div>

      {/* Main PDV Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Catalog / Product Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Quick Barcode & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <form onSubmit={handleBarcodeSubmit} className="sm:col-span-6 relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                id="input-barcode-scanner"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Bipe o código de barras (EAN-13)..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
              />
            </form>

            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-search-product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, SKU ou marca..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod, 1)}
                className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all p-2.5 flex flex-col justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="w-full h-28 rounded-lg overflow-hidden bg-white border border-slate-100 mb-2 relative flex items-center justify-center p-1">
                    {prod.photos && prod.photos[0] ? (
                      <img
                        src={prod.photos[0]}
                        alt={prod.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Tag className="w-8 h-8 text-slate-300" />
                    )}
                    {prod.coverHasWhiteBg && (
                      <span className="absolute top-1 left-1 text-[9px] bg-slate-900/80 text-white px-1 py-0.5 rounded font-bold">
                        Fundo Branco
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 text-[10px] bg-white/90 text-slate-700 px-1 py-0.5 rounded border border-slate-200 font-mono">
                      Estq: {prod.stock}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block truncate">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-800">
                    {prod.name}
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">{prod.unit}</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      R$ {prod.salePrice.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg bg-amber-500 group-hover:bg-amber-600 text-white flex items-center justify-center shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart, Nota Fiscal Paulista & Checkout (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-md p-4 flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-slate-900">Cupom Atual</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  {currentCart.reduce((sum, item) => sum + item.quantity, 0)} itens
                </span>
              </div>

              {currentCart.length > 0 && (
                <button
                  type="button"
                  id="btn-clear-cart"
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar
                </button>
              )}
            </div>

            {/* NOTA FISCAL PAULISTA / CLIENT IDENTIFIER */}
            <div className="my-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  Nota Fiscal Paulista (CPF na Nota)
                </span>
                <button
                  type="button"
                  onClick={() => setShowClientSelector(!showClientSelector)}
                  className="text-[11px] font-bold text-amber-700 hover:underline"
                >
                  {selectedClient ? 'Trocar Cliente' : '+ Vincular Cadastro'}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  id="input-cpf-nota"
                  value={cpfNaNota}
                  onChange={(e) => setCpfNaNota(e.target.value)}
                  placeholder="Digite CPF ou CNPJ do consumidor..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                />
                {selectedClient && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setCpfNaNota('');
                    }}
                    className="text-xs text-rose-600 font-bold px-2"
                  >
                    Remover
                  </button>
                )}
              </div>

              {selectedClient && (
                <div className="text-[11px] text-amber-800 font-semibold truncate">
                  Cliente: <strong>{selectedClient.name}</strong> ({selectedClient.document})
                </div>
              )}

              {/* Quick Client Selector dropdown */}
              {showClientSelector && (
                <div className="bg-white border border-slate-200 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1 shadow-lg">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClient(c)}
                      className="w-full text-left p-1.5 text-xs rounded hover:bg-amber-50 flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-800">{c.name}</span>
                      <span className="font-mono text-slate-500 text-[10px]">{c.document}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {currentCart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhum item adicionado ao carrinho.
                  <br />
                  Bipe o código de barras ou selecione no catálogo ao lado.
                </div>
              ) : (
                currentCart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        R$ {item.unitPrice.toFixed(2)} / {item.product.unit} • SKU: {item.product.sku}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-extrabold text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="font-extrabold text-slate-900 text-xs">
                        R$ {item.total.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Bottom Summary & Checkout Button */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {totalItemDiscounts > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Descontos em Itens:</span>
                  <span>- R$ {totalItemDiscounts.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline text-slate-900 pt-1 border-t border-slate-200">
                <span className="font-extrabold text-sm">TOTAL A PAGAR:</span>
                <span className="text-2xl font-black text-emerald-600">
                  R$ {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-open-checkout"
              disabled={currentCart.length === 0}
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:pointer-events-none text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Receipt className="w-5 h-5" />
              Finalizar Venda & Emitir NFC-e
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT & PAYMENT MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Pagamento e Emissão Fiscal</h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Total Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Valor Total da Venda
                </span>
                <div className="text-3xl font-black text-emerald-600">
                  R$ {finalTotal.toFixed(2)}
                </div>
                {cpfNaNota && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    CPF na Nota: {cpfNaNota}
                  </span>
                )}
              </div>

              {/* Payment Methods Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Selecione a Forma de Pagamento:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'dinheiro'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    Dinheiro
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'pix'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    PIX Instantâneo
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debito')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'debito'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Cartão Débito
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credito')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'credito'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Cartão Crédito
                  </button>
                </div>
              </div>

              {/* Specific Method Helpers */}
              {paymentMethod === 'dinheiro' && (
                <div className="space-y-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                    <span>Valor Entregue pelo Cliente:</span>
                    <span>Troco: R$ {Math.max(0, cashAmountGiven - finalTotal).toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    id="input-cash-given"
                    value={cashAmountGiven}
                    onChange={(e) => setCashAmountGiven(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-base font-bold rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  {/* Quick cash chips */}
                  <div className="flex gap-1.5">
                    {[10, 20, 50, 100, 200].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashAmountGiven(val)}
                        className="flex-1 py-1 text-xs font-bold rounded bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-900"
                      >
                        R$ {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-28 h-28 mx-auto bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">
                    Aponte o app do banco para pagar R$ {finalTotal.toFixed(2)} via Chave PIX Dinâmica
                  </p>
                </div>
              )}

              {paymentMethod === 'credito' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Parcelas:
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value={1}>1x de R$ {finalTotal.toFixed(2)} (À vista)</option>
                    <option value={2}>2x de R$ {(finalTotal / 2).toFixed(2)} sem juros</option>
                    <option value={3}>3x de R$ {(finalTotal / 3).toFixed(2)} sem juros</option>
                    <option value={6}>6x de R$ {(finalTotal / 6).toFixed(2)} sem juros</option>
                    <option value={10}>10x de R$ {(finalTotal / 10).toFixed(2)} sem juros</option>
                  </select>
                </div>
              )}

              {/* Fiscal Document Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Emitir Cupom Fiscal Eletrônico (NFC-e)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Transmissão automática para a SEFAZ com QR Code e Chave de 44 dígitos
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="checkbox-issue-nfce"
                  checked={issueNfce}
                  onChange={(e) => setIssueNfce(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50"
                >
                  Voltar ao Carrinho
                </button>
                <button
                  type="button"
                  id="btn-confirm-sale"
                  onClick={handleCompleteSale}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar Venda (F7)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Sessions Modal */}
      <CashSessionModal
        isOpen={cashModalOpen}
        onClose={() => setCashModalOpen(false)}
        mode={cashModalMode}
      />

      {/* Thermal Receipt & NFC-e Modal */}
      <ThermalReceiptModal
        sale={selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
      />
    </div>
  );
};
