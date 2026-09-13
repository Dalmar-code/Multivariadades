import React from 'react';
import {
  X,
  Printer,
  FileText,
  Stethoscope,
  HeartPulse,
  Thermometer,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { VeterinaryConsultation } from '../../types';
import { useStore } from '../../context/StoreContext';

interface VeterinaryRecordViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: VeterinaryConsultation | null;
  onBillToPDV?: (consultationId: string) => void;
}

export const VeterinaryRecordViewModal: React.FC<VeterinaryRecordViewModalProps> = ({
  isOpen,
  onClose,
  consultation,
  onBillToPDV,
}) => {
  const { company } = useStore();

  if (!isOpen || !consultation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-6 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:max-w-none print:m-0 print:rounded-none">
        {/* Header / Actions - Hidden on print */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Prontuário & Receituário Veterinário
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {consultation.code}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Documento clínico oficial com CRMV, procedimentos e prescrição
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Receita</span>
            </button>
            {consultation.paymentStatus !== 'pago' && onBillToPDV && (
              <button
                type="button"
                onClick={() => {
                  onBillToPDV(consultation.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <DollarSign className="w-4 h-4" />
                <span>Faturar no PDV</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="space-y-6 printable-area">
          {/* Clinic & Vet Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-emerald-600 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {company.tradeName || company.corporateName || 'Centro Veterinário Integrado'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {company.address?.street ? `${company.address.street}, ${company.address.number || ''}` : 'Endereço Comercial'}, {company.address?.city || 'São Paulo'} - {company.address?.state || 'SP'} | CNPJ: {company.cnpj}
              </p>
              <p className="text-xs text-slate-600">
                Telefone / WhatsApp: {company.phone || company.whatsapp} | E-mail: {company.email}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                Atendimento Clínico Veterinário
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {consultation.veterinarianName}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 block">
                CRMV: {consultation.crmv}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Data: {new Date(consultation.date).toLocaleDateString('pt-BR')} às {consultation.time}
              </span>
            </div>
          </div>

          {/* Patient & Owner Info Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Paciente (Pet)</span>
              <span className="font-extrabold text-slate-900 text-sm">🐾 {consultation.petName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Espécie / Raça</span>
              <span className="font-bold text-slate-800">
                {consultation.petSpecies.toUpperCase()} • {consultation.petBreed}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Idade / Peso</span>
              <span className="font-bold text-slate-800">
                {consultation.petAgeYears ? `${consultation.petAgeYears} anos` : 'N/I'} •{' '}
                {consultation.petWeightKg ? `${consultation.petWeightKg} kg` : 'N/I'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Tutor(a) Responsável</span>
              <span className="font-bold text-slate-800">{consultation.clientName}</span>
              {consultation.clientPhone && (
                <span className="text-[10px] text-slate-500 block">{consultation.clientPhone}</span>
              )}
            </div>
          </div>

          {/* Vitals Summary */}
          {(consultation.temperatureCelsius || consultation.heartRateBpm || consultation.mucousMembranes) && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-wrap items-center gap-6 text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                Sinais Vitais na Triagem:
              </span>
              {consultation.temperatureCelsius && (
                <span className="text-slate-700">
                  <strong>Temperatura:</strong> {consultation.temperatureCelsius}°C
                </span>
              )}
              {consultation.heartRateBpm && (
                <span className="text-slate-700">
                  <strong>Freq. Cardíaca:</strong> {consultation.heartRateBpm} bpm
                </span>
              )}
              {consultation.respiratoryRateRpm && (
                <span className="text-slate-700">
                  <strong>Freq. Respiratória:</strong> {consultation.respiratoryRateRpm} rpm
                </span>
              )}
              {consultation.mucousMembranes && (
                <span className="text-slate-700">
                  <strong>Mucosas:</strong> {consultation.mucousMembranes}
                </span>
              )}
              {consultation.hydrationStatus && (
                <span className="text-slate-700">
                  <strong>Hidratação:</strong> {consultation.hydrationStatus}
                </span>
              )}
            </div>
          )}

          {/* Clinical Findings */}
          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                Queixa Principal & Anamnese
              </h4>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                {consultation.chiefComplaint}
                {consultation.anamnesis && (
                  <span className="block mt-1 text-slate-600 italic">
                    Histórico: {consultation.anamnesis}
                  </span>
                )}
              </p>
            </div>

            {consultation.diagnosis && (
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500 mb-1">
                  Diagnóstico Clínico / Suspeita
                </h4>
                <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold leading-relaxed">
                  {consultation.diagnosis}
                </p>
              </div>
            )}
          </div>

          {/* Prescription */}
          {consultation.prescription && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Prescrição Médica Veterinária & Tratamento
                </h4>
              </div>
              <div className="p-4 bg-emerald-50/30 border-2 border-emerald-200 rounded-xl font-mono text-xs text-slate-900 whitespace-pre-wrap leading-relaxed">
                {consultation.prescription}
              </div>
            </div>
          )}

          {/* Services & Procedures breakdown (including ad-hoc / unlisted) */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
              Procedimentos Realizados no Atendimento
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {consultation.standardServices.map((srv, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{srv.serviceName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      Catálogo
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">R$ {srv.price.toFixed(2)}</span>
                </div>
              ))}

              {consultation.customServices?.map((cst) => (
                <div key={cst.id} className="p-2.5 flex items-center justify-between bg-amber-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-950">{cst.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        Procedimento Avulso Informado
                      </span>
                    </div>
                    {cst.description && (
                      <p className="text-[11px] text-slate-600 mt-0.5">{cst.description}</p>
                    )}
                  </div>
                  <span className="font-extrabold text-amber-900">R$ {cst.price.toFixed(2)}</span>
                </div>
              ))}

              <div className="p-3 bg-slate-50 flex items-center justify-between font-black text-sm text-slate-900">
                <span>Total dos Serviços:</span>
                <span className="text-emerald-700">R$ {consultation.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Return Date Notice */}
          {consultation.returnDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Retorno Clínico Agendado:</strong> Retorno previsto para o dia{' '}
                <strong>{new Date(consultation.returnDate).toLocaleDateString('pt-BR')}</strong> para reavaliação.
              </span>
            </div>
          )}

          {/* Signature & CRMV Stamp Line */}
          <div className="pt-8 border-t border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-64 border-b-2 border-slate-400 mb-2"></div>
            <span className="text-xs font-bold text-slate-900 block">
              {consultation.veterinarianName}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800 block">
              Médico(a) Veterinário(a) - CRMV {consultation.crmv}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
