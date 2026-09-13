import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  MapPin,
  Printer,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PDVRegister } from '../../types';

interface PDVRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPdvCreated?: (newPdv: PDVRegister) => void;
}

export const PDVRegisterModal: React.FC<PDVRegisterModalProps> = ({
  isOpen,
  onClose,
  onPdvCreated,
}) => {
  const { pdvRegisters, addPDVRegister, branches, currentBranchId, setSelectedPdvId } = useStore();

  const nextNumber = pdvRegisters.length + 1;
  const defaultCode = `CX-${nextNumber.toString().padStart(2, '0')}`;
  const defaultName = `Caixa ${nextNumber.toString().padStart(2, '0')} - Frente de Loja`;

  const defaultBranch =
    branches.find((b) => b.id === currentBranchId) || branches[0] || {
      id: 'branch_matriz',
      storeNumber: '001',
      name: 'Loja 001 - Matriz Centro',
    };

  const [code, setCode] = useState(defaultCode);
  const [name, setName] = useState(defaultName);
  const [branchId, setBranchId] = useState(defaultBranch.id);
  const [location, setLocation] = useState('Frente de Loja');
  const [printerModel, setPrinterModel] = useState('Térmica 80mm Padrão ESC/POS');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const nextNum = pdvRegisters.length + 1;
      setCode(`CX-${nextNum.toString().padStart(2, '0')}`);
      setName(`Caixa ${nextNum.toString().padStart(2, '0')} - Frente de Loja`);
      const targetBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
      if (targetBranch) {
        setBranchId(targetBranch.id);
      }
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, pdvRegisters.length, currentBranchId, branches]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim() || !name.trim()) {
      setErrorMsg('Por favor, preencha o código e o nome do Caixa PDV.');
      return;
    }

    const selectedBranch = branches.find((b) => b.id === branchId) || defaultBranch;

    const newPdv = addPDVRegister({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      branchId: selectedBranch.id,
      branchStoreNumber: selectedBranch.storeNumber || '001',
      branchName: selectedBranch.name || 'Matriz',
      location: location.trim() || 'Frente de Loja',
      printerModel: printerModel.trim() || 'Térmica 80mm Padrão',
      status,
    });

    setSelectedPdvId(newPdv.id);
    if (onPdvCreated) {
      onPdvCreated(newPdv);
    }

    setSuccessMsg(`Caixa "${newPdv.name}" cadastrado com sucesso!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cadastrar Novo Caixa PDV</h3>
              <p className="text-xs text-slate-400">
                Cadastre um novo terminal de caixa para operações de venda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Código do Caixa *
              </label>
              <input
                type="text"
                id="input-pdv-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: CX-01"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status do Terminal
              </label>
              <select
                id="select-pdv-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="active">Ativo para Vendas</option>
                <option value="maintenance">Em Manutenção</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome do Terminal / Descrição *
            </label>
            <input
              type="text"
              id="input-pdv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Caixa 01 - Principal / Frente de Loja"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Loja / Filial Vinculada
            </label>
            <select
              id="select-pdv-branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    Loja {b.storeNumber} - {b.name} ({b.city}/{b.state})
                  </option>
                ))
              ) : (
                <option value="branch_matriz">Loja 001 - Matriz Principal</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Localização Física
              </label>
              <input
                type="text"
                id="input-pdv-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Balcão Central"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Impressora Térmica
              </label>
              <input
                type="text"
                id="input-pdv-printer"
                value={printerModel}
                onChange={(e) => setPrinterModel(e.target.value)}
                placeholder="Ex: Térmica 80mm ESC/POS"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-new-pdv"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Salvar Caixa PDV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
