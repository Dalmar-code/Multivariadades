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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { ProductFormModal } from './ProductFormModal';

export const ProductCatalog: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, updateStock } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
    'Jardinagem',
    'Outros',
  ];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
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

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Catálogo de Produtos</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Padrão Shopee & Mercado Livre (8 Fotos)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerenciamento de estoque, código de barras EAN-13, dados fiscais (NCM/CFOP) e fotos com fundo branco.
          </p>
        </div>

        <button
          type="button"
          id="btn-new-product"
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Produto
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Total de Itens</span>
          <div className="text-2xl font-black text-slate-900">{products.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Valor Total Estoque</span>
          <div className="text-2xl font-black text-emerald-600">
            R$ {products.reduce((acc, p) => acc + p.salePrice * p.stock, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Custo do Estoque</span>
          <div className="text-2xl font-black text-slate-700">
            R$ {products.reduce((acc, p) => acc + p.costPrice * p.stock, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Estoque Baixo / Crítico</span>
          <div className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {lowStockCount} itens
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="catalog-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, marca, código de barras ou SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-4 flex items-center justify-end text-xs text-slate-500">
            Exibindo <strong>{filtered.length}</strong> de {products.length} produtos
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
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
                <th className="py-3 px-4 text-right">Preço Venda</th>
                <th className="py-3 px-4 text-center">Estoque</th>
                <th className="py-3 px-4">NCM / CFOP</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((prod) => (
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
                  </td>

                  {/* Category & Brand */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      {prod.category}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{prod.brand}</div>
                  </td>

                  {/* Barcode */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    <div className="flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prod.barcode}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">SKU: {prod.sku}</span>
                  </td>

                  {/* Sale Price */}
                  <td className="py-3 px-4 text-right">
                    <div className="font-black text-sm text-slate-900">
                      R$ {prod.salePrice.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Custo: R$ {prod.costPrice.toFixed(2)}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                        prod.stock <= prod.minStock
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {prod.stock} {prod.unit}
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
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prod.id, prod.name)}
                        title="Excluir"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
    </div>
  );
};
