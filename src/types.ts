export type UserRole = 'admin' | 'cashier' | 'seller';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface CompanyAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string; // UF (SP, RJ, MG, etc.)
}

export interface CompanyProfile {
  id: string;
  corporateName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  stateRegistration: string; // Inscrição Estadual (IE)
  municipalRegistration?: string; // Inscrição Municipal
  email: string;
  phone: string;
  whatsapp: string;
  address: CompanyAddress;
  logoUrl: string; // URL or Base64
  crt: '1' | '2' | '3'; // 1=Simples Nacional, 2=Simples Nacional Excesso, 3=Regime Normal
  taxRegimeName: string; // e.g. "Simples Nacional (ME/EPP)"
  aliquotaSimples: number; // %
  cnaePrincipal?: string;
  establishedDate?: string;
}

export interface ProductPhoto {
  id: string;
  url: string;
  isCover: boolean;
  hasWhiteBg: boolean;
  title?: string;
}

export type ProductCategory =
  | 'Ferragens'
  | 'Limpeza'
  | 'Construção'
  | 'Casa & Utilidades'
  | 'Papelaria'
  | 'Ferramentas'
  | 'Elétrica & Hidráulica'
  | 'Pintura'
  | 'Jardinagem'
  | 'Outros';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string; // EAN-13
  category: ProductCategory;
  description: string;
  brand: string;
  unit: 'UN' | 'CX' | 'KG' | 'MT' | 'PCT' | 'LT' | 'PAR' | 'ROLO' | 'JG' | 'GL' | 'SC' | 'FD';
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  location?: string; // e.g. "Corredor 3 - Prateleira B"
  photos: string[]; // up to 8 photos
  coverHasWhiteBg: boolean;
  // Fiscal Data
  ncm: string;
  cest?: string;
  cfop: string;
  csosn: string; // Simples Nacional tax situation
  icmsAliquota: number;
  pisAliquota: number;
  cofinsAliquota: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  documentType: 'cpf' | 'cnpj';
  document: string; // CPF or CNPJ
  rgIe?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  notaFiscalPaulistaEnabled: boolean; // Preferência por CPF na Nota
  creditLimit: number;
  notes?: string;
  totalPurchases: number;
  createdAt: string;
}

export interface CashMovement {
  id: string;
  type: 'suprimento' | 'sangria' | 'venda' | 'estorno';
  amount: number;
  description: string;
  timestamp: string;
  paymentMethod?: string;
  operatorName: string;
}

export interface CashRegisterSession {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  initialBalance: number; // Fundo de troco
  status: 'open' | 'closed';
  movements: CashMovement[];
  declaredBalance?: {
    dinheiro: number;
    pix: number;
    cartaoDebito: number;
    cartaoCredito: number;
    prazo: number;
    total: number;
  };
  calculatedBalance?: {
    dinheiro: number;
    pix: number;
    cartaoDebito: number;
    cartaoCredito: number;
    prazo: number;
    suprimentos: number;
    sangrias: number;
    total: number;
  };
  difference?: number;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito' | 'prazo' | 'multi';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  installments?: number;
}

export interface Sale {
  id: string;
  code: string; // e.g. #VD-1048
  sessionId: string;
  cashierId: string;
  cashierName: string;
  sellerId?: string;
  sellerName?: string;
  clientId?: string;
  clientName?: string;
  clientDocument?: string; // CPF for Nota Fiscal Paulista
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: PaymentEntry[];
  amountReceived?: number;
  changeAmount?: number;
  cpfNaNota?: string; // Nota Paulista CPF/CNPJ
  status: 'completed' | 'cancelled';
  createdAt: string;
  fiscalInvoiceId?: string;
  fiscalInvoiceType?: 'NFCE' | 'NFE';
}

export interface FiscalConfig {
  environment: 'homologacao' | 'producao';
  nfeSeries: number;
  nfeNextNumber: number;
  nfceSeries: number;
  nfceNextNumber: number;
  cscId: string;
  cscToken: string;
  certificateStatus: 'installed' | 'missing' | 'expiring';
  certificateExpiry: string;
  certificateSubject: string;
  defaultCfopInside: string; // e.g. 5.102 / 5.405
  defaultCfopOutside: string; // e.g. 6.102
  defaultCsosn: string; // e.g. 102 / 500
  ibptEstimatedTaxPercent: number; // e.g. 31.45%
  autoIssueNFCeOnSale: boolean;
}

export interface FiscalInvoice {
  id: string;
  type: 'NFCE' | 'NFE';
  saleId: string;
  number: number;
  series: number;
  accessKey: string; // 44 digits
  protocol: string;
  emissionDate: string;
  status: 'authorized' | 'cancelled' | 'denied';
  naturezaOperacao: string;
  recipientName?: string;
  recipientDocument?: string;
  totalProducts: number;
  totalDiscount: number;
  totalInvoice: number;
  taxEstimatedTotal: number;
  qrCodeUrl: string;
  xmlData?: string;
  justificativaCancelamento?: string;
}

export interface FinancialEntry {
  id: string;
  type: 'receita' | 'despesa' | 'custo_cmv';
  category:
    | 'Venda de Mercadorias'
    | 'Fornecedores / Estoque'
    | 'Folha de Pagamento'
    | 'Aluguel & Condomínio'
    | 'Energia & Água'
    | 'Impostos & Tributos'
    | 'Software & Telecom'
    | 'Manutenção & Limpeza'
    | 'Taxas de Cartão / Bancárias'
    | 'Marketing & Embalagens'
    | 'Outras Despesas';
  description: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  documentRef?: string;
  createdAt: string;
}

export interface DREPeriodSummary {
  periodLabel: string;
  receitaBrutaVendas: number;
  deducoesImpostos: number;
  receitaLiquida: number;
  cmvCustosMercadoria: number;
  lucroBruto: number;
  margemBrutaPercent: number;
  despesasOperacionais: number;
  despesasFixas: number;
  despesasVariaveis: number;
  lucroLiquido: number;
  margemLiquidaPercent: number;
}
