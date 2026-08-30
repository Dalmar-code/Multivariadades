import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Barcode,
  Calculator,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialProduct?: Product | null;
}

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  if (!isOpen) return null;

  // 8 Photo slots
  const [photos, setPhotos] = useState<string[]>(
    initialProduct?.photos || ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80']
  );
  const [coverHasWhiteBg, setCoverHasWhiteBg] = useState<boolean>(
    initialProduct?.coverHasWhiteBg ?? true
  );

  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || `VAR-${Math.floor(100 + Math.random() * 900)}`);
  const [barcode, setBarcode] = useState(
    initialProduct?.barcode || `789${Math.floor(1000000000 + Math.random() * 9000000000)}`
  );
  const [category, setCategory] = useState<ProductCategory>(
    initialProduct?.category || 'Ferragens'
  );
  const [brand, setBrand] = useState(initialProduct?.brand || 'Master Variedades');
  const [unit, setUnit] = useState<Product['unit']>(initialProduct?.unit || 'UN');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [location, setLocation] = useState(initialProduct?.location || 'Corredor 1 - Prateleira A');

  // Pricing & Stock
  const [costPrice, setCostPrice] = useState<number>(initialProduct?.costPrice || 20.0);
  const [salePrice, setSalePrice] = useState<number>(initialProduct?.salePrice || 45.0);
  const [stock, setStock] = useState<number>(initialProduct?.stock || 50);
  const [minStock, setMinStock] = useState<number>(initialProduct?.minStock || 10);

  // Fiscal Data
  const [ncm, setNcm] = useState(initialProduct?.ncm || '8467.21.00');
  const [cest, setCest] = useState(initialProduct?.cest || '');
  const [cfop, setCfop] = useState(initialProduct?.cfop || '5.102');
  const [csosn, setCsosn] = useState(initialProduct?.csosn || '102');
  const [icmsAliquota, setIcmsAliquota] = useState(initialProduct?.icmsAliquota || 18.0);
  const [pisAliquota, setPisAliquota] = useState(initialProduct?.pisAliquota || 0.65);
  const [cofinsAliquota, setCofinsAliquota] = useState(initialProduct?.cofinsAliquota || 3.0);

  // Profit Markup calculations
  const profit = salePrice - costPrice;
  const markupPercent = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  const marginPercent = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  // Add photo slot
  const handleAddPhoto = (url?: string) => {
    if (photos.length >= 8) {
      alert('Você atingiu o limite máximo de 8 fotos (padrão Shopee e Mercado Livre).');
      return;
    }
    const newUrl =
      url ||
      SAMPLE_PHOTO_PRESETS[photos.length % SAMPLE_PHOTO_PRESETS.length] ||
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80';
    setPhotos([...photos, newUrl]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleGenerateBarcode = () => {
    const generated = `789${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setBarcode(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !salePrice) {
      alert('Preencha o nome e preço de venda.');
      return;
    }

    onSave({
      name,
      sku,
      barcode,
      category,
      brand,
      unit,
      description,
      location,
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80'],
      coverHasWhiteBg,
      ncm,
      cest,
      cfop,
      csosn,
      icmsAliquota: Number(icmsAliquota) || 0,
      pisAliquota: Number(pisAliquota) || 0,
      cofinsAliquota: Number(cofinsAliquota) || 0,
      active: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">
              {initialProduct ? 'Editar Produto' : 'Novo Produto (Padrão Mercado Livre & Shopee)'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* SECTION 1: 8 PHOTOS GRID (MERCADO LIVRE & SHOPEE STYLE) */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  Galeria de Fotos do Produto (Até 8 Fotos)
                </h4>
                <p className="text-xs text-slate-500">
                  A primeira foto é a <strong>Foto de Capa</strong>. Recomenda-se foto com fundo branco limpo.
                </p>
              </div>

              {/* Cover White BG Toggle */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 cursor-pointer text-xs font-semibold text-slate-800 shadow-2xs hover:bg-amber-50">
                <input
                  type="checkbox"
                  id="checkbox-cover-white-bg"
                  checked={coverHasWhiteBg}
                  onChange={(e) => setCoverHasWhiteBg(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>Foto de Capa com Fundo Branco ✅</span>
              </label>
            </div>

            {/* 8 Photo Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
              {Array.from({ length: 8 }).map((_, index) => {
                const photoUrl = photos[index];
                const isCover = index === 0;

                return (
                  <div
                    key={index}
                    className={`relative h-24 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${
                      isCover
                        ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                        : photoUrl
                        ? 'border-slate-300 bg-white'
                        : 'border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/60'
                    }`}
                  >
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-contain p-1 bg-white"
                          referrerPolicy="no-referrer"
                        />
                        {isCover && (
                          <span className="absolute top-1 left-1 text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white px-1 rounded shadow-xs">
                            Capa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute bottom-1 right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddPhoto()}
                        className="w-full h-full flex flex-col items-center justify-center p-1 text-slate-400 hover:text-amber-600"
                      >
                        <Plus className="w-5 h-5 mb-0.5" />
                        <span className="text-[9px] font-bold">Foto {index + 1}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {photos.length < 8 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAddPhoto()}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> Adicionar Foto ({photos.length}/8)
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: BASIC INFO & CATEGORY */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              1. Informações Básicas do Produto
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título do Anúncio / Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  id="input-prod-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Jogo de Chaves Fenda e Philips com Cabo Isolado 6 Peças"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  id="select-prod-category"
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="Ferragens">Ferragens</option>
                  <option value="Limpeza">Limpeza</option>
                  <option value="Construção">Construção</option>
                  <option value="Casa & Utilidades">Casa & Utilidades</option>
                  <option value="Papelaria">Papelaria</option>
                  <option value="Ferramentas">Ferramentas</option>
                  <option value="Elétrica & Hidráulica">Elétrica & Hidráulica</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Jardinagem">Jardinagem</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código de Barras (EAN-13)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    id="input-prod-barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="789..."
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    title="Gerar EAN-13 aleatório"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código SKU / Referência
                </label>
                <input
                  type="text"
                  id="input-prod-sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="EX: FER-001"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marca / Fabricante</label>
                <input
                  type="text"
                  id="input-prod-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Vonder, MasterTool"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade de Medida</label>
                <select
                  value={unit}
                  id="select-prod-unit"
                  onChange={(e) => setUnit(e.target.value as Product['unit'])}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white font-bold"
                >
                  <option value="UN">UN (Unidade)</option>
                  <option value="CX">CX (Caixa)</option>
                  <option value="KG">KG (Quilo)</option>
                  <option value="MT">MT (Metro)</option>
                  <option value="PCT">PCT (Pacote)</option>
                  <option value="LT">LT (Litro / Balde)</option>
                  <option value="PAR">PAR (Par)</option>
                  <option value="ROLO">ROLO (Rolo / Fita)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localização no Estoque / Corredor
                </label>
                <input
                  type="text"
                  id="input-prod-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Corredor 3 - Prateleira B2"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição Detalhada do Produto
                </label>
                <input
                  type="text"
                  id="input-prod-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Alta resistência, acompanha maleta e ponteiras"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PRICING, MARKUP & STOCK */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              2. Preços, Margem de Lucro & Estoque
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preço de Custo (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="input-cost-price"
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  id="input-sale-price"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-black text-emerald-700 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estoque Atual
                </label>
                <input
                  type="number"
                  min="0"
                  id="input-stock"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estoque Mínimo (Alerta)
                </label>
                <input
                  type="number"
                  min="0"
                  id="input-min-stock"
                  value={minStock}
                  onChange={(e) => setMinStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            {/* Profit margin live badge */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-amber-900">
                Lucro Bruto Unitário: <strong>R$ {profit.toFixed(2)}</strong>
              </span>
              <span className="text-amber-900">
                Markup sobre Custo: <strong>{markupPercent.toFixed(1)}%</strong>
              </span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Margem Líquida da Venda: {marginPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* SECTION 4: FISCAL / SEFAZ DATA (NCM, CFOP, CSOSN) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              3. Dados Fiscais para Emissão de NF-e e NFC-e (SEFAZ)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NCM (8 dígitos) *
                </label>
                <input
                  type="text"
                  id="input-ncm"
                  required
                  value={ncm}
                  onChange={(e) => setNcm(e.target.value)}
                  placeholder="8467.21.00"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CEST (Subst. Tributária)
                </label>
                <input
                  type="text"
                  id="input-cest"
                  value={cest}
                  onChange={(e) => setCest(e.target.value)}
                  placeholder="00.000.00"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CFOP Padrão *
                </label>
                <input
                  type="text"
                  id="input-cfop"
                  required
                  value={cfop}
                  onChange={(e) => setCfop(e.target.value)}
                  placeholder="5.102 ou 5.405"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CSOSN (Simples Nacional)
                </label>
                <select
                  value={csosn}
                  id="select-csosn"
                  onChange={(e) => setCsosn(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="102">102 - Tributada pelo Simples s/ permissão de crédito</option>
                  <option value="500">500 - ICMS cobrado anteriormente por ST</option>
                  <option value="101">101 - Tributada c/ permissão de crédito</option>
                  <option value="400">400 - Não tributada pelo Simples Nacional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-product"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
