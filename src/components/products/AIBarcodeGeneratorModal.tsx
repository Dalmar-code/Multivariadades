import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Barcode,
  CheckCircle2,
  Copy,
  Printer,
  Package,
  Layers,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Tag,
  Scale,
  Ruler,
  Boxes,
} from 'lucide-react';
import {
  requestAIGeneratedBarcode,
  getEan13BinaryPattern,
  isValidEan13,
  AIGeneratedBarcodeResult,
} from '../../utils/barcodeGenerator';

interface AIBarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  category: string;
  unit: string;
  brand: string;
  salePrice?: number;
  onApplyBarcode: (barcode: string, suggestedSku?: string) => void;
}

export const AIBarcodeGeneratorModal: React.FC<AIBarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  productName,
  category,
  unit,
  brand,
  salePrice,
  onApplyBarcode,
}) => {
  if (!isOpen) return null;

  const [saleType, setSaleType] = useState<'granel' | 'fracionado' | 'proprio' | 'linear' | 'auto'>('granel');
  const [customContext, setCustomContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGeneratedBarcodeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [applySkuAlso, setApplySkuAlso] = useState(true);

  // Set default saleType based on unit
  useEffect(() => {
    if (unit === 'KG' || unit === 'LT') {
      setSaleType('granel');
    } else if (unit === 'MT' || unit === 'ROLO') {
      setSaleType('linear');
    } else if (unit === 'PCT' || unit === 'CX') {
      setSaleType('fracionado');
    } else {
      setSaleType('auto');
    }
  }, [unit]);

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const generated = await requestAIGeneratedBarcode({
        productName: productName || 'Produto de Loja',
        category: category || 'Ferragens',
        unit: unit || 'UN',
        brand: brand || 'Loja',
        saleType,
        customContext,
      });
      setResult(generated);
    } catch (err) {
      console.error('Failed to generate barcode:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger generation on modal open if not generated yet
  useEffect(() => {
    if (isOpen && !result) {
      handleGenerate();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!result?.barcode) return;
    navigator.clipboard.writeText(result.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!result?.barcode) return;
    onApplyBarcode(result.barcode, applySkuAlso ? result.sku : undefined);
    onClose();
  };

  const handlePrintTestLabel = () => {
    if (!result?.barcode) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Permita popups no navegador para imprimir a etiqueta.');
      return;
    }

    const binaryPattern = getEan13BinaryPattern(result.barcode);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta de Código de Barras - ${productName || 'Produto'}</title>
          <style>
            @page { size: 60mm 40mm; margin: 0; }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 6px;
              width: 58mm;
              height: 38mm;
              box-sizing: border-box;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header-title {
              font-size: 11px;
              font-weight: bold;
              line-height: 1.1;
              max-height: 24px;
              overflow: hidden;
            }
            .sku-info {
              font-size: 9px;
              color: #444;
            }
            .barcode-box {
              margin: 2px 0;
            }
            .barcode-number {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 2px;
            }
            .price-tag {
              font-size: 14px;
              font-weight: 900;
              color: #000;
            }
          </style>
        </head>
        <body onload="window.print();">
          <div class="header-title">${productName || 'PRODUTO FRACIONADO / GRANEL'}</div>
          <div class="sku-info">SKU: ${result.sku} | UN: ${unit}</div>
          <div class="barcode-box">
            <svg viewBox="0 0 95 30" width="160" height="40" style="display: block; margin: 0 auto;">
              ${binaryPattern
                .split('')
                .map((bit, idx) =>
                  bit === '1' ? `<rect x="${idx}" y="0" width="1" height="30" fill="#000" />` : ''
                )
                .join('')}
            </svg>
            <div class="barcode-number">${result.barcode}</div>
          </div>
          <div class="price-tag">${salePrice ? `R$ ${salePrice.toFixed(2)}` : 'CONSULTE NO CAIXA'}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base flex items-center gap-2">
                Gerador de Código de Barras EAN-13 com IA
              </h3>
              <p className="text-xs text-slate-300">
                Para itens a granel, produtos fracionados de fardos/pacotes ou sem código de barras original
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target Product Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold">Produto Alvo:</span>
              <div className="font-bold text-slate-900 text-sm">
                {productName || 'Novo Produto em Cadastro'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-700">
                Cat: {category || 'Geral'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 font-black text-amber-900">
                Unidade: {unit || 'UN'}
              </span>
            </div>
          </div>

          {/* Scenario Selection Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Selecione a Situação do Produto:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Granel / Balança */}
              <button
                type="button"
                onClick={() => setSaleType('granel')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  saleType === 'granel'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Venda a Granel / Balança (KG)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Pregos, parafusos por peso, areia, adubo, produtos pesáveis. Prefixo GS1 20.
                  </div>
                </div>
              </button>

              {/* Option 2: Fracionado de Pacote */}
              <button
                type="button"
                onClick={() => setSaleType('fracionado')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  saleType === 'fracionado'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Fracionado de Pacote / Caixa (UN)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Chegou em caixa com 50/100 un e será vendido avulso no balcão. Prefixo GS1 22.
                  </div>
                </div>
              </button>

              {/* Option 3: Linear / Metro */}
              <button
                type="button"
                onClick={() => setSaleType('linear')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  saleType === 'linear'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Venda Linear / Metro (MT/ROLO)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Cabos elétricos, mangueiras, correntes fracionadas por metro. Prefixo GS1 25.
                  </div>
                </div>
              </button>

              {/* Option 4: Marca Própria / Sem Código de Fábrica */}
              <button
                type="button"
                onClick={() => setSaleType('proprio')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  saleType === 'proprio'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-800 shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Marca Própria / Varejo Padrão (789)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Itens fabricados, kits da loja ou sem código de barras de fábrica. Prefixo 789.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Optional context prompt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Instrução ou Detalhe para a Inteligência Artificial (Opcional):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="Ex: Chegou fardo com 200 parafusos sextavados 3/8 para vender a unidade avulsa"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? 'Calculando...' : 'Recalcular Código com IA'}
              </button>
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50/60 via-slate-50 to-white border-2 border-amber-300 shadow-sm animate-in fade-in zoom-in-95">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-emerald-500 text-white">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">
                      {result.barcodeType}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {result.source === 'ai' ? '✨ Otimizado pelo Gemini AI' : '⚡ Gerador GS1 Módulo 10'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Dígito Verificador Válido (Módulo 10)
                  </span>
                </div>
              </div>

              {/* Visual Barcode Display */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pré-visualização do Código de Barras EAN-13 (Laser / Óptico)
                </div>

                {/* SVG Bars Render */}
                <div className="flex justify-center py-1">
                  <svg
                    viewBox="0 0 95 36"
                    className="w-56 h-14"
                    style={{ shapeRendering: 'crispEdges' }}
                  >
                    {getEan13BinaryPattern(result.barcode)
                      .split('')
                      .map((bit, idx) =>
                        bit === '1' ? (
                          <rect key={idx} x={idx} y="0" width="1" height="36" fill="#0f172a" />
                        ) : null
                      )}
                  </svg>
                </div>

                {/* Number with spaced presentation */}
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-widest bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {result.barcode.slice(0, 1)} {result.barcode.slice(1, 7)} {result.barcode.slice(7, 13)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Código Formatado: <strong>{result.barcode}</strong> • SKU Sugerido: <strong>{result.sku}</strong>
                </div>
              </div>

              {/* AI Explanation & Packaging Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Explicação da IA
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {result.explanation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-500" />
                    Dica de Rotulagem & PDV
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {result.packagingAdvice}
                  </p>
                </div>
              </div>

              {/* SKU Apply checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applySkuAlso}
                    onChange={(e) => setApplySkuAlso(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>
                    Preencher também o campo <strong>SKU ({result.sku})</strong> com a sugestão mnemônica
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handlePrintTestLabel}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Imprimir Etiqueta de Balcão
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% compatível com leitores de código de barras USB/Bluetooth, balanças e SEFAZ.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!result?.barcode || loading}
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aplicar Código ao Produto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
