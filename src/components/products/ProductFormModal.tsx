import React, { useState, useRef } from 'react';
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
  Calendar,
  Clock,
  Layers,
  Wand2,
  Pill,
  Dog,
  Shirt,
  Store,
  Tag,
  Hash,
  Link as LinkIcon,
  Flame,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  FileText,
  Sliders,
  Package,
  Copy,
  Palette,
  Scale,
  Utensils,
  Camera,
} from 'lucide-react';
import { Product, ProductCategory, RetailNicheId, ProductVariation } from '../../types';
import { useStore } from '../../context/StoreContext';
import { RETAIL_NICHES } from '../../utils/retailNiches';
import { AIBarcodeGeneratorModal } from './AIBarcodeGeneratorModal';
import { isValidEan13, generateLocalEan13 } from '../../utils/barcodeGenerator';
import { compressImage } from '../../utils/imageCompressor';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialProduct?: Product | null;
}

/**
 * Helper to generate standardized 9-digit SKU:
 * Takes the first 5 digits of the company's CNPJ or CPF + sequential number starting from 1 to complete 9 digits total.
 * Example: CNPJ 12.345.678/0001-90 -> 5 digits = 12345 + seq 0001 = 123450001 (exactly 9 digits)
 */
export const generateCompanySku = (companyDoc: string | undefined, existingProducts: Product[]): string => {
  const digits = (companyDoc || '').replace(/\D/g, '');
  const prefix5 = (digits.length >= 5 ? digits.slice(0, 5) : (digits + '00000').slice(0, 5)) || '12345';

  let maxSeq = 0;
  existingProducts.forEach((p) => {
    if (p.sku && p.sku.startsWith(prefix5) && p.sku.length === 9) {
      const seqPart = parseInt(p.sku.slice(5), 10);
      if (!isNaN(seqPart) && seqPart > maxSeq) {
        maxSeq = seqPart;
      }
    }
  });

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `${prefix5}${nextSeq}`;
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  if (!isOpen) return null;

  const { companyNiche, customCategories, company, products } = useStore();

  // 8 Photo slots (Starts completely blank; client chooses their photos)
  const [photos, setPhotos] = useState<string[]>(
    initialProduct?.photos || []
  );
  const [coverHasWhiteBg, setCoverHasWhiteBg] = useState<boolean>(
    initialProduct?.coverHasWhiteBg ?? true
  );
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [isAddingViaUrl, setIsAddingViaUrl] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop state for photos
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Niche and Merchandising Structure
  const [selectedNiche, setSelectedNiche] = useState<RetailNicheId>(
    (initialProduct?.department ? companyNiche : companyNiche) || 'farmacia'
  );
  const activeNicheInfo = RETAIL_NICHES[selectedNiche] || RETAIL_NICHES.farmacia;
  
  const [department, setDepartment] = useState<string>(
    initialProduct?.department || activeNicheInfo.departments[0]?.name || 'Geral'
  );

  const [name, setName] = useState(initialProduct?.name || '');

  // SKU: Combined 5 first numbers of CNPJ/CPF + sequence starting at 1 to complete 9 numbers
  const [sku, setSku] = useState(() => {
    if (initialProduct?.sku) return initialProduct.sku;
    return generateCompanySku(company?.cnpj, products);
  });

  // Barcode (EAN-13): Defaults to BLANK for new products so as not to influence the typist
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');

  const [category, setCategory] = useState<string>(
    initialProduct?.category || activeNicheInfo.departments[0]?.categories[0] || 'Medicamentos Isentos (MIP)'
  );
  const [brand, setBrand] = useState(initialProduct?.brand || 'Fabricante Homologado');
  const [unit, setUnit] = useState<Product['unit']>(initialProduct?.unit || 'UN');
  const [location, setLocation] = useState(initialProduct?.location || 'Corredor 1 - Prateleira A');

  // Separated Commercial Description and Technical Specifications
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [specifications, setSpecifications] = useState(initialProduct?.specifications || '');

  // Promotion / Oferta
  const [isOnPromotion, setIsOnPromotion] = useState<boolean>(initialProduct?.isOnPromotion || false);
  const [promotionalPrice, setPromotionalPrice] = useState<number>(
    initialProduct?.promotionalPrice || (initialProduct?.salePrice ? initialProduct.salePrice * 0.9 : 0)
  );
  const [promotionDiscountPercent, setPromotionDiscountPercent] = useState<number>(
    initialProduct?.promotionDiscountPercent || 10
  );
  const [promotionStartDate, setPromotionStartDate] = useState<string>(
    initialProduct?.promotionStartDate || new Date().toISOString().split('T')[0]
  );
  const [promotionEndDate, setPromotionEndDate] = useState<string>(
    initialProduct?.promotionEndDate || ''
  );

  // Product Variations (Up to 5 options: e.g. Ração 1kg, 2kg, 3kg)
  const [hasVariations, setHasVariations] = useState<boolean>(
    initialProduct?.hasVariations || (Boolean(initialProduct?.variations && initialProduct.variations.length > 0))
  );
  const [variations, setVariations] = useState<ProductVariation[]>(
    initialProduct?.variations && initialProduct.variations.length > 0
      ? initialProduct.variations
      : []
  );

  // Niche-specific fields
  const [anvisaRegister, setAnvisaRegister] = useState<string>(initialProduct?.anvisaRegister || '');
  const [clothingSize, setClothingSize] = useState<string>(initialProduct?.clothingSize || '');
  const [clothingColor, setClothingColor] = useState<string>(initialProduct?.clothingColor || '');
  const [petSpeciesTarget, setPetSpeciesTarget] = useState<string>(initialProduct?.petSpeciesTarget || 'Cães e Gatos');
  const [serialNumberImei, setSerialNumberImei] = useState<string>(initialProduct?.serialNumberImei || '');

  // Expiration date & batch number
  const [expirationDate, setExpirationDate] = useState<string>(initialProduct?.expirationDate || '');
  const [batchNumber, setBatchNumber] = useState<string>(initialProduct?.batchNumber || '');

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

  const [isAIBarcodeModalOpen, setIsAIBarcodeModalOpen] = useState(false);
  const [isQuickGeneratingBarcode, setIsQuickGeneratingBarcode] = useState(false);

  // Profit Markup calculations
  const profit = salePrice - costPrice;
  const markupPercent = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  const marginPercent = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  // Barcode validation check
  const isBarcodeValid = barcode ? isValidEan13(barcode) : false;

  // Re-generate standardized SKU (5 digits CNPJ + seq 4 digits)
  const handleRegenerateStandardSku = () => {
    const newSku = generateCompanySku(company?.cnpj, products);
    setSku(newSku);
  };

  const handleApplyAIGeneratedBarcode = (newBarcode: string, newSku?: string) => {
    setBarcode(newBarcode);
    if (newSku) {
      setSku(newSku);
    }
  };

  const handleQuickAIGenerateBarcode = () => {
    setIsQuickGeneratingBarcode(true);
    let type: 'granel' | 'fracionado' | 'linear' | 'proprio' = 'granel';
    if (unit === 'KG' || unit === 'LT' || name.toLowerCase().includes('granel') || name.toLowerCase().includes('quilo')) {
      type = 'granel';
    } else if (unit === 'PCT' || unit === 'CX' || unit === 'PAR' || name.toLowerCase().includes('pct') || name.toLowerCase().includes('pacote')) {
      type = 'fracionado';
    } else if (unit === 'MT' || unit === 'ROLO' || name.toLowerCase().includes('metro')) {
      type = 'linear';
    } else {
      type = 'proprio';
    }

    setTimeout(() => {
      const generated = generateLocalEan13(type);
      setBarcode(generated.barcode);
      setIsQuickGeneratingBarcode(false);
    }, 250);
  };

  // Add photo via URL or base64
  const handleAddPhoto = (url: string) => {
    if (photos.length >= 8) {
      alert('Limite de 8 fotos atingido.');
      return;
    }
    if (url.startsWith('data:image')) {
      compressImage(url).then((compressed) => {
        setPhotos([...photos, compressed || url]);
      });
    } else {
      setPhotos([...photos, url]);
    }
    setPhotoUrlInput('');
    setIsAddingViaUrl(false);
  };

  // Upload photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 8 - photos.length;
    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      if (file.type.startsWith('image/')) {
        compressImage(file).then((compressed) => {
          if (compressed) {
            setPhotos((prev) => (prev.length < 8 ? [...prev, compressed] : prev));
          }
        });
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 8 - photos.length;
    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      if (file.type.startsWith('image/')) {
        compressImage(file).then((compressed) => {
          if (compressed) {
            setPhotos((prev) => (prev.length < 8 ? [...prev, compressed] : prev));
          }
        });
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Drag & drop reordering of photos
  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePhotoDragLeave = () => {
    setDragOverIndex(null);
  };

  const handlePhotoDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = sourceIndexStr !== '' ? parseInt(sourceIndexStr, 10) : draggedPhotoIndex;
    setDraggedPhotoIndex(null);

    if (sourceIndex === null || isNaN(sourceIndex) || sourceIndex === targetIndex) return;
    if (!photos[sourceIndex]) return;

    const updated = [...photos];
    const [draggedItem] = updated.splice(sourceIndex, 1);
    const safeTarget = Math.min(targetIndex, updated.length);
    updated.splice(safeTarget, 0, draggedItem);
    setPhotos(updated);
  };

  const movePhoto = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;
    const updated = [...photos];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, item);
    setPhotos(updated);
  };

  // Variations handlers (Unlimited options, flavor, color, size, weight, and individual photos)
  const handleAddVariation = (
    params?: Partial<ProductVariation>
  ) => {
    const nextNum = variations.length + 1;
    const newVar: ProductVariation = {
      id: 'var_' + Date.now() + '_' + nextNum,
      name: params?.name || `Variação ${nextNum}`,
      type: params?.type || 'personalizado',
      flavor: params?.flavor,
      size: params?.size,
      color: params?.color,
      weight: params?.weight,
      photo: params?.photo,
      price: params?.price !== undefined ? Number(params.price) : Number(salePrice) || 0,
      costPrice: params?.costPrice !== undefined ? Number(params.costPrice) : Number(costPrice) || 0,
      stock: params?.stock !== undefined ? Number(params.stock) : Number(stock) || 10,
      sku: params?.sku || (sku ? `${sku}-V${nextNum}` : `VAR-${nextNum}`),
      barcode: params?.barcode || '',
    };
    setVariations((prev) => [...prev, newVar]);
    setHasVariations(true);
  };

  const handleDuplicateVariation = (v: ProductVariation) => {
    const nextNum = variations.length + 1;
    const duplicated: ProductVariation = {
      ...v,
      id: 'var_' + Date.now() + '_' + nextNum,
      name: `${v.name} (Cópia)`,
      sku: v.sku ? `${v.sku}-CP` : '',
    };
    setVariations((prev) => [...prev, duplicated]);
  };

  const handleRemoveVariation = (id: string) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  const handleUpdateVariation = (id: string, field: keyof ProductVariation, value: any) => {
    setVariations(
      variations.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleVariationPhotoUpload = async (id: string, file: File) => {
    try {
      const compressed = await compressImage(file, 800, 0.85);
      handleUpdateVariation(id, 'photo', compressed);
    } catch (e) {
      console.error(e);
      const reader = new FileReader();
      reader.onload = (ev) => {
        handleUpdateVariation(id, 'photo', ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPresetVariations = (
    presetType:
      | 'sabores_gourmet'
      | 'sabores_pet'
      | 'racao_pesos'
      | 'tamanhos'
      | 'cores'
      | 'cor_tamanho'
      | 'volumes'
  ) => {
    let presets: Partial<ProductVariation>[] = [];

    if (presetType === 'sabores_gourmet') {
      presets = [
        { name: 'Sabor: Chocolate Belga', type: 'sabor', flavor: 'Chocolate Belga', price: salePrice },
        { name: 'Sabor: Morango Silvestre', type: 'sabor', flavor: 'Morango Silvestre', price: salePrice },
        { name: 'Sabor: Baunilha de Madagascar', type: 'sabor', flavor: 'Baunilha de Madagascar', price: salePrice },
        { name: 'Sabor: Doce de Leite', type: 'sabor', flavor: 'Doce de Leite', price: salePrice },
      ];
    } else if (presetType === 'sabores_pet') {
      presets = [
        { name: 'Sabor: Frango & Batata Doce', type: 'sabor', flavor: 'Frango & Batata Doce', price: salePrice },
        { name: 'Sabor: Carne & Cereais Integrais', type: 'sabor', flavor: 'Carne & Cereais Integrais', price: salePrice },
        { name: 'Sabor: Salmão com Vegetais', type: 'sabor', flavor: 'Salmão com Vegetais', price: salePrice },
        { name: 'Sabor: Cordeiro & Ervilha', type: 'sabor', flavor: 'Cordeiro & Ervilha', price: salePrice },
      ];
    } else if (presetType === 'racao_pesos') {
      presets = [
        { name: '1kg', type: 'peso', weight: '1kg', price: parseFloat((salePrice * 1).toFixed(2)) },
        { name: '2.5kg', type: 'peso', weight: '2.5kg', price: parseFloat((salePrice * 2.3).toFixed(2)) },
        { name: '10kg', type: 'peso', weight: '10kg', price: parseFloat((salePrice * 6.5).toFixed(2)) },
        { name: '15kg', type: 'peso', weight: '15kg', price: parseFloat((salePrice * 9.2).toFixed(2)) },
      ];
    } else if (presetType === 'tamanhos') {
      presets = [
        { name: 'Tamanho P', type: 'tamanho', size: 'P', price: salePrice },
        { name: 'Tamanho M', type: 'tamanho', size: 'M', price: salePrice },
        { name: 'Tamanho G', type: 'tamanho', size: 'G', price: salePrice },
        { name: 'Tamanho GG', type: 'tamanho', size: 'GG', price: parseFloat((salePrice * 1.1).toFixed(2)) },
      ];
    } else if (presetType === 'cores') {
      presets = [
        { name: 'Cor: Preto', type: 'cor', color: 'Preto', price: salePrice },
        { name: 'Cor: Branco', type: 'cor', color: 'Branco', price: salePrice },
        { name: 'Cor: Azul Marinho', type: 'cor', color: 'Azul Marinho', price: salePrice },
        { name: 'Cor: Vermelho', type: 'cor', color: 'Vermelho', price: salePrice },
      ];
    } else if (presetType === 'cor_tamanho') {
      presets = [
        { name: 'Preto / P', type: 'cor_tamanho', color: 'Preto', size: 'P', price: salePrice },
        { name: 'Preto / M', type: 'cor_tamanho', color: 'Preto', size: 'M', price: salePrice },
        { name: 'Preto / G', type: 'cor_tamanho', color: 'Preto', size: 'G', price: salePrice },
        { name: 'Azul / P', type: 'cor_tamanho', color: 'Azul', size: 'P', price: salePrice },
        { name: 'Azul / M', type: 'cor_tamanho', color: 'Azul', size: 'M', price: salePrice },
        { name: 'Azul / G', type: 'cor_tamanho', color: 'Azul', size: 'G', price: salePrice },
      ];
    } else if (presetType === 'volumes') {
      presets = [
        { name: '250ml', type: 'peso', weight: '250ml', price: parseFloat((salePrice * 0.6).toFixed(2)) },
        { name: '500ml', type: 'peso', weight: '500ml', price: salePrice },
        { name: '1 Litro', type: 'peso', weight: '1L', price: parseFloat((salePrice * 1.85).toFixed(2)) },
      ];
    }

    const newVars: ProductVariation[] = presets.map((p, idx) => ({
      id: 'var_' + Date.now() + '_' + (idx + 1),
      name: p.name || `Opção ${idx + 1}`,
      type: p.type || 'personalizado',
      flavor: p.flavor,
      size: p.size,
      color: p.color,
      weight: p.weight,
      price: p.price !== undefined ? p.price : salePrice,
      costPrice: costPrice,
      stock: stock || 10,
      sku: `${sku}-V${idx + 1}`,
      barcode: '',
    }));
    setVariations(newVars);
    setHasVariations(true);
  };

  // Technical Specifications Template loader
  const handleLoadSpecificationsTemplate = () => {
    let template = '';
    if (selectedNiche === 'petshop' || name.toLowerCase().includes('ração')) {
      template = `• Apresentação / Embalagem: Pacote selado\n• Indicação: Cães / Gatos de todas as raças\n• Composição Básica: Farinha de vísceras de frango, grãos integrais, vitaminas A, D3, E\n• Níveis de Garantia: Proteína Bruta (mín) 26%, Extrato Etéreo (mín) 12%\n• Modo de Conservação: Manter em local seco, fresco e arejado`;
    } else if (selectedNiche === 'farmacia') {
      template = `• Princípio Ativo / DCB: \n• Concentração: \n• Forma Farmacêutica: \n• Modo de Uso: Via oral / Tópico conforme prescrição\n• Contraindicações: Hipersensibilidade aos componentes\n• Registro MS: `;
    } else if (selectedNiche === 'moda') {
      template = `• Composição do Tecido: 100% Algodão Penteado\n• Modelagem: Regular Fit / Conforto\n• Instruções de Lavagem: Lavar à mão ou ciclo delicado, não alvejar\n• País de Fabricação: Brasil`;
    } else {
      template = `• Dimensões (AxLxP): \n• Peso Líquido: \n• Composição / Material: \n• Garantia do Fabricante: 90 dias contra defeitos\n• Conteúdo da Embalagem: `;
    }
    setSpecifications(template);
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
      barcode: barcode.trim(), // Can be blank as requested by user
      department,
      category,
      brand,
      unit,
      description,
      specifications: specifications.trim() || undefined,
      location,
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      photos,
      coverHasWhiteBg,

      // Promoção
      isOnPromotion: Boolean(isOnPromotion && promotionalPrice > 0),
      promotionalPrice: isOnPromotion ? Number(promotionalPrice) || 0 : undefined,
      promotionDiscountPercent: isOnPromotion ? Number(promotionDiscountPercent) || 0 : undefined,
      promotionStartDate: isOnPromotion && promotionStartDate ? promotionStartDate : undefined,
      promotionEndDate: isOnPromotion && promotionEndDate ? promotionEndDate : undefined,

      // Variações (ilimitadas: sabores, tamanhos, cores, pesos, fotos individuais)
      hasVariations: Boolean(hasVariations && variations.length > 0),
      variations: hasVariations && variations.length > 0 ? variations : undefined,

      anvisaRegister: anvisaRegister ? anvisaRegister.trim() : undefined,
      clothingSize: clothingSize ? clothingSize.trim() : undefined,
      clothingColor: clothingColor ? clothingColor.trim() : undefined,
      petSpeciesTarget: (petSpeciesTarget ? petSpeciesTarget.trim() : undefined) as Product['petSpeciesTarget'],
      serialNumberImei: serialNumberImei ? serialNumberImei.trim() : undefined,
      expirationDate: expirationDate ? expirationDate : undefined,
      batchNumber: batchNumber ? batchNumber.trim() : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {initialProduct ? 'Editar Produto' : 'Novo Cadastro de Produto'}
              </h3>
              <p className="text-[11px] text-slate-400">
                MultiVariedades ERP • Galeria Interativa, Variações, Promoções & Ficha Técnica
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* SECTION 1: 8 PHOTOS GRID WITH DRAG & DROP REORDERING */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropFiles}
            className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  Galeria de Fotos do Produto ({photos.length}/8 fotos)
                </h4>
                <p className="text-xs text-slate-500">
                  <strong className="text-amber-700">💡 Arraste e solte</strong> para reordenar as fotos. A 1ª foto é automaticamente a Capa Principal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 cursor-pointer text-xs font-semibold text-slate-800 shadow-2xs hover:bg-amber-50">
                  <input
                    type="checkbox"
                    id="checkbox-cover-white-bg"
                    checked={coverHasWhiteBg}
                    onChange={(e) => setCoverHasWhiteBg(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Capa c/ Fundo Branco</span>
                </label>

                {photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPhotos([])}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 font-bold transition-colors cursor-pointer"
                  >
                    Limpar Fotos
                  </button>
                )}
              </div>
            </div>

            {/* Photos empty state banner */}
            {photos.length === 0 && (
              <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-600">
                  Nenhuma foto selecionada para este produto.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Escolher Fotos do Computador / Celular
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingViaUrl(!isAddingViaUrl)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Inserir Link de Imagem (URL)
                  </button>
                </div>
              </div>
            )}

            {/* URL Input Form */}
            {isAddingViaUrl && (
              <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/foto-do-produto.jpg"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (photoUrlInput.trim()) {
                      handleAddPhoto(photoUrlInput.trim());
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingViaUrl(false)}
                  className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* 8 Photo Slots Grid with HTML5 Drag & Drop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
              {Array.from({ length: 8 }).map((_, index) => {
                const photoUrl = photos[index];
                const isCover = index === 0;
                const isDragTarget = dragOverIndex === index;
                const isBeingDragged = draggedPhotoIndex === index;

                return (
                  <div
                    key={index}
                    draggable={Boolean(photoUrl)}
                    onDragStart={(e) => photoUrl && handlePhotoDragStart(e, index)}
                    onDragOver={(e) => handlePhotoDragOver(e, index)}
                    onDragLeave={handlePhotoDragLeave}
                    onDrop={(e) => handlePhotoDrop(e, index)}
                    className={`relative h-28 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all select-none ${
                      isBeingDragged
                        ? 'opacity-40 scale-95 border-amber-500'
                        : isDragTarget
                        ? 'border-amber-500 bg-amber-100/60 ring-2 ring-amber-400 scale-102 shadow-md'
                        : isCover && photoUrl
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : photoUrl
                        ? 'border-slate-300 bg-white hover:border-slate-400 shadow-2xs'
                        : 'border-dashed border-slate-300 bg-slate-100/70 hover:bg-slate-200/60'
                    } ${photoUrl ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    title={
                      photoUrl
                        ? `Foto ${index + 1} ${isCover ? '(Capa)' : ''} - Arraste para reposicionar`
                        : `Slot ${index + 1} Vazio`
                    }
                  >
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-contain p-1 bg-white"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-1 left-1 right-1 flex items-center justify-between pointer-events-none">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shadow-2xs ${
                              isCover
                                ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-600'
                                : 'bg-slate-900/80 text-white'
                            }`}
                          >
                            {isCover ? '⭐ Capa' : `#${index + 1}`}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(index);
                            }}
                            className="pointer-events-auto p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
                            title="Remover foto"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Drag Handle & Reorder Arrows Footer */}
                        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between bg-slate-950/70 backdrop-blur-2xs rounded-md px-1 py-0.5 text-white">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              movePhoto(index, 'left');
                            }}
                            className={`p-0.5 rounded hover:bg-white/20 transition-colors ${
                              index === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Mover para a esquerda"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>

                          <div className="flex items-center gap-0.5 text-[9px] text-slate-200">
                            <GripVertical className="w-2.5 h-2.5 text-amber-400" />
                            <span className="hidden sm:inline">Arrastar</span>
                          </div>

                          <button
                            type="button"
                            disabled={index >= photos.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              movePhoto(index, 'right');
                            }}
                            className={`p-0.5 rounded hover:bg-white/20 transition-colors ${
                              index >= photos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            title="Mover para a direita"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-400 hover:text-amber-600 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-bold">Slot {index + 1}</span>
                        <span className="text-[9px] text-slate-400">Clique</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {photos.length > 0 && photos.length < 8 && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Adicionar Fotos ({photos.length}/8)
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: BASIC INFO & STRUCTURE */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              1. Informações Básicas do Produto
            </h4>

            {/* SELETOR DE NICHO, DEPARTAMENTO E CATEGORIA */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-600" />
                  Estrutura Mercadológica & Nicho
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {activeNicheInfo.name}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nicho de Varejo
                  </label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => {
                      const newNiche = e.target.value as RetailNicheId;
                      setSelectedNiche(newNiche);
                      const nInfo = RETAIL_NICHES[newNiche];
                      if (nInfo && nInfo.departments.length > 0) {
                        setDepartment(nInfo.departments[0].name);
                        setCategory(nInfo.departments[0].categories[0] || 'Geral');
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                  >
                    {Object.values(RETAIL_NICHES).map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Departamento da Loja *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setDepartment(newDept);
                      const found = activeNicheInfo.departments.find((d) => d.name === newDept);
                      if (found && found.categories.length > 0) {
                        setCategory(found.categories[0]);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                  >
                    {activeNicheInfo.departments.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Categoria Específica *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                  >
                    {activeNicheInfo.departments
                      .find((d) => d.name === department)
                      ?.categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}

                    {customCategories
                      .find((d) => d.department === department)
                      ?.categories.map((catName) => (
                        <option key={catName} value={catName}>
                          {catName} (Personalizada)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Specific niche fields */}
              {selectedNiche === 'farmacia' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Pill className="w-4 h-4 text-emerald-700" />
                    Controle Sanitário & ANVISA / Ministério da Saúde
                  </div>
                  <div>
                    <label className="block font-semibold text-emerald-950 mb-0.5">
                      Registro MS / ANVISA
                    </label>
                    <input
                      type="text"
                      value={anvisaRegister}
                      onChange={(e) => setAnvisaRegister(e.target.value)}
                      placeholder="Ex: 1.0043.0123.001-9"
                      className="w-full px-2.5 py-1 rounded border border-emerald-300 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedNiche === 'moda' && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <Shirt className="w-4 h-4 text-purple-700" />
                    Grade de Tamanho e Cor (Confecção & Calçados)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-purple-950 mb-0.5">
                        Tamanho da Peça (Grade)
                      </label>
                      <input
                        type="text"
                        value={clothingSize}
                        onChange={(e) => setClothingSize(e.target.value)}
                        placeholder="Ex: P, M, G, 42, 44..."
                        className="w-full px-2.5 py-1 rounded border border-purple-300 bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-purple-950 mb-0.5">
                        Cor / Estampa
                      </label>
                      <input
                        type="text"
                        value={clothingColor}
                        onChange={(e) => setClothingColor(e.target.value)}
                        placeholder="Ex: Azul Marinho, Preto, Floral"
                        className="w-full px-2.5 py-1 rounded border border-purple-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedNiche === 'petshop' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Dog className="w-4 h-4 text-amber-700" />
                    Espécie-Alvo & Cuidados Veterinários
                  </div>
                  <div>
                    <label className="block font-semibold text-amber-950 mb-0.5">
                      Indicação de Espécie Animal
                    </label>
                    <select
                      value={petSpeciesTarget}
                      onChange={(e) => setPetSpeciesTarget(e.target.value)}
                      className="w-full px-2.5 py-1 rounded border border-amber-300 bg-white text-xs"
                    >
                      <option value="Cães">Cães (Filhote, Adulto, Sênior)</option>
                      <option value="Gatos">Gatos (Filhote, Adulto, Castrado)</option>
                      <option value="Cães e Gatos">Cães e Gatos (Uso Geral)</option>
                      <option value="Pássaros & Aves">Pássaros & Aves</option>
                      <option value="Peixes & Aquários">Peixes & Aquários</option>
                      <option value="Roedores">Roedores & Pequenos Animais</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Product Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título do Anúncio / Nome do Produto *
              </label>
              <input
                type="text"
                required
                id="input-prod-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ração Golden Especial Cães Adultos Frango & Arroz ou Paracetamol 750mg 20 Comprimidos"
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            {/* BARCODE & SKU (CNPJ COMBINADO + BLANK BARCODE) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Barcode field: starts blank to avoid influencing typist */}
              <div className="md:col-span-6">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-prod-barcode" className="block text-xs font-semibold text-slate-700">
                    Código de Barras (EAN-13)
                  </label>
                  {isBarcodeValid ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> EAN-13 Válido
                    </span>
                  ) : barcode ? (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Código Personalizado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Em branco (digitar ou bipar)
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    id="input-prod-barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Em branco para bipar com leitor ou digitar..."
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAIGenerateBarcode}
                    disabled={isQuickGeneratingBarcode}
                    title="Gerar código EAN-13 automático"
                    className="p-1.5 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAIBarcodeModalOpen(true)}
                    title="Assistente de Código de Barras IA"
                    className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>IA EAN</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Vem em branco para não influenciar o digitador. Use o leitor de código de barras ou gere se for produto próprio.
                </span>
              </div>

              {/* SKU: Combined 5 first numbers of CNPJ + 4 digits sequence = 9 numbers total */}
              <div className="md:col-span-6">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-prod-sku" className="block text-xs font-semibold text-slate-700">
                    Código SKU / Referência (9 Dígitos: CNPJ + Seq) *
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateStandardSku}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                    title="Recalcular código combinando os 5 primeiros dígitos do CNPJ + sequência numérica"
                  >
                    🔄 Recalcular SKU
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    id="input-prod-sku"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ex: 123450001 (9 dígitos)"
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600 flex items-center">
                    {sku.length} dígitos
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Formato padrão: 5 primeiros números do CNPJ ({((company?.cnpj || '').replace(/\D/g, '') + '00000').slice(0, 5)}) + sequência a partir do 1 até completar 9 números.
                </span>
              </div>
            </div>

            {/* Brand, Unit and Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="input-prod-brand" className="block text-xs font-semibold text-slate-700 mb-1">
                  Marca / Fabricante
                </label>
                <input
                  type="text"
                  id="input-prod-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Premier Pet, Medley, Bosch"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label htmlFor="select-prod-unit" className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade de Medida
                </label>
                <select
                  value={unit}
                  id="select-prod-unit"
                  onChange={(e) => setUnit(e.target.value as Product['unit'])}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white font-bold"
                >
                  <option value="UN">UN (Unidade)</option>
                  <option value="CX">CX (Caixa)</option>
                  <option value="KG">KG (Quilo)</option>
                  <option value="G">G (Grama)</option>
                  <option value="PCT">PCT (Pacote)</option>
                  <option value="LT">LT (Litro / Galão)</option>
                  <option value="ML">ML (Mililitro)</option>
                  <option value="MT">MT (Metro)</option>
                  <option value="PAR">PAR (Par)</option>
                  <option value="ROLO">ROLO (Rolo / Fita)</option>
                  <option value="FD">FD (Fardo)</option>
                  <option value="SC">SC (Saco)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localização no Estoque / Prateleira
                </label>
                <input
                  type="text"
                  id="input-prod-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Corredor 3 - Prateleira B2"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            {/* SEPARATED DESCRIPTION & TECHNICAL SPECIFICATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Commercial Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-prod-desc" className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    Descrição Geral do Produto
                  </label>
                  <span className="text-[10px] text-slate-400">Texto para clientes & vitrine</span>
                </div>
                <textarea
                  id="input-prod-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as qualidades, benefícios, apresentação comercial do produto..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white resize-y"
                />
              </div>

              {/* Technical Specifications */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-prod-specs" className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Especificações Técnicas / Ficha Técnica
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSpecificationsTemplate}
                    className="text-[10px] font-bold text-blue-700 hover:text-blue-800 underline cursor-pointer"
                  >
                    + Carregar Modelo
                  </button>
                </div>
                <textarea
                  id="input-prod-specs"
                  rows={4}
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="• Dimensões (AxLxP):&#10;• Peso Líquido:&#10;• Composição / Ingredientes:&#10;• Modo de Usar:&#10;• Garantia do Fabricante:"
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white resize-y"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PRODUCT VARIATIONS (UP TO 5 OPTIONS) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-600" />
                  2. Variações do Produto (Até 5 opções - ex: 1kg, 2kg, 3kg, tamanhos ou sabores)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Permite cadastrar o mesmo produto com pesos, tamanhos ou embalagens diferentes no mesmo item.
                </p>
              </div>

              {/* Toggle variations */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 cursor-pointer text-xs font-bold text-purple-900 hover:bg-purple-100 transition-colors">
                <input
                  type="checkbox"
                  checked={hasVariations}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasVariations(checked);
                    if (checked && variations.length === 0) {
                      handleAddVariation({ name: '1kg', price: Number(salePrice) || 0, stock: Number(stock) || 10 });
                    }
                  }}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>Ativar Variações</span>
              </label>
            </div>

            {hasVariations && (
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-4">
                {/* Header & Presets */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Modelos de Preenchimento Rápido:
                    </span>
                    <span className="text-[11px] font-semibold text-purple-800 bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                      {variations.length} {variations.length === 1 ? 'variação cadastrada' : 'variações cadastradas'} (Sem limite)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariations('sabores_gourmet')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                      title="Incluir sabores de alimentos / doces"
                    >
                      🍓 Sabores Gourmet
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariations('sabores_pet')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                      title="Incluir sabores de rações / petiscos"
                    >
                      🍖 Sabores Pet (Frango, Carne, Salmão)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariations('racao_pesos')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      ⚖️ Pesos (1kg, 2.5kg, 10kg, 15kg)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariations('tamanhos')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      👕 Tamanhos (P, M, G, GG)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariations('cores')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      🎨 Cores (Preto, Branco, Azul, Vermelho)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariations('cor_tamanho')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      🔀 Cores + Tamanhos Combinados
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariations('volumes')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      🧴 Volumes (250ml, 500ml, 1L)
                    </button>
                  </div>
                </div>

                {/* Quick Add Buttons by Type */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white/90 rounded-xl border border-purple-200/80">
                  <span className="text-[11px] font-bold text-slate-700">Adicionar manualmente:</span>
                  <button
                    type="button"
                    onClick={() => handleAddVariation({ type: 'sabor', name: 'Novo Sabor', flavor: 'Sabor' })}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    🍓 + Sabor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariation({ type: 'tamanho', name: 'Tamanho G', size: 'G' })}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    👕 + Tamanho
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariation({ type: 'cor', name: 'Cor Azul', color: 'Azul' })}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    🎨 + Cor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariation({ type: 'peso', name: '15kg', weight: '15kg' })}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    ⚖️ + Peso / Volume
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariation({ type: 'cor_tamanho', name: 'Azul / G', color: 'Azul', size: 'G' })}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    🔀 + Cor & Tamanho
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariation({ type: 'personalizado', name: `Variação ${variations.length + 1}` })}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ml-auto shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Outra Variação Livre
                  </button>
                </div>

                {/* Variations List */}
                <div className="space-y-3">
                  {variations.map((v, index) => (
                    <div
                      key={v.id}
                      className="p-3 bg-white border border-purple-200/90 rounded-xl shadow-xs hover:border-purple-300 transition-all space-y-2.5"
                    >
                      {/* Top Bar of Variation: Photo, Type, Name, Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 font-black text-[11px] flex items-center justify-center">
                            {index + 1}
                          </span>

                          {/* Variation Type Selector */}
                          <select
                            value={v.type || 'personalizado'}
                            onChange={(e) => handleUpdateVariation(v.id, 'type', e.target.value)}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200"
                          >
                            <option value="sabor">🍓 Sabor</option>
                            <option value="tamanho">👕 Tamanho</option>
                            <option value="cor">🎨 Cor</option>
                            <option value="peso">⚖️ Peso / Volume</option>
                            <option value="cor_tamanho">🔀 Cor + Tamanho</option>
                            <option value="personalizado">✏️ Personalizado</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicateVariation(v)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Duplicar esta variação"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Duplicar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariation(v.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Excluir esta variação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Excluir</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Fields Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Photo column */}
                        <div className="sm:col-span-2 flex flex-col items-center">
                          <div className="relative group w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                            {v.photo ? (
                              <img
                                src={v.photo}
                                alt={v.name}
                                className="w-full h-full object-cover"
                              />
                            ) : photos[0] ? (
                              <img
                                src={photos[0]}
                                alt="Foto do Produto"
                                className="w-full h-full object-cover opacity-40 grayscale"
                                title="Usando foto principal do produto"
                              />
                            ) : (
                              <Camera className="w-5 h-5 text-slate-400" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[9px] font-bold p-1 text-center">
                              <Upload className="w-3 h-3 mb-0.5" />
                              Foto
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariationPhotoUpload(v.id, file);
                                }}
                              />
                            </label>
                          </div>
                          <span className="text-[9px] text-slate-500 font-medium mt-1">
                            {v.photo ? 'Foto Própria' : 'Foto Padrão'}
                          </span>
                          {v.photo && (
                            <button
                              type="button"
                              onClick={() => handleUpdateVariation(v.id, 'photo', undefined)}
                              className="text-[9px] text-rose-500 hover:underline cursor-pointer"
                            >
                              Remover
                            </button>
                          )}
                        </div>

                        {/* Name & Specific Attributes */}
                        <div className="sm:col-span-4 space-y-1.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Nome da Variação (Exibido no PDV/Cupom) *
                            </label>
                            <input
                              type="text"
                              required
                              value={v.name}
                              onChange={(e) => handleUpdateVariation(v.id, 'name', e.target.value)}
                              placeholder="Ex: Chocolate Suíço, Azul / G, 15kg..."
                              className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 rounded-lg border border-slate-300 focus:ring-1 focus:ring-purple-500"
                            />
                          </div>

                          {/* Extra attributes depending on type */}
                          {v.type === 'sabor' && (
                            <div>
                              <input
                                type="text"
                                value={v.flavor || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateVariation(v.id, 'flavor', val);
                                  handleUpdateVariation(v.id, 'name', val ? `Sabor: ${val}` : 'Sabor');
                                }}
                                placeholder="Digitar Sabor (ex: Chocolate Belga, Frango com Arroz, Morango...)"
                                className="w-full px-2 py-1 text-[11px] rounded border border-amber-300 bg-amber-50/50"
                              />
                            </div>
                          )}

                          {v.type === 'tamanho' && (
                            <div>
                              <input
                                type="text"
                                value={v.size || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateVariation(v.id, 'size', val);
                                  handleUpdateVariation(v.id, 'name', val ? `Tamanho ${val}` : 'Tamanho');
                                }}
                                placeholder="Digitar Tamanho (ex: P, M, G, GG, 38, 40, 42, Infantil 10...)"
                                className="w-full px-2 py-1 text-[11px] rounded border border-blue-300 bg-blue-50/50"
                              />
                            </div>
                          )}

                          {v.type === 'cor' && (
                            <div>
                              <input
                                type="text"
                                value={v.color || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateVariation(v.id, 'color', val);
                                  handleUpdateVariation(v.id, 'name', val ? `Cor: ${val}` : 'Cor');
                                }}
                                placeholder="Digitar Cor (ex: Azul Marinho, Preto Fosco, Vermelho Carmim...)"
                                className="w-full px-2 py-1 text-[11px] rounded border border-rose-300 bg-rose-50/50"
                              />
                            </div>
                          )}

                          {v.type === 'peso' && (
                            <div>
                              <input
                                type="text"
                                value={v.weight || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleUpdateVariation(v.id, 'weight', val);
                                  handleUpdateVariation(v.id, 'name', val || 'Peso / Volume');
                                }}
                                placeholder="Digitar Peso / Volume (ex: 500g, 1kg, 2.5kg, 15kg, 250ml, 1L...)"
                                className="w-full px-2 py-1 text-[11px] rounded border border-emerald-300 bg-emerald-50/50"
                              />
                            </div>
                          )}

                          {v.type === 'cor_tamanho' && (
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                value={v.color || ''}
                                onChange={(e) => {
                                  const cVal = e.target.value;
                                  handleUpdateVariation(v.id, 'color', cVal);
                                  handleUpdateVariation(v.id, 'name', `${cVal || 'Cor'} / ${v.size || 'Tam'}`);
                                }}
                                placeholder="Cor (ex: Preto)"
                                className="w-full px-2 py-1 text-[11px] rounded border border-indigo-200 bg-indigo-50/40"
                              />
                              <input
                                type="text"
                                value={v.size || ''}
                                onChange={(e) => {
                                  const sVal = e.target.value;
                                  handleUpdateVariation(v.id, 'size', sVal);
                                  handleUpdateVariation(v.id, 'name', `${v.color || 'Cor'} / ${sVal || 'Tam'}`);
                                }}
                                placeholder="Tamanho (ex: G)"
                                className="w-full px-2 py-1 text-[11px] rounded border border-indigo-200 bg-indigo-50/40"
                              />
                            </div>
                          )}
                        </div>

                        {/* Price & Cost */}
                        <div className="sm:col-span-3 grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Preço Venda (R$) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              required
                              value={v.price}
                              onChange={(e) => handleUpdateVariation(v.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-xs font-bold text-emerald-700 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Custo (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={v.costPrice || ''}
                              onChange={(e) => handleUpdateVariation(v.id, 'costPrice', parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300"
                            />
                          </div>
                        </div>

                        {/* Stock & Codes */}
                        <div className="sm:col-span-3 grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Estoque (Qtd) *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariation(v.id, 'stock', parseInt(e.target.value, 10) || 0)}
                              className="w-full px-2 py-1.5 text-xs font-bold text-slate-800 rounded-lg border border-slate-300"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Código / SKU
                            </label>
                            <input
                              type="text"
                              value={v.sku || ''}
                              onChange={(e) => handleUpdateVariation(v.id, 'sku', e.target.value)}
                              placeholder="SKU"
                              className="w-full px-2 py-1.5 text-[11px] font-mono rounded-lg border border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Add button */}
                <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                  <span className="text-xs text-purple-950 font-semibold">
                    Total: <strong>{variations.length} {variations.length === 1 ? 'variação' : 'variações'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddVariation({ name: `Variação ${variations.length + 1}` })}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Mais Variações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: PROMOTION / SPECIAL OFFER */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  3. Promoção & Preço de Oferta Especial
                </h4>
                <p className="text-[11px] text-slate-500">
                  Destaque o produto no PDV e catálogo com etiqueta de promoção e desconto temporário.
                </p>
              </div>

              {/* Toggle Promotion */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer text-xs font-bold text-rose-900 hover:bg-rose-100 transition-colors">
                <input
                  type="checkbox"
                  checked={isOnPromotion}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsOnPromotion(checked);
                    if (checked && (!promotionalPrice || promotionalPrice >= salePrice)) {
                      const promoDefault = parseFloat((salePrice * 0.9).toFixed(2));
                      setPromotionalPrice(promoDefault);
                      setPromotionDiscountPercent(10);
                    }
                  }}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span>Ativar Preço Promocional</span>
              </label>
            </div>

            {isOnPromotion && (
              <div className="p-3.5 bg-rose-50/40 border border-rose-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-rose-950 mb-1">
                      Preço Promocional (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required={isOnPromotion}
                      value={promotionalPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setPromotionalPrice(val);
                        if (salePrice > 0 && val > 0) {
                          const disc = ((salePrice - val) / salePrice) * 100;
                          setPromotionDiscountPercent(parseFloat(disc.toFixed(1)));
                        }
                      }}
                      className="w-full px-3 py-2 text-sm font-black text-rose-700 rounded-lg border border-rose-300 focus:ring-2 focus:ring-rose-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Desconto da Promoção (%)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="99"
                        value={promotionDiscountPercent}
                        onChange={(e) => {
                          const pct = parseFloat(e.target.value) || 0;
                          setPromotionDiscountPercent(pct);
                          if (salePrice > 0) {
                            const newPromo = salePrice * (1 - pct / 100);
                            setPromotionalPrice(parseFloat(newPromo.toFixed(2)));
                          }
                        }}
                        className="w-full px-3 py-2 text-sm font-bold text-slate-800 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                      <span className="font-bold text-slate-600 text-sm">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data Início da Promoção
                    </label>
                    <input
                      type="date"
                      value={promotionStartDate}
                      onChange={(e) => setPromotionStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data Fim / Validade da Oferta
                    </label>
                    <input
                      type="date"
                      value={promotionEndDate}
                      onChange={(e) => setPromotionEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Live Promotion Badge */}
                <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 line-through">
                      Preço Normal: R$ {salePrice.toFixed(2)}
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="font-black text-rose-700 text-sm">
                      Preço de Oferta: R$ {promotionalPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                    Economia de {promotionDiscountPercent.toFixed(1)}% (R$ {(salePrice - promotionalPrice).toFixed(2)} por item)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: PRICING & STOCK */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              4. Preços Regulares, Margem & Estoque
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
                  Preço Normal de Venda (R$) *
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

          {/* SECTION 6: EXPIRATION DATE & BATCH */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                5. Controle de Data de Validade & Lote
              </h4>
              <span className="text-[11px] text-slate-500">
                Alimentos, pet shop, farmácia, tintas e químicos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Data de Validade (Vencimento)
                </label>
                <input
                  type="date"
                  id="input-expiration-date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Número do Lote de Fabricação
                </label>
                <input
                  type="text"
                  id="input-batch-number"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Ex: LOTE-2026-X49"
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: FISCAL / SEFAZ DATA */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              6. Dados Fiscais para Emissão de NF-e e NFC-e (SEFAZ)
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
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-product"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Produto
            </button>
          </div>
        </form>
      </div>

      {/* AI Barcode Generator Modal */}
      <AIBarcodeGeneratorModal
        isOpen={isAIBarcodeModalOpen}
        onClose={() => setIsAIBarcodeModalOpen(false)}
        productName={name}
        category={category}
        unit={unit}
        brand={brand}
        salePrice={salePrice}
        onApplyBarcode={handleApplyAIGeneratedBarcode}
      />
    </div>
  );
};
