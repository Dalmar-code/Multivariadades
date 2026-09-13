import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Barcode,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Tag,
  ArrowUpDown,
  Sparkles,
  Calendar,
  Clock,
  Layers,
  AlertCircle,
  ShieldAlert,
  Flame,
  Sliders,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { StockValuationModal } from './StockValuationModal';
import { Boxes, DollarSign } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const ProductCatalog: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, updateStock, setActiveTab, companyNiche } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [validityFilter, setValidityFilter] = useState<'all' | 'expiring' | 'expired' | 'valid' | 'none' | 'promo' | 'variations'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockValuationOpen, setIsStockValuationOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dynamic categories from real inventory
  const dynamicCategories = Array.from(
    new Set(['Todas', ...products.map((p) => p.category).filter(Boolean)])
  );
  const categories = dynamicCategories.length > 1 ? dynamicCategories : [
    'Todas',
    'Medicamentos Isentos (MIP)',
    'Higiene & Cuidados Pessoais',
    'Alimentos',
    'Moda',
    'Pet Shop',
    'Geral',
  ];

  // Helper to compute expiration status
  const getProductExpiryStatus = (dateStr?: string) => {
    if (!dateStr) {
      return {
        type: 'none' as const,
        label: 'Sem validade',
        shortLabel: 'Sem prazo',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
        days: 9999,
        formattedDate: '-',
      };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const formattedDate = target.toLocaleDateString('pt-BR');

    if (diffDays < 0) {
      return {
        type: 'expired' as const,
        days: diffDays,
        formattedDate,
        label: `Vencido (${formattedDate})`,
        shortLabel: `Venceu há ${Math.abs(diffDays)}d`,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      };
    } else if (diffDays <= 30) {
      return {
        type: 'expiring' as const,
        days: diffDays,
        formattedDate,
        label: `Vence em ${diffDays}d (${formattedDate})`,
        shortLabel: `Vence em ${diffDays}d`,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      };
    } else {
      return {
        type: 'valid' as const,
        days: diffDays,
        formattedDate,
        label: `Val: ${formattedDate}`,
        shortLabel: formattedDate,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium',
      };
    }
  };

  const expiringCount = products.filter((p) => {
    const status = getProductExpiryStatus(p?.expirationDate);
    return status.type === 'expiring';
  }).length;

  const expiredCount = products.filter((p) => {
    const status = getProductExpiryStatus(p?.expirationDate);
    return status.type === 'expired';
  }).length;

  const promoCount = products.filter((p) => Boolean(p?.isOnPromotion && p?.promotionalPrice)).length;
  const variationsCount = products.filter((p) => Boolean(p?.hasVariations && Array.isArray(p?.variations) && p.variations.length > 0)).length;

  const filtered = products.filter((p) => {
    if (!p) return false;
    const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const searchLower = (searchTerm || '').toLowerCase().trim();
    const matchesSearch =
      searchLower === '' ||
      (p.name || '').toLowerCase().includes(searchLower) ||
      (p.sku || '').toLowerCase().includes(searchLower) ||
      (p.barcode || '').includes(searchLower) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(searchLower)) ||
      (p.brand || '').toLowerCase().includes(searchLower);

    const expiryStatus = getProductExpiryStatus(p.expirationDate);
    let matchesValidity = true;
    if (validityFilter === 'expiring') matchesValidity = expiryStatus.type === 'expiring';
    if (validityFilter === 'expired') matchesValidity = expiryStatus.type === 'expired';
    if (validityFilter === 'valid') matchesValidity = expiryStatus.type === 'valid';
    if (validityFilter === 'none') matchesValidity = expiryStatus.type === 'none';
    if (validityFilter === 'promo') matchesValidity = Boolean(p.isOnPromotion && p.promotionalPrice);
    if (validityFilter === 'variations') matchesValidity = Boolean(p.hasVariations && Array.isArray(p.variations) && p.variations.length > 0);

    return matchesCat && matchesSearch && matchesValidity;
  });

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o produto "${name}"?`)) {
      deleteProduct(id);
    }
  };

  const lowStockCount = products.filter((p) => Number(p?.stock || 0) <= Number(p?.minStock || 0)).length;
  const totalPhysicalUnits = products.reduce((acc, p) => acc + (Number(p?.stock) || 0), 0);
  const totalStockCost = products.reduce((acc, p) => acc + ((Number(p?.costPrice) || 0) * (Number(p?.stock) || 0)), 0);
  const totalStockSale = products.reduce((acc, p) => acc + ((Number(p?.salePrice) || 0) * (Number(p?.stock) || 0)), 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900">Catálogo de Produtos</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Galeria Multi-Fotos (Até 8 Fotos)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Controle de Validade & Lote
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerenciamento de estoque, validade (FEFO), códigos EAN-13, dados fiscais (NCM/CFOP) e rastreabilidade de lote.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <BackButton variant="light" label="Voltar ao Menu" className="px-3 py-2 text-xs" />

          <button
            type="button"
            onClick={() => setActiveTab('validades')}
            className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            Controle de Validades
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('departamentos')}
            className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-700" />
            Departamentos & Categorias
          </button>

          {(companyNiche === 'farmacia' || companyNiche === 'petshop') && (
            <button
              type="button"
              onClick={() => setActiveTab('vacinas')}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              Agenda de Vacinas
            </button>
          )}

          <button
            type="button"
            id="btn-stock-valuation"
            onClick={() => setIsStockValuationOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            Custo Estoque
          </button>

          <button
            type="button"
            id="btn-new-product"
            onClick={handleOpenNew}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Quantidade Total de Itens */}
        <div
          onClick={() => setIsStockValuationOpen(true)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Quantidade Total de Itens</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalPhysicalUnits.toLocaleString('pt-BR')} <span className="text-xs font-bold text-slate-500">peças</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Distribuídos em <strong>{products.length}</strong> produtos cadastrados
          </div>
        </div>

        {/* Estoque em Custo */}
        <div
          onClick={() => setIsStockValuationOpen(true)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Estoque a Preço de CUSTO</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
            R$ {totalStockCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-800 font-medium mt-1">
            Capital investido em mercadoria ativa
          </div>
        </div>

        {/* Estoque em Venda */}
        <div
          onClick={() => setIsStockValuationOpen(true)}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Estoque a Preço de VENDA</span>
            <span className="text-[11px] font-bold text-emerald-600">Varejo</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            R$ {totalStockSale.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Lucro potencial: <strong>R$ {(totalStockSale - totalStockCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Alertas de Estoque & Validade */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Estoque Baixo & Validade</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xl sm:text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {lowStockCount} <span className="text-xs font-bold">críticos</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className={`text-xl sm:text-2xl font-black ${expiredCount > 0 ? 'text-rose-600' : expiringCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {expiredCount + expiringCount} <span className="text-xs font-bold">alertas</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {expiredCount} vencidos / {expiringCount} a vencer em 30d
          </div>
        </div>
      </div>

      {/* Search, Categories & Validity Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="catalog-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, marca, código de barras, lote ou SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-4 flex items-center justify-end text-xs text-slate-500">
            Exibindo <strong>{filtered.length}</strong> de {products.length} produtos
          </div>
        </div>

        {/* Filter by Validity Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Filtro de Validade:
          </span>
          <button
            type="button"
            onClick={() => setValidityFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              validityFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setValidityFilter('expiring')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              validityFilter === 'expiring'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            A Vencer (≤ 30 dias) ({expiringCount})
          </button>
          <button
            type="button"
            onClick={() => setValidityFilter('expired')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              validityFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Vencidos ({expiredCount})
          </button>
          <button
            type="button"
            onClick={() => setValidityFilter('valid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              validityFilter === 'valid'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Validade Adequada
          </button>
          <button
            type="button"
            onClick={() => setValidityFilter('promo')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              validityFilter === 'promo'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            Em Oferta ({promoCount})
          </button>
          <button
            type="button"
            onClick={() => setValidityFilter('variations')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              validityFilter === 'variations'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-purple-500" />
            Com Variações ({variationsCount})
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Foto / Capa</th>
                <th className="py-3 px-4">Produto / Descrição</th>
                <th className="py-3 px-4">Categoria / Marca</th>
                <th className="py-3 px-4">Código / EAN-13</th>
                <th className="py-3 px-4">Validade & Lote</th>
                <th className="py-3 px-4 text-right">Preço Venda</th>
                <th className="py-3 px-4 text-center">Estoque</th>
                <th className="py-3 px-4">NCM / CFOP</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const expiryStatus = getProductExpiryStatus(prod.expirationDate);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Photo & 8 photos count */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-0.5 relative overflow-hidden flex items-center justify-center shrink-0">
                            {prod.photos && prod.photos[0] ? (
                              <img
                                src={prod.photos[0]}
                                alt={prod.name}
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Tag className="w-5 h-5 text-slate-300" />
                            )}
                            {prod.coverHasWhiteBg && (
                              <span className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" title="Fundo Branco"></span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            <span className="font-bold text-slate-700">{prod.photos?.length || 1}/8</span> fotos
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {prod.location ? `Local: ${prod.location}` : `SKU: ${prod.sku}`}
                        </div>

                        {/* Badges for Variations & Specifications */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {prod.hasVariations && Array.isArray(prod.variations) && prod.variations.length > 0 && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200"
                              title={`Variações: ${prod.variations.map((v) => `${v.name} (R$ ${Number(v.price || 0).toFixed(2)})`).join(', ')}`}
                            >
                              📦 {prod.variations.length} variações ({prod.variations.map((v) => v.name).join(', ')})
                            </span>
                          )}

                          {prod.specifications && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200"
                              title={prod.specifications}
                            >
                              📋 Ficha Técnica
                            </span>
                          )}

                          {prod.isOnPromotion && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white shadow-2xs">
                              🔥 Oferta
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {prod.category || 'Geral'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">{prod.brand || '—'}</div>
                      </td>

                      {/* Barcode */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {prod.barcode ? (
                          <div className="flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prod.barcode}</span>
                          </div>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            Sem EAN (Avulso)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">SKU: {prod.sku || '—'}</span>
                      </td>

                      {/* Expiration Date & Batch */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${expiryStatus.badgeClass}`}>
                              <Calendar className="w-3 h-3 shrink-0" />
                              {expiryStatus.label}
                            </span>
                          </div>
                          {prod.batchNumber && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <Layers className="w-3 h-3 text-slate-400" />
                              <span>Lote: {prod.batchNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sale Price (with promotion support) */}
                      <td className="py-3 px-4 text-right">
                        {prod.isOnPromotion && Number(prod.promotionalPrice || 0) > 0 ? (
                          <div className="space-y-0.5">
                            <span className="inline-block px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider">
                              🔥 OFERTA
                            </span>
                            <div className="font-black text-sm text-rose-700">
                              R$ {Number(prod.promotionalPrice || 0).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400 line-through">
                              R$ {Number(prod.salePrice || 0).toFixed(2)}
                            </div>
                            <div className="text-[9px] text-rose-600 font-bold">
                              Economia {prod.promotionDiscountPercent ? `-${prod.promotionDiscountPercent}%` : ''}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-black text-sm text-slate-900">
                              R$ {Number(prod.salePrice || 0).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Custo: R$ {Number(prod.costPrice || 0).toFixed(2)}
                            </div>
                          </>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                            Number(prod.stock || 0) <= Number(prod.minStock || 0)
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {Number(prod.stock || 0)} {prod.unit || 'UN'}
                        </span>
                      </td>

                      {/* Fiscal info */}
                      <td className="py-3 px-4 text-[10px] font-mono text-slate-600">
                        <div>NCM: {prod.ncm}</div>
                        <div>CFOP: {prod.cfop} • {prod.csosn}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(prod.id, prod.name)}
                            title="Excluir"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialProduct={editingProduct}
      />

      {/* Stock Valuation & Cost Position Modal */}
      <StockValuationModal
        isOpen={isStockValuationOpen}
        onClose={() => setIsStockValuationOpen(false)}
      />
    </div>
  );
};
