import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Printer,
  FileText,
  DollarSign,
  ShoppingCart,
  Wrench,
  Clock,
  User,
  CreditCard,
  QrCode,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Share2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Sale, FiscalInvoice } from '../../types';

export const SalesAndServicesDashboard: React.FC = () => {
  const {
    sales,
    petAppointments,
    veterinaryConsultations,
    vaccineAppointments,
    fiscalInvoices,
    setSelectedSaleForReceipt,
    setSelectedInvoiceForDanfe,
    generateFiscalInvoice,
    company,
  } = useStore();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter States
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(todayStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);
  const [typeFilter, setTypeFilter] = useState<'all' | 'sales' | 'services' | 'credit'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Helper to format currency
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Compute date boundaries
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilterMode === 'today') {
      return { start: todayStr, end: todayStr, label: 'Hoje' };
    }

    if (dateFilterMode === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      return { start: yStr, end: yStr, label: 'Ontem' };
    }

    if (dateFilterMode === 'week') {
      const w = new Date(today);
      w.setDate(w.getDate() - 7);
      const wStr = w.toISOString().split('T')[0];
      return { start: wStr, end: todayStr, label: 'Últimos 7 Dias' };
    }

    if (dateFilterMode === 'month') {
      const mStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      return { start: mStart, end: todayStr, label: 'Este Mês' };
    }

    return {
      start: customDate || todayStr,
      end: customEndDate || customDate || todayStr,
      label: customDate === customEndDate ? `Data ${customDate}` : `De ${customDate} até ${customEndDate}`,
    };
  }, [dateFilterMode, todayStr, customDate, customEndDate]);

  // Unified items list: Sales + Registered Services
  interface UnifiedTransaction {
    id: string;
    code: string;
    type: 'sale' | 'service';
    serviceCategory?: string;
    createdAt: string;
    clientName?: string;
    clientDocument?: string;
    sellerName?: string;
    total: number;
    paymentMethods: string[];
    isCredit: boolean;
    description: string;
    itemCount: number;
    saleRef?: Sale;
    rawService?: any;
    hasInvoice: boolean;
  }

  const unifiedList = useMemo<UnifiedTransaction[]>(() => {
    const list: UnifiedTransaction[] = [];

    // 1. Regular Sales (Products & services billed in PDV)
    sales.forEach((s) => {
      const dateOnly = s.createdAt.split('T')[0];
      if (dateOnly >= dateRange.start && dateOnly <= dateRange.end) {
        const hasServiceItems = s.items.some(
          (it) =>
            it.product.isService ||
            (it.product.category && it.product.category.toLowerCase().includes('serviço')) ||
            (it.product.department && it.product.department.toLowerCase().includes('serviço'))
        );

        const isCreditSale = s.payments.some(
          (p) => p.method === 'prazo' || p.method === 'crediario' || p.method === 'mensalista'
        );

        const desc = s.items
          .map((i) => `${i.quantity}x ${i.product.name}${i.variation ? ` (${i.variation.name})` : ''}`)
          .join(', ');

        const hasInv = Boolean(
          s.fiscalInvoiceId ||
          fiscalInvoices.some((inv) => inv.saleId === s.id)
        );

        list.push({
          id: s.id,
          code: s.code,
          type: hasServiceItems ? 'service' : 'sale',
          serviceCategory: hasServiceItems ? 'Serviço em Balcão / PDV' : undefined,
          createdAt: s.createdAt,
          clientName: s.clientName || 'Consumidor Final',
          clientDocument: s.clientDocument || s.cpfNaNota,
          sellerName: s.sellerName || s.cashierName || 'Balcão',
          total: s.total,
          paymentMethods: s.payments.map((p) => p.method),
          isCredit: isCreditSale,
          description: desc,
          itemCount: s.items.length,
          saleRef: s,
          hasInvoice: hasInv,
        });
      }
    });

    // 2. Pet Appointments (Banho & Tosa, etc.) that are not duplicate sales
    if (Array.isArray(petAppointments)) {
      petAppointments.forEach((app) => {
        const appDate = app.date || app.createdAt?.split('T')[0] || todayStr;
        if (appDate >= dateRange.start && appDate <= dateRange.end) {
          const firstItem = app.items?.[0];
          const serviceName = firstItem?.primaryServiceName || 'Serviço Estética Pet';
          const petName = firstItem?.petName || 'Pet';
          const staff = firstItem?.assignedStaff || 'Profissional Estética';

          list.push({
            id: app.id,
            code: app.code || `PET-${app.id.slice(-4)}`,
            type: 'service',
            serviceCategory: 'Estética Animal (Banho & Tosa)',
            createdAt: `${appDate}T${app.time || '10:00'}:00Z`,
            clientName: app.clientName || 'Cliente Pet',
            sellerName: staff,
            total: app.totalAmount || 0,
            paymentMethods: [app.isPaid ? 'Faturado / Pago' : 'Aguardando Pagamento'],
            isCredit: false,
            description: `${serviceName} • Pet: ${petName}${app.notes ? ` (${app.notes})` : ''}`,
            itemCount: app.items?.length || 1,
            rawService: app,
            hasInvoice: false,
          });
        }
      });
    }

    // 3. Veterinary Consultations
    if (Array.isArray(veterinaryConsultations)) {
      veterinaryConsultations.forEach((vet) => {
        const vetDate = vet.createdAt?.split('T')[0] || todayStr;
        if (vetDate >= dateRange.start && vetDate <= dateRange.end) {
          list.push({
            id: vet.id,
            code: vet.code || `VET-${vet.id.slice(-4)}`,
            type: 'service',
            serviceCategory: 'Consulta Veterinária Especializada',
            createdAt: vet.createdAt,
            clientName: vet.clientName || 'Tutor',
            sellerName: vet.veterinarianName || 'Médico Veterinário',
            total: vet.totalAmount || 0,
            paymentMethods: [vet.status === 'concluido' ? 'Concluído' : 'Agendado/Em Atendimento'],
            isCredit: false,
            description: `Consulta/Procedimento Veterinário • Pet: ${vet.petName}${vet.diagnosis ? ` (${vet.diagnosis})` : ''}`,
            itemCount: 1,
            rawService: vet,
            hasInvoice: false,
          });
        }
      });
    }

    // 4. Vaccine Clinical Appointments
    if (Array.isArray(vaccineAppointments)) {
      vaccineAppointments.forEach((vac) => {
        const vacDate = vac.applicationDate || vac.createdAt?.split('T')[0] || todayStr;
        if (vacDate >= dateRange.start && vacDate <= dateRange.end) {
          list.push({
            id: vac.id,
            code: `VAC-${vac.id.slice(-4)}`,
            type: 'service',
            serviceCategory: 'Aplicação de Vacina / Injetável',
            createdAt: vac.createdAt || `${vacDate}T12:00:00Z`,
            clientName: vac.patientName || vac.clientName || 'Paciente',
            sellerName: vac.professionalName || 'Responsável Técnico',
            total: vac.price || 0,
            paymentMethods: [vac.status === 'completed' ? 'Concluído' : 'Agendado'],
            isCredit: false,
            description: `Vacina: ${vac.vaccineName}${vac.doseNumber ? ` (${vac.doseNumber})` : ''}`,
            itemCount: 1,
            rawService: vac,
            hasInvoice: false,
          });
        }
      });
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sales, petAppointments, veterinaryConsultations, vaccineAppointments, fiscalInvoices, dateRange, todayStr]);

  // Filtered by Search & Type
  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      // Type filter
      if (typeFilter === 'sales' && item.type !== 'sale') return false;
      if (typeFilter === 'services' && item.type !== 'service') return false;
      if (typeFilter === 'credit' && !item.isCredit) return false;

      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesClient = item.clientName?.toLowerCase().includes(q) || false;
        const matchesDoc = item.clientDocument?.toLowerCase().includes(q) || false;
        const matchesSeller = item.sellerName?.toLowerCase().includes(q) || false;
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesPayment = item.paymentMethods.some((p) => p.toLowerCase().includes(q));

        if (!matchesCode && !matchesClient && !matchesDoc && !matchesSeller && !matchesDesc && !matchesPayment) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedList, typeFilter, searchTerm]);

  // Aggregated totals for selected period
  const totalRevenue = useMemo(
    () => filteredList.reduce((acc, curr) => acc + curr.total, 0),
    [filteredList]
  );

  const totalProductsRevenue = useMemo(
    () => filteredList.filter((i) => i.type === 'sale').reduce((acc, curr) => acc + curr.total, 0),
    [filteredList]
  );

  const totalServicesRevenue = useMemo(
    () => filteredList.filter((i) => i.type === 'service').reduce((acc, curr) => acc + curr.total, 0),
    [filteredList]
  );

  const totalCreditRevenue = useMemo(
    () => filteredList.filter((i) => i.isCredit).reduce((acc, curr) => acc + curr.total, 0),
    [filteredList]
  );

  // Reprint / Fiscal Action Handlers
  const handleReprintReceipt = (item: UnifiedTransaction) => {
    if (item.saleRef) {
      setSelectedSaleForReceipt(item.saleRef);
    } else {
      // Create a temporary synthetic sale object for printing receipt of pure service
      const tempSale: Sale = {
        id: 'srv_' + item.id,
        code: item.code,
        sessionId: 'session_service',
        cashierId: 'cashier_service',
        cashierName: item.sellerName || 'Balcão',
        clientName: item.clientName,
        clientDocument: item.clientDocument,
        subtotal: item.total,
        discount: 0,
        total: item.total,
        status: 'completed',
        createdAt: item.createdAt,
        items: [
          {
            product: {
              id: 'prod_srv_' + item.id,
              name: item.description,
              description: item.description,
              brand: 'Serviço Próprio',
              salePrice: item.total,
              costPrice: 0,
              stock: 999,
              minStock: 1,
              category: 'Serviços',
              department: 'Serviços',
              barcode: 'SRV' + item.id.slice(-6),
              sku: 'SRV-' + item.code,
              unit: 'UN',
              ncm: '00000000',
              cfop: '5933',
              csosn: '102',
              icmsAliquota: 0,
              pisAliquota: 0,
              cofinsAliquota: 0,
              photos: [],
              coverHasWhiteBg: false,
              active: true,
              isService: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            quantity: 1,
            unitPrice: item.total,
            discount: 0,
            total: item.total,
          },
        ],
        payments: [
          {
            method: 'dinheiro',
            amount: item.total,
          },
        ],
      };
      setSelectedSaleForReceipt(tempSale);
    }
  };

  const handleReprintFiscalInvoice = (item: UnifiedTransaction) => {
    if (!item.saleRef) {
      alert('Esta ordem de serviço ainda não foi faturada no Caixa PDV com emissão de NFC-e. Fature no caixa para emitir a nota fiscal.');
      return;
    }

    // Check if existing invoice in store
    const existing = fiscalInvoices.find((inv) => inv.saleId === item.saleRef!.id);
    if (existing) {
      setSelectedInvoiceForDanfe(existing);
      return;
    }

    // Generate new NFC-e on demand
    const generated = generateFiscalInvoice(
      item.saleRef,
      'NFCE',
      item.saleRef.clientName,
      item.saleRef.cpfNaNota || item.saleRef.clientDocument
    );
    setSelectedInvoiceForDanfe(generated);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header & Date / Calendar Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Vendas & Serviços: Visão Diária e Histórico por Calendário
            </h2>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Consulte todas as operações do dia ou busque qualquer data passada no calendário. Reimpressão de recibos térmicos (80mm/58mm) e notas fiscais eletrônicas (NFC-e / DANFE).
          </p>
        </div>

        {/* Quick Date Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              dateFilterMode === 'today'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vendas do Dia (Hoje)
          </button>
          <button
            type="button"
            onClick={() => setDateFilterMode('yesterday')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              dateFilterMode === 'yesterday'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ontem
          </button>
          <button
            type="button"
            onClick={() => setDateFilterMode('week')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              dateFilterMode === 'week'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Dias
          </button>
          <button
            type="button"
            onClick={() => setDateFilterMode('month')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              dateFilterMode === 'month'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mês Atual
          </button>
          <button
            type="button"
            onClick={() => setDateFilterMode('custom')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
              dateFilterMode === 'custom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendário...</span>
          </button>
        </div>
      </div>

      {/* Date Picker Input when "Calendário..." is selected */}
      {dateFilterMode === 'custom' && (
        <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-900">Selecione o Dia ou Período no Calendário:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span>Data Inicial:</span>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span>Data Final:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards for the chosen Date */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Faturado */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Faturamento ({dateRange.label})
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[10px] text-slate-400">
            {filteredList.length} registro(s) de vendas e serviços
          </div>
        </div>

        {/* Vendas de Produtos */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            Vendas de Produtos
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-950">
            {formatCurrency(totalProductsRevenue)}
          </div>
          <div className="text-[10px] text-emerald-700">
            {filteredList.filter((i) => i.type === 'sale').length} vendas de balcão
          </div>
        </div>

        {/* Serviços Prestados */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            Serviços Prestados
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-950">
            {formatCurrency(totalServicesRevenue)}
          </div>
          <div className="text-[10px] text-blue-700">
            {filteredList.filter((i) => i.type === 'service').length} ordens de serviço / procedimentos
          </div>
        </div>

        {/* A Prazo / Mensalista */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-amber-600" />
            A Prazo / Mensalistas
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-950">
            {formatCurrency(totalCreditRevenue)}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold">
            {filteredList.filter((i) => i.isCredit).length} com cliente vinculado para cobrança
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por Código, Cliente, CPF, Produto..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              typeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Todas ({unifiedList.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('sales')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              typeFilter === 'sales'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Apenas Vendas ({unifiedList.filter((i) => i.type === 'sale').length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('services')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              typeFilter === 'services'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Apenas Serviços ({unifiedList.filter((i) => i.type === 'service').length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('credit')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
              typeFilter === 'credit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            A Prazo ({unifiedList.filter((i) => i.isCredit).length})
          </button>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">
              Nenhuma venda ou serviço encontrado para {dateRange.label}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Utilize o calendário para selecionar datas passadas, ou realize uma nova venda no PDV para que ela apareça instantaneamente aqui.
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const dateObj = new Date(item.createdAt);
            const timeStr = isNaN(dateObj.getTime())
              ? '--:--'
              : dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const formattedDate = isNaN(dateObj.getTime())
              ? item.createdAt.split('T')[0]
              : dateObj.toLocaleDateString('pt-BR');

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.isCredit
                    ? 'border-amber-200 bg-amber-50/20 hover:border-amber-400'
                    : item.type === 'service'
                    ? 'border-blue-200 bg-blue-50/10 hover:border-blue-400'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                {/* Left details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge Venda vs Serviço */}
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        item.type === 'service'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.type === 'service' ? (
                        <>
                          <Wrench className="w-3 h-3" />
                          Serviço
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3" />
                          Venda PDV
                        </>
                      )}
                    </span>

                    {/* Code */}
                    <span className="font-mono font-black text-sm text-slate-900">
                      {item.code}
                    </span>

                    {/* Date & Time */}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formattedDate} às {timeStr}
                    </span>

                    {/* A Prazo Badge */}
                    {item.isCredit && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                        Venda a Prazo / Mensalista
                      </span>
                    )}

                    {/* NFC-e Badge */}
                    {item.hasInvoice && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-600" />
                        NFC-e Autorizada
                      </span>
                    )}
                  </div>

                  {/* Customer and Seller line */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{item.clientName}</span>
                      {item.clientDocument && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({item.clientDocument})
                        </span>
                      )}
                    </div>
                    {item.sellerName && (
                      <div className="text-slate-500 text-[11px]">
                        Atendente/Vendedor: <strong className="text-slate-700">{item.sellerName}</strong>
                      </div>
                    )}
                  </div>

                  {/* Description preview */}
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {item.description}
                  </div>

                  {/* Payment methods */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {item.paymentMethods.map((pm, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {pm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Value and Action Buttons */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-lg sm:text-xl font-black text-slate-900">
                      {formatCurrency(item.total)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.itemCount} {item.itemCount === 1 ? 'item' : 'itens'}
                    </div>
                  </div>

                  {/* Action Buttons: Thermal Receipt & NFC-e */}
                  <div className="flex items-center gap-2">
                    {/* Reimprimir Recibo Térmico */}
                    <button
                      type="button"
                      onClick={() => handleReprintReceipt(item)}
                      title="Reimprimir Recibo Térmico (80mm / 58mm / A4)"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-105"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reimprimir Recibo</span>
                    </button>

                    {/* Reimprimir Nota Fiscal / DANFE */}
                    <button
                      type="button"
                      onClick={() => handleReprintFiscalInvoice(item)}
                      title="Reimprimir DANFE / Nota Fiscal NFC-e Oficial"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-105"
                    >
                      <FileText className="w-3.5 h-3.5 text-white" />
                      <span>DANFE / NFC-e</span>
                    </button>

                    {/* Ver Detalhes */}
                    {item.saleRef && (
                      <button
                        type="button"
                        onClick={() => setSelectedSaleDetail(item.saleRef!)}
                        title="Ver detalhes desta venda"
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">
                  Detalhes da Venda {selectedSaleDetail.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSaleDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cliente:</span>
                  <span className="font-bold text-slate-900">{selectedSaleDetail.clientName || 'Consumidor Final'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">CPF/CNPJ na Nota:</span>
                  <span className="font-mono text-slate-900">{selectedSaleDetail.cpfNaNota || selectedSaleDetail.clientDocument || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Operador / Caixa:</span>
                  <span className="font-semibold text-slate-800">{selectedSaleDetail.cashierName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Data & Horário:</span>
                  <span className="font-semibold text-slate-800">{new Date(selectedSaleDetail.createdAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Itens da Venda:
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {selectedSaleDetail.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-slate-800 bg-white">
                      <div>
                        <div className="font-bold">{item.product.name}</div>
                        {item.variation && (
                          <div className="text-[10px] text-indigo-600 font-semibold">
                            Variação: {item.variation.name}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total breakdown */}
              <div className="bg-slate-100 p-3 rounded-2xl space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(selectedSaleDetail.subtotal)}</span>
                </div>
                {selectedSaleDetail.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Desconto concedido:</span>
                    <span className="font-mono">-{formatCurrency(selectedSaleDetail.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Final:</span>
                  <span>{formatCurrency(selectedSaleDetail.total)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSaleForReceipt(selectedSaleDetail);
                  setSelectedSaleDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                Imprimir Recibo Térmico
              </button>
              <button
                type="button"
                onClick={() => {
                  const existing = fiscalInvoices.find((inv) => inv.saleId === selectedSaleDetail.id);
                  if (existing) {
                    setSelectedInvoiceForDanfe(existing);
                  } else {
                    const gen = generateFiscalInvoice(selectedSaleDetail, 'NFCE', selectedSaleDetail.clientName, selectedSaleDetail.cpfNaNota);
                    setSelectedInvoiceForDanfe(gen);
                  }
                  setSelectedSaleDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                Imprimir DANFE NFC-e
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
