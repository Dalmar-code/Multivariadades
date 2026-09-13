import {
  RetailNicheId,
  VaccineAppointment,
  ClientPet,
  ClientVaccineRecord,
} from './utils/retailNiches';

export type {
  RetailNicheId,
  VaccineAppointment,
  ClientPet,
  ClientVaccineRecord,
};

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'manager'
  | 'treasury'
  | 'stockist'
  | 'cashier'
  | 'seller';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  jobTitle?: string; // Cargo formal (ex: "Gerente Geral", "Chefe de Tesouraria", "Operador de Caixa Senior")
  departments?: string[]; // Departamentos com acesso: 'dashboard', 'pdv', 'vendas', 'produtos', 'fiscal', 'financeiro', 'tesouraria', 'clientes', 'filiais', 'relatorios', 'usuarios', 'empresa'
  active: boolean;
  avatar?: string;
  phone?: string;
  branchId?: string; // Filial atribuída ao usuário (operador não abre caixa de outra filial)
  branchStoreNumber?: string;
  branchName?: string;
  createdAt: string;
}

export interface StoreBranch {
  id: string;
  storeNumber: string; // Número de loja único para segurança fiscal e operacional (ex: "001", "002")
  name: string; // ex: "Loja 01 - Matriz Centro", "Loja 02 - Filial Shopping"
  tradeName?: string;
  cnpj: string;
  stateRegistration: string; // IE
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  isHeadquarter: boolean; // Matriz
  active: boolean;
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
  niche?: RetailNicheId; // Nicho de Varejo Selecionado (Farmácia, Supermercado, etc.)
  address: CompanyAddress;
  logoUrl: string; // URL or Base64
  primaryColor?: string; // Dominant Brand Color (e.g. #f59e0b)
  secondaryColor?: string; // Secondary Brand Color (e.g. #0f172a)
  accentColor?: string; // Accent Brand Color (e.g. #d97706)
  crt: '1' | '2' | '3'; // 1=Simples Nacional, 2=Simples Nacional Excesso, 3=Regime Normal
  taxRegimeName: string; // e.g. "Simples Nacional (ME/EPP)"
  aliquotaSimples: number; // %
  cnaePrincipal?: string;
  establishedDate?: string;
  isConfigured?: boolean; // Whether the initial company registration has been completed
  name?: string; // Alias for tradeName/corporateName
  pixKey?: string; // Chave PIX cadastrada para cobrança
}

export interface ProductPhoto {
  id: string;
  url: string;
  isCover: boolean;
  hasWhiteBg: boolean;
  title?: string;
}

export type ProductCategory = string;

export type VariationType = 'sabor' | 'tamanho' | 'cor' | 'peso' | 'cor_tamanho' | 'personalizado';

export interface ProductVariation {
  id: string;
  name: string; // ex: "Chocolate Suíço", "Frango e Arroz", "Azul / G", "15kg", "P"
  type?: VariationType;
  flavor?: string; // Sabor específico (ex: Chocolate, Morango, Frango, Salmão)
  size?: string; // Tamanho específico (ex: P, M, G, GG, 38, 40)
  color?: string; // Cor específica (ex: Azul, Preto, Vermelho)
  weight?: string; // Peso/Volume (ex: 500g, 1kg, 2kg, 15kg, 250ml)
  photo?: string; // Foto específica desta variação (sabor, cor, etc.)
  sku?: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string; // EAN-13
  category: ProductCategory;
  department?: string; // Departamento amplo (ex: "Medicamentos Éticos", "Hortifrúti", "Moda Feminina")
  description: string;
  specifications?: string; // Especificações técnicas e ficha detalhada do produto
  brand: string;
  unit: 'UN' | 'CX' | 'KG' | 'MT' | 'PCT' | 'LT' | 'PAR' | 'ROLO' | 'JG' | 'GL' | 'SC' | 'FD' | 'G' | 'ML';
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  location?: string; // e.g. "Corredor 3 - Prateleira B"
  photos: string[]; // up to 8 photos
  coverHasWhiteBg: boolean;
  expirationDate?: string; // Data de validade (YYYY-MM-DD)
  batchNumber?: string; // Número do lote / Fabricação

  // Promoção / Oferta
  isOnPromotion?: boolean;
  promotionalPrice?: number;
  promotionDiscountPercent?: number;
  promotionStartDate?: string;
  promotionEndDate?: string;

  // Variações do Produto (até 5 opções, ex: 1kg, 2kg, 3kg)
  hasVariations?: boolean;
  variations?: ProductVariation[];
  isService?: boolean;
  niche?: RetailNicheId;

  // Specialized Retail Fields
  anvisaRegister?: string; // Registro MS/ANVISA (Farmácia)
  activeIngredient?: string; // Princípio ativo / DCB (Farmácia)
  prescriptionType?: 'isento' | 'branca' | 'azul' | 'amarela_controlado'; // Tipo de Receita (Farmácia)
  isWeighable?: boolean; // Balança / Pesável (Supermercado / Hortifrúti)
  clothingSize?: string; // Tamanho (Moda: PP, P, M, G, GG, 38, 40, 42...)
  clothingColor?: string; // Cor (Moda)
  clothingGender?: 'Feminino' | 'Masculino' | 'Unissex' | 'Infantil';
  autoPartVehicle?: string; // Aplicação por Veículo/Ano (Autopeças)
  autoPartOemCode?: string; // Código de Peça Original OEM (Autopeças)
  serialNumberImei?: string; // Número de Série ou IMEI (Eletrônicos)
  warrantyMonths?: number; // Garantia em meses (Eletrônicos)
  petSpeciesTarget?: 'Cães' | 'Gatos' | 'Pássaros' | 'Peixes' | 'Roedores' | 'Geral'; // Alvo Pet

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
  currentDebt?: number; // Saldo devedor acumulado em vendas a prazo / fiado
  creditBlocked?: boolean; // Bloqueio de novas vendas a prazo se ultrapassar limite
  notes?: string;
  totalPurchases: number;
  createdAt: string;

  // Clube de Fidelidade
  isLoyaltyMember?: boolean;
  loyaltyPoints?: number;
  loyaltyTier?: 'bronze' | 'prata' | 'ouro' | 'diamante';
  loyaltyDiscountPercent?: number;

  // Niche Preference & Personalized Profile
  preferredNiche?: RetailNicheId; // Preferência de Nicho do Cliente (ex: Farmácia, Pet Shop, Moda...)
  vaccineInterest?: boolean;
  chronicConditions?: string;
  allergies?: string;
  vaccineHistory?: ClientVaccineRecord[]; // Histórico de vacinas do cliente (Farmácia)
  vaccineRecords?: ClientVaccineRecord[]; // Alias para registros de vacina
  pets?: ClientPet[]; // Pets do cliente (Pet Shop)
  petInfo?: { petName?: string; petSpecies?: string };
  clothingSizePreference?: string; // Tamanho de roupa habitual (Moda)
  shoeSizePreference?: string; // Tamanho de calçado habitual (Moda)
  clothingPreferences?: { shoeSize?: string; clothingSize?: string };
  vehicleModel?: string; // Modelo do carro/moto (Autopeças)
  vehiclePlate?: string; // Placa do veículo (Autopeças)
  optometryRecipe?: {
    odSphere?: string;
    odCylinder?: string;
    odAxis?: string;
    oeSphere?: string;
    oeCylinder?: string;
    oeAxis?: string;
    dnp?: string;
    addition?: string;
    doctorName?: string;
    examDate?: string;
  };
}

export interface PDVRegister {
  id: string;
  code: string; // e.g. "CX-01", "CX-02"
  name: string; // e.g. "Caixa 01 - Balcão Principal"
  branchId: string; // ID da filial à qual este caixa pertence
  branchStoreNumber?: string; // Número de loja da filial (ex: "001")
  branchName?: string; // Nome da filial (ex: "Loja Matriz Centro")
  location?: string; // e.g. "Frente de Loja - Posição 1"
  status: 'active' | 'inactive' | 'maintenance';
  printerModel?: string; // e.g. "Térmica 80mm - Epson TM-T20X"
  assignedUserId?: string;
  assignedUserName?: string;
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
  pdvId?: string;
  pdvCode?: string;
  pdvName?: string;
  sessionDate: string; // YYYY-MM-DD format for daily control
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
  closedDefinitive?: boolean; // Fechamento em definitivo (não pode ser reaberto no mesmo dia/turno)
  treasuryAudit?: {
    audited: boolean;
    auditorName?: string;
    auditedAt?: string;
    status: 'pending' | 'approved' | 'divergent' | 'adjusted';
    treasuryNotes?: string;
    physicalDifference?: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  variation?: ProductVariation;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito' | 'prazo' | 'crediario' | 'vale' | 'multi' | 'mensalista';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  installments?: number;
  referenceCode?: string; // Código de autorização POS ou ID de transação PIX
  notes?: string;
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
  timestamp?: string; // Timestamp compatibility alias
  paymentMethod?: PaymentMethod; // Primary payment method alias
  fiscalInvoiceId?: string;
  fiscalInvoiceType?: 'NFCE' | 'NFE';
}

export interface PreSaleItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  variation?: ProductVariation;
}

export interface PreSale {
  id: string;
  code: string; // e.g. "PV-3942"
  sellerId?: string;
  sellerName?: string;
  clientId?: string;
  clientName?: string;
  clientCpf?: string;
  items: PreSaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'pending' | 'billed' | 'cancelled';
  createdAt: string;
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
    | 'Prestação de Serviços'
    | 'Contas a Receber (A Prazo / Mensalista)'
    | 'Recebimento de Crediário / Mensalista'
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

export type PlanType = 'trial_10_days' | 'monthly_49_90' | 'lifetime_1699_90' | 'custom_days';
export type LicenseStatus = 'trial_active' | 'active_monthly' | 'active_lifetime' | 'custom_extended' | 'expired' | 'blocked';

export interface ClientLicense {
  id: string;
  clientName: string;
  companyName: string;
  tradeName?: string;
  document: string; // CNPJ / CPF
  email: string;
  phone: string;
  whatsapp?: string;
  plan: PlanType;
  status: LicenseStatus;
  trialStartDate: string; // Data início dos 10 dias
  trialEndDate: string; // Fim dos 10 dias
  licenseExpiryDate: string; // Data limite de acesso liberado
  isLifetime: boolean;
  amountPaid: number;
  paymentDate?: string;
  paymentMethod?: 'pix' | 'cartao' | 'boleto' | 'manual_admin';
  affiliateId?: string;
  affiliateCode?: string;
  affiliateName?: string;
  affiliateCommissionPaid: boolean;
  affiliateCommissionAmount: number;
  manualDaysGranted?: number;
  manualNotes?: string;
  createdAt: string;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  referralCode: string; // ex: "DALMAR2025" -> link gerado
  referralLink: string;
  totalReferrals: number;
  activePayingClients: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  pendingCommission: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AffiliateCommissionLog {
  id: string;
  affiliateId: string;
  affiliateName: string;
  clientId: string;
  clientName: string;
  planType: PlanType;
  saleAmount: number;
  commissionAmount: number; // R$ 49,90 (100% 1ª mensalidade) ou R$ 169,99 (10% vitalício)
  commissionRule: '1st_month_100_percent' | 'lifetime_10_percent';
  status: 'pending' | 'paid';
  paidAt?: string;
  pixTransactionId?: string;
  createdAt: string;
}

// Pet Shop & Veterinary Management Types
export type PetSpecies = 'cao' | 'gato' | 'passaro' | 'coelho' | 'roedor' | 'outro';
export type PetSize = 'mini' | 'pequeno' | 'medio' | 'grande' | 'gigante';

export interface Pet {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: 'macho' | 'femea';
  size: PetSize;
  coatType?: 'curto' | 'medio' | 'longo' | 'duplo' | 'cacheado';
  coatColor?: string;
  birthDate?: string;
  ageYears?: number;
  weightKg?: number;
  temperament: 'docil' | 'bravo' | 'agitado' | 'medroso' | 'idoso' | 'normal';
  allergies?: string;
  medicalNotes?: string;
  microchipNumber?: string;
  photoUrl?: string;
  vaccinesUpToDate?: boolean;
  createdAt: string;
}

export interface PetService {
  id: string;
  name: string;
  serviceType?: 'petshop' | 'veterinario';
  category: 'banho_tosa' | 'estetica' | 'veterinario' | 'hotel_creche' | 'transporte' | 'outros';
  targetSpecies: PetSpecies[];
  price: number;
  basePrice?: number;
  priceBySize?: {
    mini?: number;
    pequeno?: number;
    medio?: number;
    grande?: number;
    gigante?: number;
  };
  durationMinutes: number;
  description?: string;
  observations?: string;
  requiresCRMV?: boolean;
  returnDays?: number;
  clinicalInstructions?: string;
  isExtraService?: boolean;
  active: boolean;
}

export interface CustomVeterinaryService {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: 'procedimento' | 'cirurgia' | 'medicacao' | 'exame' | 'outro';
}

export interface PetAppointmentItem {
  petId: string;
  petName: string;
  petBreed: string;
  petSpecies: PetSpecies;
  petSize: string;
  primaryServiceId: string;
  primaryServiceName: string;
  primaryServicePrice: number;
  extraServices: {
    id: string;
    name: string;
    price: number;
  }[];
  customVeterinaryServices?: CustomVeterinaryService[];
  assignedStaff?: string;
  observations?: string;
  veterinaryNotes?: string;
  subtotal: number;
}

export interface VeterinaryConsultation {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  petId: string;
  petName: string;
  petSpecies: PetSpecies;
  petBreed?: string;
  petAgeYears?: number;
  petWeightKg?: number;
  date: string;
  time: string;
  veterinarianName: string;
  crmv: string;
  type: 'consulta_geral' | 'retorno' | 'emergencia' | 'vacinacao' | 'cirurgia' | 'exame';
  chiefComplaint: string;
  anamnesis?: string;
  temperatureCelsius?: number;
  heartRateBpm?: number;
  respiratoryRateRpm?: number;
  mucousMembranes?: 'normocoradas' | 'palidas' | 'congestas' | 'ictéricas' | 'cianoticas';
  hydrationStatus?: 'hidratado' | 'desidratado_leve' | 'desidratado_moderado' | 'desidratado_grave';
  diagnosis?: string;
  treatmentPlan?: string;
  prescription?: string;
  standardServices: {
    serviceId: string;
    serviceName: string;
    price: number;
  }[];
  customServices: CustomVeterinaryService[];
  vaccinesApplied?: {
    name: string;
    batchNumber?: string;
    nextDueDate?: string;
  }[];
  returnDate?: string;
  totalAmount: number;
  status: 'agendado' | 'em_atendimento' | 'concluido' | 'cancelado';
  paymentStatus: 'pendente' | 'pago';
  notes?: string;
  createdAt: string;
}

export type PetAppointmentStep =
  | 'aguardando'
  | 'aguardando_cliente_trazer'
  | 'aguardando_petshop_buscar'
  | 'na_loja_fila'
  | 'retirado'
  | 'em_andamento'
  | 'pronto'
  | 'pronto_aguardando_retirada'
  | 'pronto_aguardando_entrega'
  | 'em_transporte_entrega'
  | 'entregue';

export interface PetAppointment {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  time: string;
  transportType: 'cliente_traz' | 'leva_e_traz' | 'apenas_leva' | 'apenas_traz';
  transportAddress?: string;
  items: PetAppointmentItem[];
  totalAmount: number;
  currentStep: PetAppointmentStep;
  stepTimestamps: {
    aguardandoAt?: string;
    retiradoAt?: string;
    emAndamentoAt?: string;
    prontoAt?: string;
    entregueAt?: string;
    customStepAt?: string;
  };
  isPaid?: boolean;
  paymentStatus?: 'pendente' | 'pago';
  paymentMethod?: string;
  generalNotes?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface PlanMonthlyPurchase {
  id: string;
  date: string;
  description: string;
  amount: number;
  saleId?: string;
  paid: boolean;
  paidAt?: string;
}

export interface PetRecurringPlan {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  petId: string;
  petName: string;
  petBreed?: string;
  petSpecies?: PetSpecies;
  planType: 'quinzenal' | 'mensal';
  frequency?: 'quinzenal' | 'mensal';
  name: string;
  planName?: string;
  servicesIncluded: string[];
  totalSessions: number;
  usedSessions: number;
  extraPendingSessions?: number; // Sessões extras utilizadas quando em atraso (separadas)
  price: number;
  billingDay: number;
  startDate: string;
  nextBillingDate?: string;
  expiryDate?: string;
  paymentStatus: 'pago' | 'em_dia' | 'atrasado' | 'bloqueado' | 'liberado' | 'pendente';
  monthlyPurchases?: PlanMonthlyPurchase[]; // Compras de produtos do mensalista na loja
  active: boolean;
  notes?: string;
  createdAt: string;
}


