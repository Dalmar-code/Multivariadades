/**
 * GS1 Brasil EAN-13 Barcode Algorithm & AI Generator Utilities
 */

// Modulo 10 Check Digit calculation for EAN-13
export function calculateEan13CheckDigit(base12: string): number {
  const digits = base12.replace(/\D/g, '').slice(0, 12);
  if (digits.length < 12) return 0;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits[i], 10) || 0;
    // Odd positions (0, 2, 4...) weight 1, Even positions (1, 3, 5...) weight 3
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

// Check if a 13-digit string is a mathematically valid EAN-13
export function isValidEan13(code: string): boolean {
  const clean = (code || '').replace(/\D/g, '');
  if (clean.length !== 13) return false;

  const base12 = clean.slice(0, 12);
  const expectedCheck = calculateEan13CheckDigit(base12);
  const actualCheck = parseInt(clean[12], 10);
  return expectedCheck === actualCheck;
}

// Generate valid GS1 EAN-13 with specific prefix
export function generateLocalEan13(
  prefix: 'granel' | 'fracionado' | 'proprio' | 'linear' | 'padrao' = 'granel'
): { barcode: string; skuPrefix: string; typeLabel: string; advice: string } {
  let prefixDigits = '20'; // GS1 Standard restricted store prefix for bulk/weight
  let skuPrefix = 'GRA';
  let typeLabel = 'EAN-13 Venda a Granel / Balança (Prefixo 20)';
  let advice = 'Ideal para itens vendidos por peso (KG) ou quantidade no balcão (pregos, parafusos, areia).';

  if (prefix === 'fracionado') {
    prefixDigits = '22';
    skuPrefix = 'FRAC';
    typeLabel = 'EAN-13 Fracionado de Pacote / Fardo (Prefixo 22)';
    advice = 'Ideal para produtos que chegaram em caixas/pacotes de 50 ou 100 peças e serão vendidos avulsos.';
  } else if (prefix === 'linear') {
    prefixDigits = '25';
    skuPrefix = 'MET';
    typeLabel = 'EAN-13 Venda por Metro / Medida (Prefixo 25)';
    advice = 'Ideal para cabos elétricos, mangueiras, correntes e fitas vendidas fracionadas por metro.';
  } else if (prefix === 'proprio' || prefix === 'padrao') {
    prefixDigits = '789';
    skuPrefix = 'VAR';
    typeLabel = 'EAN-13 Varejo Interno / Marca Própria (Prefixo 789)';
    advice = 'Ideal para produtos de fabricação própria, kits montados na loja ou sem código do fornecedor.';
  }

  const remainingLength = 12 - prefixDigits.length;
  let randomBody = '';
  for (let i = 0; i < remainingLength; i++) {
    randomBody += Math.floor(Math.random() * 10).toString();
  }

  const base12 = `${prefixDigits}${randomBody}`;
  const checkDigit = calculateEan13CheckDigit(base12);
  const barcode = `${base12}${checkDigit}`;

  return {
    barcode,
    skuPrefix,
    typeLabel,
    advice,
  };
}

export interface AIGeneratedBarcodeResult {
  barcode: string;
  sku: string;
  barcodeType: string;
  explanation: string;
  packagingAdvice: string;
  isCheckDigitValid: boolean;
  source: 'ai' | 'local';
}

// Request AI generation from server with instant fallback
export async function requestAIGeneratedBarcode(params: {
  productName: string;
  category: string;
  unit: string;
  brand?: string;
  saleType: 'granel' | 'fracionado' | 'proprio' | 'linear' | 'auto';
  customContext?: string;
}): Promise<AIGeneratedBarcodeResult> {
  try {
    const response = await fetch('/api/gemini/generate-barcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.barcode && data.barcode.length === 13) {
        return {
          barcode: data.barcode,
          sku: data.sku || `${params.unit}-${Math.floor(100 + Math.random() * 900)}`,
          barcodeType: data.barcodeType || 'EAN-13 Gerado por IA',
          explanation: data.explanation || 'Código EAN-13 gerado e validado com padrão GS1 Brasil.',
          packagingAdvice: data.packagingAdvice || 'Imprima a etiqueta com código de barras para identificação e leitura ágil.',
          isCheckDigitValid: isValidEan13(data.barcode),
          source: 'ai',
        };
      }
    }
  } catch (err) {
    console.warn('AI Barcode server request failed, utilizing local GS1 engine:', err);
  }

  // Fallback to local high-precision GS1 generator
  const local = generateLocalEan13(
    params.saleType === 'auto' ? (params.unit === 'KG' ? 'granel' : 'fracionado') : params.saleType
  );
  const cleanName = (params.productName || 'PROD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
  const fallbackSku = `${local.skuPrefix}-${cleanName}-${params.unit}`;

  return {
    barcode: local.barcode,
    sku: fallbackSku,
    barcodeType: local.typeLabel,
    explanation: `Código EAN-13 gerado com algoritmo GS1 Brasil padrão Módulo 10 para ${params.productName || 'produto sem código'}.`,
    packagingAdvice: local.advice,
    isCheckDigitValid: true,
    source: 'local',
  };
}

/**
 * Standard EAN-13 binary pattern for SVG rendering
 */
const L_CODES = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011'
];
const G_CODES = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111'
];
const R_CODES = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100'
];

const FIRST_DIGIT_STRUCTURE = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
];

export function getEan13BinaryPattern(barcode: string): string {
  const clean = barcode.replace(/\D/g, '').padEnd(13, '0').slice(0, 13);
  const firstDigit = parseInt(clean[0], 10) || 0;
  const leftStructure = FIRST_DIGIT_STRUCTURE[firstDigit] || 'LLLLLL';

  let pattern = '101'; // Left guard

  // Left 6 digits (indexes 1 to 6)
  for (let i = 1; i <= 6; i++) {
    const digit = parseInt(clean[i], 10) || 0;
    const mode = leftStructure[i - 1];
    pattern += mode === 'G' ? G_CODES[digit] : L_CODES[digit];
  }

  pattern += '01010'; // Center guard

  // Right 6 digits (indexes 7 to 12)
  for (let i = 7; i <= 12; i++) {
    const digit = parseInt(clean[i], 10) || 0;
    pattern += R_CODES[digit];
  }

  pattern += '101'; // Right guard
  return pattern;
}
