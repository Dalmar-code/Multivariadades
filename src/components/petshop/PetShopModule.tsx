import React, { useState } from 'react';
import {
  Dog,
  Calendar,
  Clock,
  Scissors,
  Repeat,
  Search,
  Plus,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  HeartPulse,
  User,
  UserPlus,
  Phone,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Check,
  Building2,
  Stethoscope,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Pet, PetService, PetRecurringPlan, PetSpecies, PetSize } from '../../types';
import { PET_SPECIES_LABELS } from '../../utils/petBreeds';
import { DailyServiceBoard } from './DailyServiceBoard';
import { MultiPetSchedulerModal } from './MultiPetSchedulerModal';
import { PetFormModal } from './PetFormModal';
import { PetServiceCatalogModal } from './PetServiceCatalogModal';
import { RecurringPlanModal } from './RecurringPlanModal';
import { VeterinaryConsultationsManager } from './VeterinaryConsultationsManager';
import { ClientFormModal } from '../clients/ClientFormModal';

export const PetShopModule: React.FC = () => {
  const {
    pets,
    clients,
    addClient,
    petServices,
    petRecurringPlans,
    veterinaryConsultations,
    deletePet,
    deletePetService,
    deletePetRecurringPlan,
    recordPlanSessionUsage,
    billPlanToPDV,
    setActiveTab,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'pets' | 'services' | 'plans' | 'vet'>('daily');

  // Modals state
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<PetService | null>(null);
  const [serviceDefaultType, setServiceDefaultType] = useState<'petshop' | 'veterinario'>('petshop');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<PetRecurringPlan | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  // Search & Filters
  const [petSearch, setPetSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceFilterScope, setServiceFilterScope] = useState<'all' | 'petshop' | 'veterinario'>('all');

  // Filtered Pets
  const filteredPets = pets.filter((pet) => {
    if (!pet) return false;
    const petName = pet.name || '';
    const petBreed = pet.breed || '';
    const clientName = pet.clientName || '';
    const searchLower = petSearch.toLowerCase();
    const matchesSearch =
      petName.toLowerCase().includes(searchLower) ||
      petBreed.toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower);
    const matchesSpecies = speciesFilter === 'all' || pet.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  // Filtered Services
  const filteredServices = petServices.filter((srv) => {
    if (!srv) return false;
    const isVet = srv.serviceType === 'veterinario' || srv.category === 'veterinario';
    if (serviceFilterScope === 'petshop' && isVet) return false;
    if (serviceFilterScope === 'veterinario' && !isVet) return false;

    const srvName = srv.name || '';
    const srvCat = srv.category || '';
    const srvDesc = srv.description || '';
    const srvSearchLower = serviceSearch.toLowerCase();

    return (
      srvName.toLowerCase().includes(srvSearchLower) ||
      srvCat.toLowerCase().includes(srvSearchLower) ||
      srvDesc.toLowerCase().includes(srvSearchLower)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Main Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-inner">
            <Dog className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Pet Shop & Centro Veterinário Integrado
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Profissional
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Gestão completa de banho & tosa, atendimento clínico veterinário, esteira de etapas em tempo real, agendamento multi-pets por tutor e planos recorrentes com faturamento direto no PDV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setShowClientModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Cadastrar cliente/tutor unificado para Venda, Pet Shop e Veterinário"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cadastrar Cliente / Tutor</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSchedulerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-amber-500/20"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendamento</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPetToEdit(null);
              setShowPetModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Cadastrar Pet</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('daily')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'daily'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Quadro do Dia (Esteira de Serviços)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'pets'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Dog className="w-4 h-4" />
          <span>Pets & Tutores ({pets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('services')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'services'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Catálogo de Serviços ({petServices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('plans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'plans'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Planos Recorrentes ({petRecurringPlans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('vet')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'vet'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          <span>Clínica Veterinária & Consultas ({veterinaryConsultations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vacinas')}
          className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ml-auto"
          title="Ver calendário e histórico vacinal"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Carteira de Vacinas</span>
        </button>
      </div>

      {/* Sub-tab 1: Daily Service Board */}
      {activeSubTab === 'daily' && <DailyServiceBoard />}

      {/* Sub-tab 2: Pets Directory */}
      {activeSubTab === 'pets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome do pet, tutor ou raça..."
                value={petSearch}
                onChange={(e) => setPetSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todas as Espécies</option>
                {Object.entries(PET_SPECIES_LABELS).map(([val, info]) => (
                  <option key={val} value={val}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                title="Cadastrar cliente/tutor unificado no sistema"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Cadastrar Cliente / Tutor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPetToEdit(null);
                  setShowPetModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Novo Pet</span>
              </button>
            </div>
          </div>

          {filteredPets.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Nenhum pet encontrado. Clique em "+ Cadastrar Novo Pet" para registrar um animal.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                        <Dog className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                          {pet.name}
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {pet.gender === 'femea' ? '♀ Fêmea' : '♂ Macho'}
                          </span>
                        </h4>
                        <p className="text-xs text-amber-400 font-medium">{pet.breed}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPetToEdit(pet);
                          setShowPetModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Editar Pet"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir o cadastro do pet ${pet.name}?`)) {
                            deletePet(pet.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Excluir Pet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase">Porte / Peso</span>
                      <strong className="text-white">
                        {pet.size?.toUpperCase()} ({pet.weightKg || '-'} kg)
                      </strong>
                    </div>

                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase">Pelagem</span>
                      <strong className="text-white capitalize">
                        {pet.coatType} {pet.coatColor ? `(${pet.coatColor})` : ''}
                      </strong>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Tutor Responsável:</span>
                      <strong className="text-white">{pet.clientName || 'Cliente Balcão / Geral'}</strong>
                    </div>
                    {pet.temperament && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Comportamento:</span>
                        <span className="text-amber-400 capitalize">{pet.temperament}</span>
                      </div>
                    )}
                    {pet.allergies && (
                      <div className="pt-1 text-[11px] text-rose-400 font-semibold border-t border-slate-800">
                        ⚠ Alergias: {pet.allergies}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSchedulerModal(true);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 hover:border-amber-500"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Serviço para {pet.name}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: Services Catalog */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-2 items-center flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar serviços de banho, tosa, clínica..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Filter scope buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setServiceFilterScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    serviceFilterScope === 'all'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({petServices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setServiceFilterScope('petshop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                    serviceFilterScope === 'petshop'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Pet Shop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceFilterScope('veterinario')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                    serviceFilterScope === 'veterinario'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Veterinário (Local à Parte)</span>
                </button>
              </div>
            </div>

            {/* Quick Registration for Pet Shop and Veterinary Services */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => {
                  setServiceDefaultType('petshop');
                  setServiceToEdit(null);
                  setShowServiceModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Scissors className="w-4 h-4" />
                <span>+ Serviço de Pet Shop</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceDefaultType('veterinario');
                  setServiceToEdit(null);
                  setShowServiceModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Cadastrar serviço veterinário em local à parte"
              >
                <Stethoscope className="w-4 h-4" />
                <span>+ Serviço Veterinário</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-5 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{service.name}</h4>
                      {service.isExtraService && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Serviço Adicional
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-xs text-slate-400 mt-1">{service.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setServiceToEdit(service);
                        setShowServiceModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja remover o serviço ${service.name}?`)) {
                          deletePetService(service.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pricing Table by Size */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Valores por Porte:
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                    <div className="p-1 bg-slate-900 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Mini</span>
                      <strong className="text-emerald-400">R$ {(service.priceBySize?.mini ?? service.price).toFixed(2)}</strong>
                    </div>
                    <div className="p-1 bg-slate-900 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Pequeno</span>
                      <strong className="text-emerald-400">R$ {(service.priceBySize?.pequeno ?? service.price).toFixed(2)}</strong>
                    </div>
                    <div className="p-1 bg-slate-900 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Médio</span>
                      <strong className="text-emerald-400">R$ {(service.priceBySize?.medio ?? service.price).toFixed(2)}</strong>
                    </div>
                    <div className="p-1 bg-slate-900 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Grande</span>
                      <strong className="text-emerald-400">R$ {(service.priceBySize?.grande ?? service.price).toFixed(2)}</strong>
                    </div>
                    <div className="p-1 bg-slate-900 rounded-lg">
                      <span className="text-[9px] text-slate-400 block">Gigante</span>
                      <strong className="text-emerald-400">R$ {(service.priceBySize?.gigante ?? service.price).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {service.observations && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                    <strong className="text-slate-300">Observação à parte:</strong> {service.observations}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 4: Recurring Plans */}
      {activeSubTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Contratos de Planos Quinzenais & Mensais</h3>
              <p className="text-xs text-slate-400">
                Acompanhe o consumo de sessões por pet e a data de cobrança preferencial do cliente
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPlanToEdit(null);
                setShowPlanModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Contrato de Plano</span>
            </button>
          </div>

          {petRecurringPlans.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              Nenhum plano recorrente cadastrado. Clique no botão acima para criar o primeiro contrato.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {petRecurringPlans.map((plan) => {
                const percentUsed = Math.round((plan.usedSessions / plan.totalSessions) * 100);
                const remaining = plan.totalSessions - plan.usedSessions;

                return (
                  <div
                    key={plan.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                            {plan.planType || plan.frequency || 'mensal'}
                          </span>
                          <h4 className="font-bold text-white text-sm">
                            {plan.name || plan.planName || 'Plano Recorrente'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tutor: <strong className="text-slate-300">{plan.clientName}</strong> • Pet:{' '}
                          <strong className="text-amber-400">{plan.petName}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-white">
                          R$ {plan.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-amber-400 block font-semibold">
                          Cobrança todo dia {plan.billingDay < 10 ? `0${plan.billingDay}` : plan.billingDay}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Sessions */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">
                          Sessões Utilizadas: <strong>{plan.usedSessions} de {plan.totalSessions}</strong>
                        </span>
                        <span className="font-bold text-amber-400">
                          {remaining > 0 ? `${remaining} restante(s)` : 'Plano concluído!'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>

                    {/* Services description */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                      <strong className="text-slate-400 block text-[10px] uppercase mb-0.5">
                        Incluso no Pacote:
                      </strong>
                      {plan.servicesIncluded.join(', ')}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPlanToEdit(plan);
                            setShowPlanModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="Editar Plano"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja cancelar o plano ${plan.name || plan.planName}?`)) {
                              deletePetRecurringPlan(plan.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Excluir Plano"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => billPlanToPDV(plan.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Enviar mensalidade para receber o pagamento no PDV"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Pagar Mensalidade no PDV</span>
                        </button>

                        <button
                          type="button"
                          disabled={remaining <= 0}
                          onClick={() => recordPlanSessionUsage(plan.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registrar Sessão</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 5: Veterinary Clinical Center & Consultations (Local à Parte) */}
      {activeSubTab === 'vet' && <VeterinaryConsultationsManager />}

      {/* Multi-Pet Scheduler Modal */}
      {showSchedulerModal && (
        <MultiPetSchedulerModal
          isOpen={showSchedulerModal}
          onClose={() => setShowSchedulerModal(false)}
        />
      )}

      {/* Pet Registration / Edit Modal */}
      {showPetModal && (
        <PetFormModal
          isOpen={showPetModal}
          onClose={() => {
            setShowPetModal(false);
            setPetToEdit(null);
          }}
          petToEdit={petToEdit}
        />
      )}

      {/* Pet Service Catalog Modal (Pet Shop & Veterinary Services in dedicated sections) */}
      {showServiceModal && (
        <PetServiceCatalogModal
          isOpen={showServiceModal}
          onClose={() => {
            setShowServiceModal(false);
            setServiceToEdit(null);
          }}
          serviceToEdit={serviceToEdit}
          defaultServiceType={serviceDefaultType}
        />
      )}

      {/* Recurring Plan Modal */}
      {showPlanModal && (
        <RecurringPlanModal
          isOpen={showPlanModal}
          onClose={() => {
            setShowPlanModal(false);
            setPlanToEdit(null);
          }}
          planToEdit={planToEdit}
        />
      )}

      {/* Client Quick Registration Modal (Unified for Sales, Pet Shop and Veterinary) */}
      <ClientFormModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSave={(clientData) => {
          addClient(clientData);
          setShowClientModal(false);
        }}
      />
    </div>
  );
};
