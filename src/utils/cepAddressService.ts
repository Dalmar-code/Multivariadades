/**
 * Service for Bidirectional CEP <-> Address resolution using ViaCEP
 */

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean | string;
}

export interface AddressData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  number?: string;
}

export const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

/**
 * Format CEP string to 00000-000
 */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Clean CEP string to only digits
 */
export function cleanCep(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Normalize text removing accents for reliable API searches
 */
export function normalizeSearchTerm(term: string): string {
  return term
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * 1. Fetch address details given a CEP code
 */
export async function fetchAddressByCep(rawCep: string): Promise<AddressData | null> {
  const clean = cleanCep(rawCep);
  if (clean.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data: ViaCepResponse = await response.json();
    if (data.erro) {
      return null;
    }

    return {
      cep: data.cep || formatCep(clean),
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      complement: data.complemento || '',
    };
  } catch (error) {
    console.warn('Erro ao consultar CEP via ViaCEP:', error);
    return null;
  }
}

/**
 * 2. Search CEPs by Street, City, and State (UF)
 * ViaCEP requires: UF (2 chars), City (min 3 chars), Street (min 3 chars)
 */
export async function searchCepByAddress(
  uf: string,
  city: string,
  street: string
): Promise<AddressData[]> {
  const cleanUf = uf.trim().toUpperCase();
  const cleanCity = normalizeSearchTerm(city);
  const cleanStreet = normalizeSearchTerm(street);

  if (cleanUf.length !== 2 || cleanCity.length < 3 || cleanStreet.length < 3) {
    return [];
  }

  try {
    const url = `https://viacep.com.br/ws/${encodeURIComponent(cleanUf)}/${encodeURIComponent(
      cleanCity
    )}/${encodeURIComponent(cleanStreet)}/json/`;
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: ViaCepResponse) => ({
      cep: item.cep || '',
      street: item.logradouro || '',
      neighborhood: item.bairro || '',
      city: item.localidade || '',
      state: item.uf || '',
      complement: item.complemento || '',
    }));
  } catch (error) {
    console.warn('Erro ao consultar endereço para obter CEP:', error);
    return [];
  }
}

/**
 * Helper to extract potential UF, city and street from a free-form query string
 * e.g., "Av. Paulista 1000, Sao Paulo - SP"
 */
export function parseAddressQuery(query: string, defaultUf = 'SP', defaultCity = 'São Paulo'): {
  uf: string;
  city: string;
  street: string;
} {
  const clean = query.trim();
  
  // Check if UF is at the end (e.g. "... - SP" or "..., SP")
  const ufMatch = clean.match(/(?:[-/, ]|\b)([A-Z]{2})\b$/i);
  let uf = ufMatch ? ufMatch[1].toUpperCase() : defaultUf;
  let remaining = ufMatch ? clean.slice(0, ufMatch.index).trim() : clean;

  // Check if remaining has comma for city
  let city = defaultCity;
  let street = remaining;

  if (remaining.includes(',')) {
    const parts = remaining.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      street = parts[0];
      city = parts[1];
    }
  } else if (remaining.includes('-')) {
    const parts = remaining.split('-').map((p) => p.trim());
    if (parts.length >= 2) {
      street = parts[0];
      city = parts[1];
    }
  }

  return {
    uf: uf || defaultUf,
    city: city || defaultCity,
    street: street || clean,
  };
}
