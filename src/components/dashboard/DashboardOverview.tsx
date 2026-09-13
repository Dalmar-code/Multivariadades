import React from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Receipt,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  Store,
  Tag,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SalesAndServicesDashboard } from './SalesAndServicesDashboard';

export const DashboardOverview: React.FC = () => {
  const {
    company,
    currentUser,
    sales,
    products,
    clients,
    activeSession,
    setActiveTab,
    calculateDRE,
    fiscalInvoices,
  } = useStore();

  const dre = calculateDRE(0);
  const totalSalesCount = sales.length;
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Expiration calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiringOrExpiredProducts = products
    .map((p) => {
      if (!p.expirationDate) return null;
      const target = new Date(p.expirationDate + 'T00:00:00');
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        product: p,
        diffDays,
        formattedDate: target.toLocaleDateString('pt-BR'),
        isExpired: diffDays < 0,
        isExpiringSoon: diffDays >= 0 && diffDays <= 30,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== null && (item.isExpired || item.isExpiringSoon)
    )
    .sort((a, b) => a.diffDays - b.diffDays);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {company.logoUrl && (
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border border-slate-700 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={company.logoUrl}
                alt={company.tradeName}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `rgba(${company.primaryColor ? 'var(--brand-primary-rgb, 245, 158, 11)' : '245, 158, 11'}, 0.2)`,
                  color: company.primaryColor || '#f59e0b',
                  borderColor: `rgba(${company.primaryColor ? 'var(--brand-primary-rgb, 245, 158, 11)' : '245, 158, 11'}, 0.4)`,
                }}
              >
                Painel de Gestão ERP
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Olá, {currentUser?.name || 'Gestor'}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Bem-vindo ao sistema de gestão da <strong>{company.tradeName}</strong>. Acompanhe abaixo o resumo operacional, faturamento e alertas em tempo real.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('pdv')}
            style={{ backgroundColor: company.primaryColor || '#f59e0b' }}
            className="px-4 py-2.5 rounded-xl text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:brightness-110"
          >
            <ShoppingCart className="w-4 h-4" />
            Abrir Caixa (PDV)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('produtos')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-amber-400" />
            Cadastrar Produto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Manual do Usuário
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faturamento */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Faturamento Acumulado
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(totalSalesRevenue)}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {totalSalesCount} cupons emitidos
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Status do Caixa */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Sessão de Caixa
            </span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {activeSession ? 'Turno Aberto' : 'Caixa Fechado'}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-1">
              {activeSession ? (
                <span className="text-emerald-700 font-bold">
                  Operador: {activeSession.cashierName.split(' ')[0]}
                </span>
              ) : (
                'Nenhuma sessão ativa'
              )}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeSession ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Itens em Estoque */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Catálogo de Produtos
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {products.length} itens
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-1">
              {products.reduce((sum, p) => sum + p.stock, 0)} unidades físicas
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* DRE Lucro Líquido */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Lucro Líquido (DRE)
            </span>
            <div className={`text-2xl font-black mt-1 ${dre.lucroLiquido >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatCurrency(dre.lucroLiquido)}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-1">
              Margem: {dre.margemLiquidaPercent.toFixed(1)}% do faturamento
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Módulos do Sistema & Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('pdv')}
            className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900">Frente de Caixa (PDV)</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Leitor de código, troco e cupom 80mm</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vendas')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900">Área de Vendas</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Consulta de corredores e pré-vendas</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('produtos')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">Estoque & Galeria</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Multi-fotos, controle de lote e NCM</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fiscal')}
            className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900">Fiscal & SEFAZ</div>
            <p className="text-[10px] text-slate-500 mt-0.5">NF-e, NFC-e, DANFE A4 e XML</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financeiro')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-900">Financeiro & DRE</div>
            <p className="text-[10px] text-slate-500 mt-0.5">CMV, custos fixos e apuração contábil</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clientes')}
            className="p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900">Clientes & Paulista</div>
            <p className="text-[10px] text-slate-500 mt-0.5">CPF na nota e limite de crediário</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('relatorios')}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-500 hover:bg-slate-50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900">Relatórios em PDF</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Auditorias, Curva ABC e Livro Fiscal</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">Usuários & RBAC</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Admin, Caixa e Vendedor</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('empresa')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900">Dados da Loja</div>
            <p className="text-[10px] text-slate-500 mt-0.5">CNPJ, IE, CRT Simples e Endereço</p>
          </button>
        </div>
      </div>

      {/* Visão Geral: Lista das Vendas e Serviços do Dia e Histórico por Calendário */}
      <SalesAndServicesDashboard />

      {/* Three columns / Grid: Low Stock Alert, Expiration Alert & Quick Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Reposição de Estoque ({lowStockProducts.length})
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('produtos')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              Ver todos →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Todos os produtos estão com estoque adequado!
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.photos?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&q=80'}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-contain border border-slate-200 shrink-0 bg-white"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.sku}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800">
                      {p.stock} {p.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiration Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              Controle de Validade ({expiringOrExpiredProducts.length})
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('produtos')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Gerenciar →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {expiringOrExpiredProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Nenhum produto próximo ao vencimento ou vencido!
              </p>
            ) : (
              expiringOrExpiredProducts.map(({ product, formattedDate, isExpired, diffDays }) => (
                <div key={product.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.photos?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&q=80'}
                      alt={product.name}
                      className="w-8 h-8 rounded-lg object-contain border border-slate-200 shrink-0 bg-white"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{product.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>Val: {formattedDate}</span>
                        {product.batchNumber && <span>• Lote: {product.batchNumber}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        isExpired
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isExpired ? `Venceu há ${Math.abs(diffDays)}d` : `Vence em ${diffDays}d`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Últimas Vendas Realizadas
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('relatorios')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Auditoria →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {sales.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Nenhuma venda registrada ainda. Realize a primeira venda no PDV!
              </p>
            ) : (
              sales.slice(0, 5).map((s) => (
                <div key={s.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <span className="truncate">{s.code}</span>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0">
                        ({new Date(s.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {s.items.length} itens • {s.payments.map((p) => p.method).join(', ')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-xs text-emerald-700">
                      {formatCurrency(s.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
