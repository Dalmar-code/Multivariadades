import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  FileCheck2,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Printer,
  CreditCard,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Client } from '../../types';
import { ClientFormModal } from './ClientFormModal';

export const ClientManager: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, company } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientForPrint, setSelectedClientForPrint] = useState<Client | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleOpenNew = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSave = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalPurchases'>) => {
    if (editingClient) {
      updateClient(editingClient.id, clientData);
    } else {
      addClient(clientData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Excluir cliente "${name}"?`)) {
      deleteClient(id);
    }
  };

  const handlePrintClientSheet = (client: Client) => {
    setSelectedClientForPrint(client);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Cadastro de Clientes</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Padrão Nota Fiscal Paulista
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dados completos para emissão de NF-e, NFC-e com CPF na nota, histórico de compras e crediário.
          </p>
        </div>

        <button
          type="button"
          id="btn-new-client"
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Cliente
        </button>
      </div>

      {/* Search & Counter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="client-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500">
          Total de Clientes: <strong>{clients.length}</strong> (Filtrados: {filtered.length})
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">{c.name}</h3>
                  <span className="font-mono text-xs font-semibold text-slate-500 block mt-0.5">
                    {c.documentType.toUpperCase()}: {c.document}
                  </span>
                </div>
                {c.notaFiscalPaulistaEnabled && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0"
                    title="Preferência por CPF na Nota Fiscal Paulista"
                  >
                    Nota Paulista ✅
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600 my-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.phone || c.whatsapp || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.email || 'Não informado'}</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    {c.address}, {c.number} {c.complement ? `- ${c.complement}` : ''} - {c.neighborhood}, {c.city}/{c.state} (CEP: {c.cep})
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Comprado</span>
                <span className="font-black text-emerald-700">
                  R$ {(c.totalPurchases || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePrintClientSheet(c)}
                  title="Ficha Cadastral / Impressão"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  title="Editar Cliente"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  title="Excluir"
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialClient={editingClient}
      />

      {/* PRINTABLE CLIENT SHEET FOR NOTA FISCAL PAULISTA (Print Only) */}
      {selectedClientForPrint && (
        <div className="print-only hidden p-8 font-sans text-xs text-black">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-base font-bold uppercase">{company.tradeName}</h2>
            <p className="text-xs">CNPJ: {company.cnpj} • Inscrição Estadual: {company.stateRegistration}</p>
            <h3 className="text-sm font-extrabold mt-2 underline">
              FICHA CADASTRAL DE CLIENTE - NOTA FISCAL PAULISTA
            </h3>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 border p-3 rounded">
              <p><strong>Nome/Razão Social:</strong> {selectedClientForPrint.name}</p>
              <p><strong>{selectedClientForPrint.documentType.toUpperCase()}:</strong> {selectedClientForPrint.document}</p>
              <p><strong>RG / IE:</strong> {selectedClientForPrint.rgIe || 'Não informado'}</p>
              <p><strong>Telefone/WhatsApp:</strong> {selectedClientForPrint.phone || selectedClientForPrint.whatsapp}</p>
              <p><strong>E-mail:</strong> {selectedClientForPrint.email}</p>
              <p><strong>Nota Fiscal Paulista:</strong> {selectedClientForPrint.notaFiscalPaulistaEnabled ? 'SIM (Automático)' : 'NÃO'}</p>
            </div>

            <div className="border p-3 rounded space-y-1">
              <h4 className="font-bold text-xs">Endereço de Entrega & Faturamento:</h4>
              <p>Logradouro: {selectedClientForPrint.address}, Nº {selectedClientForPrint.number}</p>
              <p>Complemento: {selectedClientForPrint.complement || 'N/A'} • Bairro: {selectedClientForPrint.neighborhood}</p>
              <p>Município: {selectedClientForPrint.city} - UF: {selectedClientForPrint.state} • CEP: {selectedClientForPrint.cep}</p>
            </div>

            <div className="border p-3 rounded space-y-1">
              <h4 className="font-bold text-xs">Informações Financeiras:</h4>
              <p>Limite de Crédito Aprovado: R$ {selectedClientForPrint.creditLimit.toFixed(2)}</p>
              <p>Total Acumulado em Compras: R$ {(selectedClientForPrint.totalPurchases || 0).toFixed(2)}</p>
              {selectedClientForPrint.notes && <p>Obs: {selectedClientForPrint.notes}</p>}
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-slate-500 pt-8 border-t">
            <p>Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
