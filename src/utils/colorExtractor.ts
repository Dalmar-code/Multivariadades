/**
 * Utility for extracting dominant brand colors from uploaded company logo images
 * and applying dynamic theme variables across the application.
 */

export interface ExtractedPalette {
  primary: string;
  secondary: string;
  accent: string;
  palette: string[];
}

export const PRESET_THEMES = [
  {
    name: 'Azul Royal (Alta Visibilidade - Padrão)',
    primary: '#1d4ed8',
    secondary: '#0f172a',
    accent: '#2563eb',
  },
  {
    name: 'Verde Esmeralda Intenso',
    primary: '#059669',
    secondary: '#064e3b',
    accent: '#10b981',
  },
  {
    name: 'Preto & Grafite Alto Contraste',
    primary: '#0f172a',
    secondary: '#020617',
    accent: '#334155',
  },
  {
    name: 'Índigo Elétrico',
    primary: '#4f46e5',
    secondary: '#1e1b4b',
    accent: '#6366f1',
  },
  {
    name: 'Vermelho Corporativo',
    primary: '#dc2626',
    secondary: '#18181b',
    accent: '#ef4444',
  },
  {
    name: 'Âmbar Varejo (Clássico)',
    primary: '#d97706',
    secondary: '#0f172a',
    accent: '#b45309',
  },
];

// Helper to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper to calculate color luminance
function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Helper to determine optimal high-contrast text color (black or white)
export function getContrastTextColor(hex?: string): string {
  if (!hex) return '#ffffff';
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 160 ? '#020617' : '#ffffff';
}

// Helper to calculate color saturation
function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

// Convert Hex to RGB object
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

// Calculate lighter or darker shades
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 + percent / 100;
  return rgbToHex(
    Math.min(255, rgb.r * factor),
    Math.min(255, rgb.g * factor),
    Math.min(255, rgb.b * factor)
  );
}

// Extract dominant colors using Canvas Pixel sampling
export function extractColorsFromImage(imageSrc: string): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    // Default fallback
    const fallback: ExtractedPalette = {
      primary: '#f59e0b',
      secondary: '#0f172a',
      accent: '#d97706',
      palette: ['#f59e0b', '#d97706', '#b45309', '#0f172a', '#334155'],
    };

    if (!imageSrc) {
      resolve(fallback);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(fallback);
          return;
        }

        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        const colorBuckets: { [hex: string]: { count: number; r: number; g: number; b: number; sat: number; lum: number } } = {};

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip transparent or near-transparent pixels
          if (a < 128) continue;

          const lum = getLuminance(r, g, b);
          const sat = getSaturation(r, g, b);

          // Skip pure whites/light grays (> 240) and pure blacks (< 15) for brand color identification
          if (lum > 242 || lum < 15) continue;

          // Quantize color to 16-step buckets
          const qr = Math.round(r / 20) * 20;
          const qg = Math.round(g / 20) * 20;
          const qb = Math.round(b / 20) * 20;
          const hex = rgbToHex(qr, qg, qb);

          if (!colorBuckets[hex]) {
            colorBuckets[hex] = { count: 0, r, g, b, sat, lum };
          }
          // Weight saturated colors higher
          colorBuckets[hex].count += 1 + sat * 2;
        }

        const sortedColors = Object.entries(colorBuckets)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([hex]) => hex);

        if (sortedColors.length === 0) {
          resolve(fallback);
          return;
        }

        // Pick primary: most vibrant/prominent
        const primary = sortedColors[0];
        // Pick secondary: darker contrast or second bucket
        const secondary = sortedColors[1] || adjustBrightness(primary, -40);
        // Pick accent: third or brightened primary
        const accent = sortedColors[2] || adjustBrightness(primary, 20);

        const palette = sortedColors.slice(0, 6);

        resolve({
          primary,
          secondary: secondary.startsWith('#') ? secondary : '#0f172a',
          accent: accent.startsWith('#') ? accent : '#d97706',
          palette: palette.length >= 3 ? palette : fallback.palette,
        });
      } catch (err) {
        console.warn('Could not extract colors from logo image:', err);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      resolve(fallback);
    };

    img.src = imageSrc;
  });
}

// Injects dynamic CSS variables for immediate site-wide theme propagation
export function applyThemeColors(primary: string, secondary = '#0f172a', accent = '#d97706') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-secondary', secondary);
  root.style.setProperty('--brand-accent', accent);

  const rgb = hexToRgb(primary);
  if (rgb) {
    root.style.setProperty('--brand-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    // Light background tint (5% opacity)
    root.style.setProperty('--brand-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
    root.style.setProperty('--brand-light-border', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
  }

  const darkShade = adjustBrightness(primary, -15);
  const lightShade = adjustBrightness(primary, 15);
  root.style.setProperty('--brand-dark', darkShade);
  root.style.setProperty('--brand-hover', lightShade);
}
