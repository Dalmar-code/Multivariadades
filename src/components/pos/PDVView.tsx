import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  UserPlus,
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
  Building2,
  Users,
  Layers,
  Flame,
  Package,
  CalendarCheck,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, Client, PaymentMethod, PaymentEntry, ProductVariation, PreSale } from '../../types';
import { RETAIL_NICHES } from '../../utils/retailNiches';
import { CashSessionModal } from './CashSessionModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { PDVRegisterModal } from './PDVRegisterModal';
import { CashierQuickModal } from './CashierQuickModal';
import { PreSaleSearchModal } from './PreSaleSearchModal';
import { ClientFormModal } from '../clients/ClientFormModal';
import { BackButton } from '../common/BackButton';

export const PDVView: React.FC = () => {
  const {
    company,
    products,
    clients,
    addClient,
    updateClient,
    currentCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartDiscount,
    clearCart,
    finalizeSale,
    activeSession,
    canOpenCashSession,
    currentUser,
    selectedSaleForReceipt,
    setSelectedSaleForReceipt,
    pdvRegisters,
    setActiveTab,
    preSales,
    updatePreSaleStatus,
    companyNiche,
    customCategories,
  } = useStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Client / Nota Fiscal Paulista State & Loyalty Club
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cpfNaNota, setCpfNaNota] = useState('');
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [loyaltyDiscountApplied, setLoyaltyDiscountApplied] = useState(false);

  // Management modals for Client, PDV Register and Cashier Operator
  const [isPdvModalOpen, setIsPdvModalOpen] = useState(false);
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPreSaleModalOpen, setIsPreSaleModalOpen] = useState(false);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<Product | null>(null);

  // Cash Session Modal state
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashModalMode, setCashModalMode] = useState<
    'open_session' | 'close_session' | 'sangria' | 'suprimento' | 'history'
  >('open_session');

  // Payment Checkout Modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'single' | 'split'>('single');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [cashAmountGiven, setCashAmountGiven] = useState<number>(0);
  const [installments, setInstallments] = useState<number>(1);
  const [discountOverall, setDiscountOverall] = useState<number>(0);
  const [issueNfce, setIssueNfce] = useState(true);

  // Split payments state
  const [splitPayments, setSplitPayments] = useState<PaymentEntry[]>([]);
  const [splitMethod, setSplitMethod] = useState<PaymentMethod>('dinheiro');
  const [splitAmountInput, setSplitAmountInput] = useState<number>(0);
  const [splitInstallments, setSplitInstallments] = useState<number>(1);
  const [splitRefCode, setSplitRefCode] = useState<string>('');

  // Barcode input ref for fast keyboard focus
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Strictly filter departments to the active company niche chosen by the administrator
  const dynamicDepartments = useMemo(() => {
    const activeNiche = companyNiche || company.niche || 'supermercado';
    const nicheObj = RETAIL_NICHES[activeNiche] || RETAIL_NICHES.supermercado;
    const nicheDeptNames = (nicheObj?.departments || []).map((d) => d.name);

    const list: string[] = ['Todos'];
    nicheDeptNames.forEach((name) => {
      if (!list.includes(name)) list.push(name);
    });

    customCategories.forEach((c) => {
      if (!c.niche || c.niche === activeNiche) {
        if (!list.includes(c.department)) list.push(c.department);
      }
    });

    return list;
  }, [companyNiche, company.niche, customCategories]);

  const pendingPreSalesCount = preSales.filter((p) => p.status === 'pending').length;

  const handleImportPreSale = (preSale: PreSale) => {
    if (!activeSession) {
      alert('É necessário abrir o caixa antes de importar e faturar a pré-venda.');
      setCashModalMode('open_session');
      setCashModalOpen(true);
      return;
    }

    if (currentCart.length > 0) {
      const replace = confirm(
        'O carrinho do PDV já contém itens. Deseja substituir os itens atuais pelos itens da pré-venda?\n\n[OK] = Substituir carrinho\n[Cancelar] = Adicionar itens da pré-venda ao carrinho atual'
      );
      if (replace) {
        clearCart();
      }
    }

    // Add each item from preSale to cart
    preSale.items.forEach((item) => {
      addToCart(item.product, item.quantity, item.variation);
      if (item.discount > 0) {
        updateCartDiscount(item.product.id, item.discount);
      }
    });

    // Link client if present
    if (preSale.clientId) {
      const found = clients.find((c) => c.id === preSale.clientId);
      if (found) {
        setSelectedClient(found);
      }
    } else if (preSale.clientName && preSale.clientName !== 'Cliente Balcão') {
      // Find matching client by name or CPF
      const found = clients.find(
        (c) =>
          c.name.toLowerCase() === preSale.clientName!.toLowerCase() ||
          (preSale.clientCpf && c.document === preSale.clientCpf)
      );
      if (found) {
        setSelectedClient(found);
      }
    }

    if (preSale.clientCpf) {
      setCpfNaNota(preSale.clientCpf);
    }

    // Mark pre-sale as billed
    updatePreSaleStatus(preSale.id, 'billed');
    setIsPreSaleModalOpen(false);

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

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

  // Filter products strictly aligned with the company's chosen niche
  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const activeNiche = companyNiche || company.niche || 'supermercado';
    const nicheObj = RETAIL_NICHES[activeNiche];
    const nicheDeptsLower = (nicheObj?.departments || []).map((d) => d.name.toLowerCase());

    // Strict exclusion of other niches
    if (p.niche && p.niche !== activeNiche) {
      return false;
    }

    const prodDept = (p.department || p.category || '').toLowerCase();
    const belongsToNiche =
      nicheDeptsLower.length === 0 ||
      nicheDeptsLower.includes(prodDept) ||
      ((p as any).niche && (p as any).niche === activeNiche) ||
      customCategories.some(
        (c) => (!c.niche || c.niche === activeNiche) && c.department.toLowerCase() === prodDept
      );

    const matchesCategory =
      selectedCategory === 'Todos' ||
      selectedCategory === 'Todas' ||
      p.department === selectedCategory ||
      p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);

    return belongsToNiche && matchesCategory && matchesSearch;
  });

  // Handle Barcode Scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Check direct product match
    const found = products.find(
      (p) =>
        (p.barcode && p.barcode === query) ||
        (p.sku && p.sku.toLowerCase() === query.toLowerCase())
    );

    if (found) {
      if (found.hasVariations && found.variations && found.variations.length > 0) {
        setSelectedProductForVariation(found);
      } else {
        addToCart(found, 1);
      }
      setBarcodeInput('');
      return;
    }

    // Check if query matches a variation's sku or barcode
    let matchedVar: { product: Product; variation: ProductVariation } | null = null;
    for (const p of products) {
      if (p.variations) {
        const v = p.variations.find(
          (varItem) =>
            (varItem.barcode && varItem.barcode === query) ||
            (varItem.sku && varItem.sku.toLowerCase() === query.toLowerCase())
        );
        if (v) {
          matchedVar = { product: p, variation: v };
          break;
        }
      }
    }

    if (matchedVar) {
      addToCart(matchedVar.product, 1, matchedVar.variation);
      setBarcodeInput('');
    } else {
      alert(`Produto com código ou SKU "${barcodeInput}" não encontrado no estoque.`);
    }
  };

  // Quick Client Selection & Loyalty
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    if (client.document) {
      setCpfNaNota(client.document);
    }
    if (client.isLoyaltyMember && !loyaltyDiscountApplied) {
      // Auto apply 5% loyalty discount
      const loyaltyDisc = (subtotal - totalItemDiscounts) * 0.05;
      setDiscountOverall(loyaltyDisc);
      setLoyaltyDiscountApplied(true);
    }
    setShowClientSelector(false);
  };

  const handleToggleLoyaltyEnrollment = () => {
    if (!selectedClient) return;
    const updated = {
      ...selectedClient,
      isLoyaltyMember: true,
      loyaltyPoints: (selectedClient.loyaltyPoints || 0) + 100, // 100 pontos bônus de boas-vindas
      loyaltyTier: (selectedClient.loyaltyTier || 'bronze') as 'bronze' | 'prata' | 'ouro' | 'diamante',
      loyaltyDiscountPercent: 5,
    };
    updateClient(selectedClient.id, updated);
    setSelectedClient(updated);
    // Apply 5% discount
    const loyaltyDisc = (subtotal - totalItemDiscounts) * 0.05;
    setDiscountOverall(loyaltyDisc);
    setLoyaltyDiscountApplied(true);
  };

  // Add a payment entry to split payments
  const handleAddSplitPayment = () => {
    if (splitAmountInput <= 0) return;
    const newEntry: PaymentEntry = {
      method: splitMethod,
      amount: splitAmountInput,
      installments: splitMethod === 'credito' ? splitInstallments : undefined,
      referenceCode: splitRefCode ? splitRefCode.trim() : undefined,
    };
    const updated = [...splitPayments, newEntry];
    setSplitPayments(updated);

    // Recalculate remaining
    const totalPaid = updated.reduce((acc, p) => acc + p.amount, 0);
    const remaining = Math.max(0, finalTotal - totalPaid);
    setSplitAmountInput(remaining);
    setSplitRefCode('');
  };

  const handleRemoveSplitPayment = (index: number) => {
    const updated = splitPayments.filter((_, idx) => idx !== index);
    setSplitPayments(updated);
    const totalPaid = updated.reduce((acc, p) => acc + p.amount, 0);
    const remaining = Math.max(0, finalTotal - totalPaid);
    setSplitAmountInput(remaining);
  };

  // Finalize Sale Handler (Single or Multi-Split)
  const handleCompleteSale = () => {
    if (currentCart.length === 0) return;

    let payments: PaymentEntry[] = [];
    let change = 0;
    let amountReceived = finalTotal;

    if (paymentMode === 'split') {
      const totalPaid = splitPayments.reduce((acc, p) => acc + p.amount, 0);
      if (totalPaid < finalTotal - 0.01) {
        alert(`O valor pago (R$ ${totalPaid.toFixed(2)}) é inferior ao total da venda (R$ ${finalTotal.toFixed(2)}). Adicione os pagamentos restantes.`);
        return;
      }
      payments = splitPayments;
      amountReceived = totalPaid;
      change = Math.max(0, totalPaid - finalTotal);
    } else {
      payments = [
        {
          method: paymentMethod,
          amount: finalTotal,
          installments: paymentMethod === 'credito' ? installments : undefined,
        },
      ];

      change =
        paymentMethod === 'dinheiro' && cashAmountGiven > finalTotal
          ? cashAmountGiven - finalTotal
          : 0;
      amountReceived = paymentMethod === 'dinheiro' ? cashAmountGiven : finalTotal;
    }

    finalizeSale({
      payments,
      amountReceived,
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
    setLoyaltyDiscountApplied(false);
    setSplitPayments([]);
  };

  // If cash register session is closed, prompt to open or display definitive closure block
  if (!activeSession) {
    const canOpen = canOpenCashSession();

    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        {!canOpen.allowed ? (
          <div className="w-full max-w-lg p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 text-slate-900 shadow-xl space-y-4 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-200 text-rose-900 uppercase tracking-wider">
                Bloqueio Fiscal & Operacional
              </span>
              <h2 className="text-xl font-black text-rose-950 mt-2">
                Caixa PDV Fechado em Definitivo
              </h2>
            </div>
            <p className="text-xs font-semibold text-rose-900 leading-relaxed">
              {canOpen.reason}
            </p>

            {canOpen.lastClosedSession && (
              <div className="p-3 bg-white/90 rounded-2xl border border-rose-200 text-left text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Terminal: {canOpen.lastClosedSession.pdvName || 'PDV'}</span>
                  <span>Turno de Hoje</span>
                </div>
                <div className="text-slate-600">
                  Operador do Fechamento: <strong>{canOpen.lastClosedSession.cashierName}</strong>
                </div>
                <div className="text-slate-600">
                  Horário do Fechamento: <strong>{new Date(canOpen.lastClosedSession.closedAt || '').toLocaleString('pt-BR')}</strong>
                </div>
                <div className="text-emerald-800 font-bold">
                  Total Declarado no Fechamento: R$ {canOpen.lastClosedSession.declaredBalance?.total.toFixed(2)}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <BackButton variant="light" label="Voltar ao Menu" className="px-5 py-2.5 text-xs justify-center" />
              <button
                type="button"
                onClick={() => {
                  setCashModalMode('history');
                  setCashModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl border border-rose-300 text-rose-950 font-bold text-xs hover:bg-rose-100 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Histórico de Fechamentos
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-5 shadow-inner">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Caixa Fechado no Momento</h2>
            <p className="text-sm text-slate-600 max-w-md mb-6">
              Para realizar vendas no balcão e emitir cupons fiscais e Nota Paulista, abra o caixa informando o fundo de troco inicial. O caixa pode ser aberto apenas uma vez por dia.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <BackButton variant="light" label="Voltar ao Menu Principal" className="px-5 py-3 text-sm justify-center" />
              <button
                type="button"
                id="btn-open-cash-main"
                onClick={() => {
                  setCashModalMode('open_session');
                  setCashModalOpen(true);
                }}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
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
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                Histórico de Sessões
              </button>
            </div>

            {/* Quick Management Shortcuts for Client Setup */}
            <div className="pt-6 border-t border-slate-200 mt-6 w-full max-w-lg">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Cadastros Rápidos da Frente de Loja:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPdvModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-800 font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  + Caixa PDV
                </button>
                <button
                  type="button"
                  onClick={() => setIsCashierModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-slate-800 font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  + Operador
                </button>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 text-slate-800 font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  + Cliente
                </button>
              </div>
            </div>
          </>
        )}

        <CashSessionModal
          isOpen={cashModalOpen}
          onClose={() => setCashModalOpen(false)}
          mode={cashModalMode}
        />

        {/* PDV Register Modal (Quick Setup) */}
        <PDVRegisterModal
          isOpen={isPdvModalOpen}
          onClose={() => setIsPdvModalOpen(false)}
        />

        {/* Cashier Quick Modal (Quick Setup) */}
        <CashierQuickModal
          isOpen={isCashierModalOpen}
          onClose={() => setIsCashierModalOpen(false)}
        />

        {/* Client Quick Registration Modal (Quick Setup) */}
        <ClientFormModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSave={(clientData) => {
            const newCli = addClient(clientData);
            handleSelectClient(newCli);
            setIsClientModalOpen(false);
          }}
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
          <BackButton variant="dark" label="Voltar ao Menu" className="px-3 py-1.5 text-xs" />

          {/* Quick Registration Buttons */}
          <button
            type="button"
            onClick={() => setIsPdvModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cadastrar novo terminal de caixa PDV"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            + Caixa
          </button>

          <button
            type="button"
            onClick={() => setIsCashierModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cadastrar novo operador de caixa"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            + Operador
          </button>

          <button
            type="button"
            onClick={() => setIsClientModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cadastrar novo cliente consumidor"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            + Cliente
          </button>

          <button
            type="button"
            id="btn-buscar-pre-venda"
            onClick={() => setIsPreSaleModalOpen(true)}
            className="relative px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Buscar pré-venda gerada por vendedor do balcão"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pré-Venda (Balcão)</span>
            {pendingPreSalesCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
                {pendingPreSalesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="btn-sangria"
            onClick={() => {
              setCashModalMode('sangria');
              setCashModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-rose-300 border border-rose-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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

          {/* Dynamic Category / Department Filter Pills */}
          {dynamicDepartments.length <= 1 ? (
            <div className="flex flex-wrap items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Nenhum departamento com produtos cadastrados até o momento.</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('produtos')}
                className="text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
              >
                + Cadastrar Produtos no Estoque
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {dynamicDepartments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedCategory(dept)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === dept
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => {
              const isPromo = Boolean(prod.isOnPromotion && prod.promotionalPrice && prod.promotionalPrice > 0);
              const hasVars = Boolean(prod.hasVariations && prod.variations && prod.variations.length > 0);

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (hasVars) {
                      setSelectedProductForVariation(prod);
                    } else {
                      addToCart(prod, 1);
                    }
                  }}
                  className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all p-2.5 flex flex-col justify-between cursor-pointer group select-none relative"
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

                      {/* Promo Badge */}
                      {isPromo && (
                        <span className="absolute top-1 right-1 text-[9px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black shadow-2xs flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          OFERTA
                        </span>
                      )}

                      {/* Variations Badge */}
                      {hasVars && (
                        <span className="absolute top-1 left-1 text-[9px] bg-purple-700 text-white px-1.5 py-0.5 rounded font-bold shadow-2xs flex items-center gap-0.5">
                          <Package className="w-2.5 h-2.5" />
                          {prod.variations!.length} opções
                        </span>
                      )}

                      {!hasVars && prod.coverHasWhiteBg && !isPromo && (
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

                    {hasVars && (
                      <span className="inline-block mt-0.5 text-[10px] text-purple-700 font-semibold truncate max-w-full">
                        {prod.variations!.map((v) => v.name).join(' • ')}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">{prod.unit}</span>
                      {isPromo ? (
                        <div>
                          <span className="text-sm font-black text-rose-600">
                            R$ {prod.promotionalPrice!.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through block -mt-1 font-mono">
                            R$ {prod.salePrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-extrabold text-slate-900">
                          R$ {prod.salePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-xs cursor-pointer ${
                        hasVars
                          ? 'bg-purple-600 group-hover:bg-purple-700'
                          : 'bg-amber-500 group-hover:bg-amber-600'
                      }`}
                      title={hasVars ? 'Escolher variação' : 'Adicionar ao cupom'}
                    >
                      {hasVars ? <Package className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
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

            {/* NOTA FISCAL PAULISTA (CPF OPCIONAL) & CLUBE DE FIDELIDADE */}
            <div className="my-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  CPF na Nota / Consumidor (Opcional)
                </span>
                <div className="flex items-center gap-2">
                  {cpfNaNota && (
                    <button
                      type="button"
                      onClick={() => setCpfNaNota('')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      Consumidor Final (Sem CPF)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(true)}
                    className="text-[10px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                    title="Cadastrar novo cliente consumidor"
                  >
                    <UserPlus className="w-3 h-3" />
                    + Cadastrar Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClientSelector(!showClientSelector)}
                    className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    {selectedClient ? 'Trocar' : 'Buscar'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  id="input-cpf-nota"
                  value={cpfNaNota}
                  onChange={(e) => setCpfNaNota(e.target.value)}
                  placeholder="CPF ou CNPJ (opcional para consumidor final)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                />
                {selectedClient && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setCpfNaNota('');
                      setDiscountOverall(0);
                      setLoyaltyDiscountApplied(false);
                    }}
                    className="text-xs text-rose-600 font-bold px-2 hover:bg-rose-50 rounded"
                  >
                    Desvincular
                  </button>
                )}
              </div>

              {/* CLUBE DE FIDELIDADE INTEGRATION */}
              {selectedClient ? (
                <div className="p-2 rounded-lg bg-white border border-amber-300 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">
                      {selectedClient.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedClient.document}
                    </span>
                  </div>

                  {selectedClient.isLoyaltyMember ? (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-amber-800 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Clube de Fidelidade • {selectedClient.loyaltyPoints || 0} pts
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        5% Desconto Fidelidade Ativo
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 text-[10px]">Não cadastrado no Clube</span>
                      <button
                        type="button"
                        onClick={handleToggleLoyaltyEnrollment}
                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Ativar no Clube (+100 pts)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between text-[10px] text-amber-800 bg-amber-100/60 px-2 py-1 rounded">
                  <span>⭐ Clube de Fidelidade: Identifique o cliente para pontuar</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsClientModalOpen(true)}
                      className="font-bold underline text-blue-700 cursor-pointer"
                    >
                      + Novo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClientSelector(true)}
                      className="font-bold underline cursor-pointer"
                    >
                      Identificar
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Client Selector dropdown */}
              {showClientSelector && (
                <div className="bg-white border border-slate-200 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1 shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Selecione o Cliente / Membro do Clube:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowClientSelector(false);
                        setIsClientModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Cadastrar Novo
                    </button>
                  </div>
                  {clients.length === 0 ? (
                    <div className="p-2 text-center text-xs text-slate-500">
                      Nenhum cliente cadastrado ainda.
                      <button
                        type="button"
                        onClick={() => {
                          setShowClientSelector(false);
                          setIsClientModalOpen(true);
                        }}
                        className="block mx-auto mt-1 text-xs font-bold text-blue-600 underline cursor-pointer"
                      >
                        Cadastrar primeiro cliente agora
                      </button>
                    </div>
                  ) : (
                    clients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className="w-full text-left p-1.5 text-xs rounded hover:bg-amber-50 flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{c.name}</span>
                          {c.isLoyaltyMember && (
                            <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                              ⭐ Membro ({c.loyaltyPoints || 0} pts)
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-slate-500 text-[10px]">{c.document || 'Sem CPF'}</span>
                      </button>
                    ))
                  )}
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
                currentCart.map((item) => {
                  const itemKey = item.variation ? `${item.product.id}_${item.variation.id}` : item.product.id;

                  return (
                    <div
                      key={itemKey}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{item.product.name}</span>
                          {item.variation && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px] shrink-0">
                              {item.variation.name}
                            </span>
                          )}
                          {item.product.isOnPromotion && (
                            <span className="px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-black text-[9px] shrink-0">
                              🔥
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          R$ {item.unitPrice.toFixed(2)} / {item.product.unit} • SKU: {item.variation?.sku || item.product.sku}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(itemKey, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-extrabold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(itemKey, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
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
                        onClick={() => removeFromCart(itemKey)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remover do carrinho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
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
              {/* Total & CPF Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Valor Total da Venda
                </span>
                <div className="text-3xl font-black text-emerald-600">
                  R$ {finalTotal.toFixed(2)}
                </div>
                <div className="mt-1 flex items-center justify-center gap-2 flex-wrap text-xs">
                  {cpfNaNota ? (
                    <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      CPF na Nota: {cpfNaNota}
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                      Consumidor Final (Sem CPF)
                    </span>
                  )}
                  {selectedClient?.isLoyaltyMember && (
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ⭐ +{Math.floor(finalTotal)} pts Clube
                    </span>
                  )}
                </div>
              </div>

              {/* Mode Toggle: Single vs Split (Múltiplas Formas) */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentMode('single')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    paymentMode === 'single'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pagamento Único
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('split');
                    if (splitPayments.length === 0) {
                      setSplitAmountInput(finalTotal);
                    }
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMode === 'split'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Múltiplas Formas (Dividido)
                </button>
              </div>

              {/* SINGLE PAYMENT MODE */}
              {paymentMode === 'single' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Selecione a Modalidade:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('dinheiro')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'dinheiro'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        Dinheiro
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'pix'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        PIX Instantâneo
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('debito')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'debito'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Cartão Débito
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('credito')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'credito'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Cartão Crédito
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('prazo')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'prazo'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <FileText className="w-4 h-4 text-amber-600" />
                        Venda a Prazo
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mensalista')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'mensalista'
                            ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CalendarCheck className="w-4 h-4 text-purple-600" />
                        Mensalista
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('crediario')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'crediario'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Receipt className="w-4 h-4 text-emerald-600" />
                        Crediário Loja
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('vale')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                          paymentMethod === 'vale'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Tag className="w-4 h-4 text-emerald-600" />
                        Vale / Outros
                      </button>
                    </div>
                  </div>

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
                      <div className="w-24 h-24 mx-auto bg-white border border-slate-300 rounded-lg flex items-center justify-center p-2">
                        <QrCode className="w-20 h-20 text-slate-900" />
                      </div>
                      <p className="text-xs text-slate-600 font-semibold">
                        Aponte a câmera para pagar R$ {finalTotal.toFixed(2)} via Chave PIX Dinâmica
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
                        {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                          <option key={n} value={n}>
                            {n === 1
                              ? `1x de R$ ${finalTotal.toFixed(2)} (À vista)`
                              : `${n}x de R$ ${(finalTotal / n).toFixed(2)} sem juros`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'prazo' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <FileText className="w-4 h-4 text-amber-700" />
                        <span>Venda a Prazo / Faturamento da Conta</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {selectedClient
                          ? `Faturado a prazo para ${selectedClient.name}. Limite de crédito disponível: R$ ${selectedClient.creditLimit.toFixed(2)}.`
                          : 'Atenção: Selecione um cliente cadastrado no topo para vincular à conta corrente a prazo.'}
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'mensalista' && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-purple-900">
                        <CalendarCheck className="w-4 h-4 text-purple-700" />
                        <span>Modalidade Mensalista (Cobrança Recorrente / Plano Pet)</span>
                      </div>
                      <p className="text-[11px] text-purple-800">
                        {selectedClient
                          ? `Vinculado à conta do mensalista ${selectedClient.name}. As despesas serão consolidadas na mensalidade/fatura do cliente.`
                          : 'Atenção: Selecione o tutor/mensalista no topo da venda para vincular ao plano recorrente.'}
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'crediario' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Crediário da Loja</strong>
                      <p className="mt-0.5 text-[11px] text-amber-800">
                        {selectedClient
                          ? `Faturado para ${selectedClient.name} (Limite disponível: R$ ${selectedClient.creditLimit.toFixed(2)})`
                          : 'Atenção: Recomenda-se selecionar um cliente cadastrado com limite aprovado para crediário.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SPLIT PAYMENT MODE (MÚLTIPLAS FORMAS DE PAGAMENTO) */}
              {paymentMode === 'split' && (
                <div className="space-y-3">
                  {/* Split Summary */}
                  {(() => {
                    const totalPaid = splitPayments.reduce((acc, p) => acc + p.amount, 0);
                    const remaining = Math.max(0, finalTotal - totalPaid);
                    return (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Total Pago:</span>
                          <span className="text-emerald-600">R$ {totalPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-200">
                          <span>Restante a Pagar:</span>
                          <span className={remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                            R$ {remaining.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Add payment entry row */}
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                    <label className="block text-xs font-bold text-amber-900">
                      + Adicionar Parcela / Forma de Pagamento:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <select
                          value={splitMethod}
                          onChange={(e) => setSplitMethod(e.target.value as PaymentMethod)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-semibold"
                        >
                          <option value="dinheiro">Dinheiro</option>
                          <option value="pix">PIX</option>
                          <option value="debito">Cartão Débito</option>
                          <option value="credito">Cartão Crédito</option>
                          <option value="prazo">Venda a Prazo</option>
                          <option value="mensalista">Mensalista</option>
                          <option value="crediario">Crediário Loja</option>
                          <option value="vale">Vale / Outro</option>
                        </select>
                      </div>

                      <div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Valor R$"
                          value={splitAmountInput || ''}
                          onChange={(e) => setSplitAmountInput(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-bold"
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={handleAddSplitPayment}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Adicionar
                        </button>
                      </div>
                    </div>

                    {splitMethod === 'credito' && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600 font-semibold">Parcelas:</span>
                        <select
                          value={splitInstallments}
                          onChange={(e) => setSplitInstallments(parseInt(e.target.value, 10))}
                          className="px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                            <option key={n} value={n}>{n}x</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* List of Added Split Payments */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {splitPayments.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400">
                        Nenhum meio de pagamento adicionado ainda.
                      </div>
                    ) : (
                      splitPayments.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-slate-800">
                              {p.method === 'credito' && p.installments
                                ? `Cartão Crédito (${p.installments}x)`
                                : p.method.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-emerald-700">
                              R$ {p.amount.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSplitPayment(idx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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

      {/* PDV Register Modal */}
      <PDVRegisterModal
        isOpen={isPdvModalOpen}
        onClose={() => setIsPdvModalOpen(false)}
      />

      {/* Cashier Quick Modal */}
      <CashierQuickModal
        isOpen={isCashierModalOpen}
        onClose={() => setIsCashierModalOpen(false)}
      />

      {/* Variation Selection Modal */}
      {selectedProductForVariation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 uppercase tracking-wider">
                    Opções & Variações
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5 leading-snug">
                    {selectedProductForVariation.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecione o tamanho, peso ou versão desejada para registrar no cupom:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForVariation(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedProductForVariation.specifications && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950">
                <strong className="block text-[11px] uppercase tracking-wider text-blue-800 mb-0.5">
                  Especificações Técnicas:
                </strong>
                {selectedProductForVariation.specifications}
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedProductForVariation.variations && selectedProductForVariation.variations.length > 0 ? (
                selectedProductForVariation.variations.map((v, idx) => (
                  <button
                    key={v.id || idx}
                    type="button"
                    onClick={() => {
                      addToCart(selectedProductForVariation, 1, v);
                      setSelectedProductForVariation(null);
                    }}
                    className="w-full text-left p-3.5 rounded-2xl border-2 border-slate-200 hover:border-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 group-hover:text-purple-950">
                          {v.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono pl-8">
                        SKU: {v.sku || 'Sem SKU'} {v.barcode ? `• EAN: ${v.barcode}` : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 group-hover:text-purple-700">
                        R$ {v.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Estoque: {v.stock} un
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  Nenhuma variação cadastrada para este produto.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProductForVariation(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Quick Registration Modal (Unified for Sales, Pet Shop and Vet) */}
      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={(clientData) => {
          const newCli = addClient(clientData);
          handleSelectClient(newCli);
          setIsClientModalOpen(false);
        }}
      />

      {/* Pre-Sale (Balcão) Search & Import Modal */}
      <PreSaleSearchModal
        isOpen={isPreSaleModalOpen}
        onClose={() => setIsPreSaleModalOpen(false)}
        onSelectPreSale={handleImportPreSale}
      />
    </div>
  );
};
