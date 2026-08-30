import React, { useState } from 'react';
import { User, FileCheck2, MapPin, Phone, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Client } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt' | 'totalPurchases'>) => void;
  initialClient?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialClient?.name || '');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>(
    initialClient?.documentType || 'cpf'
  );
  const [document, setDocument] = useState(initialClient?.document || '');
  const [rgIe, setRgIe] = useState(initialClient?.rgIe || '');
  const [email, setEmail] = useState(initialClient?.email || '');
  const [phone, setPhone] = useState(initialClient?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialClient?.whatsapp || '');
  const [cep, setCep] = useState(initialClient?.cep || '01310-100');
  const [address, setAddress] = useState(initialClient?.address || 'Avenida Paulista');
  const [number, setNumber] = useState(initialClient?.number || '1000');
  const [complement, setComplement] = useState(initialClient?.complement || '');
  const [neighborhood, setNeighborhood] = useState(initialClient?.neighborhood || 'Bela Vista');
  const [city, setCity] = useState(initialClient?.city || 'São Paulo');
  const [state, setState] = useState(initialClient?.state || 'SP');
  const [notaFiscalPaulistaEnabled, setNotaFiscalPaulistaEnabled] = useState<boolean>(
    initialClient?.notaFiscalPaulistaEnabled ?? true
  );
  const [creditLimit, setCreditLimit] = useState<number>(initialClient?.creditLimit || 1000.0);
  const [notes, setNotes] = useState(initialClient?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !document) {
      alert('Nome e CPF/CNPJ são obrigatórios para a Nota Fiscal Paulista.');
      return;
    }

    onSave({
      name,
      documentType,
      document,
      rgIe,
      email,
      phone,
      whatsapp,
      cep,
      address,
      number,
      complement,
      neighborhood,
      city,
      state,
      notaFiscalPaulistaEnabled,
      creditLimit: Number(creditLimit) || 0,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">
              {initialClient ? 'Editar Cadastro de Cliente' : 'Novo Cliente (Compatível Nota Fiscal Paulista & SEFAZ)'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
          {/* Nota Fiscal Paulista Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold block">Padrão Nota Fiscal Paulista (SP)</strong>
                Dados completos para emissão de cupom fiscal com CPF e NF-e Eletrônica.
              </div>
            </div>
            <label className="flex items-center gap-1.5 font-bold cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-amber-300">
              <input
                type="checkbox"
                id="checkbox-nf-paulista"
                checked={notaFiscalPaulistaEnabled}
                onChange={(e) => setNotaFiscalPaulistaEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span>Ativar CPF na Nota</span>
            </label>
          </div>

          {/* Nome e Documentos */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  id="client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Duarte Souza"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Pessoa
                </label>
                <select
                  value={documentType}
                  id="client-doc-type"
                  onChange={(e) => setDocumentType(e.target.value as 'cpf' | 'cnpj')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white font-bold"
                >
                  <option value="cpf">Pessoa Física (CPF)</option>
                  <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {documentType === 'cpf' ? 'CPF (Nota Paulista) *' : 'CNPJ *'}
                </label>
                <input
                  type="text"
                  required
                  id="client-document"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0001-00'}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {documentType === 'cpf' ? 'RG (Opcional)' : 'Inscrição Estadual (IE)'}
                </label>
                <input
                  type="text"
                  id="client-rg-ie"
                  value={rgIe}
                  onChange={(e) => setRgIe(e.target.value)}
                  placeholder="Ex: 12.345.678-9"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Limite de Crediário (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="client-credit-limit"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-700 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  id="client-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail para Envio da NF-e (XML/DANFE)
                </label>
                <input
                  type="email"
                  id="client-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Endereço Completo */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              Endereço de Entrega & Cobrança (SEFAZ)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
                <input
                  type="text"
                  id="client-cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Rua</label>
                <input
                  type="text"
                  id="client-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
                <input
                  type="text"
                  id="client-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento / Apto</label>
                <input
                  type="text"
                  id="client-complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto 42 / Bloco B"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                <input
                  type="text"
                  id="client-neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Centro"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / Estado</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="client-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <input
                    type="text"
                    id="client-state"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-14 text-center font-bold px-2 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações do Cliente (Histórico / Preferências)
              </label>
              <textarea
                rows={2}
                id="client-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Exige entrega em horário comercial, sempre solicita CPF na nota fiscal paulista."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-client"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
