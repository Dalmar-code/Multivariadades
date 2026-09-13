import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  X,
  Save,
  DollarSign,
  Dog,
  Repeat,
  Sparkles,
  Clock,
  User,
} from 'lucide-react';
import { PetRecurringPlan, Pet } from '../../types';
import { useStore } from '../../context/StoreContext';

interface RecurringPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: PetRecurringPlan | null;
}

export const RecurringPlanModal: React.FC<RecurringPlanModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
}) => {
  const { clients, pets, addPetRecurringPlan, updatePetRecurringPlan } = useStore();

  const [clientId, setClientId] = useState('');
  const [petId, setPetId] = useState('');
  const [planType, setPlanType] = useState<'quinzenal' | 'mensal'>('mensal');
  const [name, setName] = useState('Plano Mensal Clássico (4 Banhos + 1 Hidratação)');
  const [price, setPrice] = useState(240.0);
  const [billingDay, setBillingDay] = useState(10);
  const [totalSessions, setTotalSessions] = useState(4);
  const [usedSessions, setUsedSessions] = useState(0);
  const [servicesIncluded, setServicesIncluded] = useState(
    '4x Banhos completos com corte de unhas e limpeza de ouvidos + 1x Hidratação profunda'
  );
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente' | 'atrasado'>('pago');

  // Pets of selected client
  const clientPets = pets.filter((p) => p.clientId === clientId);

  useEffect(() => {
    if (planToEdit) {
      setClientId(planToEdit.clientId);
      setPetId(planToEdit.petId);
      setPlanType(planToEdit.planType || planToEdit.frequency || 'mensal');
      setName(planToEdit.name || planToEdit.planName || '');
      setPrice(planToEdit.price);
      setBillingDay(planToEdit.billingDay);
      setTotalSessions(planToEdit.totalSessions);
      setUsedSessions(planToEdit.usedSessions);
      setServicesIncluded(planToEdit.servicesIncluded.join(', '));
      const rawStatus = planToEdit.paymentStatus as string;
      const safeStatus: 'pago' | 'pendente' | 'atrasado' =
        rawStatus === 'em_dia' || rawStatus === 'pago' || rawStatus === 'liberado'
          ? 'pago'
          : rawStatus === 'atrasado' || rawStatus === 'bloqueado'
          ? 'atrasado'
          : 'pendente';
      setPaymentStatus(safeStatus);
    } else {
      const initClient = clients[0]?.id ?? '';
      setClientId(initClient);
      const initPets = pets.filter((p) => p.clientId === initClient);
      setPetId(initPets[0]?.id ?? '');
      setPlanType('mensal');
      setName('Plano Mensal Clássico (4 Banhos + 1 Hidratação)');
      setPrice(240.0);
      setBillingDay(10);
      setTotalSessions(4);
      setUsedSessions(0);
      setServicesIncluded('4x Banhos completos com corte de unhas e limpeza de ouvidos, 1x Hidratação');
      setPaymentStatus('pago');
    }
  }, [planToEdit, isOpen, clients, pets]);

  // When client changes, select their first pet
  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const available = pets.filter((p) => p.clientId === cId);
    setPetId(available[0]?.id ?? '');
  };

  const handlePresetChange = (type: 'quinzenal' | 'mensal') => {
    setPlanType(type);
    if (type === 'quinzenal') {
      setName('Plano Quinzenal Prático (2 Banhos + Tosa Higiênica)');
      setPrice(130.0);
      setTotalSessions(2);
      setServicesIncluded('2x Banhos completos com corte de unhas e higiênica');
    } else {
      setName('Plano Mensal Clássico (4 Banhos + 1 Hidratação)');
      setPrice(240.0);
      setTotalSessions(4);
      setServicesIncluded('4x Banhos completos com corte de unhas e limpeza de ouvidos, 1x Hidratação profunda');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find((c) => c.id === clientId);
    const selPet = pets.find((p) => p.id === petId);

    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const expiryDate = new Date(now.getTime() + (planType === 'quinzenal' ? 15 : 30) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const planData: Omit<PetRecurringPlan, 'id' | 'createdAt' | 'code'> = {
      clientId,
      clientName: selClient?.name || 'Cliente',
      clientPhone: selClient?.phone,
      petId,
      petName: selPet?.name || 'Pet',
      petBreed: selPet?.breed,
      petSpecies: selPet?.species,
      planType,
      frequency: planType,
      name,
      planName: name,
      price: Number(price) || 0,
      billingDay: Number(billingDay) || 10,
      totalSessions: Number(totalSessions) || 4,
      usedSessions: Number(usedSessions) || 0,
      servicesIncluded: servicesIncluded.split(',').map((s) => s.trim()).filter(Boolean),
      startDate,
      expiryDate,
      active: true,
      paymentStatus,
    };

    if (planToEdit) {
      updatePetRecurringPlan(planToEdit.id, planData);
    } else {
      addPetRecurringPlan(planData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 my-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {planToEdit ? 'Editar Plano Recorrente' : 'Novo Contrato de Plano Recorrente'}
              </h3>
              <p className="text-xs text-slate-400">
                Planos quinzenais e mensais com data preferencial de cobrança e controle de sessões
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick preset selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handlePresetChange('quinzenal')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planType === 'quinzenal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plano Quinzenal
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('mensal')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planType === 'mensal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plano Mensal
            </button>
          </div>

          {/* Client & Pet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tutor / Cliente *
              </label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Pet do Tutor *
              </label>
              <select
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                required
              >
                {clientPets.length === 0 ? (
                  <option value="">Nenhum pet encontrado para este tutor</option>
                ) : (
                  clientPets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.breed} - {p.size})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Título do Plano
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Price, Billing day, Total Sessions */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Valor Total (R$) *
              </label>
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Dia de Cobrança *
              </label>
              <select
                value={billingDay}
                onChange={(e) => setBillingDay(parseInt(e.target.value, 10) || 5)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              >
                {[1, 5, 10, 15, 20, 25, 28, 30].map((d) => (
                  <option key={d} value={d}>
                    Todo dia {d < 10 ? `0${d}` : d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Total de Sessões *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={totalSessions}
                onChange={(e) => setTotalSessions(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-amber-500 text-center"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Serviços Inclusos no Pacote
            </label>
            <textarea
              rows={2}
              value={servicesIncluded}
              onChange={(e) => setServicesIncluded(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Sessões Já Utilizadas
              </label>
              <input
                type="number"
                min="0"
                max={totalSessions}
                value={usedSessions}
                onChange={(e) => setUsedSessions(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Status de Pagamento
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="pago">Pago (Em dia)</option>
                <option value="pendente">Aguardando Pagamento</option>
                <option value="atrasado">Em Atraso</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{planToEdit ? 'Atualizar Plano' : 'Ativar Plano Recorrente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
