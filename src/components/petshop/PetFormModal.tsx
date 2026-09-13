import React, { useState, useEffect } from 'react';
import {
  Dog,
  Cat,
  Bird,
  Rabbit,
  X,
  Plus,
  Save,
  ShieldAlert,
  Calendar,
  Weight,
  FileText,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { Pet, PetSpecies, PetSize } from '../../types';
import { PET_SPECIES_LABELS, PET_BREEDS_BY_SPECIES } from '../../utils/petBreeds';
import { useStore } from '../../context/StoreContext';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  petToEdit?: Pet | null;
  defaultClientId?: string;
  onPetSaved?: (pet: Pet) => void;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({
  isOpen,
  onClose,
  petToEdit,
  defaultClientId,
  onPetSaved,
}) => {
  const { clients, addPet, updatePet } = useStore();

  const [clientId, setClientId] = useState<string>(defaultClientId || '');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('cao');
  const [breed, setBreed] = useState('Sem Raça Definida (SRD / Vira-lata)');
  const [customBreed, setCustomBreed] = useState('');
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const [gender, setGender] = useState<'macho' | 'femea'>('macho');
  const [size, setSize] = useState<PetSize>('medio');
  const [coatType, setCoatType] = useState<'curto' | 'medio' | 'longo' | 'duplo' | 'cacheado'>('curto');
  const [coatColor, setCoatColor] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weightInput, setWeightInput] = useState<string>('5.0');
  const [temperament, setTemperament] = useState<'docil' | 'bravo' | 'agitado' | 'medroso' | 'idoso' | 'normal'>('docil');
  const [allergies, setAllergies] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [vaccinesUpToDate, setVaccinesUpToDate] = useState(true);
  const [keepOpenForMore, setKeepOpenForMore] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Available breeds for the selected species
  const availableBreeds = PET_BREEDS_BY_SPECIES[species] || [];

  useEffect(() => {
    if (petToEdit) {
      setClientId(petToEdit.clientId);
      setName(petToEdit.name);
      setSpecies(petToEdit.species);
      setSuccessBanner(null);
      const isKnown = (PET_BREEDS_BY_SPECIES[petToEdit.species] || []).includes(petToEdit.breed);
      if (isKnown) {
        setBreed(petToEdit.breed);
        setIsCustomBreed(false);
      } else {
        setIsCustomBreed(true);
        setCustomBreed(petToEdit.breed);
      }
      setGender(petToEdit.gender || 'macho');
      setSize(petToEdit.size || 'medio');
      setCoatType(petToEdit.coatType || 'curto');
      setCoatColor(petToEdit.coatColor || '');
      setBirthDate(petToEdit.birthDate || '');
      setWeightInput(petToEdit.weightKg ? String(petToEdit.weightKg) : '5.0');
      setTemperament(petToEdit.temperament || 'docil');
      setAllergies(petToEdit.allergies || '');
      setMedicalNotes(petToEdit.medicalNotes || '');
      setMicrochipNumber(petToEdit.microchipNumber || '');
      setVaccinesUpToDate(petToEdit.vaccinesUpToDate ?? true);
    } else {
      setClientId(defaultClientId || (clients[0]?.id ?? ''));
      setName('');
      setSpecies('cao');
      setBreed('Sem Raça Definida (SRD / Vira-lata)');
      setIsCustomBreed(false);
      setCustomBreed('');
      setGender('macho');
      setSize('medio');
      setCoatType('curto');
      setCoatColor('');
      setBirthDate('');
      setWeightInput('5.0');
      setTemperament('docil');
      setAllergies('');
      setMedicalNotes('');
      setMicrochipNumber('');
      setVaccinesUpToDate(true);
      setSuccessBanner(null);
    }
  }, [petToEdit, defaultClientId, isOpen, clients]);

  // When species changes, update default breed selection
  const handleSpeciesChange = (newSpecies: PetSpecies) => {
    setSpecies(newSpecies);
    const breeds = PET_BREEDS_BY_SPECIES[newSpecies] || [];
    setBreed(breeds[0] || 'Outra Raça');
    setIsCustomBreed(false);
    setCustomBreed('');
  };

  if (!isOpen) return null;

  const savePetRecord = (stayOpen: boolean) => {
    if (!name.trim()) {
      alert('Por favor, informe o nome do pet antes de salvar.');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const finalBreed = isCustomBreed ? (customBreed.trim() || 'Outra Raça') : breed;
    const cleanWeight = parseFloat(String(weightInput).replace(',', '.')) || 0;

    const petData = {
      clientId: clientId || 'cli_avulso',
      clientName: selectedClient?.name || 'Cliente Geral',
      name: name.trim(),
      species,
      breed: finalBreed,
      gender,
      size,
      coatType,
      coatColor: coatColor.trim(),
      birthDate,
      weightKg: cleanWeight,
      temperament,
      allergies: allergies.trim(),
      medicalNotes: medicalNotes.trim(),
      microchipNumber: microchipNumber.trim(),
      vaccinesUpToDate,
    };

    if (petToEdit) {
      updatePet(petToEdit.id, petData);
      if (onPetSaved) onPetSaved({ ...petToEdit, ...petData });
      onClose();
    } else {
      const created = addPet(petData);
      if (onPetSaved) onPetSaved(created);

      if (stayOpen || keepOpenForMore) {
        setSuccessBanner(`✓ Pet "${petData.name}" cadastrado com sucesso! Prossiga com o próximo pet para este mesmo tutor.`);
        setName('');
        setCustomBreed('');
        setIsCustomBreed(false);
        setCoatColor('');
        setBirthDate('');
        setWeightInput('5.0');
        setAllergies('');
        setMedicalNotes('');
        setMicrochipNumber('');
      } else {
        onClose();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePetRecord(keepOpenForMore);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Dog className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {petToEdit ? `Editar Cadastro do Pet: ${petToEdit.name}` : 'Cadastrar Novo Pet / Animal'}
              </h3>
              <p className="text-xs text-slate-400">
                Identificação do animal, tutor responsável, porte e histórico para banho, tosa e clínica
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner when registering multiple pets sequentially */}
        {successBanner && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-between text-emerald-300 text-xs font-semibold animate-fadeIn">
            <span>{successBanner}</span>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-white ml-2 text-xs underline cursor-pointer"
            >
              Dispensar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tutor & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tutor / Cliente Responsável *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="cli_avulso">Cliente Balcão / Geral (Sem cadastro prévio)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.document || 'Sem CPF'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nome do Pet / Animal *
              </label>
              <input
                type="text"
                placeholder="Ex: Thor, Mel, Pipoca, Simba..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Species & Dynamic Breed Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Espécie do Animal *
              </label>
              <select
                value={species}
                onChange={(e) => handleSpeciesChange(e.target.value as PetSpecies)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                {Object.entries(PET_SPECIES_LABELS).map(([val, info]) => (
                  <option key={val} value={val}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Raça ({PET_SPECIES_LABELS[species]?.label || 'Animal'}) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomBreed(!isCustomBreed)}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  {isCustomBreed ? 'Ver lista suspensa' : 'Digitar outra raça'}
                </button>
              </div>

              {isCustomBreed ? (
                <input
                  type="text"
                  placeholder="Digite o nome da raça..."
                  value={customBreed}
                  onChange={(e) => setCustomBreed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              ) : (
                <select
                  value={breed}
                  onChange={(e) => {
                    if (e.target.value === '__OTHER__') {
                      setIsCustomBreed(true);
                      setCustomBreed('');
                    } else {
                      setBreed(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {availableBreeds.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="__OTHER__">+ Digitar outra raça não listada...</option>
                </select>
              )}
            </div>
          </div>

          {/* Gender, Size, Weight, Temperament */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Sexo</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'macho' | 'femea')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Porte</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as PetSize)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="mini">Mini (Até 4kg)</option>
                <option value="pequeno">Pequeno (4 a 10kg)</option>
                <option value="medio">Médio (10 a 20kg)</option>
                <option value="grande">Grande (20 a 40kg)</option>
                <option value="gigante">Gigante (Acima de 40kg)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Peso do Pet (kg)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 5.5 ou 12"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">Digitação livre (ex: 4, 8.5, 15)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Comportamento</label>
              <select
                value={temperament}
                onChange={(e) => setTemperament(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="docil">Dócil / Calmo</option>
                <option value="normal">Normal</option>
                <option value="agitado">Agitado / Brincalhão</option>
                <option value="medroso">Medroso / Assustado</option>
                <option value="bravo">Bravo / Reativo (Cuidado)</option>
              </select>
            </div>
          </div>

          {/* Coat & Birth date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Pelagem</label>
              <select
                value={coatType}
                onChange={(e) => setCoatType(e.target.value as 'curto' | 'medio' | 'longo' | 'duplo' | 'cacheado')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="curto">Pelo Curto</option>
                <option value="medio">Pelo Médio</option>
                <option value="longo">Pelo Longo</option>
                <option value="duplo">Pelagem Dupla</option>
                <option value="duro">Pelo Duro / Cerda</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Cor da Pelagem</label>
              <input
                type="text"
                placeholder="Ex: Branco, Preto, Dourado..."
                value={coatColor}
                onChange={(e) => setCoatColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Allergies & Medical/Grooming Notes */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Alergias ou Intolerâncias (se houver)
              </label>
              <input
                type="text"
                placeholder="Ex: Alergia a lâmina, perfume forte, frango, picada de pulga..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Observações Clínicas & de Banho/Tosa
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Não usar secador muito quente na cabeça; tem cicatriz na pata esquerda; gosta de carinho no queixo..."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Microchip & Vaccine Check */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nº do Microchip (Opcional)</label>
              <input
                type="text"
                placeholder="981098102345678"
                value={microchipNumber}
                onChange={(e) => setMicrochipNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={vaccinesUpToDate}
                  onChange={(e) => setVaccinesUpToDate(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                />
                <span>Vacinas principais em dia (V8/V10 / Raiva)</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {!petToEdit ? (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300 font-medium">
                <input
                  type="checkbox"
                  checked={keepOpenForMore}
                  onChange={(e) => setKeepOpenForMore(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                />
                <span>Manter nesta tela para cadastrar outros pets deste mesmo tutor</span>
              </label>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {successBanner ? 'Concluir / Fechar' : 'Cancelar'}
              </button>

              {!petToEdit && (
                <button
                  type="button"
                  onClick={() => savePetRecord(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Salvar e Cadastrar Outro Pet</span>
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{petToEdit ? 'Atualizar Pet' : 'Salvar e Concluir'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
