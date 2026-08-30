import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanyProfile,
  UserAccount,
  UserRole,
  Product,
  Client,
  FiscalConfig,
  FiscalInvoice,
  CashRegisterSession,
  Sale,
  CartItem,
  PaymentEntry,
  FinancialEntry,
  DREPeriodSummary,
} from '../types';
import {
  INITIAL_COMPANY,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_FISCAL_CONFIG,
  INITIAL_FINANCIAL_ENTRIES,
} from '../mockData';

interface StoreContextType {
  company: CompanyProfile;
  updateCompany: (data: Partial<CompanyProfile>) => void;
  currentUser: UserAccount | null;
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  switchUserRole: (role: UserRole) => void;
  setCurrentUser: (user: UserAccount | null) => void;
  login: (usernameOrEmail: string, role?: UserRole) => boolean;
  registerCompanyAndAdmin: (
    companyData: Partial<CompanyProfile>,
    adminName: string,
    adminEmail: string,
    password: string
  ) => void;
  logout: () => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, quantityChange: number) => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalPurchases'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Cash Register Sessions
  activeSession: CashRegisterSession | null;
  sessionsHistory: CashRegisterSession[];
  openCashSession: (initialBalance: number) => CashRegisterSession;
  closeCashSession: (
    declaredBalance: {
      dinheiro: number;
      pix: number;
      cartaoDebito: number;
      cartaoCredito: number;
      prazo: number;
      total: number;
    },
    notes?: string
  ) => CashRegisterSession;
  addCashMovement: (type: 'suprimento' | 'sangria', amount: number, description: string) => void;

  // Sales & Cart
  sales: Sale[];
  currentCart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  finalizeSale: (params: {
    payments: PaymentEntry[];
    amountReceived?: number;
    changeAmount?: number;
    client?: Client | null;
    cpfNaNota?: string;
    sellerId?: string;
    sellerName?: string;
    issueFiscalDoc?: boolean;
    fiscalDocType?: 'NFCE' | 'NFE';
  }) => { sale: Sale; invoice?: FiscalInvoice };

  // Fiscal
  fiscalConfig: FiscalConfig;
  updateFiscalConfig: (config: Partial<FiscalConfig>) => void;
  fiscalInvoices: FiscalInvoice[];
  generateFiscalInvoice: (
    sale: Sale,
    type: 'NFCE' | 'NFE',
    recipientName?: string,
    recipientDoc?: string
  ) => FiscalInvoice;
  cancelFiscalInvoice: (invoiceId: string, justificativa: string) => void;

  // Financial & DRE
  financialEntries: FinancialEntry[];
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id' | 'createdAt'>) => void;
  updateFinancialEntry: (id: string, entry: Partial<FinancialEntry>) => void;
  deleteFinancialEntry: (id: string) => void;
  calculateDRE: (monthOffset?: number) => DREPeriodSummary;

  // Global View Mode
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedInvoiceForDanfe: FiscalInvoice | null;
  setSelectedInvoiceForDanfe: (invoice: FiscalInvoice | null) => void;
  selectedSaleForReceipt: Sale | null;
  setSelectedSaleForReceipt: (sale: Sale | null) => void;
  isRegistered: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'multivariedades_erp_state_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    const saved = localStorage.getItem('multivariedades_is_registered');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_company`);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_clients`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_fiscal_config`);
    return saved ? JSON.parse(saved) : INITIAL_FISCAL_CONFIG;
  });

  const [fiscalInvoices, setFiscalInvoices] = useState<FiscalInvoice[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : [];
  });

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_financial`);
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ENTRIES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sales`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSession, setActiveSession] = useState<CashRegisterSession | null>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_active_session`);
    if (saved) return JSON.parse(saved);
    // Create an initial open session for convenience
    return {
      id: 'sess_' + Date.now(),
      cashierId: INITIAL_USERS[1]?.id || 'user_cashier',
      cashierName: INITIAL_USERS[1]?.name || 'Marcos Silva (Caixa)',
      openedAt: new Date().toISOString(),
      initialBalance: 200.0,
      status: 'open',
      movements: [
        {
          id: 'mov_init',
          type: 'suprimento',
          amount: 200.0,
          description: 'Fundo de troco inicial de abertura',
          timestamp: new Date().toISOString(),
          operatorName: 'Marcos Silva',
        },
      ],
    };
  });

  const [sessionsHistory, setSessionsHistory] = useState<CashRegisterSession[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sessions_history`);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentCart, setCurrentCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedInvoiceForDanfe, setSelectedInvoiceForDanfe] = useState<FiscalInvoice | null>(null);
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('multivariedades_is_registered', JSON.stringify(isRegistered));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_company`, JSON.stringify(company));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(clients));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_fiscal_config`, JSON.stringify(fiscalConfig));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(fiscalInvoices));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_financial`, JSON.stringify(financialEntries));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sales`, JSON.stringify(sales));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_session`, JSON.stringify(activeSession));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sessions_history`, JSON.stringify(sessionsHistory));
    setIsInitialized(true);
  }, [
    isRegistered,
    company,
    users,
    currentUser,
    products,
    clients,
    fiscalConfig,
    fiscalInvoices,
    financialEntries,
    sales,
    activeSession,
    sessionsHistory,
  ]);

  // Adjust active tab when current user changes according to role
  useEffect(() => {
    if (currentUser?.role === 'cashier') {
      setActiveTab('pdv');
    } else if (currentUser?.role === 'seller') {
      setActiveTab('vendas');
    } else if (currentUser?.role === 'admin' && (activeTab === 'pdv' || activeTab === 'vendas')) {
      // keep current or default to dashboard
    }
  }, [currentUser?.role]);

  // Update Company
  const updateCompany = (data: Partial<CompanyProfile>) => {
    setCompany((prev) => ({ ...prev, ...data }));
  };

  // Register Company and Admin instantly (No email confirmation needed, 2 passwords with eye toggle)
  const registerCompanyAndAdmin = (
    companyData: Partial<CompanyProfile>,
    adminName: string,
    adminEmail: string,
    password: string
  ) => {
    const newCompany: CompanyProfile = {
      ...INITIAL_COMPANY,
      ...companyData,
      id: 'comp_' + Date.now(),
    };
    const newAdmin: UserAccount = {
      id: 'user_admin_' + Date.now(),
      name: adminName || 'Administrador Geral',
      username: adminEmail.split('@')[0] || 'admin',
      email: adminEmail,
      password: password,
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
    };

    setCompany(newCompany);
    setUsers((prev) => [newAdmin, ...prev.filter((u) => u.role !== 'admin')]);
    setCurrentUser(newAdmin);
    setIsRegistered(true);
    setActiveTab('dashboard');
  };

  const switchUserRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || {
      id: `user_${role}_demo`,
      name:
        role === 'admin'
          ? 'Carlos Oliveira (Admin)'
          : role === 'cashier'
          ? 'Marcos Silva (Operador de Caixa)'
          : 'Carla Mendes (Vendedora Balcão)',
      username: role,
      email: `${role}@multitudo.com.br`,
      role: role,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(targetUser);
  };

  const login = (usernameOrEmail: string, role?: UserRole) => {
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        u.email.toLowerCase() === usernameOrEmail.toLowerCase() ||
        (role && u.role === role)
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Fallback switch to role if typed
    if (['admin', 'cashier', 'seller'].includes(usernameOrEmail.toLowerCase())) {
      switchUserRole(usernameOrEmail.toLowerCase() as UserRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<UserAccount>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null));
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProd: Product = {
      ...productData,
      id: 'prod_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateStock = (productId: string, quantityChange: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: Math.max(0, p.stock + quantityChange),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  // Clients CRUD
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalPurchases'>) => {
    const newClient: Client = {
      ...clientData,
      id: 'cli_' + Date.now(),
      totalPurchases: 0,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...clientData } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Cash Register Sessions
  const openCashSession = (initialBalance: number) => {
    const newSession: CashRegisterSession = {
      id: 'sess_' + Date.now(),
      cashierId: currentUser?.id || 'user_cashier',
      cashierName: currentUser?.name || 'Operador de Caixa',
      openedAt: new Date().toISOString(),
      initialBalance: initialBalance,
      status: 'open',
      movements: [
        {
          id: 'mov_open_' + Date.now(),
          type: 'suprimento',
          amount: initialBalance,
          description: 'Abertura de Caixa (Fundo de Troco)',
          timestamp: new Date().toISOString(),
          operatorName: currentUser?.name || 'Operador',
        },
      ],
    };
    setActiveSession(newSession);
    return newSession;
  };

  const closeCashSession = (
    declaredBalance: {
      dinheiro: number;
      pix: number;
      cartaoDebito: number;
      cartaoCredito: number;
      prazo: number;
      total: number;
    },
    notes?: string
  ) => {
    if (!activeSession) throw new Error('Nenhum caixa aberto no momento.');

    // Calculate system balance from movements and sales in this session
    const sessionSales = sales.filter((s) => s.sessionId === activeSession.id);
    let dinheiro = activeSession.initialBalance;
    let pix = 0;
    let debito = 0;
    let credito = 0;
    let prazo = 0;
    let suprimentos = 0;
    let sangrias = 0;

    activeSession.movements.forEach((mov) => {
      if (mov.type === 'suprimento' && mov.description !== 'Abertura de Caixa (Fundo de Troco)') {
        suprimentos += mov.amount;
        dinheiro += mov.amount;
      } else if (mov.type === 'sangria') {
        sangrias += mov.amount;
        dinheiro -= mov.amount;
      }
    });

    sessionSales.forEach((sale) => {
      sale.payments.forEach((p) => {
        if (p.method === 'dinheiro') dinheiro += p.amount;
        if (p.method === 'pix') pix += p.amount;
        if (p.method === 'debito') debito += p.amount;
        if (p.method === 'credito') credito += p.amount;
        if (p.method === 'prazo') prazo += p.amount;
      });
    });

    const calculatedTotal = dinheiro + pix + debito + credito + prazo;
    const difference = declaredBalance.total - calculatedTotal;

    const closedSession: CashRegisterSession = {
      ...activeSession,
      status: 'closed',
      closedAt: new Date().toISOString(),
      declaredBalance,
      calculatedBalance: {
        dinheiro,
        pix,
        cartaoDebito: debito,
        cartaoCredito: credito,
        prazo,
        suprimentos,
        sangrias,
        total: calculatedTotal,
      },
      difference,
      notes,
    };

    setSessionsHistory((prev) => [closedSession, ...prev]);
    setActiveSession(null);
    return closedSession;
  };

  const addCashMovement = (type: 'suprimento' | 'sangria', amount: number, description: string) => {
    if (!activeSession) return;
    const newMovement = {
      id: 'mov_' + Date.now(),
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
      operatorName: currentUser?.name || 'Operador',
    };

    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            movements: [...prev.movements, newMovement],
          }
        : null
    );

    // Also add to financial entries for real-time tracking
    if (type === 'sangria') {
      addFinancialEntry({
        type: 'despesa',
        category: 'Outras Despesas',
        description: `Sangria de Caixa: ${description}`,
        amount,
        dueDate: new Date().toISOString().split('T')[0],
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: 'Dinheiro',
        documentRef: `CX-SANG-${Date.now().toString().slice(-4)}`,
      });
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCurrentCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        const total = (product.salePrice - existing.discount) * newQty;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, total: Math.max(0, total) }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            unitPrice: product.salePrice,
            discount: 0,
            total: product.salePrice * quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCurrentCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCurrentCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const total = (item.unitPrice - item.discount) * quantity;
          return { ...item, quantity, total: Math.max(0, total) };
        }
        return item;
      })
    );
  };

  const updateCartDiscount = (productId: string, discount: number) => {
    setCurrentCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const effectivePrice = Math.max(0, item.unitPrice - discount);
          const total = effectivePrice * item.quantity;
          return { ...item, discount, total };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCurrentCart([]);
  };

  // Generate 44-digit SEFAZ Key
  const generateAccessKey = (
    stateCode = '35', // SP
    emissionDateStr = new Date().toISOString(),
    cnpjStr = company.cnpj.replace(/\D/g, '').padStart(14, '0'),
    model = '65', // 65 for NFC-e, 55 for NF-e
    series = 1,
    number = 1001
  ) => {
    const date = new Date(emissionDateStr);
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const modelPad = model.padStart(2, '0');
    const seriesPad = series.toString().padStart(3, '0');
    const numPad = number.toString().padStart(9, '0');
    const tipoEmissao = '1'; // Normal
    const randomCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    const raw43 = `${stateCode}${yy}${mm}${cnpjStr}${modelPad}${seriesPad}${numPad}${tipoEmissao}${randomCode}`;

    // Calculate DV (Dígito Verificador)
    let weight = 2;
    let sum = 0;
    for (let i = raw43.length - 1; i >= 0; i--) {
      sum += parseInt(raw43[i], 10) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const rem = sum % 11;
    const dv = rem === 0 || rem === 1 ? '0' : (11 - rem).toString();
    return `${raw43}${dv}`;
  };

  // Fiscal Invoice Generator
  const generateFiscalInvoice = (
    sale: Sale,
    type: 'NFCE' | 'NFE',
    recipientName?: string,
    recipientDoc?: string
  ): FiscalInvoice => {
    const isNFe = type === 'NFE';
    const series = isNFe ? fiscalConfig.nfeSeries : fiscalConfig.nfceSeries;
    const currentNumber = isNFe ? fiscalConfig.nfeNextNumber : fiscalConfig.nfceNextNumber;

    const accessKey = generateAccessKey(
      '35',
      sale.createdAt,
      company.cnpj.replace(/\D/g, ''),
      isNFe ? '55' : '65',
      series,
      currentNumber
    );

    const protocol = `135${new Date().getFullYear().toString().slice(-2)}${Math.floor(
      1000000000 + Math.random() * 9000000000
    )}`;

    const estimatedTax = (sale.total * fiscalConfig.ibptEstimatedTaxPercent) / 100;

    const invoice: FiscalInvoice = {
      id: 'inv_' + Date.now(),
      type,
      saleId: sale.id,
      number: currentNumber,
      series,
      accessKey,
      protocol,
      emissionDate: new Date().toISOString(),
      status: 'authorized',
      naturezaOperacao: isNFe ? 'VENDA DE MERCADORIAS (DENTRO DO ESTADO)' : 'VENDA AO CONSUMIDOR FINAL',
      recipientName: recipientName || sale.clientName || 'CONSUMIDOR FINAL',
      recipientDocument: recipientDoc || sale.cpfNaNota || sale.clientDocument,
      totalProducts: sale.subtotal,
      totalDiscount: sale.discount,
      totalInvoice: sale.total,
      taxEstimatedTotal: estimatedTax,
      qrCodeUrl: `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${accessKey}|2|1|${fiscalConfig.cscId}|${fiscalConfig.cscToken}`,
    };

    setFiscalInvoices((prev) => [invoice, ...prev]);

    // Advance next number in fiscal config
    setFiscalConfig((prev) => ({
      ...prev,
      nfeNextNumber: isNFe ? prev.nfeNextNumber + 1 : prev.nfeNextNumber,
      nfceNextNumber: !isNFe ? prev.nfceNextNumber + 1 : prev.nfceNextNumber,
    }));

    return invoice;
  };

  const cancelFiscalInvoice = (invoiceId: string, justificativa: string) => {
    setFiscalInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'cancelled',
              justificativaCancelamento: justificativa,
            }
          : inv
      )
    );
  };

  // Finalize Sale
  const finalizeSale = ({
    payments,
    amountReceived,
    changeAmount,
    client,
    cpfNaNota,
    sellerId,
    sellerName,
    issueFiscalDoc = true,
    fiscalDocType = 'NFCE',
  }: {
    payments: PaymentEntry[];
    amountReceived?: number;
    changeAmount?: number;
    client?: Client | null;
    cpfNaNota?: string;
    sellerId?: string;
    sellerName?: string;
    issueFiscalDoc?: boolean;
    fiscalDocType?: 'NFCE' | 'NFE';
  }) => {
    if (currentCart.length === 0) throw new Error('Carrinho vazio.');

    const subtotal = currentCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discount = currentCart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
    const total = subtotal - discount;

    const saleCode = `#VD-${new Date().getFullYear()}-${(sales.length + 1045).toString()}`;

    const newSale: Sale = {
      id: 'sale_' + Date.now(),
      code: saleCode,
      sessionId: activeSession?.id || 'sess_default',
      cashierId: currentUser?.id || 'user_cashier',
      cashierName: currentUser?.name || 'Operador de Caixa',
      sellerId: sellerId || (currentUser?.role === 'seller' ? currentUser.id : undefined),
      sellerName: sellerName || (currentUser?.role === 'seller' ? currentUser.name : undefined),
      clientId: client?.id,
      clientName: client?.name,
      clientDocument: client?.document,
      cpfNaNota: cpfNaNota || (client?.notaFiscalPaulistaEnabled ? client.document : undefined),
      items: [...currentCart],
      subtotal,
      discount,
      total,
      payments,
      amountReceived: amountReceived || total,
      changeAmount: changeAmount || 0,
      status: 'completed',
      createdAt: new Date().toISOString(),
      fiscalInvoiceType: fiscalDocType,
    };

    // Deduct stock for all items
    currentCart.forEach((item) => {
      updateStock(item.product.id, -item.quantity);
    });

    // Update Client purchases if attached
    if (client) {
      updateClient(client.id, {
        totalPurchases: (client.totalPurchases || 0) + total,
      });
    }

    // Register sale in Cash Register movement
    if (activeSession) {
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              movements: [
                ...prev.movements,
                {
                  id: 'mov_sale_' + Date.now(),
                  type: 'venda',
                  amount: total,
                  description: `Venda ${saleCode} (${payments.map((p) => p.method).join(', ')})`,
                  timestamp: new Date().toISOString(),
                  operatorName: currentUser?.name || 'Caixa',
                },
              ],
            }
          : null
      );
    }

    // Add Revenue in Financial module
    addFinancialEntry({
      type: 'receita',
      category: 'Venda de Mercadorias',
      description: `Venda ${saleCode} - Balcão PDV`,
      amount: total,
      dueDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'paid',
      paymentMethod: payments.map((p) => p.method.toUpperCase()).join(' + '),
      documentRef: saleCode,
    });

    // Automatically issue Fiscal Document (NF-e or NFC-e) if enabled
    let createdInvoice: FiscalInvoice | undefined;
    if (issueFiscalDoc) {
      createdInvoice = generateFiscalInvoice(
        newSale,
        fiscalDocType,
        client?.name,
        cpfNaNota || client?.document
      );
      newSale.fiscalInvoiceId = createdInvoice.id;
    }

    setSales((prev) => [newSale, ...prev]);
    setSelectedSaleForReceipt(newSale);
    clearCart();

    return { sale: newSale, invoice: createdInvoice };
  };

  // Fiscal Config Update
  const updateFiscalConfig = (config: Partial<FiscalConfig>) => {
    setFiscalConfig((prev) => ({ ...prev, ...config }));
  };

  // Financial Entries
  const addFinancialEntry = (entryData: Omit<FinancialEntry, 'id' | 'createdAt'>) => {
    const newEntry: FinancialEntry = {
      ...entryData,
      id: 'fin_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFinancialEntries((prev) => [newEntry, ...prev]);
  };

  const updateFinancialEntry = (id: string, entryData: Partial<FinancialEntry>) => {
    setFinancialEntries((prev) => prev.map((f) => (f.id === id ? { ...f, ...entryData } : f)));
  };

  const deleteFinancialEntry = (id: string) => {
    setFinancialEntries((prev) => prev.filter((f) => f.id !== id));
  };

  // Calculate DRE (Demonstrativo do Resultado do Exercício)
  const calculateDRE = (monthOffset = 0): DREPeriodSummary => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const periodLabel = `${monthNames[targetMonth]} de ${targetYear}`;

    // Filter sales in this period
    const periodSales = sales.filter((s) => {
      const sDate = new Date(s.createdAt);
      return (
        s.status === 'completed' &&
        sDate.getMonth() === targetMonth &&
        sDate.getFullYear() === targetYear
      );
    });

    // Filter financial entries in this period
    const periodFinancial = financialEntries.filter((f) => {
      const dateStr = f.paymentDate || f.dueDate || f.createdAt;
      const fDate = new Date(dateStr);
      return fDate.getMonth() === targetMonth && fDate.getFullYear() === targetYear;
    });

    const receitaBrutaVendas =
      periodSales.length > 0
        ? periodSales.reduce((acc, s) => acc + s.total, 0)
        : periodFinancial
            .filter((f) => f.type === 'receita')
            .reduce((acc, f) => acc + f.amount, 0);

    // Deduções e Impostos sobre Venda (Simples Nacional ~4.5%)
    const deducoesImpostos = (receitaBrutaVendas * company.aliquotaSimples) / 100;
    const receitaLiquida = Math.max(0, receitaBrutaVendas - deducoesImpostos);

    // CMV - Custo das Mercadorias Vendidas (from items sold or supplier cost entries)
    let cmvCustosMercadoria = 0;
    if (periodSales.length > 0) {
      periodSales.forEach((s) => {
        s.items.forEach((item) => {
          cmvCustosMercadoria += (item.product.costPrice || 0) * item.quantity;
        });
      });
    } else {
      cmvCustosMercadoria = periodFinancial
        .filter((f) => f.type === 'custo_cmv')
        .reduce((acc, f) => acc + f.amount, 0);
    }

    const lucroBruto = Math.max(0, receitaLiquida - cmvCustosMercadoria);
    const margemBrutaPercent = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

    // Despesas Operacionais (Fixas e Variáveis)
    const despesasFixas = periodFinancial
      .filter(
        (f) =>
          f.type === 'despesa' &&
          [
            'Aluguel & Condomínio',
            'Folha de Pagamento',
            'Energia & Água',
            'Software & Telecom',
          ].includes(f.category)
      )
      .reduce((acc, f) => acc + f.amount, 0);

    const despesasVariaveis = periodFinancial
      .filter(
        (f) =>
          f.type === 'despesa' &&
          !['Aluguel & Condomínio', 'Folha de Pagamento', 'Energia & Água', 'Software & Telecom'].includes(
            f.category
          )
      )
      .reduce((acc, f) => acc + f.amount, 0);

    const despesasOperacionais = despesasFixas + despesasVariaveis;
    const lucroLiquido = lucroBruto - despesasOperacionais;
    const margemLiquidaPercent = receitaBrutaVendas > 0 ? (lucroLiquido / receitaBrutaVendas) * 100 : 0;

    return {
      periodLabel,
      receitaBrutaVendas,
      deducoesImpostos,
      receitaLiquida,
      cmvCustosMercadoria,
      lucroBruto,
      margemBrutaPercent,
      despesasOperacionais,
      despesasFixas,
      despesasVariaveis,
      lucroLiquido,
      margemLiquidaPercent,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        company,
        updateCompany,
        currentUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        switchUserRole,
        setCurrentUser,
        login,
        registerCompanyAndAdmin,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        clients,
        addClient,
        updateClient,
        deleteClient,
        activeSession,
        sessionsHistory,
        openCashSession,
        closeCashSession,
        addCashMovement,
        sales,
        currentCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartDiscount,
        clearCart,
        finalizeSale,
        fiscalConfig,
        updateFiscalConfig,
        fiscalInvoices,
        generateFiscalInvoice,
        cancelFiscalInvoice,
        financialEntries,
        addFinancialEntry,
        updateFinancialEntry,
        deleteFinancialEntry,
        calculateDRE,
        activeTab,
        setActiveTab,
        selectedInvoiceForDanfe,
        setSelectedInvoiceForDanfe,
        selectedSaleForReceipt,
        setSelectedSaleForReceipt,
        isRegistered,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
