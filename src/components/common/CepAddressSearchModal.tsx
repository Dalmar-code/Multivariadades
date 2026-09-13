import React, { useState } from 'react';
import { Search, MapPin, X, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import {
  BRAZIL_STATES,
  searchCepByAddress,
  AddressData,
} from '../../utils/cepAddressService';

interface CepAddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: AddressData) => void;
  initialStreet?: string;
  initialCity?: string;
  initialState?: string;
}

export const CepAddressSearchModal: React.FC<CepAddressSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  initialStreet = '',
  initialCity = '',
  initialState = 'SP',
}) => {
  const [street, setStreet] = useState(initialStreet);
  const [city, setCity] = useState(initialCity || 'São Paulo');
  const [state, setState] = useState(initialState || 'SP');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AddressData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!state || state.length !== 2) {
      setErrorMsg('Por favor, selecione um estado (UF).');
      return;
    }
    if (!city || city.trim().length < 3) {
      setErrorMsg('A cidade deve ter no mínimo 3 letras.');
      return;
    }
    if (!street || street.trim().length < 3) {
      setErrorMsg('O nome da rua/logradouro deve ter no mínimo 3 letras.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await searchCepByAddress(state, city, street);
      setResults(data);
      if (data.length === 0) {
        setErrorMsg('Nenhum CEP encontrado para os dados informados. Verifique se o nome da rua ou município estão corretos.');
      }
    } catch {
      setErrorMsg('Falha ao consultar os Correios. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (addr: AddressData) => {
    onSelectAddress(addr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Localizador de CEP por Endereço</h3>
              <p className="text-[11px] text-slate-400">
                Digite o nome da rua para encontrar o CEP correto e preencher automaticamente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF)</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {BRAZIL_STATES.map((s) => (
                  <option key={s.uf} value={s.uf}>
                    {s.uf} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Município / Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome da Rua / Avenida / Logradouro
            </label>
            <div className="relative">
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Ex: Paulista, XV de Novembro, Ipiranga..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white pr-24"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Buscar
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Dica: Digite apenas o nome principal do logradouro (mínimo 3 caracteres).
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
            {results.length > 0 && (
              <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {results.length} endereço(s) encontrado(s) — Clique para selecionar:
              </p>
            )}

            {results.map((item, idx) => (
              <button
                type="button"
                key={`${item.cep}-${idx}`}
                onClick={() => handleSelect(item)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 group-hover:text-amber-950">
                      {item.street}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bairro: {item.neighborhood || 'N/A'} • {item.city} - {item.state}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 text-white font-mono font-bold text-xs shadow-xs transition-colors">
                    {item.cep}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}

            {hasSearched && !isLoading && results.length === 0 && !errorMsg && (
              <div className="p-6 text-center text-slate-400 text-xs">
                Nenhum CEP encontrado. Tente ajustar o nome da rua ou conferir a cidade.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
