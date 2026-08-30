import React, { useState } from 'react';
import { Building2, Save, CheckCircle2, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CompanyProfile } from '../../types';

export const CompanySettings: React.FC = () => {
  const { company, updateCompany } = useStore();

  const [corporateName, setCorporateName] = useState(company.corporateName);
  const [tradeName, setTradeName] = useState(company.tradeName);
  const [cnpj, setCnpj] = useState(company.cnpj);
  const [stateRegistration, setStateRegistration] = useState(company.stateRegistration);
  const [municipalRegistration, setMunicipalRegistration] = useState(company.municipalRegistration || '');
  const [crt, setCrt] = useState(company.crt);
  const [email, setEmail] = useState(company.email);
  const [phone, setPhone] = useState(company.phone);

  const [street, setStreet] = useState(company.address.street);
  const [number, setNumber] = useState(company.address.number);
  const [complement, setComplement] = useState(company.address.complement || '');
  const [neighborhood, setNeighborhood] = useState(company.address.neighborhood);
  const [city, setCity] = useState(company.address.city);
  const [state, setState] = useState(company.address.state);
  const [cep, setCep] = useState(company.address.cep);

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany({
      corporateName,
      tradeName,
      cnpj,
      stateRegistration,
      municipalRegistration,
      crt,
      email,
      phone,
      address: {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        cep,
      },
    });

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dados da Empresa & Loja</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configurações cadastrais impressas no cabeçalho dos cupons, DANFE e notas fiscais.
          </p>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Dados da empresa atualizados com sucesso!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Identificação Jurídica */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            1. Identificação Jurídica & Tributária
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia (Marca da Loja)</label>
              <input
                type="text"
                required
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social Completa</label>
              <input
                type="text"
                required
                value={corporateName}
                onChange={(e) => setCorporateName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
              <input
                type="text"
                required
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Estadual (IE)</label>
              <input
                type="text"
                required
                value={stateRegistration}
                onChange={(e) => setStateRegistration(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Regime Tributário (CRT)</label>
              <select
                value={crt}
                onChange={(e) => setCrt(e.target.value as '1' | '2' | '3')}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="1">1 - Simples Nacional (ME / EPP)</option>
                <option value="2">2 - Simples Nacional - Excesso Sublimite</option>
                <option value="3">3 - Regime Normal (Lucro Presumido/Real)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Principal / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Comercial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            2. Endereço da Sede / Loja Física
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Avenida / Rua</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Loja 01 / Galpão"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / UF</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <input
                  type="text"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  className="w-14 text-center font-bold px-2 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            id="btn-save-company-settings"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Dados da Empresa
          </button>
        </div>
      </form>
    </div>
  );
};
