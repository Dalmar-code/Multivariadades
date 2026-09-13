import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { RETAIL_NICHES, RetailNicheId, RetailNicheInfo } from '../../utils/retailNiches';
import {
  Layers,
  Search,
  Plus,
  CheckCircle2,
  Store,
  Pill,
  ShoppingBag,
  Shirt,
  Dog,
  Car,
  Hammer,
  Smartphone,
  Utensils,
  Eye,
  FolderTree,
  Sparkles,
  Check,
} from 'lucide-react';

const NICHE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Pill,
  ShoppingBag,
  Shirt,
  Dog,
  Car,
  Hammer,
  Smartphone,
  Utensils,
  Eye,
  Store,
};

export const DepartmentCategoryManager: React.FC = () => {
  const {
    company,
    companyNiche,
    products,
    customCategories,
    addCustomCategory,
  } = useStore();

  const activeNicheId: RetailNicheId = (company.niche || companyNiche || 'supermercado') as RetailNicheId;
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const currentNicheInfo = RETAIL_NICHES[activeNicheId] || RETAIL_NICHES.supermercado;
  const NicheIcon = NICHE_ICONS[currentNicheInfo.iconName] || Store;

  // Merge official departments from the chosen niche with custom added ones
  const allDepartments = [...currentNicheInfo.departments];
  customCategories.forEach((customDept) => {
    // Only merge if not associated with another niche
    if (customDept.niche && customDept.niche !== activeNicheId) {
      return;
    }
    const existingIndex = allDepartments.findIndex(
      (d) => d.name.toLowerCase() === customDept.department.toLowerCase()
    );
    if (existingIndex >= 0) {
      const mergedCategories = Array.from(
        new Set([...allDepartments[existingIndex].categories, ...customDept.categories])
      );
      allDepartments[existingIndex] = {
        name: allDepartments[existingIndex].name,
        categories: mergedCategories,
      };
    } else {
      allDepartments.push({
        name: customDept.department,
        categories: customDept.categories,
      });
    }
  });

  const filteredDepartments = allDepartments
    .map((dept) => {
      const matchesDept = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredCats = dept.categories.filter(
        (cat) => matchesDept || cat.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return {
        name: dept.name,
        categories: matchesDept ? dept.categories : filteredCats,
      };
    })
    .filter((dept) => dept.categories.length > 0);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim() || !newCategoryName.trim()) {
      alert('Preencha o nome do departamento e da categoria.');
      return;
    }
    addCustomCategory(newDepartmentName.trim(), newCategoryName.trim());
    setIsNewCategoryModalOpen(false);
    setNewCategoryName('');
    alert(`Categoria "${newCategoryName}" adicionada com sucesso ao departamento "${newDepartmentName}" do nicho ${currentNicheInfo.name}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <FolderTree className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Departamentos & Categorias — {currentNicheInfo.name}
            </h1>
          </div>
          <p className="text-slate-600 text-sm">
            Estrutura comercial exclusiva do nicho escolhido no cadastro da empresa ({currentNicheInfo.name}). Demais nichos foram ocultados para garantir agilidade e precisão na digitação.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsNewCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Categoria / Departamento</span>
          </button>
        </div>
      </div>

      {/* Active Niche Banner - Estritamente o nicho cadastrado */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${currentNicheInfo.primaryColor}30`, color: currentNicheInfo.primaryColor }}
          >
            <NicheIcon className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Nicho Escolhido no Cadastro
              </span>
              <h2 className="text-lg font-black text-white">{currentNicheInfo.name}</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">{currentNicheInfo.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{allDepartments.length} departamentos ativos para digitação</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Pesquisar entre os departamentos e categorias de ${currentNicheInfo.name}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tree View of Departments and Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDepartments.map((dept, idx) => {
          // Count products in this department/category
          const productsInDept = products.filter(
            (p) =>
              (p.department && p.department.toLowerCase() === dept.name.toLowerCase()) ||
              dept.categories.some((c) => p.category.toLowerCase() === c.toLowerCase())
          );

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900">{dept.name}</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {dept.categories.length} categorias
                </span>
              </div>

              {/* Badges de Categorias */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dept.categories.map((cat, catIdx) => (
                  <span
                    key={catIdx}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {productsInDept.length > 0 && (
                <div className="text-[11px] text-emerald-700 font-bold pt-2 border-t border-slate-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{productsInDept.length} produtos cadastrados neste departamento na loja</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Nova Categoria */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Novo Departamento / Categoria</h3>
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Ex: Medicamentos Especiais, Bebidas Importadas..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Termolábeis, Rótulo Vermelho, etc."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
