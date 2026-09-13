import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanyProfile,
  UserAccount,
  UserRole,
  Product,
  ProductVariation,
  Client,
  FiscalConfig,
  FiscalInvoice,
  CashRegisterSession,
  CashMovement,
  Sale,
  CartItem,
  PaymentEntry,
  FinancialEntry,
  DREPeriodSummary,
  PDVRegister,
  StoreBranch,
  ClientLicense,
  Affiliate,
  AffiliateCommissionLog,
  VaccineAppointment,
  RetailNicheId,
  Pet,
  PetSpecies,
  PetService,
  PetAppointment,
  PetRecurringPlan,
  PetAppointmentStep,
  VeterinaryConsultation,
  CustomVeterinaryService,
  PreSale,
  PreSaleItem,
} from '../types';
import {
  INITIAL_COMPANY,
  BLANK_COMPANY,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_FISCAL_CONFIG,
  INITIAL_FINANCIAL_ENTRIES,
  INITIAL_PDV_REGISTERS,
  INITIAL_BRANCHES,
  INITIAL_CLIENT_LICENSES,
  INITIAL_AFFILIATES,
  INITIAL_COMMISSION_LOGS,
  INITIAL_VACCINES,
} from '../mockData';
import { RETAIL_NICHES } from '../utils/retailNiches';
import { applyThemeColors } from '../utils/colorExtractor';
import { DEFAULT_PET_SERVICES, DEFAULT_RECURRING_PLANS } from '../utils/petBreeds';
import { safeSetItem } from '../utils/storageManager';

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
  login: (
    usernameOrEmail: string,
    password?: string,
    role?: UserRole
  ) => { success: boolean; error?: string };
  registerCompanyAndAdmin: (
    companyData: Partial<CompanyProfile>,
    adminName: string,
    adminEmail: string,
    password: string
  ) => void;
  logout: () => void;

  // Multi-Branch (Filiais & Lojas)
  branches: StoreBranch[];
  currentBranchId: string | null;
  setCurrentBranchId: (id: string | null) => void;
  addBranch: (branch: Omit<StoreBranch, 'id' | 'createdAt'>) => StoreBranch;
  updateBranch: (id: string, branch: Partial<StoreBranch>) => void;
  deleteBranch: (id: string) => void;
  getAvailablePdvsForUser: (user?: UserAccount | null) => PDVRegister[];

  // PDV Registers (Terminais de Caixa)
  pdvRegisters: PDVRegister[];
  selectedPdvId: string | null;
  setSelectedPdvId: (id: string | null) => void;
  addPDVRegister: (pdv: Omit<PDVRegister, 'id' | 'createdAt'>) => PDVRegister;
  updatePDVRegister: (id: string, pdv: Partial<PDVRegister>) => void;
  deletePDVRegister: (id: string) => void;
  isPdvClosedToday: (pdvId?: string) => boolean;
  canOpenCashSession: (pdvId?: string) => {
    allowed: boolean;
    reason?: string;
    lastClosedSession?: CashRegisterSession;
  };

  // Super Admin & Licensing & Affiliates
  clientLicenses: ClientLicense[];
  addClientLicense: (lic: Omit<ClientLicense, 'id' | 'createdAt'>) => ClientLicense;
  updateClientLicense: (id: string, lic: Partial<ClientLicense>) => void;
  activateClientLicense: (
    id: string,
    plan: 'monthly_49_90' | 'lifetime_1699_90',
    paymentMethod?: string
  ) => void;
  extendClientDays: (id: string, days: number, notes?: string) => void;
  affiliates: Affiliate[];
  addAffiliate: (
    aff: Omit<
      Affiliate,
      | 'id'
      | 'createdAt'
      | 'referralLink'
      | 'totalReferrals'
      | 'activePayingClients'
      | 'totalCommissionEarned'
      | 'totalCommissionPaid'
      | 'pendingCommission'
    >
  ) => Affiliate;
  updateAffiliate: (id: string, aff: Partial<Affiliate>) => void;
  payAffiliateCommission: (affiliateId: string, amount: number, pixTxId?: string) => void;
  commissionLogs: AffiliateCommissionLog[];
  isSuperAdminAuthenticated: boolean;
  superAdminLogin: (email: string, pass: string) => boolean;
  superAdminLogout: () => void;

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
  settleClientDebt: (
    clientId: string,
    amount: number,
    paymentMethod: string,
    notes?: string
  ) => { receiptData: any; remainingDebt: number };

  // Cash Register Sessions
  activeSession: CashRegisterSession | null;
  sessionsHistory: CashRegisterSession[];
  openCashSession: (initialBalance: number, pdvId?: string) => CashRegisterSession;
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
  auditTreasurySession: (
    sessionId: string,
    auditData: {
      status: 'approved' | 'divergent' | 'adjusted';
      treasuryNotes: string;
      auditorName?: string;
    }
  ) => void;
  hasDepartmentAccess: (department: string) => boolean;

  // Sales & Cart
  sales: Sale[];
  currentCart: CartItem[];
  addToCart: (product: Product, quantity?: number, variation?: ProductVariation) => void;
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

  // Pre-Sales / Orçamentos de Balcão
  preSales: PreSale[];
  addPreSale: (preSale: Omit<PreSale, 'id' | 'createdAt' | 'status'>) => PreSale;
  updatePreSaleStatus: (id: string, status: 'pending' | 'billed' | 'cancelled') => void;
  deletePreSale: (id: string) => void;

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
  isCompanyConfigured: boolean;
  registerAdminCleanSlate: (params: {
    adminName: string;
    adminEmail: string;
    password?: string;
    startBlank?: boolean;
    companyData?: Partial<CompanyProfile>;
  }) => void;
  completeCompanySetup: (companyData: Partial<CompanyProfile>) => void;
  resetToCleanSlate: () => void;
  loadDemoData: () => void;

  // Retail Niche & Brazilian Market Departments
  companyNiche: RetailNicheId;
  setCompanyNiche: (niche: RetailNicheId, autoLoadDepartments?: boolean) => void;
  customCategories: { department: string; categories: string[] }[];
  addCustomCategory: (department: string, category: string) => void;

  // Vaccines & Clinical Injectables (Farmácia / Pet)
  vaccineAppointments: VaccineAppointment[];
  addVaccineAppointment: (
    appointment: Omit<VaccineAppointment, 'id' | 'createdAt'>
  ) => VaccineAppointment;
  updateVaccineAppointment: (id: string, updates: Partial<VaccineAppointment>) => void;
  deleteVaccineAppointment: (id: string) => void;
  completeVaccineAppointment: (id: string, technicalNotes?: string) => void;

  // Pet Shop & Veterinary Management
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => Pet;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;

  petServices: PetService[];
  addPetService: (service: Omit<PetService, 'id'>) => PetService;
  updatePetService: (id: string, service: Partial<PetService>) => void;
  deletePetService: (id: string) => void;

  petAppointments: PetAppointment[];
  addPetAppointment: (
    appointment: Omit<PetAppointment, 'id' | 'createdAt' | 'code'>
  ) => PetAppointment;
  updatePetAppointment: (id: string, appointment: Partial<PetAppointment>) => void;
  updatePetAppointmentStep: (id: string, step: PetAppointmentStep) => void;
  deletePetAppointment: (id: string) => void;
  billAppointmentToPDV: (appointmentId: string) => void;

  petRecurringPlans: PetRecurringPlan[];
  addPetRecurringPlan: (
    plan: Omit<PetRecurringPlan, 'id' | 'createdAt' | 'code'>
  ) => PetRecurringPlan;
  updatePetRecurringPlan: (id: string, plan: Partial<PetRecurringPlan>) => void;
  deletePetRecurringPlan: (id: string) => void;
  recordPlanSessionUsage: (planId: string) => void;
  billPlanToPDV: (planId: string) => void;

  // Veterinary Consultations & Clinical Records
  veterinaryConsultations: VeterinaryConsultation[];
  addVeterinaryConsultation: (
    consultation: Omit<VeterinaryConsultation, 'id' | 'createdAt' | 'code'>
  ) => VeterinaryConsultation;
  updateVeterinaryConsultation: (id: string, consultation: Partial<VeterinaryConsultation>) => void;
  deleteVeterinaryConsultation: (id: string) => void;
  billVeterinaryConsultationToPDV: (consultationId: string) => void;

  // Multi-Store per CNPJ Recording & Backup
  exportStoreBackup: () => string;
  importStoreBackup: (jsonContent: string) => boolean;
  switchStoreByCnpj: (targetCnpj: string) => boolean;
  getRegisteredStores: () => Array<{ cnpj: string; cleanCnpj: string; tradeName: string; corporateName: string; lastUpdated: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'multivariedades_erp_state_v1';

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const INITIAL_STORE_PETS: Pet[] = [
  {
    id: 'pet_01',
    clientId: 'cli_03',
    clientName: 'Lucas Ferreira dos Santos',
    name: 'Thor',
    species: 'cao',
    breed: 'Golden Retriever',
    gender: 'macho',
    size: 'grande',
    coatType: 'longo',
    coatColor: 'Dourado Claro',
    birthDate: '2023-04-10',
    ageYears: 3,
    weightKg: 32.5,
    temperament: 'docil',
    allergies: 'Sensibilidade a frango na ração',
    medicalNotes: 'Secar bem as orelhas para prevenir otite. Vacinas V10 e Raiva em dia.',
    microchipNumber: '981098102345678',
    vaccinesUpToDate: true,
    createdAt: '2025-02-01T16:20:00Z',
  },
  {
    id: 'pet_02',
    clientId: 'cli_03',
    clientName: 'Lucas Ferreira dos Santos',
    name: 'Mia',
    species: 'gato',
    breed: 'Siamês',
    gender: 'femea',
    size: 'pequeno',
    coatType: 'curto',
    coatColor: 'Seal Point (Castanho e Bege)',
    birthDate: '2024-01-15',
    ageYears: 2,
    weightKg: 4.1,
    temperament: 'normal',
    allergies: 'Nenhuma alergia conhecida',
    medicalNotes: 'Manejo Cat Friendly silencioso. Não gosta de barulho de soprador alto.',
    vaccinesUpToDate: true,
    createdAt: '2025-02-01T16:25:00Z',
  },
  {
    id: 'pet_03',
    clientId: 'cli_01',
    clientName: 'Mariana Duarte Souza',
    name: 'Mel',
    species: 'cao',
    breed: 'Shih Tzu',
    gender: 'femea',
    size: 'pequeno',
    coatType: 'longo',
    coatColor: 'Branco e Dourado',
    birthDate: '2022-08-20',
    ageYears: 4,
    weightKg: 5.8,
    temperament: 'docil',
    allergies: 'Perfume muito forte irrita os olhos',
    medicalNotes: 'Fazer Tosa Bebê com tesoura no focinho e laço cor de rosa.',
    microchipNumber: '981098107765432',
    vaccinesUpToDate: true,
    createdAt: '2025-02-15T11:00:00Z',
  },
  {
    id: 'pet_04',
    clientId: 'cli_01',
    clientName: 'Mariana Duarte Souza',
    name: 'Pipoca',
    species: 'passaro',
    breed: 'Calopsita',
    gender: 'macho',
    size: 'pequeno',
    coatColor: 'Amarelo Lutino',
    birthDate: '2024-03-01',
    ageYears: 2,
    weightKg: 0.1,
    temperament: 'agitado',
    medicalNotes: 'Aparo higiênico de unhas e bico feito com cuidado.',
    vaccinesUpToDate: true,
    createdAt: '2025-02-18T14:10:00Z',
  },
];

const getInitialPetAppointments = (): PetAppointment[] => {
  const today = getTodayDateStr();
  return [
    {
      id: 'apt_101',
      code: '#PET-101',
      clientId: 'cli_03',
      clientName: 'Lucas Ferreira dos Santos',
      clientPhone: '(11) 99876-5432',
      date: today,
      time: '09:30',
      transportType: 'leva_e_traz',
      transportAddress: 'Rua Voluntários da Pátria, 890 - Santana',
      items: [
        {
          petId: 'pet_01',
          petName: 'Thor',
          petBreed: 'Golden Retriever',
          petSpecies: 'cao',
          petSize: 'Grande',
          primaryServiceId: 'srv-banho-simples',
          primaryServiceName: 'Banho Simples Completo (Porte Grande)',
          primaryServicePrice: 75.0,
          extraServices: [
            { id: 'srv-hidratacao-argan', name: 'Hidratação Profunda / Banho de Verniz', price: 35.0 },
            { id: 'srv-corte-unhas', name: 'Corte e Lixamento de Unhas', price: 15.0 },
          ],
          subtotal: 125.0,
        },
        {
          petId: 'pet_02',
          petName: 'Mia',
          petBreed: 'Siamês',
          petSpecies: 'gato',
          petSize: 'Pequeno',
          primaryServiceId: 'srv-banho-felino',
          primaryServiceName: 'Banho Especial para Gatos',
          primaryServicePrice: 70.0,
          extraServices: [
            { id: 'srv-limpeza-ouvidos', name: 'Limpeza e Higiene Auricular (Ouvidos)', price: 15.0 },
          ],
          subtotal: 85.0,
        },
      ],
      totalAmount: 210.0,
      currentStep: 'em_andamento',
      stepTimestamps: {
        aguardandoAt: `${today}T08:30:00Z`,
        retiradoAt: `${today}T09:15:00Z`,
        emAndamentoAt: `${today}T09:40:00Z`,
      },
      isPaid: false,
      notes: 'Táxi dog buscou os 2 animais pontualmente. Thor e Mia estão em atendimento.',
      createdAt: `${today}T08:00:00Z`,
    },
    {
      id: 'apt_102',
      code: '#PET-102',
      clientId: 'cli_01',
      clientName: 'Mariana Duarte Souza',
      clientPhone: '(11) 98765-1122',
      date: today,
      time: '11:00',
      transportType: 'cliente_traz',
      items: [
        {
          petId: 'pet_03',
          petName: 'Mel',
          petBreed: 'Shih Tzu',
          petSpecies: 'cao',
          petSize: 'Pequeno',
          primaryServiceId: 'srv-tosa-bebe',
          primaryServiceName: 'Tosa Bebê + Banho Completo',
          primaryServicePrice: 95.0,
          extraServices: [
            { id: 'srv-lacos-aderecos', name: 'Kit Laços & Bandanas Luxo', price: 10.0 },
            { id: 'srv-escovacao-dental', name: 'Escovação Dentária com Gel Enzimático', price: 20.0 },
          ],
          subtotal: 125.0,
        },
      ],
      totalAmount: 125.0,
      currentStep: 'pronto',
      stepTimestamps: {
        aguardandoAt: `${today}T10:00:00Z`,
        retiradoAt: `${today}T11:00:00Z`,
        emAndamentoAt: `${today}T11:15:00Z`,
        prontoAt: `${today}T12:30:00Z`,
      },
      isPaid: true,
      paymentMethod: 'pix',
      notes: 'Mel já está cheirosa, tosada e com lacinhos prontos aguardando a tutora.',
      createdAt: `${today}T08:15:00Z`,
    },
    {
      id: 'apt_103',
      code: '#PET-103',
      clientId: 'cli_01',
      clientName: 'Mariana Duarte Souza',
      clientPhone: '(11) 98765-1122',
      date: today,
      time: '14:30',
      transportType: 'cliente_traz',
      items: [
        {
          petId: 'pet_04',
          petName: 'Pipoca',
          petBreed: 'Calopsita',
          petSpecies: 'passaro',
          petSize: 'Pequeno',
          primaryServiceId: 'srv-corte-unhas',
          primaryServiceName: 'Corte e Lixamento de Unhas e Bico',
          primaryServicePrice: 15.0,
          extraServices: [],
          subtotal: 15.0,
        },
      ],
      totalAmount: 15.0,
      currentStep: 'aguardando',
      stepTimestamps: {
        aguardandoAt: `${today}T13:00:00Z`,
      },
      isPaid: false,
      notes: 'Tutora virá às 14h30 trazer a gaiola de transporte.',
      createdAt: `${today}T09:00:00Z`,
    },
    {
      id: 'apt_104',
      code: '#PET-104',
      clientId: 'cli_03',
      clientName: 'Lucas Ferreira dos Santos',
      clientPhone: '(11) 99876-5432',
      date: today,
      time: '08:00',
      transportType: 'cliente_traz',
      items: [
        {
          petId: 'pet_01',
          petName: 'Thor',
          petBreed: 'Golden Retriever',
          petSpecies: 'cao',
          petSize: 'Grande',
          primaryServiceId: 'srv-consulta-veterinaria',
          primaryServiceName: 'Consulta Clínica Veterinária Geral + Vacina',
          primaryServicePrice: 130.0,
          extraServices: [
            { id: 'srv-vacina-antirrabica', name: 'Vacinação Antirrábica', price: 75.0 },
          ],
          subtotal: 205.0,
        },
      ],
      totalAmount: 205.0,
      currentStep: 'entregue',
      stepTimestamps: {
        aguardandoAt: `${today}T07:30:00Z`,
        retiradoAt: `${today}T08:00:00Z`,
        emAndamentoAt: `${today}T08:15:00Z`,
        prontoAt: `${today}T08:50:00Z`,
        entregueAt: `${today}T09:05:00Z`,
      },
      isPaid: true,
      paymentMethod: 'cartaoCredito',
      notes: 'Consulta realizada pelo Dr. Veterinário. Carteirinha carimbada.',
      createdAt: `${today}T07:00:00Z`,
    },
  ];
};

const getInitialVeterinaryConsultations = (): VeterinaryConsultation[] => {
  const today = getTodayDateStr();
  return [
    {
      id: 'vet_01',
      code: '#VET-801',
      clientId: 'cli_03',
      clientName: 'Lucas Ferreira dos Santos',
      clientPhone: '(11) 99876-5432',
      clientEmail: 'lucas.santos@email.com',
      petId: 'pet_01',
      petName: 'Thor',
      petSpecies: 'cao',
      petBreed: 'Golden Retriever',
      petAgeYears: 3,
      petWeightKg: 32.5,
      date: today,
      time: '10:30',
      veterinarianName: 'Dra. Camila Vasconcelos',
      crmv: 'SP-34891',
      type: 'consulta_geral',
      chiefComplaint: 'Coceira intensa na orelha direita e sacudidas frequentes de cabeça após o último banho.',
      anamnesis: 'Animal ativo, alimentando-se normalmente. Sem histórico recente de febre. Apresenta prurido auricular há 3 dias.',
      temperatureCelsius: 38.6,
      heartRateBpm: 92,
      respiratoryRateRpm: 24,
      mucousMembranes: 'normocoradas',
      hydrationStatus: 'hidratado',
      diagnosis: 'Otite externa fúngica/bacteriana com excesso de cerúmen escuro.',
      treatmentPlan: 'Lavagem auricular com solução ceruminolítica + gotas otológicas 2x ao dia durante 10 dias.',
      prescription: '1. Otomax Gotas Auriculares - Pingar 6 gotas no conduto auditivo direito a cada 12 horas por 10 dias.\n2. Limp & Hidrat - Higienização externa com algodão antes da medicação.',
      standardServices: [
        {
          serviceId: 'srv-consulta-veterinaria',
          serviceName: 'Consulta Clínica Veterinária Geral',
          price: 130.0,
        },
      ],
      customServices: [
        {
          id: 'cst_01',
          name: 'Limpeza e Curativo Auricular Profundo com Aspiração',
          category: 'procedimento',
          price: 45.0,
          description: 'Procedimento ambulatorial para desobstrução e remoção de secreção profunda na orelha direita.',
        },
        {
          id: 'cst_02',
          name: 'Aplicação de Anti-inflamatório Injetável Meloxicam',
          category: 'medicacao',
          price: 35.0,
          description: 'Dose de ataque anti-inflamatória e analgésica subcutânea.',
        },
      ],
      vaccinesApplied: [],
      returnDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      totalAmount: 210.0,
      status: 'concluido',
      paymentStatus: 'pago',
      notes: 'Retorno agendado em 15 dias sem custo de consulta para reavaliação otoscópica.',
      createdAt: `${today}T10:00:00Z`,
    },
    {
      id: 'vet_02',
      code: '#VET-802',
      clientId: 'cli_01',
      clientName: 'Mariana Duarte Souza',
      clientPhone: '(11) 98765-1122',
      clientEmail: 'mariana.duarte@email.com',
      petId: 'pet_03',
      petName: 'Mel',
      petSpecies: 'cao',
      petBreed: 'Shih Tzu',
      petAgeYears: 4,
      petWeightKg: 5.8,
      date: today,
      time: '15:00',
      veterinarianName: 'Dr. Rodrigo Alcantara',
      crmv: 'SP-41208',
      type: 'vacinacao',
      chiefComplaint: 'Reforço anual de vacinação e check-up preventivo de rotina.',
      anamnesis: 'Animal assintomático, sem vômitos, fezes normais, apetite preservado. Histórico vacinal regular.',
      temperatureCelsius: 38.3,
      heartRateBpm: 110,
      respiratoryRateRpm: 28,
      mucousMembranes: 'normocoradas',
      hydrationStatus: 'hidratado',
      diagnosis: 'Paciente saudável, apto para imunização anual.',
      treatmentPlan: 'Aplicação de vacina V10 polivalente importada + vermifugação semestral.',
      prescription: '1. Vermífugo Drontal Plus Cães até 10kg - 1 comprimido dose única via oral.\n2. Repouso pós-vacinal de 24 horas.',
      standardServices: [
        {
          serviceId: 'srv-vacina-v10',
          serviceName: 'Vacinação Polivalente V10 Canina Importada',
          price: 95.0,
        },
      ],
      customServices: [
        {
          id: 'cst_03',
          name: 'Exame Parasitológico de Fezes Rápido (Giárdiase)',
          category: 'exame',
          price: 50.0,
          description: 'Teste rápido imunocromatográfico de triagem para cistos de giárdia.',
        },
      ],
      vaccinesApplied: [
        {
          name: 'V10 Vanguard HTLP 5/CV-L',
          batchNumber: 'LOTE-7782A',
          nextDueDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        },
      ],
      returnDate: undefined,
      totalAmount: 145.0,
      status: 'em_atendimento',
      paymentStatus: 'pendente',
      notes: 'Aguardando liberação de exame e finalização para envio ao caixa.',
      createdAt: `${today}T14:45:00Z`,
    },
  ];
};

export const MASTER_USERS_REGISTRY_KEY = 'multivariedades_master_users_registry_v1';
export const REMEMBERED_CREDENTIALS_KEY = 'multivariedades_remembered_credentials_v1';

// Synchronously saves a user to the master persistent registry
export const persistUserToMasterRegistry = (user: UserAccount) => {
  if (!user || !user.id) return;
  try {
    const saved = localStorage.getItem(MASTER_USERS_REGISTRY_KEY);
    let list: UserAccount[] = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex(
      (u) =>
        u.id === user.id ||
        (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
        (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase())
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...user };
    } else {
      list.push(user);
    }
    localStorage.setItem(MASTER_USERS_REGISTRY_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Erro ao salvar no master users registry:', e);
  }
};

// Loads all users combining built-ins, master registry and local storage
const loadInitialUsers = (): UserAccount[] => {
  const dalmarHelpAdmin: UserAccount = {
    id: 'user_admin_dalmarhelp',
    name: 'Dalmar (Administrador)',
    username: 'dalmarhelp',
    email: 'dalmarhelp@gmail.com',
    password: 'admin',
    role: 'admin',
    active: true,
    branchId: 'branch_matriz',
    branchName: 'Loja 001 - Matriz',
    phone: '(11) 99999-8888',
    createdAt: '2025-01-01T00:00:00Z',
  };

  const map = new Map<string, UserAccount>();

  // 1. Initial users
  INITIAL_USERS.forEach((u) => {
    if (u && u.id) {
      map.set(u.id, u);
      if (u.email) map.set(u.email.toLowerCase(), u);
      if (u.username) map.set(u.username.toLowerCase(), u);
    }
  });

  // Guarantee dalmarhelp is present
  map.set(dalmarHelpAdmin.id, dalmarHelpAdmin);
  map.set(dalmarHelpAdmin.email.toLowerCase(), dalmarHelpAdmin);
  map.set(dalmarHelpAdmin.username.toLowerCase(), dalmarHelpAdmin);

  // 2. Read Master Users Registry
  try {
    const masterSaved = localStorage.getItem(MASTER_USERS_REGISTRY_KEY);
    if (masterSaved) {
      const parsed: UserAccount[] = JSON.parse(masterSaved);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (u && u.id) {
            const existing = map.get(u.id) || (u.email ? map.get(u.email.toLowerCase()) : undefined);
            const merged = existing ? { ...existing, ...u } : u;
            map.set(u.id, merged);
            if (u.email) map.set(u.email.toLowerCase(), merged);
            if (u.username) map.set(u.username.toLowerCase(), merged);
          }
        });
      }
    }
  } catch (e) {
    console.error('Erro ao ler master users registry:', e);
  }

  // 3. Read Local session users
  try {
    const localSaved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (localSaved) {
      const parsed: UserAccount[] = JSON.parse(localSaved);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (u && u.id) {
            const existing = map.get(u.id) || (u.email ? map.get(u.email.toLowerCase()) : undefined);
            const merged = existing ? { ...existing, ...u } : u;
            map.set(u.id, merged);
            if (u.email) map.set(u.email.toLowerCase(), merged);
            if (u.username) map.set(u.username.toLowerCase(), merged);
          }
        });
      }
    }
  } catch (e) {
    console.error('Erro ao ler local users:', e);
  }

  // Extract unique users
  const uniqueUsers: UserAccount[] = [];
  const seenIds = new Set<string>();
  map.forEach((u) => {
    if (u && u.id && !seenIds.has(u.id)) {
      seenIds.add(u.id);
      uniqueUsers.push(u);
    }
  });

  return uniqueUsers;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    const saved = localStorage.getItem('multivariedades_is_registered');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_company`);
    let loaded: Partial<CompanyProfile> = {};
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler company:', e);
      }
    }
    return {
      ...INITIAL_COMPANY,
      ...loaded,
      address: {
        cep: loaded?.address?.cep || INITIAL_COMPANY.address?.cep || '',
        street: loaded?.address?.street || INITIAL_COMPANY.address?.street || '',
        number: loaded?.address?.number || INITIAL_COMPANY.address?.number || '',
        complement: loaded?.address?.complement || INITIAL_COMPANY.address?.complement || '',
        neighborhood: loaded?.address?.neighborhood || INITIAL_COMPANY.address?.neighborhood || '',
        city: loaded?.address?.city || INITIAL_COMPANY.address?.city || '',
        state: loaded?.address?.state || INITIAL_COMPANY.address?.state || 'SP',
      },
    };
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    return loadInitialUsers();
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    // If explicitly logged out, never restore previous session
    const isLoggedOut = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logged_out`) === 'true';
    if (isLoggedOut) {
      return null;
    }
    const isLoggedIn = localStorage.getItem(`${LOCAL_STORAGE_KEY}_is_logged_in`) === 'true';
    if (!isLoggedIn) {
      return null;
    }
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_current_user`);
    if (saved && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed;
        }
      } catch {
        // ignore JSON parse failure
      }
    }
    return null;
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

  const [branches, setBranches] = useState<StoreBranch[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_branches`);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [currentBranchId, setCurrentBranchId] = useState<string | null>(() => {
    return 'branch_matriz';
  });

  const [clientLicenses, setClientLicenses] = useState<ClientLicense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_client_licenses`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_LICENSES;
  });

  const [affiliates, setAffiliates] = useState<Affiliate[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_affiliates`);
    return saved ? JSON.parse(saved) : INITIAL_AFFILIATES;
  });

  const [commissionLogs, setCommissionLogs] = useState<AffiliateCommissionLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_commission_logs`);
    return saved ? JSON.parse(saved) : INITIAL_COMMISSION_LOGS;
  });

  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_is_superadmin`);
    return saved ? JSON.parse(saved) : false;
  });

  const [pdvRegisters, setPdvRegisters] = useState<PDVRegister[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pdv_registers`);
    return saved ? JSON.parse(saved) : INITIAL_PDV_REGISTERS;
  });

  const [selectedPdvId, setSelectedPdvId] = useState<string | null>(() => {
    return 'pdv_01';
  });

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_financial`);
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ENTRIES;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sales`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    const now = new Date();
    const todayStr = now.toISOString();
    const todayEarlier = new Date(now.getTime() - 3 * 3600000).toISOString();
    const yesterday = new Date(now.getTime() - 86400000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 86400000 * 2).toISOString();

    return [
      {
        id: 'sale_demo_today_1',
        code: `#VD-${now.getFullYear()}-1048`,
        sessionId: 'sess_init',
        cashierId: 'user_cashier',
        cashierName: 'Marcos Silva (Caixa)',
        sellerName: 'Rodrigo Alves (Vendedor)',
        clientId: 'cli_1',
        clientName: 'Ana Paula Ferreira',
        clientDocument: '123.456.789-00',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 2,
            unitPrice: INITIAL_PRODUCTS[0]?.salePrice || 48.9,
            discount: 0,
            total: (INITIAL_PRODUCTS[0]?.salePrice || 48.9) * 2,
          },
        ],
        subtotal: (INITIAL_PRODUCTS[0]?.salePrice || 48.9) * 2,
        discount: 0,
        total: (INITIAL_PRODUCTS[0]?.salePrice || 48.9) * 2,
        payments: [{ method: 'pix', amount: (INITIAL_PRODUCTS[0]?.salePrice || 48.9) * 2 }],
        status: 'completed',
        createdAt: todayEarlier,
        fiscalInvoiceType: 'NFCE',
        fiscalInvoiceId: 'inv_demo_today_1',
      },
      {
        id: 'sale_demo_today_2',
        code: `#VD-${now.getFullYear()}-1049`,
        sessionId: 'sess_init',
        cashierId: 'user_cashier',
        cashierName: 'Marcos Silva (Caixa)',
        clientName: 'Cliente Balcão',
        items: [
          {
            product: INITIAL_PRODUCTS[1] || INITIAL_PRODUCTS[0],
            quantity: 1,
            unitPrice: INITIAL_PRODUCTS[1]?.salePrice || 29.9,
            discount: 0,
            total: INITIAL_PRODUCTS[1]?.salePrice || 29.9,
          },
        ],
        subtotal: INITIAL_PRODUCTS[1]?.salePrice || 29.9,
        discount: 0,
        total: INITIAL_PRODUCTS[1]?.salePrice || 29.9,
        payments: [{ method: 'dinheiro', amount: INITIAL_PRODUCTS[1]?.salePrice || 29.9 }],
        amountReceived: 50.0,
        changeAmount: 50.0 - (INITIAL_PRODUCTS[1]?.salePrice || 29.9),
        status: 'completed',
        createdAt: todayStr,
        fiscalInvoiceType: 'NFCE',
        fiscalInvoiceId: 'inv_demo_today_2',
      },
      {
        id: 'sale_demo_yest_1',
        code: `#VD-${now.getFullYear()}-1046`,
        sessionId: 'sess_init',
        cashierId: 'user_cashier',
        cashierName: 'Marcos Silva (Caixa)',
        clientId: 'cli_2',
        clientName: 'Carlos Eduardo Santos',
        clientDocument: '234.567.890-11',
        items: [
          {
            product: INITIAL_PRODUCTS[2] || INITIAL_PRODUCTS[0],
            quantity: 1,
            unitPrice: INITIAL_PRODUCTS[2]?.salePrice || 85.0,
            discount: 5.0,
            total: (INITIAL_PRODUCTS[2]?.salePrice || 85.0) - 5.0,
          },
        ],
        subtotal: INITIAL_PRODUCTS[2]?.salePrice || 85.0,
        discount: 5.0,
        total: (INITIAL_PRODUCTS[2]?.salePrice || 85.0) - 5.0,
        payments: [{ method: 'prazo', amount: (INITIAL_PRODUCTS[2]?.salePrice || 85.0) - 5.0 }],
        status: 'completed',
        createdAt: yesterday,
        fiscalInvoiceType: 'NFCE',
        fiscalInvoiceId: 'inv_demo_yest_1',
      },
      {
        id: 'sale_demo_prev_1',
        code: `#VD-${now.getFullYear()}-1045`,
        sessionId: 'sess_init',
        cashierId: 'user_cashier',
        cashierName: 'Marcos Silva (Caixa)',
        clientId: 'cli_3',
        clientName: 'Roberto Mendes Albuquerque',
        clientDocument: '345.678.901-22',
        items: [
          {
            product: INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0],
            quantity: 2,
            unitPrice: INITIAL_PRODUCTS[3]?.salePrice || 60.0,
            discount: 0,
            total: (INITIAL_PRODUCTS[3]?.salePrice || 60.0) * 2,
          },
        ],
        subtotal: (INITIAL_PRODUCTS[3]?.salePrice || 60.0) * 2,
        discount: 0,
        total: (INITIAL_PRODUCTS[3]?.salePrice || 60.0) * 2,
        payments: [{ method: 'mensalista', amount: (INITIAL_PRODUCTS[3]?.salePrice || 60.0) * 2 }],
        status: 'completed',
        createdAt: twoDaysAgo,
        fiscalInvoiceType: 'NFE',
        fiscalInvoiceId: 'inv_demo_prev_1',
      },
    ];
  });

  const [preSales, setPreSales] = useState<PreSale[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pre_sales`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'ps_1',
        code: 'PV-3891',
        sellerId: 'user_seller',
        sellerName: 'Rodrigo Alves (Vendedor)',
        clientId: 'cli_1',
        clientName: 'Ana Paula Ferreira',
        clientCpf: '123.456.789-00',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 2,
            unitPrice: INITIAL_PRODUCTS[0]?.salePrice || 48.9,
            discount: 0,
            total: (INITIAL_PRODUCTS[0]?.salePrice || 48.9) * 2,
          },
        ],
        subtotal: (INITIAL_PRODUCTS[0]?.salePrice || 48.9) * 2,
        discount: 0,
        total: (INITIAL_PRODUCTS[0]?.salePrice || 48.9) * 2,
        notes: 'Cliente aguardando faturamento no caixa',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ps_2',
        code: 'PV-4102',
        sellerId: 'user_seller',
        sellerName: 'Rodrigo Alves (Vendedor)',
        clientName: 'Carlos Eduardo Santos',
        clientCpf: '234.567.890-11',
        items: [
          {
            product: INITIAL_PRODUCTS[1] || INITIAL_PRODUCTS[0],
            quantity: 1,
            unitPrice: INITIAL_PRODUCTS[1]?.salePrice || 29.9,
            discount: 2.0,
            total: (INITIAL_PRODUCTS[1]?.salePrice || 29.9) - 2.0,
          },
        ],
        subtotal: INITIAL_PRODUCTS[1]?.salePrice || 29.9,
        discount: 2.0,
        total: (INITIAL_PRODUCTS[1]?.salePrice || 29.9) - 2.0,
        notes: 'Orçamento balcão pré-aprovado',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  });

  useEffect(() => {
    safeSetItem(`${LOCAL_STORAGE_KEY}_pre_sales`, JSON.stringify(preSales));
  }, [preSales]);

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

  // Vaccines & Clinical Injectables (Farmácia & Pet)
  const [vaccineAppointments, setVaccineAppointments] = useState<VaccineAppointment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_vaccine_appointments`);
    return saved ? JSON.parse(saved) : INITIAL_VACCINES;
  });

  // Brazilian Market Custom Departments & Categories
  const [customCategories, setCustomCategories] = useState<{ department: string; categories: string[] }[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_custom_categories`);
    return saved ? JSON.parse(saved) : [];
  });

  // Pet Shop & Veterinary States
  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pets`);
    return saved ? JSON.parse(saved) : INITIAL_STORE_PETS;
  });

  const [petServices, setPetServices] = useState<PetService[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pet_services`);
    return saved ? JSON.parse(saved) : DEFAULT_PET_SERVICES;
  });

  const [petAppointments, setPetAppointments] = useState<PetAppointment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pet_appointments`);
    return saved ? JSON.parse(saved) : getInitialPetAppointments();
  });

  const [petRecurringPlans, setPetRecurringPlans] = useState<PetRecurringPlan[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pet_recurring_plans`);
    return saved ? JSON.parse(saved) : DEFAULT_RECURRING_PLANS;
  });

  const [veterinaryConsultations, setVeterinaryConsultations] = useState<VeterinaryConsultation[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_veterinary_consultations`);
    return saved ? JSON.parse(saved) : getInitialVeterinaryConsultations();
  });

  // Sync to localStorage
  useEffect(() => {
    safeSetItem('multivariedades_is_registered', JSON.stringify(isRegistered));
    safeSetItem(`${LOCAL_STORAGE_KEY}_company`, JSON.stringify(company));
    safeSetItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));

    if (currentUser) {
      safeSetItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
      safeSetItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'true');
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out`);
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_is_logged_in`);
      } catch {
        // ignore
      }
    }

    safeSetItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
    safeSetItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(clients));
    safeSetItem(`${LOCAL_STORAGE_KEY}_fiscal_config`, JSON.stringify(fiscalConfig));
    safeSetItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(fiscalInvoices.slice(0, 50)));
    safeSetItem(`${LOCAL_STORAGE_KEY}_financial`, JSON.stringify(financialEntries.slice(0, 100)));

    // Keep sales lightweight by stripping redundant product bulk data
    const lightweightSales = sales.slice(0, 80).map((s) => ({
      ...s,
      items: Array.isArray(s.items)
        ? s.items.map((it) => ({
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            discount: it.discount,
            variation: it.variation,
            product: it.product
              ? {
                  id: it.product.id,
                  name: it.product.name,
                  sku: it.product.sku,
                  barcode: it.product.barcode,
                  unit: it.product.unit,
                  salePrice: it.product.salePrice,
                  category: it.product.category,
                }
              : undefined,
          }))
        : [],
    }));
    safeSetItem(`${LOCAL_STORAGE_KEY}_sales`, JSON.stringify(lightweightSales));

    safeSetItem(`${LOCAL_STORAGE_KEY}_active_session`, JSON.stringify(activeSession));
    safeSetItem(`${LOCAL_STORAGE_KEY}_sessions_history`, JSON.stringify(sessionsHistory.slice(0, 20)));
    safeSetItem(`${LOCAL_STORAGE_KEY}_pdv_registers`, JSON.stringify(pdvRegisters));
    safeSetItem(`${LOCAL_STORAGE_KEY}_branches`, JSON.stringify(branches));
    safeSetItem(`${LOCAL_STORAGE_KEY}_client_licenses`, JSON.stringify(clientLicenses));
    safeSetItem(`${LOCAL_STORAGE_KEY}_affiliates`, JSON.stringify(affiliates));
    safeSetItem(`${LOCAL_STORAGE_KEY}_commission_logs`, JSON.stringify(commissionLogs.slice(0, 50)));
    safeSetItem(`${LOCAL_STORAGE_KEY}_is_superadmin`, JSON.stringify(isSuperAdminAuthenticated));
    safeSetItem(`${LOCAL_STORAGE_KEY}_vaccine_appointments`, JSON.stringify(vaccineAppointments));
    safeSetItem(`${LOCAL_STORAGE_KEY}_custom_categories`, JSON.stringify(customCategories));
    safeSetItem(`${LOCAL_STORAGE_KEY}_pets`, JSON.stringify(pets));
    safeSetItem(`${LOCAL_STORAGE_KEY}_pet_services`, JSON.stringify(petServices));
    safeSetItem(`${LOCAL_STORAGE_KEY}_pet_appointments`, JSON.stringify(petAppointments.slice(0, 50)));
    safeSetItem(`${LOCAL_STORAGE_KEY}_pet_recurring_plans`, JSON.stringify(petRecurringPlans));
    safeSetItem(`${LOCAL_STORAGE_KEY}_veterinary_consultations`, JSON.stringify(veterinaryConsultations.slice(0, 50)));

    // Save Store Registry Index by CNPJ (Stores essential company profile and stats per CNPJ)
    const rawCnpj = company.cnpj ? company.cnpj.replace(/\D/g, '') : '';
    if (rawCnpj.length >= 8) {
      const storeMetadata = {
        cnpj: company.cnpj,
        cleanCnpj: rawCnpj,
        tradeName: company.tradeName || 'Loja Comercial',
        corporateName: company.corporateName || '',
        savedAt: new Date().toISOString(),
        company,
        productCount: products.length,
        clientCount: clients.length,
        userCount: users.length,
        salesCount: sales.length,
      };

      try {
        safeSetItem(`multivariedades_store_cnpj_${rawCnpj}`, JSON.stringify(storeMetadata));
        safeSetItem('multivariedades_last_active_cnpj', rawCnpj);

        const registrySaved = localStorage.getItem('multivariedades_stores_registry');
        const registry: Array<{ cnpj: string; cleanCnpj: string; tradeName: string; corporateName: string; lastUpdated: string }> = registrySaved
          ? JSON.parse(registrySaved)
          : [];
        const existingIdx = registry.findIndex((r) => r.cleanCnpj === rawCnpj);
        const storeEntry = {
          cnpj: company.cnpj,
          cleanCnpj: rawCnpj,
          tradeName: company.tradeName || 'Loja Comercial',
          corporateName: company.corporateName || '',
          lastUpdated: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          registry[existingIdx] = storeEntry;
        } else {
          registry.push(storeEntry);
        }
        safeSetItem('multivariedades_stores_registry', JSON.stringify(registry));
      } catch (e) {
        console.error('Erro ao gravar dados do CNPJ:', e);
      }
    }

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
    pdvRegisters,
    branches,
    clientLicenses,
    affiliates,
    commissionLogs,
    isSuperAdminAuthenticated,
    vaccineAppointments,
    customCategories,
    pets,
    petServices,
    petAppointments,
    petRecurringPlans,
    veterinaryConsultations,
  ]);

  // Apply dynamic brand theme colors across application
  useEffect(() => {
    applyThemeColors(
      company.primaryColor || '#f59e0b',
      company.secondaryColor || '#0f172a',
      company.accentColor || '#d97706'
    );
  }, [company.primaryColor, company.secondaryColor, company.accentColor]);

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
    setCompany((prev) => {
      const next = { ...prev, ...data, isConfigured: true };

      // Immediately synchronize primary store (Matriz / Loja 001)
      setBranches((prevBranches) => {
        const hq = prevBranches.find((b) => b.isHeadquarter || b.storeNumber === '001');
        const hqName = (next.tradeName || next.corporateName)
          ? `Loja 001 - ${next.tradeName || next.corporateName}`
          : 'Loja 001 - Matriz';
        const formattedAddress = next.address?.street
          ? `${next.address.street}, ${next.address.number || 'S/N'}${next.address.neighborhood ? ' - ' + next.address.neighborhood : ''}`
          : undefined;

        if (hq) {
          return prevBranches.map((b) =>
            b.id === hq.id
              ? {
                  ...b,
                  name: hqName,
                  tradeName: next.tradeName || next.corporateName || b.tradeName,
                  cnpj: next.cnpj || b.cnpj,
                  stateRegistration: next.stateRegistration !== undefined ? next.stateRegistration : b.stateRegistration,
                  phone: next.phone !== undefined ? next.phone : b.phone,
                  email: next.email !== undefined ? next.email : b.email,
                  address: formattedAddress || b.address,
                  city: next.address?.city || b.city,
                  state: next.address?.state || b.state,
                }
              : b
          );
        } else {
          const newHq: StoreBranch = {
            id: 'branch_matriz',
            storeNumber: '001',
            name: hqName,
            tradeName: next.tradeName || next.corporateName || 'Matriz',
            cnpj: next.cnpj || '',
            stateRegistration: next.stateRegistration || 'ISENTO',
            phone: next.phone || '',
            email: next.email || '',
            address: formattedAddress || 'Endereço Principal',
            city: next.address?.city || 'São Paulo',
            state: next.address?.state || 'SP',
            isHeadquarter: true,
            active: true,
            createdAt: new Date().toISOString(),
          };
          return [newHq, ...prevBranches];
        }
      });

      // Synchronous localStorage backup
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_company`, JSON.stringify(next));
      } catch (e) {
        console.error('Erro ao gravar dados da empresa:', e);
      }

      return next;
    });
  };

  // Whether the company has been registered/configured by the user
  const isCompanyConfigured = Boolean(
    company &&
      (company.isConfigured === true ||
        (Boolean(company.tradeName?.trim() || company.corporateName?.trim()) &&
          Boolean(company.cnpj?.trim())))
  );

  // Register Admin & Company with Clean Slate option (starts with zero products, zero sales, zero clients, zero financial entries, only 1 admin user, and routes to company configuration)
  const registerAdminCleanSlate = ({
    adminName,
    adminEmail,
    password = 'admin',
    startBlank = true,
    companyData,
  }: {
    adminName: string;
    adminEmail: string;
    password?: string;
    startBlank?: boolean;
    companyData?: Partial<CompanyProfile>;
  }) => {
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

    if (startBlank) {
      // Clear all items to start 100% clean for the new company
      const newCompany: CompanyProfile = {
        ...BLANK_COMPANY,
        id: 'comp_' + Date.now(),
        email: adminEmail,
        corporateName: companyData?.corporateName || '',
        tradeName: companyData?.tradeName || companyData?.corporateName || '',
        cnpj: companyData?.cnpj || '',
        niche: companyData?.niche || 'variedades',
        isConfigured: true,
        ...companyData,
        address: {
          ...BLANK_COMPANY.address,
          ...(companyData?.address || {}),
        },
      };

      setCompany(newCompany);

      if (newCompany.primaryColor) {
        applyThemeColors(
          newCompany.primaryColor,
          newCompany.secondaryColor || '#0f172a',
          newCompany.accentColor || '#d97706'
        );
      }

      setUsers([newAdmin]);
      setProducts([]);
      setClients([]);
      setSales([]);
      setFiscalInvoices([]);
      setFinancialEntries([]);
      setPets([]);
      setPetAppointments([]);
      setPetRecurringPlans([]);
      setVeterinaryConsultations([]);

      // Initialize company's primary store (Matriz / Loja 001) with the company's real data
      const mainBranch: StoreBranch = {
        id: 'branch_matriz',
        storeNumber: '001',
        name: (newCompany.tradeName || newCompany.corporateName)
          ? `Loja 001 - ${newCompany.tradeName || newCompany.corporateName}`
          : 'Loja 001 - Matriz',
        tradeName: newCompany.tradeName || newCompany.corporateName || 'Matriz',
        cnpj: newCompany.cnpj || '',
        stateRegistration: newCompany.stateRegistration || 'ISENTO',
        phone: newCompany.phone || '',
        email: newCompany.email || adminEmail,
        address: newCompany.address?.street
          ? `${newCompany.address.street}, ${newCompany.address.number || 'S/N'}`
          : 'Endereço Principal da Loja',
        city: newCompany.address?.city || 'São Paulo',
        state: newCompany.address?.state || 'SP',
        isHeadquarter: true,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setBranches([mainBranch]);
      setCurrentBranchId(mainBranch.id);

      // Create default active PDV terminal for this store
      const defaultPdv: PDVRegister = {
        id: 'pdv_01',
        code: 'CX-01',
        name: 'Caixa 01 - Frente de Loja',
        branchId: mainBranch.id,
        branchStoreNumber: '001',
        branchName: mainBranch.name,
        location: 'Frente de Loja',
        printerModel: 'Térmica 80mm ESC/POS Padrão',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setPdvRegisters([defaultPdv]);
      setSelectedPdvId(defaultPdv.id);
      setActiveSession(null);
      setSessionsHistory([]);
      setCurrentCart([]);

      // Synchronously record new company and user in storage to guarantee zero data loss
      try {
        persistUserToMasterRegistry(newAdmin);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify([newAdmin]));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(newAdmin));
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'true');
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out`);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_company`, JSON.stringify(newCompany));
        localStorage.setItem('multivariedades_is_registered', 'true');

        if (password) {
          const credsSaved = localStorage.getItem(REMEMBERED_CREDENTIALS_KEY);
          const creds = credsSaved ? JSON.parse(credsSaved) : {};
          creds[adminEmail.toLowerCase()] = password;
          if (newAdmin.username) creds[newAdmin.username.toLowerCase()] = password;
          localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, JSON.stringify(creds));
        }

        const rawCnpj = newCompany.cnpj ? newCompany.cnpj.replace(/\D/g, '') : '';
        if (rawCnpj) {
          localStorage.setItem('multivariedades_last_active_cnpj', rawCnpj);
        }
      } catch (e) {
        console.error('Erro ao persistir novo administrador e empresa:', e);
      }
    } else {
      if (companyData) {
        setCompany((prev) => ({
          ...prev,
          ...companyData,
          address: {
            cep: companyData.address?.cep || prev.address?.cep || '',
            street: companyData.address?.street || prev.address?.street || '',
            number: companyData.address?.number || prev.address?.number || '',
            complement: companyData.address?.complement || prev.address?.complement || '',
            neighborhood: companyData.address?.neighborhood || prev.address?.neighborhood || '',
            city: companyData.address?.city || prev.address?.city || '',
            state: companyData.address?.state || prev.address?.state || 'SP',
          },
        }));
      }
      setUsers((prev) => {
        const next = [newAdmin, ...prev.filter((u) => u.role !== 'admin')];
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(next));
        } catch {}
        return next;
      });
      persistUserToMasterRegistry(newAdmin);
    }

    setCurrentUser(newAdmin);
    setIsRegistered(true);
    setActiveTab('empresa');
  };

  // Complete Company Registration (saves company details and marks as configured, unlocking system menus)
  const completeCompanySetup = (companyData: Partial<CompanyProfile>) => {
    const updatedCompany: CompanyProfile = {
      ...company,
      ...companyData,
      id: company.id || 'comp_' + Date.now(),
      isConfigured: true,
    };
    setCompany(updatedCompany);

    // Synchronize primary store (Matriz / Loja 001)
    setBranches((prevBranches) => {
      const hq = prevBranches.find((b) => b.isHeadquarter || b.storeNumber === '001');
      const hqName = (updatedCompany.tradeName || updatedCompany.corporateName)
        ? `Loja 001 - ${updatedCompany.tradeName || updatedCompany.corporateName}`
        : 'Loja 001 - Matriz';
      const formattedAddress = updatedCompany.address?.street
        ? `${updatedCompany.address.street}, ${updatedCompany.address.number || 'S/N'}${updatedCompany.address.neighborhood ? ' - ' + updatedCompany.address.neighborhood : ''}`
        : undefined;

      if (hq) {
        return prevBranches.map((b) =>
          b.id === hq.id
            ? {
                ...b,
                name: hqName,
                tradeName: updatedCompany.tradeName || updatedCompany.corporateName || b.tradeName,
                cnpj: updatedCompany.cnpj || b.cnpj,
                stateRegistration: updatedCompany.stateRegistration || b.stateRegistration,
                phone: updatedCompany.phone || b.phone,
                email: updatedCompany.email || b.email,
                address: formattedAddress || b.address,
                city: updatedCompany.address?.city || b.city,
                state: updatedCompany.address?.state || b.state,
              }
            : b
        );
      } else {
        const newHq: StoreBranch = {
          id: 'branch_matriz',
          storeNumber: '001',
          name: hqName,
          tradeName: updatedCompany.tradeName || updatedCompany.corporateName || 'Matriz',
          cnpj: updatedCompany.cnpj || '',
          stateRegistration: updatedCompany.stateRegistration || 'ISENTO',
          phone: updatedCompany.phone || '',
          email: updatedCompany.email || '',
          address: formattedAddress || 'Endereço Principal',
          city: updatedCompany.address?.city || 'São Paulo',
          state: updatedCompany.address?.state || 'SP',
          isHeadquarter: true,
          active: true,
          createdAt: new Date().toISOString(),
        };
        return [newHq, ...prevBranches];
      }
    });

    // Ensure at least one active PDV exists
    setPdvRegisters((prev) => {
      if (prev.length === 0) {
        const defaultPdv: PDVRegister = {
          id: 'pdv_01',
          code: 'CX-01',
          name: 'Caixa 01 - Frente de Loja',
          branchId: 'branch_matriz',
          branchStoreNumber: '001',
          branchName: (updatedCompany.tradeName || updatedCompany.corporateName)
            ? `Loja 001 - ${updatedCompany.tradeName || updatedCompany.corporateName}`
            : 'Loja 001 - Matriz',
          location: 'Frente de Loja',
          printerModel: 'Térmica 80mm ESC/POS Padrão',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        setSelectedPdvId(defaultPdv.id);
        return [defaultPdv];
      }
      return prev;
    });

    // Synchronous save to localStorage
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_company`, JSON.stringify(updatedCompany));
    } catch (e) {
      console.error('Erro ao gravar dados da empresa:', e);
    }

    if (companyData.primaryColor || companyData.secondaryColor || companyData.accentColor) {
      applyThemeColors(
        companyData.primaryColor || '#f59e0b',
        companyData.secondaryColor || '#0f172a',
        companyData.accentColor || '#d97706'
      );
    }
    setActiveTab('dashboard');
  };

  // Reset entire database to blank state for new store setup
  const resetToCleanSlate = () => {
    const defaultAdmin: UserAccount = {
      id: 'user_admin_' + Date.now(),
      name: 'Administrador da Loja',
      username: 'admin',
      email: 'admin@minhaloja.com.br',
      password: 'admin',
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
    };
    setCompany({
      ...BLANK_COMPANY,
      id: 'comp_' + Date.now(),
      isConfigured: false,
    });
    setUsers([defaultAdmin]);
    setCurrentUser(defaultAdmin);
    setProducts([]);
    setClients([]);
    setSales([]);
    setFiscalInvoices([]);
    setFinancialEntries([]);
    setPets([]);
    setPetAppointments([]);
    setPetRecurringPlans([]);
    setVeterinaryConsultations([]);
    const blankBranch: StoreBranch = {
      id: 'branch_matriz',
      storeNumber: '001',
      name: 'Loja 001 - Matriz',
      tradeName: 'Matriz',
      cnpj: '',
      stateRegistration: 'ISENTO',
      phone: '',
      email: defaultAdmin.email,
      address: 'Endereço Principal da Loja',
      city: 'São Paulo',
      state: 'SP',
      isHeadquarter: true,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setBranches([blankBranch]);
    setCurrentBranchId(blankBranch.id);

    const defaultPdv: PDVRegister = {
      id: 'pdv_01',
      code: 'CX-01',
      name: 'Caixa 01 - Frente de Loja',
      branchId: blankBranch.id,
      branchStoreNumber: '001',
      branchName: blankBranch.name,
      location: 'Frente de Loja',
      printerModel: 'Térmica 80mm ESC/POS Padrão',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setPdvRegisters([defaultPdv]);
    setSelectedPdvId(defaultPdv.id);
    setActiveSession(null);
    setSessionsHistory([]);
    setCurrentCart([]);
    setIsRegistered(true);
    setActiveTab('empresa');
  };

  // Restore demonstration sample data
  const loadDemoData = () => {
    setCompany(INITIAL_COMPANY);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setClients(INITIAL_CLIENTS);
    setFiscalConfig(INITIAL_FISCAL_CONFIG);
    setFinancialEntries(INITIAL_FINANCIAL_ENTRIES);
    setPdvRegisters(INITIAL_PDV_REGISTERS);
    setSelectedPdvId('pdv_01');
    setPets(INITIAL_STORE_PETS);
    setPetServices(DEFAULT_PET_SERVICES);
    setPetAppointments(getInitialPetAppointments());
    setPetRecurringPlans(DEFAULT_RECURRING_PLANS);
    setSales([]);
    setFiscalInvoices([]);
    setCurrentCart([]);
    setIsRegistered(true);
    setActiveTab('dashboard');
    applyThemeColors(INITIAL_COMPANY.primaryColor || '#f59e0b', INITIAL_COMPANY.secondaryColor || '#0f172a', INITIAL_COMPANY.accentColor || '#d97706');
  };

  // Register Company and Admin instantly (Legacy helper)
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
      isConfigured: true,
      address: {
        cep: companyData.address?.cep || INITIAL_COMPANY.address?.cep || '',
        street: companyData.address?.street || INITIAL_COMPANY.address?.street || '',
        number: companyData.address?.number || INITIAL_COMPANY.address?.number || '',
        complement: companyData.address?.complement || INITIAL_COMPANY.address?.complement || '',
        neighborhood: companyData.address?.neighborhood || INITIAL_COMPANY.address?.neighborhood || '',
        city: companyData.address?.city || INITIAL_COMPANY.address?.city || '',
        state: companyData.address?.state || INITIAL_COMPANY.address?.state || 'SP',
      },
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
    setUsers((prev) => {
      const next = [newAdmin, ...prev.filter((u) => u.role !== 'admin')];
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(next));
      } catch {}
      return next;
    });
    persistUserToMasterRegistry(newAdmin);
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

  const login = (
    usernameOrEmail: string,
    password?: string,
    role?: UserRole
  ): { success: boolean; error?: string } => {
    const input = (usernameOrEmail || '').trim().toLowerCase();
    if (!input) {
      return { success: false, error: 'Informe o usuário ou e-mail de acesso.' };
    }

    // Super Admin credential check
    if (input === 'dalmarsousa@gmail.com') {
      if (password && password !== 'Djs09101967?') {
        return { success: false, error: 'Senha incorreta para o Super Administrador.' };
      }
      const ok = superAdminLogin('dalmarsousa@gmail.com', password || 'Djs09101967?');
      if (ok) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'true');
        localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out`);
        return { success: true };
      }
      return { success: false, error: 'Falha na autenticação do Super Administrador.' };
    }

    // 1. Search in current in-memory users state
    let found = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === input) ||
        (u.email && u.email.toLowerCase() === input) ||
        (role && u.role === role)
    );

    // 2. If not found in current state, search in master persistent registry
    if (!found) {
      try {
        const masterSaved = localStorage.getItem(MASTER_USERS_REGISTRY_KEY);
        if (masterSaved) {
          const masterList: UserAccount[] = JSON.parse(masterSaved);
          if (Array.isArray(masterList)) {
            found = masterList.find(
              (u) =>
                (u.username && u.username.toLowerCase() === input) ||
                (u.email && u.email.toLowerCase() === input) ||
                (role && u.role === role)
            );
          }
        }
      } catch (e) {
        console.error('Erro ao pesquisar no master users registry:', e);
      }
    }

    // 3. Special guarantee for dalmarhelp: persistent administrator profile
    if (!found && (input === 'dalmarhelp@gmail.com' || input === 'dalmarhelp')) {
      found = {
        id: 'user_admin_dalmarhelp',
        name: 'Dalmar (Administrador)',
        username: 'dalmarhelp',
        email: 'dalmarhelp@gmail.com',
        password: password || 'admin',
        role: 'admin',
        active: true,
        branchId: 'branch_matriz',
        branchName: 'Loja 001 - Matriz',
        phone: '(11) 99999-8888',
        createdAt: new Date().toISOString(),
      };
      persistUserToMasterRegistry(found);
    }

    // 4. If still not found, check across all registered CNPJ store databases
    if (!found) {
      try {
        const regSaved = localStorage.getItem('multivariedades_stores_registry');
        if (regSaved) {
          const regList = JSON.parse(regSaved);
          if (Array.isArray(regList)) {
            for (const item of regList) {
              const snap = localStorage.getItem(`multivariedades_store_cnpj_${item.cleanCnpj}`);
              if (snap) {
                const snapObj = JSON.parse(snap);
                if (Array.isArray(snapObj.users)) {
                  const uMatch = snapObj.users.find(
                    (u: UserAccount) =>
                      (u.username && u.username.toLowerCase() === input) ||
                      (u.email && u.email.toLowerCase() === input)
                  );
                  if (uMatch) {
                    found = uMatch;
                    break;
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Erro ao pesquisar lojas registradas:', e);
      }
    }

    if (found) {
      if (!found.active) {
        return {
          success: false,
          error: 'Este usuário está inativo no sistema. Contate a gerência ou o administrador.',
        };
      }

      // If a password was provided, validate against user's password or default role password
      if (password !== undefined && password.trim() !== '') {
        const expected =
          found.password ||
          (found.role === 'admin'
            ? 'admin'
            : found.role === 'cashier'
            ? 'caixa'
            : 'vendedor');

        // If it is dalmarhelp and has default 'admin' password, update it to whatever the user configured
        if (
          found.email.toLowerCase() === 'dalmarhelp@gmail.com' &&
          (!found.password || found.password === 'admin')
        ) {
          found.password = password.trim();
          persistUserToMasterRegistry(found);
        } else if (password.trim() !== expected.trim()) {
          return { success: false, error: 'Senha incorreta para o usuário informado.' };
        }
      }

      // Ensure user is present in memory and persistent master
      setUsers((prev) => {
        const exists = prev.some(
          (u) =>
            u.id === found!.id ||
            (u.email && u.email.toLowerCase() === found!.email.toLowerCase())
        );
        const next = exists
          ? prev.map((u) => (u.id === found!.id ? { ...u, ...found } : u))
          : [found!, ...prev];
        try {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(next));
        } catch {}
        return next;
      });

      persistUserToMasterRegistry(found);

      setCurrentUser(found);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'true');
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out`);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_current_user`, JSON.stringify(found));

      if (found.role === 'cashier') {
        setActiveTab('pdv');
      } else if (found.role === 'seller') {
        setActiveTab('vendas');
      } else if (found.role === 'superadmin') {
        setActiveTab('superadmin');
      } else {
        setActiveTab(isCompanyConfigured ? 'dashboard' : 'empresa');
      }

      return { success: true };
    }

    // Fallback switch to role if typed directly
    if (['admin', 'cashier', 'seller'].includes(input)) {
      switchUserRole(input as UserRole);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_logged_in`, 'true');
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logged_out`);
      return { success: true };
    }

    return {
      success: false,
      error: 'Usuário não encontrado. Verifique os dados digitados ou selecione um perfil na lista.',
    };
  };

  const logout = () => {
    setIsSuperAdminAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_is_logged_in`);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logged_out`, 'true');
    setActiveTab('login');
  };

  const addUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => {
      const next = [...prev, newUser];
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(next));
      } catch {}
      return next;
    });
    persistUserToMasterRegistry(newUser);
  };

  const updateUser = (id: string, userData: Partial<UserAccount>) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...userData } : u));
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null));
    }
    const target = users.find((u) => u.id === id);
    if (target) {
      persistUserToMasterRegistry({ ...target, ...userData });
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(next));
      } catch {}
      return next;
    });
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

    // Automatically sync registered pet to Pet Shop database if provided
    if (Array.isArray(clientData.pets) && clientData.pets.length > 0) {
      const newPets: Pet[] = clientData.pets
        .filter((p) => Boolean(p && p.name && p.name.trim()))
        .map((p, idx) => ({
          id: 'pet_' + Date.now() + '_' + idx,
          clientId: newClient.id,
          clientName: newClient.name,
          name: p.name.trim(),
          species: (p.species as PetSpecies) || 'cao',
          breed: p.breed?.trim() || 'SRD (Sem Raça Definida)',
          gender: 'macho',
          size: 'medio',
          coatType: 'curto',
          coatColor: '',
          birthDate: '',
          weightKg: 5,
          temperament: 'docil',
          allergies: '',
          medicalNotes: '',
          microchipNumber: '',
          vaccinesUpToDate: true,
          createdAt: new Date().toISOString(),
        }));
      if (newPets.length > 0) {
        setPets((prev) => [...newPets, ...prev]);
      }
    }

    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...clientData } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const settleClientDebt = (
    clientId: string,
    amount: number,
    paymentMethod: string,
    notes?: string
  ) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) throw new Error('Cliente não encontrado');

    const currentDebt = client.currentDebt || 0;
    const paidAmount = Math.min(amount, currentDebt > 0 ? currentDebt : amount);
    const remainingDebt = Math.max(0, currentDebt - paidAmount);

    // Update Client Debt
    updateClient(clientId, { currentDebt: remainingDebt });

    const now = new Date();
    const receiptCode = 'REC-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Add Financial Entry for the revenue
    addFinancialEntry({
      type: 'receita',
      category: 'Recebimento de Crediário / Mensalista',
      description: `Quitação de débito - ${client.name}${notes ? ` (${notes})` : ''}`,
      amount: paidAmount,
      dueDate: now.toISOString().split('T')[0],
      paymentDate: now.toISOString().split('T')[0],
      status: 'paid',
      paymentMethod: paymentMethod.toUpperCase(),
      documentRef: receiptCode,
    });

    // 2. Register in active Cash Register session if open
    if (activeSession) {
      const movement: CashMovement = {
        id: 'mov_' + Date.now(),
        type: 'suprimento',
        amount: paidAmount,
        description: `Recebimento Débito / Mensalista: ${client.name} (${paymentMethod.toUpperCase()})`,
        timestamp: now.toISOString(),
        paymentMethod: paymentMethod,
        operatorName: currentUser?.name || activeSession.cashierName || 'Operador',
      };

      setActiveSession((prev) => {
        if (!prev) return prev;
        const movements = [...prev.movements, movement];
        const prevCalc = prev.calculatedBalance || {
          dinheiro: prev.initialBalance || 0,
          pix: 0,
          cartaoDebito: 0,
          cartaoCredito: 0,
          prazo: 0,
          suprimentos: 0,
          sangrias: 0,
          total: prev.initialBalance || 0,
        };

        const isDinheiro = paymentMethod.toLowerCase() === 'dinheiro';
        const isPix = paymentMethod.toLowerCase() === 'pix';
        const isDebito = paymentMethod.toLowerCase() === 'debito';
        const isCredito = paymentMethod.toLowerCase() === 'credito';

        const updatedCalc = {
          ...prevCalc,
          dinheiro: isDinheiro ? prevCalc.dinheiro + paidAmount : prevCalc.dinheiro,
          pix: isPix ? prevCalc.pix + paidAmount : prevCalc.pix,
          cartaoDebito: isDebito ? prevCalc.cartaoDebito + paidAmount : prevCalc.cartaoDebito,
          cartaoCredito: isCredito ? prevCalc.cartaoCredito + paidAmount : prevCalc.cartaoCredito,
          suprimentos: prevCalc.suprimentos + paidAmount,
          total: prevCalc.total + paidAmount,
        };

        return {
          ...prev,
          movements,
          calculatedBalance: updatedCalc,
        };
      });
    }

    const receiptData = {
      receiptCode,
      date: now.toLocaleString('pt-BR'),
      clientId: client.id,
      clientName: client.name,
      clientDoc: client.document,
      previousDebt: currentDebt,
      amountPaid: paidAmount,
      remainingDebt,
      paymentMethod: paymentMethod.toUpperCase(),
      operatorName: currentUser?.name || 'Operador',
      companyName: company.tradeName || company.name,
      companyCnpj: company.cnpj,
      companyPhone: company.phone,
      notes: notes || 'Recebimento de conta a prazo / mensalidade quitada com sucesso.',
    };

    return { receiptData, remainingDebt };
  };

  // Multi-Branch Management (Filiais & Lojas)
  const addBranch = (branchData: Omit<StoreBranch, 'id' | 'createdAt'>): StoreBranch => {
    const newBranch: StoreBranch = {
      ...branchData,
      id: 'branch_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setBranches((prev) => [...prev, newBranch]);
    return newBranch;
  };

  const updateBranch = (id: string, branchData: Partial<StoreBranch>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...branchData } : b)));
  };

  const deleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    if (currentBranchId === id) {
      setCurrentBranchId(branches[0]?.id || null);
    }
  };

  const getAvailablePdvsForUser = (user?: UserAccount | null): PDVRegister[] => {
    const targetUser = user || currentUser;
    if (!targetUser) return pdvRegisters;
    
    // Superadmin & Admin can access all or filter by selected branch
    if (targetUser.role === 'superadmin' || targetUser.role === 'admin') {
      if (currentBranchId) {
        const filtered = pdvRegisters.filter((p) => p.branchId === currentBranchId);
        return filtered.length > 0 ? filtered : pdvRegisters;
      }
      return pdvRegisters;
    }

    // Cashier role STRICTLY sees ONLY PDVs belonging to their assigned branch
    if (targetUser.role === 'cashier' && targetUser.branchId) {
      return pdvRegisters.filter((p) => p.branchId === targetUser.branchId);
    }

    return pdvRegisters;
  };

  // PDV Terminal Management
  const addPDVRegister = (pdvData: Omit<PDVRegister, 'id' | 'createdAt'>): PDVRegister => {
    const newPDV: PDVRegister = {
      ...pdvData,
      id: 'pdv_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPdvRegisters((prev) => [...prev, newPDV]);
    return newPDV;
  };

  const updatePDVRegister = (id: string, pdvData: Partial<PDVRegister>) => {
    setPdvRegisters((prev) => prev.map((p) => (p.id === id ? { ...p, ...pdvData } : p)));
  };

  const deletePDVRegister = (id: string) => {
    setPdvRegisters((prev) => prev.filter((p) => p.id !== id));
    if (selectedPdvId === id) {
      setSelectedPdvId(null);
    }
  };

  const isPdvClosedToday = (pdvId?: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return sessionsHistory.some((s) => {
      if (s.status !== 'closed') return false;
      const isSameDay =
        s.sessionDate === today ||
        s.openedAt?.startsWith(today) ||
        (s.closedAt && s.closedAt.startsWith(today));
      if (!isSameDay) return false;
      if (pdvId) {
        return s.pdvId === pdvId;
      }
      return true;
    });
  };

  const canOpenCashSession = (
    pdvId?: string
  ): { allowed: boolean; reason?: string; lastClosedSession?: CashRegisterSession } => {
    if (activeSession) {
      return {
        allowed: false,
        reason: `Já existe uma sessão de caixa aberta no momento (${activeSession.pdvName || 'Caixa Atual'}). Feche a sessão ativa antes de abrir outra.`,
      };
    }

    const availablePdvs = getAvailablePdvsForUser(currentUser);
    const targetPdvId = pdvId || selectedPdvId || (availablePdvs[0]?.id ?? 'pdv_01');
    const targetPdv = pdvRegisters.find((p) => p.id === targetPdvId);
    const today = new Date().toISOString().split('T')[0];

    // Branch Security: Operator cannot open register belonging to another branch
    if (currentUser?.role === 'cashier' && currentUser.branchId) {
      if (targetPdv && targetPdv.branchId && targetPdv.branchId !== currentUser.branchId) {
        const userBranch = branches.find((b) => b.id === currentUser.branchId);
        const pdvBranch = branches.find((b) => b.id === targetPdv.branchId);
        return {
          allowed: false,
          reason: `Bloqueio de Segurança por Filial: O operador de caixa (${currentUser.name}) está alocado na Loja/Filial Nº ${userBranch?.storeNumber || '001'} ("${userBranch?.name || currentUser.branchName}"). Não é permitido abrir nem operar terminais da Loja/Filial Nº ${pdvBranch?.storeNumber || '---'} ("${pdvBranch?.name || targetPdv.branchName}").`,
        };
      }
    }

    // Find if closed today
    const closedTodaySession = sessionsHistory.find((s) => {
      if (s.status !== 'closed') return false;
      const isSameDay =
        s.sessionDate === today ||
        s.openedAt?.startsWith(today) ||
        (s.closedAt && s.closedAt.startsWith(today));
      return isSameDay && (!targetPdvId || s.pdvId === targetPdvId);
    });

    if (closedTodaySession) {
      const todayFormatted = new Date().toLocaleDateString('pt-BR');
      return {
        allowed: false,
        reason: `O terminal de caixa "${targetPdv?.name || 'Caixa PDV'}" já teve seu turno aberto e FECHADO hoje (${todayFormatted}). Por regras de segurança, conformidade e integridade contábil, cada caixa PDV só pode ser operado uma única vez ao dia. A reabertura estará liberada automaticamente a partir de amanhã.`,
        lastClosedSession: closedTodaySession,
      };
    }

    return { allowed: true };
  };

  // Super Admin, Licensing & Affiliates
  const addClientLicense = (licData: Omit<ClientLicense, 'id' | 'createdAt'>): ClientLicense => {
    const newLic: ClientLicense = {
      ...licData,
      id: 'lic_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setClientLicenses((prev) => [newLic, ...prev]);
    return newLic;
  };

  const updateClientLicense = (id: string, licData: Partial<ClientLicense>) => {
    setClientLicenses((prev) => prev.map((l) => (l.id === id ? { ...l, ...licData } : l)));
  };

  const activateClientLicense = (
    id: string,
    plan: 'monthly_49_90' | 'lifetime_1699_90',
    paymentMethod: string = 'pix'
  ) => {
    const isLifetime = plan === 'lifetime_1699_90';
    const amount = isLifetime ? 1699.9 : 49.9;
    const expiry = isLifetime
      ? '2099-12-31'
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setClientLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id !== id) return lic;

        // Check affiliate commission
        let affiliateCommissionPaid = lic.affiliateCommissionPaid;
        let affiliateCommissionAmount = lic.affiliateCommissionAmount;

        if (lic.affiliateId && !lic.affiliateCommissionPaid) {
          const commission = isLifetime ? 169.99 : 49.9; // 100% 1st month (49.90) or 10% lifetime (169.99)
          affiliateCommissionPaid = true;
          affiliateCommissionAmount = commission;

          // Create commission log
          const newLog: AffiliateCommissionLog = {
            id: 'comm_' + Date.now(),
            affiliateId: lic.affiliateId,
            affiliateName: lic.affiliateName || 'Afiliado Parceiro',
            clientId: lic.id,
            clientName: `${lic.clientName} (${lic.companyName})`,
            planType: plan,
            saleAmount: amount,
            commissionAmount: commission,
            commissionRule: isLifetime ? 'lifetime_10_percent' : '1st_month_100_percent',
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          setCommissionLogs((logs) => [newLog, ...logs]);

          // Update affiliate totals
          setAffiliates((affs) =>
            affs.map((a) =>
              a.id === lic.affiliateId
                ? {
                    ...a,
                    totalReferrals: a.totalReferrals + 1,
                    activePayingClients: a.activePayingClients + 1,
                    totalCommissionEarned: a.totalCommissionEarned + commission,
                    pendingCommission: a.pendingCommission + commission,
                  }
                : a
            )
          );
        }

        return {
          ...lic,
          plan: plan,
          status: isLifetime ? 'active_lifetime' : 'active_monthly',
          isLifetime,
          amountPaid: amount,
          paymentDate: new Date().toISOString(),
          paymentMethod: paymentMethod as any,
          licenseExpiryDate: expiry,
          affiliateCommissionPaid,
          affiliateCommissionAmount,
        };
      })
    );
  };

  const extendClientDays = (id: string, days: number, notes?: string) => {
    setClientLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id !== id) return lic;
        const currentExp = new Date(lic.licenseExpiryDate > new Date().toISOString() ? lic.licenseExpiryDate : new Date());
        currentExp.setDate(currentExp.getDate() + days);
        const newExpiryStr = currentExp.toISOString().split('T')[0];

        return {
          ...lic,
          status: 'custom_extended',
          licenseExpiryDate: newExpiryStr,
          manualDaysGranted: (lic.manualDaysGranted || 0) + days,
          manualNotes: notes || `Liberado temporariamente mais ${days} dias pelo Super Administrador`,
        };
      })
    );
  };

  const addAffiliate = (
    affData: Omit<
      Affiliate,
      | 'id'
      | 'createdAt'
      | 'referralLink'
      | 'totalReferrals'
      | 'activePayingClients'
      | 'totalCommissionEarned'
      | 'totalCommissionPaid'
      | 'pendingCommission'
    >
  ): Affiliate => {
    const code = affData.referralCode.trim().toUpperCase() || 'REF' + Math.floor(1000 + Math.random() * 9000);
    const newAff: Affiliate = {
      ...affData,
      referralCode: code,
      referralLink: `https://multitudo.app/?ref=${code}`,
      totalReferrals: 0,
      activePayingClients: 0,
      totalCommissionEarned: 0,
      totalCommissionPaid: 0,
      pendingCommission: 0,
      id: 'aff_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAffiliates((prev) => [...prev, newAff]);
    return newAff;
  };

  const updateAffiliate = (id: string, affData: Partial<Affiliate>) => {
    setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, ...affData } : a)));
  };

  const payAffiliateCommission = (affiliateId: string, amount: number, pixTxId?: string) => {
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === affiliateId
          ? {
              ...a,
              totalCommissionPaid: a.totalCommissionPaid + amount,
              pendingCommission: Math.max(0, a.pendingCommission - amount),
            }
          : a
      )
    );

    setCommissionLogs((prev) =>
      prev.map((log) =>
        log.affiliateId === affiliateId && log.status === 'pending'
          ? {
              ...log,
              status: 'paid',
              paidAt: new Date().toISOString(),
              pixTransactionId: pixTxId || 'PIX-' + Date.now(),
            }
          : log
      )
    );
  };

  const superAdminLogin = (email: string, pass: string): boolean => {
    if (email.trim().toLowerCase() === 'dalmarsousa@gmail.com' && pass === 'Djs09101967?') {
      setIsSuperAdminAuthenticated(true);
      const superAdminUser = users.find((u) => u.email.toLowerCase() === 'dalmarsousa@gmail.com') || {
        id: 'user_superadmin',
        name: 'Dalmar Sousa (Super Administrador)',
        username: 'dalmar.master',
        email: 'dalmarsousa@gmail.com',
        role: 'superadmin' as UserRole,
        active: true,
        createdAt: '2025-01-01T00:00:00Z',
      };
      setCurrentUser(superAdminUser);
      return true;
    }
    return false;
  };

  const superAdminLogout = () => {
    setIsSuperAdminAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_current_user`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_is_logged_in`);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logged_out`, 'true');
    setActiveTab('login');
  };

  // Cash Register Sessions
  const openCashSession = (initialBalance: number, pdvId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const targetPdvId = pdvId || selectedPdvId || (pdvRegisters[0]?.id ?? 'pdv_01');
    const targetPdv = pdvRegisters.find((p) => p.id === targetPdvId);

    const check = canOpenCashSession(targetPdvId);
    if (!check.allowed) {
      throw new Error(check.reason || 'Abertura de caixa não permitida no momento.');
    }

    const newSession: CashRegisterSession = {
      id: 'sess_' + Date.now(),
      pdvId: targetPdvId,
      pdvCode: targetPdv?.code || 'CX-01',
      pdvName: targetPdv?.name || 'Caixa 01 - Balcão',
      sessionDate: today,
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
          description: `Abertura de Caixa - ${targetPdv?.name || 'PDV'} (Fundo de Troco)`,
          timestamp: new Date().toISOString(),
          operatorName: currentUser?.name || 'Operador',
        },
      ],
    };
    setActiveSession(newSession);
    setSelectedPdvId(targetPdvId);
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

    const today = new Date().toISOString().split('T')[0];

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
      if (mov.type === 'suprimento' && !mov.description.includes('Abertura de Caixa')) {
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
      sessionDate: activeSession.sessionDate || today,
      status: 'closed',
      closedDefinitive: true, // Fechamento em definitivo: bloqueia reabertura no mesmo dia/turno
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
      treasuryAudit: {
        audited: false,
        status: 'pending',
        physicalDifference: difference,
      },
    };

    setSessionsHistory((prev) => [closedSession, ...prev]);
    setActiveSession(null);
    return closedSession;
  };

  const auditTreasurySession = (
    sessionId: string,
    auditData: {
      status: 'approved' | 'divergent' | 'adjusted';
      treasuryNotes: string;
      auditorName?: string;
    }
  ) => {
    setSessionsHistory((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          treasuryAudit: {
            audited: true,
            auditorName: auditData.auditorName || currentUser?.name || 'Chefe da Tesouraria',
            auditedAt: new Date().toISOString(),
            status: auditData.status,
            treasuryNotes: auditData.treasuryNotes,
            physicalDifference: s.difference,
          },
        };
      })
    );
  };

  const hasDepartmentAccess = (department: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') {
      return department !== 'superadmin';
    }
    if (currentUser.role === 'treasury') {
      return ['dashboard', 'financeiro', 'tesouraria', 'relatorios'].includes(department);
    }
    if (currentUser.role === 'stockist') {
      return ['dashboard', 'produtos', 'validades', 'departamentos'].includes(department);
    }
    if (currentUser.role === 'cashier') {
      return department === 'pdv';
    }
    if (currentUser.role === 'seller') {
      return department === 'vendas' || department === 'produtos';
    }
    if (currentUser.departments && currentUser.departments.includes(department)) {
      return true;
    }
    return false;
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
  const addToCart = (product: Product, quantity = 1, variation?: ProductVariation) => {
    const effectiveUnitPrice = variation
      ? variation.price
      : product.isOnPromotion && product.promotionalPrice && product.promotionalPrice > 0
      ? product.promotionalPrice
      : product.salePrice;

    setCurrentCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        if (variation) {
          return item.product.id === product.id && item.variation?.id === variation.id;
        }
        return item.product.id === product.id && !item.variation;
      });

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        const total = (existing.unitPrice - existing.discount) * newQty;
        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty, total: Math.max(0, total) };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            variation,
            quantity,
            unitPrice: effectiveUnitPrice,
            discount: 0,
            total: effectiveUnitPrice * quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (cartKeyOrProductId: string) => {
    setCurrentCart((prev) =>
      prev.filter((item) => {
        const itemKey = item.variation ? `${item.product.id}_${item.variation.id}` : item.product.id;
        return itemKey !== cartKeyOrProductId && item.product.id !== cartKeyOrProductId;
      })
    );
  };

  const updateCartQuantity = (cartKeyOrProductId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartKeyOrProductId);
      return;
    }
    setCurrentCart((prev) =>
      prev.map((item) => {
        const itemKey = item.variation ? `${item.product.id}_${item.variation.id}` : item.product.id;
        if (itemKey === cartKeyOrProductId || item.product.id === cartKeyOrProductId) {
          const total = (item.unitPrice - item.discount) * quantity;
          return { ...item, quantity, total: Math.max(0, total) };
        }
        return item;
      })
    );
  };

  const updateCartDiscount = (cartKeyOrProductId: string, discount: number) => {
    setCurrentCart((prev) =>
      prev.map((item) => {
        const itemKey = item.variation ? `${item.product.id}_${item.variation.id}` : item.product.id;
        if (itemKey === cartKeyOrProductId || item.product.id === cartKeyOrProductId) {
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

    // Validate mandatory client for 'prazo' and 'mensalista'
    const hasPrazoOrMensalista = payments.some(
      (p) => p.method === 'prazo' || p.method === 'mensalista' || p.method === 'crediario'
    );
    if (hasPrazoOrMensalista) {
      if (!client || !client.name || !client.name.trim() || client.id === 'balcao') {
        throw new Error(
          'Para vendas na modalidade A PRAZO ou MENSALISTA, é obrigatório selecionar o cliente cadastrado para viabilizar o controle e a cobrança posterior.'
        );
      }
    }

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

    // Update Client purchases, Loyalty Club points, and Debt if prazo/mensalista
    if (client) {
      const pointsEarned = Math.max(1, Math.floor(total));
      const previousPoints = client.loyaltyPoints || 0;
      const updatedPoints = previousPoints + pointsEarned;
      let updatedTier: 'bronze' | 'prata' | 'ouro' | 'diamante' = client.loyaltyTier || 'bronze';
      if (updatedPoints >= 1500) updatedTier = 'diamante';
      else if (updatedPoints >= 700) updatedTier = 'ouro';
      else if (updatedPoints >= 300) updatedTier = 'prata';

      const previousDebt = client.currentDebt || 0;
      const newDebt = hasPrazoOrMensalista ? previousDebt + total : previousDebt;

      updateClient(client.id, {
        totalPurchases: (client.totalPurchases || 0) + total,
        currentDebt: newDebt,
        loyaltyPoints: updatedPoints,
        loyaltyTier: updatedTier,
        isLoyaltyMember: true,
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

    // Add Revenue in Financial module (pending status if prazo/mensalista for receivables billing)
    const dueDate30 = new Date();
    dueDate30.setDate(dueDate30.getDate() + 30);
    const dueDateStr = dueDate30.toISOString().split('T')[0];

    addFinancialEntry({
      type: 'receita',
      category: hasPrazoOrMensalista ? 'Contas a Receber (A Prazo / Mensalista)' : 'Venda de Mercadorias',
      description: hasPrazoOrMensalista
        ? `Venda a Prazo ${saleCode} - Cliente: ${client?.name || 'Cliente'}`
        : `Venda ${saleCode} - Balcão PDV`,
      amount: total,
      dueDate: hasPrazoOrMensalista ? dueDateStr : new Date().toISOString().split('T')[0],
      paymentDate: hasPrazoOrMensalista ? undefined : new Date().toISOString().split('T')[0],
      status: hasPrazoOrMensalista ? 'pending' : 'paid',
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

    setSales((prev) => [newSale, ...prev.slice(0, 99)]);
    setSelectedSaleForReceipt(newSale);
    clearCart();

    return { sale: newSale, invoice: createdInvoice };
  };

  // Pre-Sales Management
  const addPreSale = (preSaleData: Omit<PreSale, 'id' | 'createdAt' | 'status'>): PreSale => {
    const newPreSale: PreSale = {
      ...preSaleData,
      id: 'ps_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setPreSales((prev) => [newPreSale, ...prev]);
    return newPreSale;
  };

  const updatePreSaleStatus = (id: string, status: 'pending' | 'billed' | 'cancelled') => {
    setPreSales((prev) =>
      prev.map((ps) => (ps.id === id ? { ...ps, status } : ps))
    );
  };

  const deletePreSale = (id: string) => {
    setPreSales((prev) => prev.filter((ps) => ps.id !== id));
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

  // Retail Niche & Brazilian Market Categories
  const companyNiche: RetailNicheId = company.niche || 'variedades';

  const setCompanyNiche = (niche: RetailNicheId, autoLoadColorsAndDeps: boolean = true) => {
    const nicheInfo = RETAIL_NICHES[niche];
    const updates: Partial<CompanyProfile> = {
      niche,
    };
    if (autoLoadColorsAndDeps && nicheInfo) {
      updates.primaryColor = nicheInfo.primaryColor;
      updates.accentColor = nicheInfo.accentColor;
    }
    updateCompany(updates);
  };

  const addCustomCategory = (department: string, category: string) => {
    setCustomCategories((prev) => {
      const existingDeptIndex = prev.findIndex(
        (d) => d.department.trim().toLowerCase() === department.trim().toLowerCase()
      );
      if (existingDeptIndex >= 0) {
        const existingDept = prev[existingDeptIndex];
        if (!existingDept.categories.includes(category)) {
          const updated = [...prev];
          updated[existingDeptIndex] = {
            ...existingDept,
            categories: [...existingDept.categories, category],
          };
          return updated;
        }
        return prev;
      }
      return [...prev, { department, categories: [category] }];
    });
  };

  // Vaccine CRUD (Farmácia & Pet Shop)
  const addVaccineAppointment = (
    data: Omit<VaccineAppointment, 'id' | 'createdAt'>
  ): VaccineAppointment => {
    const newAppointment: VaccineAppointment = {
      ...data,
      id: 'vac_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setVaccineAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  const updateVaccineAppointment = (id: string, updates: Partial<VaccineAppointment>) => {
    setVaccineAppointments((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const completeVaccineAppointment = (id: string, technicalNotes?: string) => {
    setVaccineAppointments((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: 'completed',
            notes: technicalNotes ? `${v.notes ? v.notes + ' | ' : ''}${technicalNotes}` : v.notes,
          };
        }
        return v;
      })
    );
  };

  const deleteVaccineAppointment = (id: string) => {
    setVaccineAppointments((prev) => prev.filter((v) => v.id !== id));
  };

  // Pet Shop CRUD
  const addPet = (data: Omit<Pet, 'id' | 'createdAt'>): Pet => {
    const newPet: Pet = {
      ...data,
      id: 'pet_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPets((prev) => [newPet, ...prev]);
    return newPet;
  };

  const updatePet = (id: string, updates: Partial<Pet>) => {
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePet = (id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
  };

  // Pet Services CRUD
  const addPetService = (data: Omit<PetService, 'id'>): PetService => {
    const newService: PetService = {
      ...data,
      id: 'srv_' + Date.now(),
    };
    setPetServices((prev) => [...prev, newService]);
    return newService;
  };

  const updatePetService = (id: string, updates: Partial<PetService>) => {
    setPetServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deletePetService = (id: string) => {
    setPetServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Pet Appointments
  const addPetAppointment = (
    data: Omit<PetAppointment, 'id' | 'createdAt' | 'code'>
  ): PetAppointment => {
    const randCode = Math.floor(100 + Math.random() * 900);
    const newAppointment: PetAppointment = {
      ...data,
      id: 'apt_' + Date.now(),
      code: `#PET-${randCode}`,
      createdAt: new Date().toISOString(),
    };
    setPetAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  const updatePetAppointment = (id: string, updates: Partial<PetAppointment>) => {
    setPetAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const updatePetAppointmentStep = (id: string, step: PetAppointmentStep) => {
    const nowIso = new Date().toISOString();
    setPetAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const stepTimestamps = { ...a.stepTimestamps };
          if (step === 'aguardando' && !stepTimestamps.aguardandoAt) stepTimestamps.aguardandoAt = nowIso;
          if (step === 'retirado' && !stepTimestamps.retiradoAt) stepTimestamps.retiradoAt = nowIso;
          if (step === 'em_andamento' && !stepTimestamps.emAndamentoAt) stepTimestamps.emAndamentoAt = nowIso;
          if (step === 'pronto' && !stepTimestamps.prontoAt) stepTimestamps.prontoAt = nowIso;
          if (step === 'entregue' && !stepTimestamps.entregueAt) stepTimestamps.entregueAt = nowIso;
          return {
            ...a,
            currentStep: step,
            stepTimestamps,
          };
        }
        return a;
      })
    );
  };

  const deletePetAppointment = (id: string) => {
    setPetAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const billAppointmentToPDV = (appointmentId: string) => {
    const apt = petAppointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const newCartItems: CartItem[] = [];

    apt.items.forEach((item) => {
      const serviceProd: Product = {
        id: `srv_item_${item.petId}_${item.primaryServiceId}_${Date.now()}`,
        name: `[${item.petName}] ${item.primaryServiceName}`,
        sku: `PET-${item.petSpecies.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
        barcode: `789${Date.now().toString().slice(-10)}`,
        category: 'Pet Shop & Veterinária',
        brand: 'Serviço Pet',
        unit: 'UN',
        costPrice: 0,
        salePrice: item.primaryServicePrice,
        stock: 999,
        minStock: 0,
        description: `Serviço de Pet Shop para ${item.petName}`,
        photos: [],
        coverHasWhiteBg: true,
        ncm: '0000.00.00',
        cfop: '5.933',
        csosn: '102',
        icmsAliquota: 0,
        pisAliquota: 0,
        cofinsAliquota: 0,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newCartItems.push({
        product: serviceProd,
        quantity: 1,
        unitPrice: item.primaryServicePrice,
        discount: 0,
        total: item.primaryServicePrice,
      });

      item.extraServices.forEach((extra) => {
        const extraProd: Product = {
          id: `srv_extra_${item.petId}_${extra.id}_${Date.now()}`,
          name: `[${item.petName} - Adicional] ${extra.name}`,
          sku: `EXTRA-${Date.now().toString().slice(-4)}`,
          barcode: `789${Date.now().toString().slice(-10)}`,
          category: 'Pet Shop & Veterinária',
          brand: 'Serviço Adicional',
          unit: 'UN',
          costPrice: 0,
          salePrice: extra.price,
          stock: 999,
          minStock: 0,
          description: `Serviço adicional: ${extra.name}`,
          photos: [],
          coverHasWhiteBg: true,
          ncm: '0000.00.00',
          cfop: '5.933',
          csosn: '102',
          icmsAliquota: 0,
          pisAliquota: 0,
          cofinsAliquota: 0,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newCartItems.push({
          product: extraProd,
          quantity: 1,
          unitPrice: extra.price,
          discount: 0,
          total: extra.price,
        });
      });
    });

    if (apt.transportType === 'leva_e_traz') {
      const taxiProd: Product = {
        id: `srv_taxi_${apt.id}_${Date.now()}`,
        name: `[Táxi Dog Leva e Traz] ${apt.clientName}`,
        sku: 'TAXI-DOG',
        barcode: '7899990001112',
        category: 'Pet Shop & Veterinária',
        brand: 'Transporte Pet',
        unit: 'UN',
        costPrice: 10,
        salePrice: 35.0,
        stock: 999,
        minStock: 0,
        description: 'Serviço de transporte táxi dog busca e entrega com segurança',
        photos: [],
        coverHasWhiteBg: true,
        ncm: '0000.00.00',
        cfop: '5.933',
        csosn: '102',
        icmsAliquota: 0,
        pisAliquota: 0,
        cofinsAliquota: 0,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newCartItems.push({
        product: taxiProd,
        quantity: 1,
        unitPrice: 35.0,
        discount: 0,
        total: 35.0,
      });
    }

    setCurrentCart(newCartItems);
    setActiveTab('pdv');
  };

  // Pet Recurring Plans
  const addPetRecurringPlan = (
    data: Omit<PetRecurringPlan, 'id' | 'createdAt' | 'code'>
  ): PetRecurringPlan => {
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const newPlan: PetRecurringPlan = {
      ...data,
      id: 'plan_' + Date.now(),
      code: `PLN-${randCode}`,
      createdAt: new Date().toISOString(),
    };
    setPetRecurringPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const updatePetRecurringPlan = (id: string, updates: Partial<PetRecurringPlan>) => {
    setPetRecurringPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePetRecurringPlan = (id: string) => {
    setPetRecurringPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const recordPlanSessionUsage = (planId: string) => {
    setPetRecurringPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const nextUsed = Math.min(plan.totalSessions, plan.usedSessions + 1);
          return {
            ...plan,
            usedSessions: nextUsed,
            paymentStatus: nextUsed >= plan.totalSessions ? 'pago' : plan.paymentStatus,
          };
        }
        return plan;
      })
    );
  };

  const billPlanToPDV = (planId: string) => {
    const plan = petRecurringPlans.find((p) => p.id === planId);
    if (!plan) return;

    const planProd: Product = {
      id: `srv_plan_${plan.id}_${Date.now()}`,
      name: `[Mensalidade Pet] ${plan.planName || plan.name} - ${plan.clientName} (${plan.petName})`,
      sku: `PLN-${Date.now().toString().slice(-4)}`,
      barcode: `789${Date.now().toString().slice(-10)}`,
      category: 'Pet Shop & Veterinária',
      brand: 'Plano Mensalista',
      unit: 'UN',
      costPrice: 0,
      salePrice: plan.price,
      stock: 999,
      minStock: 0,
      description: `Mensalidade recorrente do plano pet: ${plan.planName || plan.name} para ${plan.clientName}`,
      photos: [],
      coverHasWhiteBg: true,
      ncm: '0000.00.00',
      cfop: '5.933',
      csosn: '102',
      icmsAliquota: 0,
      pisAliquota: 0,
      cofinsAliquota: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentCart([
      {
        product: planProd,
        quantity: 1,
        unitPrice: plan.price,
        discount: 0,
        total: plan.price,
      },
    ]);
    setActiveTab('pdv');
  };

  // Veterinary Consultations & Clinical Management
  const addVeterinaryConsultation = (
    data: Omit<VeterinaryConsultation, 'id' | 'createdAt' | 'code'>
  ): VeterinaryConsultation => {
    const randCode = Math.floor(100 + Math.random() * 900);
    const newConsultation: VeterinaryConsultation = {
      ...data,
      id: 'vet_' + Date.now(),
      code: `#VET-${randCode}`,
      createdAt: new Date().toISOString(),
    };
    setVeterinaryConsultations((prev) => [newConsultation, ...prev]);
    return newConsultation;
  };

  const updateVeterinaryConsultation = (id: string, updates: Partial<VeterinaryConsultation>) => {
    setVeterinaryConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteVeterinaryConsultation = (id: string) => {
    setVeterinaryConsultations((prev) => prev.filter((c) => c.id !== id));
  };

  const billVeterinaryConsultationToPDV = (consultationId: string) => {
    const cons = veterinaryConsultations.find((c) => c.id === consultationId);
    if (!cons) return;

    const newCartItems: CartItem[] = [];

    // 1. Standard catalog services
    cons.standardServices.forEach((srv) => {
      const prod: Product = {
        id: `srv_vet_${cons.petId}_${srv.serviceId}_${Date.now()}`,
        name: `[${cons.petName} - Vet] ${srv.serviceName}`,
        sku: `VET-${cons.petSpecies.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
        barcode: `789${Date.now().toString().slice(-10)}`,
        category: 'Clínica Veterinária',
        brand: cons.veterinarianName || 'Clínica Veterinária',
        unit: 'UN',
        costPrice: 0,
        salePrice: srv.price,
        stock: 999,
        minStock: 0,
        description: `Procedimento veterinário para ${cons.petName} com ${cons.veterinarianName} (CRMV: ${cons.crmv})`,
        photos: [],
        coverHasWhiteBg: true,
        ncm: '0000.00.00',
        cfop: '5.933',
        csosn: '102',
        icmsAliquota: 0,
        pisAliquota: 0,
        cofinsAliquota: 0,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newCartItems.push({
        product: prod,
        quantity: 1,
        unitPrice: srv.price,
        discount: 0,
        total: srv.price,
      });
    });

    // 2. Custom unlisted / avulso services
    cons.customServices.forEach((cst) => {
      const prod: Product = {
        id: `srv_cst_${cons.petId}_${cst.id}_${Date.now()}`,
        name: `[${cons.petName} - Procedimento Avulso] ${cst.name}`,
        sku: `CST-${Date.now().toString().slice(-4)}`,
        barcode: `789${Date.now().toString().slice(-10)}`,
        category: 'Clínica Veterinária (Avulso)',
        brand: cons.veterinarianName || 'Clínica Veterinária',
        unit: 'UN',
        costPrice: 0,
        salePrice: cst.price,
        stock: 999,
        minStock: 0,
        description: cst.description || `Procedimento especial não listado para ${cons.petName}`,
        photos: [],
        coverHasWhiteBg: true,
        ncm: '0000.00.00',
        cfop: '5.933',
        csosn: '102',
        icmsAliquota: 0,
        pisAliquota: 0,
        cofinsAliquota: 0,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newCartItems.push({
        product: prod,
        quantity: 1,
        unitPrice: cst.price,
        discount: 0,
        total: cst.price,
      });
    });

    setCurrentCart(newCartItems);
    setActiveTab('pdv');
  };

  const getRegisteredStores = (): Array<{
    cnpj: string;
    cleanCnpj: string;
    tradeName: string;
    corporateName: string;
    lastUpdated: string;
  }> => {
    try {
      const saved = localStorage.getItem('multivariedades_stores_registry');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const exportStoreBackup = (): string => {
    const rawCnpj = company.cnpj ? company.cnpj.replace(/\D/g, '') : 'loja';
    const storeSnapshot = {
      backupVersion: '1.0',
      exportedAt: new Date().toISOString(),
      cnpj: company.cnpj,
      cleanCnpj: rawCnpj,
      tradeName: company.tradeName,
      corporateName: company.corporateName,
      company,
      users,
      products,
      clients,
      fiscalConfig,
      fiscalInvoices,
      financialEntries,
      sales,
      activeSession,
      sessionsHistory,
      pdvRegisters,
      branches,
      pets,
      petServices,
      petAppointments,
      petRecurringPlans,
      veterinaryConsultations,
      customCategories,
    };
    const jsonStr = JSON.stringify(storeSnapshot, null, 2);

    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_loja_${rawCnpj || 'cnpj'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }

    return jsonStr;
  };

  const importStoreBackup = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.company) setCompany(parsed.company);
      if (Array.isArray(parsed.users)) setUsers(parsed.users);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.clients)) setClients(parsed.clients);
      if (parsed.fiscalConfig) setFiscalConfig(parsed.fiscalConfig);
      if (Array.isArray(parsed.fiscalInvoices)) setFiscalInvoices(parsed.fiscalInvoices);
      if (Array.isArray(parsed.financialEntries)) setFinancialEntries(parsed.financialEntries);
      if (Array.isArray(parsed.sales)) setSales(parsed.sales);
      if (Array.isArray(parsed.sessionsHistory)) setSessionsHistory(parsed.sessionsHistory);
      if (Array.isArray(parsed.pdvRegisters)) setPdvRegisters(parsed.pdvRegisters);
      if (Array.isArray(parsed.branches)) setBranches(parsed.branches);
      if (Array.isArray(parsed.pets)) setPets(parsed.pets);
      if (Array.isArray(parsed.petServices)) setPetServices(parsed.petServices);
      if (Array.isArray(parsed.petAppointments)) setPetAppointments(parsed.petAppointments);
      if (Array.isArray(parsed.petRecurringPlans)) setPetRecurringPlans(parsed.petRecurringPlans);
      if (Array.isArray(parsed.veterinaryConsultations)) setVeterinaryConsultations(parsed.veterinaryConsultations);
      if (Array.isArray(parsed.customCategories)) setCustomCategories(parsed.customCategories);
      setActiveSession(parsed.activeSession || null);
      setIsRegistered(true);
      return true;
    } catch (err) {
      console.error('Erro ao importar backup:', err);
      return false;
    }
  };

  const switchStoreByCnpj = (targetCnpj: string): boolean => {
    const raw = targetCnpj.replace(/\D/g, '');
    try {
      const saved = localStorage.getItem(`multivariedades_store_cnpj_${raw}`);
      if (saved) {
        return importStoreBackup(saved);
      }
      return false;
    } catch {
      return false;
    }
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
        settleClientDebt,
        branches,
        currentBranchId,
        setCurrentBranchId,
        addBranch,
        updateBranch,
        deleteBranch,
        getAvailablePdvsForUser,
        clientLicenses,
        addClientLicense,
        updateClientLicense,
        activateClientLicense,
        extendClientDays,
        affiliates,
        addAffiliate,
        updateAffiliate,
        payAffiliateCommission,
        commissionLogs,
        isSuperAdminAuthenticated,
        superAdminLogin,
        superAdminLogout,
        activeSession,
        sessionsHistory,
        pdvRegisters,
        selectedPdvId,
        setSelectedPdvId,
        addPDVRegister,
        updatePDVRegister,
        deletePDVRegister,
        isPdvClosedToday,
        canOpenCashSession,
        openCashSession,
        closeCashSession,
        addCashMovement,
        auditTreasurySession,
        hasDepartmentAccess,
        sales,
        currentCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartDiscount,
        clearCart,
        finalizeSale,
        preSales,
        addPreSale,
        updatePreSaleStatus,
        deletePreSale,
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
        isCompanyConfigured,
        registerAdminCleanSlate,
        completeCompanySetup,
        resetToCleanSlate,
        loadDemoData,
        companyNiche,
        setCompanyNiche,
        customCategories,
        addCustomCategory,
        vaccineAppointments,
        addVaccineAppointment,
        updateVaccineAppointment,
        deleteVaccineAppointment,
        completeVaccineAppointment,
        pets,
        addPet,
        updatePet,
        deletePet,
        petServices,
        addPetService,
        updatePetService,
        deletePetService,
        petAppointments,
        addPetAppointment,
        updatePetAppointment,
        updatePetAppointmentStep,
        deletePetAppointment,
        billAppointmentToPDV,
        petRecurringPlans,
        addPetRecurringPlan,
        updatePetRecurringPlan,
        deletePetRecurringPlan,
        recordPlanSessionUsage,
        billPlanToPDV,
        veterinaryConsultations,
        addVeterinaryConsultation,
        updateVeterinaryConsultation,
        deleteVeterinaryConsultation,
        billVeterinaryConsultationToPDV,
        exportStoreBackup,
        importStoreBackup,
        switchStoreByCnpj,
        getRegisteredStores,
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
