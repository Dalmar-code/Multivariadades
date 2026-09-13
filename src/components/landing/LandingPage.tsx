import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  CreditCard,
  Building2,
  Receipt,
  DollarSign,
  Users,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  Store,
  ChevronRight,
  Percent,
  Lock,
  Gift,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PlanType } from '../../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenSuperAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenSuperAdminLogin }) => {
  const { addClientLicense, affiliates, company } = useStore();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialForm, setTrialForm] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    document: '',
    referralCode: '',
  });
  const [trialSuccess, setTrialSuccess] = useState(false);

  const handleStartTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialForm.clientName || !trialForm.email) return;

    const today = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(today.getDate() + 10);

    const affiliate = affiliates.find(
      (a) => a.referralCode.toUpperCase() === trialForm.referralCode.trim().toUpperCase()
    );

    addClientLicense({
      clientName: trialForm.clientName,
      companyName: trialForm.companyName || trialForm.clientName,
      tradeName: trialForm.companyName || trialForm.clientName,
      document: trialForm.document || '00.000.000/0001-00',
      email: trialForm.email,
      phone: trialForm.phone,
      plan: 'trial_10_days',
      status: 'trial_active',
      trialStartDate: today.toISOString().split('T')[0],
      trialEndDate: trialEnd.toISOString().split('T')[0],
      licenseExpiryDate: trialEnd.toISOString().split('T')[0],
      isLifetime: false,
      amountPaid: 0,
      affiliateId: affiliate?.id,
      affiliateCode: affiliate?.referralCode || trialForm.referralCode,
      affiliateName: affiliate?.name,
      affiliateCommissionPaid: false,
      affiliateCommissionAmount: 0,
    });

    setTrialSuccess(true);
    setTimeout(() => {
      setIsTrialModalOpen(false);
      setTrialSuccess(false);
      onEnterApp();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                MultiVariedades ERP & PDV
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                10 DIAS GRÁTIS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSuperAdminLogin}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Área Super Admin
            </button>

            <button
              type="button"
              onClick={() => setIsTrialModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Testar 10 Dias Grátis
            </button>

            <button
              type="button"
              onClick={onEnterApp}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all"
            >
              Acessar Sistema
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
            Experimente Grátis por 10 Dias • Sem Cartão de Crédito
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            O Sistema de Gestão e Frente de Caixa PDV Mais Completo para o Seu Comércio
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Controle total de <strong>estoque por custo e venda</strong>, terminais de caixa PDV com
            <strong> fechamento diário seguro 1x/dia</strong>, emissão fiscal <strong>NFC-e / NF-e</strong> e
            <strong> isolamento de segurança por filial/loja</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              Começar Teste Grátis de 10 Dias
            </button>

            <button
              type="button"
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Ver Demonstração ao Vivo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Core Advantages Grid */}
      <section className="py-12 px-4 sm:px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Recursos Essenciais para Varejo e Atacado
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Desenvolvido sob medida para atender exigências fiscais, contábeis e de segurança
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fechamento Diário Seguro */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Fechamento de Caixa Seguro (1x ao Dia)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada caixa PDV só pode ser aberto e fechado uma única vez ao dia, com confirmação obrigatória
                para evitar fraudes e erros de contabilidade no fechamento de turno.
              </p>
            </div>

            {/* Gestão Multi-Filiais Segura */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Filiais & Número de Loja</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cadastro de lojas com Número de Loja único para segurança e SEFAZ. O operador de caixa de uma
                filial não pode abrir caixas de outras filiais.
              </p>
            </div>

            {/* Estoque em Custo e Venda */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Estoque em Custo & Lucro Projetado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saiba em tempo real a quantidade total de itens, o valor total investido em custo de reposição e
                o patrimônio total em valor de venda.
              </p>
            </div>

            {/* Frente de Caixa PDV Ágil */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">PDV Rápido com Cupom Térmico 80mm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leitor de código de barras, pagamentos em PIX com QR Code dinâmico, cartões e impressão térmica
                de cupons fiscais e recibos.
              </p>
            </div>

            {/* Emissão Fiscal */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Fiscal Completo (NFC-e / NF-e / DANFE)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emissão em contingência, cálculo de tributos (Simples Nacional), geração de XML e DANFE PDF para o
                consumidor final.
              </p>
            </div>

            {/* DRE & Financeiro */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">DRE Gerencial & Fluxo de Caixa</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Demonstrativo de Resultado com Receita Bruta, Deduções, CMV, Despesas Operacionais e Margem Líquida
                real da sua operação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
              Planos Transparentes e Sem Surpresas
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Libere seu Acesso após os 10 Dias Grátis
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Utilize o sistema completo durante 10 dias sem pagar nada. Ao final, escolha entre a assinatura
              mensal acessível ou a compra vitalícia com pagamento único.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* PLANO MENSAL */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6 hover:border-amber-500/50 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Assinatura Recorrente
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Mais Popular
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">Plano Mensal</h3>
                  <p className="text-xs text-slate-400 mt-1">Flexibilidade e baixo investimento inicial</p>
                </div>

                <div className="flex items-baseline gap-1 py-4 border-y border-slate-800">
                  <span className="text-lg font-bold text-slate-400">R$</span>
                  <span className="text-5xl font-black text-white">49,90</span>
                  <span className="text-slate-400 font-bold text-sm">/ mês</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <strong>10 Dias Grátis</strong> para começar sem compromisso
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Frente de Caixa PDV & Controle de Filiais Ilimitados
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Emissão de NFC-e / NF-e e Cupom Térmico 80mm
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Atualizações automáticas inclusas
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Cancele a qualquer momento sem taxas
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-md"
              >
                Experimentar 10 Dias Grátis
              </button>
            </div>

            {/* PLANO VITALÍCIO */}
            <div className="p-8 rounded-3xl bg-linear-to-b from-purple-950/40 to-slate-900 border-2 border-purple-500/40 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute -top-3 -right-12 bg-purple-500 text-white font-black text-[10px] uppercase py-1.5 px-12 rotate-45 shadow-md">
                MELHOR CUSTO
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Pagamento Único Perpétuo
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Sem Mensalidades
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">Plano Vitalício</h3>
                  <p className="text-xs text-purple-300 mt-1">O sistema é seu para sempre, sem cobranças futuras</p>
                </div>

                <div className="flex items-baseline gap-1 py-4 border-y border-purple-500/20">
                  <span className="text-lg font-bold text-slate-400">R$</span>
                  <span className="text-5xl font-black text-white">1.699,90</span>
                  <span className="text-slate-400 font-bold text-xs">pagamento único</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <strong>10 Dias Grátis de Teste</strong> antes de pagar
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    Licença permanente vitalícia sem mensalidades
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    Módulos completos de Filiais, PDVs, Fiscal e DRE
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    Economia de mais de 80% comparado a outros ERPs
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    Liberação direta pelo Super Administrador
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition-all cursor-pointer shadow-lg shadow-purple-600/30"
              >
                Garantir Licença Vitalícia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Program Section */}
      <section className="py-16 px-4 sm:px-6 bg-slate-900/90 border-t border-slate-800">
        <div className="max-w-5xl mx-auto rounded-3xl bg-linear-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 p-8 sm:p-12 border border-amber-500/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase">
                <Percent className="w-3.5 h-3.5" />
                Programa de Afiliados Parceiros
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Indique Lojistas e Ganhe Altas Comissões em Dinheiro via PIX
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Cada afiliado cadastrado recebe um <strong>link de indicação próprio</strong>. Você ganha
                comissões assim que o cliente realizar o pagamento:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] uppercase font-bold text-slate-400">Cliente no Plano Mensal</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">100% da 1ª Mensalidade</div>
                  <div className="text-xs text-slate-400 mt-0.5">Você recebe R$ 49,90 integral</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] uppercase font-bold text-slate-400">Cliente no Plano Vitalício</div>
                  <div className="text-xl font-black text-purple-400 mt-1">10% do Valor Vitalício</div>
                  <div className="text-xs text-slate-400 mt-0.5">Você recebe R$ 169,99 via PIX</div>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={onOpenSuperAdminLogin}
                className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl cursor-pointer transition-all flex items-center gap-2"
              >
                Cadastrar-se como Afiliado
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400">Liberação e gestão pelo Super Admin</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>MultiVariedades ERP & PDV • Sistema Comercial com Suporte a Multi-Filiais e Emissão Fiscal</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Super Administrador: dalmarsousa@gmail.com
        </p>
      </footer>

      {/* TRIAL REGISTRATION MODAL */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-800 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150">
            {trialSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-white">Teste de 10 Dias Ativado!</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Seu acesso foi liberado com sucesso. Redirecionando para o painel do sistema...
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Ativar 10 Dias Grátis</h3>
                      <p className="text-[11px] text-slate-400">Acesso completo sem cobrança inicial</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTrialModalOpen(false)}
                    className="text-slate-500 hover:text-white text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleStartTrial} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nome Completo*</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={trialForm.clientName}
                      onChange={(e) => setTrialForm({ ...trialForm, clientName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nome da Empresa / Loja</label>
                    <input
                      type="text"
                      placeholder="Multi Lojas LTDA"
                      value={trialForm.companyName}
                      onChange={(e) => setTrialForm({ ...trialForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">E-mail*</label>
                      <input
                        type="email"
                        required
                        placeholder="loja@email.com"
                        value={trialForm.email}
                        onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">WhatsApp / Celular</label>
                      <input
                        type="text"
                        placeholder="(11) 99999-8888"
                        value={trialForm.phone}
                        onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Código de Afiliado Indicador (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: DALMAR2026"
                      value={trialForm.referralCode}
                      onChange={(e) => setTrialForm({ ...trialForm, referralCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono font-bold uppercase outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      Liberar Meus 10 Dias de Teste
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
