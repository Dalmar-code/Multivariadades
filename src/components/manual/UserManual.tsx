import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Store,
  Package,
  ShoppingCart,
  Receipt,
  DollarSign,
  Clock,
  Layers,
  Syringe,
  Users,
  Building2,
  UserCheck,
  BarChart3,
  HelpCircle,
  Printer,
  Sparkles,
  ChevronRight,
  FileText,
  BadgeCheck,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BackButton } from '../common/BackButton';
import { RETAIL_NICHES } from '../../utils/retailNiches';

interface ManualTopic {
  id: string;
  category: 'iniciante' | 'operacao' | 'estoque' | 'fiscal' | 'gestao';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  targetTab?: string;
  readTime: string;
  description: string;
  forWhom: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
  }[];
  termsGlossary?: {
    term: string;
    meaning: string;
  }[];
  commonMistakes?: string[];
  goldenTips?: string[];
}

export const UserManual: React.FC = () => {
  const { setActiveTab, company, companyNiche } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeTopicId, setActiveTopicId] = useState<string>('inicio_rapido');

  const manualTopics: ManualTopic[] = useMemo(
    () => [
      {
        id: 'inicio_rapido',
        category: 'iniciante',
        title: 'Guia de 5 Minutos: Como Começar do Zero',
        subtitle: 'Roteiro simples e rápido para quem nunca usou o sistema',
        icon: Sparkles,
        readTime: '4 min',
        description:
          'Seja bem-vindo! Você não precisa ser expert em computadores para usar este sistema. Siga apenas 4 passos básicos para colocar sua loja para funcionar e fazer sua primeira venda hoje mesmo.',
        forWhom: 'Proprietários, gerentes e novos operadores da loja.',
        steps: [
          {
            title: '1º Passo: Cadastre os dados da sua Empresa e Nicho',
            description:
              'Acesse "Dados da Empresa" no menu lateral. Escolha o nicho do seu comércio (ex: Farmácia, Supermercado, Loja de Roupas, Pet Shop ou Variedades). Coloque o CNPJ ou CPF, nome da sua loja e endereço. O sistema já vai carregar as cores e departamentos corretos para o seu tipo de negócio.',
            tip: '💡 Dica: Se tiver o logotipo da loja, anexe a foto para sair impresso nos cupons e recibos dos clientes.',
          },
          {
            title: '2º Passo: Cadastre seus primeiros Produtos',
            description:
              'Vá em "Produtos (Estoque)" e clique no botão verde "+ Cadastrar Produto". Preencha o nome (ex: Arroz 5kg ou Dipirona 500mg), bipe o código de barras da embalagem ou clique em "Gerar EAN-13". Coloque o preço de custo que você pagou e o preço de venda que quer cobrar.',
            tip: '💡 Dica: O sistema calcula a sua margem de lucro na hora! Você pode cadastrar até 8 fotos por produto.',
          },
          {
            title: '3º Passo: Abra o Caixa da Loja',
            description:
              'Vá em "PDV - Caixa Balcão". O sistema vai perguntar o "Fundo de Troco" (quanto dinheiro em moedas e notas tem na gaveta para dar troco no início do dia, por exemplo: R$ 100,00). Digite o valor e clique em "Abrir Caixa".',
            tip: '💡 Dica: Sem abrir o caixa, o sistema não deixa passar compras por segurança do seu dinheiro.',
          },
          {
            title: '4º Passo: Faça a sua Primeira Venda!',
            description:
              'Com o caixa aberto, bipe o código de barras ou digite o nome do produto no campo de busca. Clique em "Finalizar Venda (F4)", escolha se o cliente pagou em Dinheiro, PIX ou Cartão e clique em "Concluir Venda". O cupom sai prontinho para impressão!',
          },
        ],
        goldenTips: [
          'Você pode usar um leitor de código de barras USB ou sem fio barato; basta conectar no computador e bipar.',
          'No final do expediente, vá no PDV e clique em "Fechar Caixa". O sistema confere tudo que entrou em dinheiro, PIX e cartão para você não ter surpresas.',
        ],
      },
      {
        id: 'empresa_nicho',
        category: 'iniciante',
        title: '1. Dados da Empresa & Nicho de Varejo',
        subtitle: 'Como configurar nome, logotipo, cores e seu segmento de atuação',
        icon: Store,
        targetTab: 'empresa',
        readTime: '3 min',
        description:
          'Aqui você define a identidade da sua loja. O sistema foi desenvolvido sob medida para o varejo brasileiro e se adapta conforme o seu ramo de atividade.',
        forWhom: 'Proprietários e Administradores da Loja.',
        steps: [
          {
            title: 'Como escolher o nicho de mercado',
            description:
              'Na tela de Dados da Empresa, clique no card do seu segmento: Farmácia, Supermercado, Moda, Pet Shop, Autopeças, Materiais de Construção, Eletrônicos, Restaurante ou Ótica. Ao clicar, o sistema adapta os departamentos, regras de validade e recursos fiscais.',
          },
          {
            title: 'Preenchimento dos dados fiscais',
            description:
              'Preencha a Razão Social (nome no contrato social), Nome Fantasia (nome na fachada), CNPJ e Inscrição Estadual (IE). Se você for MEI ou Isento de IE, marque "ISENTO".',
          },
          {
            title: 'Endereço e Contato',
            description:
              'Digite o CEP, Rua, Bairro, Cidade e Telefone/WhatsApp. Esses dados saem no cabeçalho do cupom fiscal e recibos.',
          },
          {
            title: 'Cores e Logomarca',
            description:
              'Você pode enviar uma foto da sua logomarca ou colar o link da imagem. O sistema ainda oferece o recurso de "Extrair cores da imagem" para deixar o sistema com a identidade visual da sua marca.',
          },
        ],
        termsGlossary: [
          { term: 'Razão Social', meaning: 'O nome oficial registrado na Receita Federal e Junta Comercial.' },
          { term: 'Nome Fantasia', meaning: 'O nome popular pelo qual os clientes conhecem a sua loja.' },
          { term: 'Inscrição Estadual (IE)', meaning: 'Número do cadastro na SEFAZ do seu estado para venda de mercadorias.' },
        ],
        goldenTips: [
          'Se você mudar de ramo ou quiser testar outros nichos, pode alterar a qualquer momento sem perder os produtos já cadastrados.',
        ],
      },
      {
        id: 'produtos_estoque',
        category: 'estoque',
        title: '2. Cadastro de Produtos & Estoque',
        subtitle: 'Adicione itens com código de barras, fotos, margem de lucro e lote',
        icon: Package,
        targetTab: 'produtos',
        readTime: '5 min',
        description:
          'O coração da sua loja! Aprenda a cadastrar mercadorias de maneira organizada com preços automáticos, fotos em fundo branco e aviso de estoque baixo.',
        forWhom: 'Estoquistas, Gerentes e Administradores.',
        steps: [
          {
            title: 'Como iniciar um novo cadastro',
            description:
              'No menu lateral, clique em "Produtos (Estoque)" e depois no botão amarelo "+ Cadastrar Produto". Uma janela completa vai se abrir.',
          },
          {
            title: 'Código de Barras (EAN-13) e SKU',
            description:
              'Se o produto já tiver código de barras de fábrica (como refrigerante, remédio ou ferramenta), basta passar o leitor no campo de código de barras. Se for um produto de fabricação própria ou a granel, clique no botão "Gerar EAN-13 Válido" que o sistema cria um código oficial para você imprimir etiqueta.',
          },
          {
            title: 'Estrutura Mercadológica (Departamento e Categoria)',
            description:
              'Selecione em qual departamento o produto fica (ex: Higiene, Bebidas, Medicamentos, Ferramentas) e a categoria específica. Isso ajuda muito na hora de tirar relatórios de vendas.',
          },
          {
            title: 'Preço de Custo, Margem de Lucro e Preço de Venda',
            description:
              'Coloque o "Preço de Custo" (quanto você pagou ao fornecedor). Em seguida, digite a margem que deseja lucrar (ex: 50%) ou digite diretamente o Preço de Venda final (ex: R$ 25,00). O sistema calcula os valores e impostos automaticamente.',
            tip: '💡 Exemplo: Custo R$ 10,00 + Margem 100% = Venda a R$ 20,00.',
          },
          {
            title: 'Estoque Atual e Estoque Mínimo',
            description:
              'Informe quantas unidades você tem na prateleira agora. O "Estoque Mínimo" serve para o sistema te avisar em vermelho quando o produto estiver acabando e precisar comprar mais do fornecedor.',
          },
          {
            title: 'Validade e Número de Lote (Essencial para Farmácias e Alimentos)',
            description:
              'Se o item tiver prazo de vencimento (remédios, iogurtes, rações), preencha a "Data de Validade" e o "Lote". Isso alimenta o painel de Controle de Validades automaticamente!',
          },
          {
            title: 'Fotos do Produto',
            description:
              'Você pode adicionar até 8 fotos! O sistema aceita envio do computador ou link da web. Fotos bonitas facilitam muito a identificação pelo vendedor no caixa.',
          },
        ],
        termsGlossary: [
          { term: 'EAN-13', meaning: 'O código de barras padrão de 13 dígitos presente na maioria dos produtos comerciais.' },
          { term: 'SKU', meaning: 'Código interno da sua loja para identificar a peça (ex: FER-001).' },
          { term: 'Estoque Mínimo', meaning: 'A quantidade de segurança para você não ficar sem mercadoria para vender.' },
        ],
        commonMistakes: [
          'Esquecer de colocar o código de barras e depois não conseguir bipar o produto no caixa.',
          'Colocar o preço com vírgula ou ponto no lugar errado (ex: digitar 1000 ao invés de 10.00).',
        ],
      },
      {
        id: 'validades_lotes',
        category: 'estoque',
        title: '3. Controle de Validades & Lotes (FEFO)',
        subtitle: 'Evite perdas financeiras e multas da vigilância sanitária',
        icon: Clock,
        targetTab: 'validades',
        readTime: '3 min',
        description:
          'Painel inteligente que organiza seus produtos por urgência de vencimento: Vencidos (vermelho), Vencendo em 30 dias (laranja), 60 dias (amarelo) e Regulares (verde).',
        forWhom: 'Farmácias, Supermercados, Pet Shops e comércios com perecíveis.',
        steps: [
          {
            title: 'Como verificar os produtos próximos ao vencimento',
            description:
              'Acesse "Controle de Validades" no menu lateral. No topo, você verá 4 cartões com a contagem exata e o valor em R$ de mercadoria em risco.',
          },
          {
            title: 'Como agir antes de perder o produto',
            description:
              'Ao identificar itens que vencem nos próximos 30 ou 60 dias, faça uma promoção ou queima de estoque no caixa antes que vençam. O sistema sinaliza com etiquetas coloridas chamativas.',
          },
          {
            title: 'Rastreabilidade de Lotes para Farmácia e ANVISA',
            description:
              'Se algum lote for recolhido pelo fabricante ou pela ANVISA, basta digitar o número do lote no campo de busca para listar exatamente quantas unidades ainda existem na loja e em qual prateleira estão guardadas.',
          },
        ],
        goldenTips: [
          'Regra FEFO (First Expire, First Out): Sempre coloque os produtos que vencem primeiro na frente da prateleira para o cliente pegar antes.',
        ],
      },
      {
        id: 'departamentos_categorias',
        category: 'estoque',
        title: '4. Departamentos & Categorias',
        subtitle: 'Organize as gôndolas e seções do seu comércio',
        icon: Layers,
        targetTab: 'departamentos',
        readTime: '3 min',
        description:
          'Gerencie a árvore mercadológica da sua loja. O sistema já vem com os departamentos oficiais do varejo brasileiro configurados e permite criar novos a qualquer momento.',
        forWhom: 'Administradores e Gerentes.',
        steps: [
          {
            title: 'Como ver os departamentos do seu nicho',
            description:
              'Clique em "Departamentos & Categorias" no menu lateral. Você verá a lista completa de seções recomendadas para o seu ramo (ex: Medicamentos, Perfumaria, Bebidas, Roupas).',
          },
          {
            title: 'Como criar uma Categoria Personalizada',
            description:
              'No formulário superior da tela, selecione o departamento desejado, digite o nome da nova categoria (ex: "Chás Naturais" ou "Parafusos Especiais") e clique em "+ Adicionar Categoria".',
          },
          {
            title: 'Uso no cadastro de produtos',
            description:
              'Assim que você cadastrar uma nova categoria, ela já fica disponível na hora na listinha suspensa de cadastro de produtos.',
          },
        ],
      },
      {
        id: 'caixa_pdv',
        category: 'operacao',
        title: '5. Frente de Caixa (PDV) & Realização de Vendas',
        subtitle: 'Como abrir caixa, bipar produtos, aplicar desconto e finalizar',
        icon: ShoppingCart,
        targetTab: 'pdv',
        readTime: '6 min',
        description:
          'O módulo mais utilizado no dia a dia. Rápido, leve e simples, funciona com teclado numérico, leitor de código de barras ou tela touch.',
        forWhom: 'Operadores de Caixa, Vendedores e Gerentes.',
        steps: [
          {
            title: 'Passo 1: Abertura de Caixa (Início do Turno)',
            description:
              'Ao entrar no PDV com o caixa fechado, informe o valor do fundo de troco (ex: R$ 150,00 em notas miúdas) e clique em "Abrir Caixa Agora". Uma sessão de caixa exclusiva é iniciada com a data e hora registradas.',
          },
          {
            title: 'Passo 2: Inserir Produtos no Carrinho',
            description:
              'Bipe o código de barras com o leitor óptico. Se não tiver leitor, digite o nome do produto no campo de busca ou clique na foto do produto no catálogo visual. O item entra no carrinho na hora.',
            tip: '💡 Dica: Para alterar a quantidade, clique nos botões de (+) ou (-) no carrinho, ou digite o número desejado.',
          },
          {
            title: 'Passo 3: Desconto ou CPF do Cliente',
            description:
              'Se o cliente tiver direito a desconto, você pode informar a porcentagem ou valor em reais. Você também pode associar o CPF do cliente para Nota Fiscal Paulista ou cadastro de fidelidade.',
          },
          {
            title: 'Passo 4: Finalizar a Venda (Pagamento)',
            description:
              'Clique no botão grande verde "Finalizar Venda" (ou aperte F4 no teclado). Escolha a forma de pagamento: Dinheiro, PIX (gera QR Code), Cartão de Débito, Cartão de Crédito ou A Prazo (Fiado/Crediário).',
            tip: '💡 Dica em Dinheiro: Digite o valor que o cliente te entregou (ex: Compra R$ 35, cliente deu R$ 50). O sistema calcula o troco exato na tela (R$ 15,00)!',
          },
          {
            title: 'Passo 5: Impressão do Cupom / NFC-e',
            description:
              'Ao concluir, a janela do comprovante de venda se abre automaticamente pronta para impressora térmica de 80mm ou 58mm, com QR Code da SEFAZ para conferência do consumidor.',
          },
          {
            title: 'Suprimento e Sangria (Movimentações de Gaveta)',
            description:
              'Durante o dia, se você colocar mais troco na gaveta, use a opção "Suprimento (+)". Se retirar dinheiro para pagar uma entrega ou guardar no cofre, use a opção "Sangria (-)". Tudo fica registrado para não dar diferença no final.',
          },
          {
            title: 'Fechamento de Caixa (Fim do Turno)',
            description:
              'No final do dia, clique em "Fechar Caixa". Conte o dinheiro da gaveta e digite os valores. O sistema faz o batimento e emite o relatório de fechamento para o gerente assinar.',
          },
        ],
        termsGlossary: [
          { term: 'Fundo de Troco', meaning: 'Dinheiro colocado na gaveta no início do dia para voltar troco aos primeiros clientes.' },
          { term: 'Sangria', meaning: 'Retirada de dinheiro da gaveta durante o dia por motivo de segurança ou pagamento.' },
          { term: 'Suprimento', meaning: 'Entrada avulsa de dinheiro no caixa (ex: reforço de moedas).' },
        ],
      },
      {
        id: 'vacinas_clinica',
        category: 'operacao',
        title: '6. Agenda de Vacinas & Atenção Farmacêutica / Pet',
        subtitle: 'Controle de aplicações injetáveis, doses de reforço e carteirinha',
        icon: Syringe,
        targetTab: 'vacinas',
        readTime: '4 min',
        description:
          'Módulo exclusivo para Drogarias com sala de vacinas e Pet Shops / Clínicas Veterinárias. Garante rastreabilidade total conforme exigido pela ANVISA e pelos Conselhos Profissionais.',
        forWhom: 'Farmacêuticos (CRF), Médicos Veterinários (CRMV) e Atendentes.',
        steps: [
          {
            title: 'Como agendar uma nova aplicação',
            description:
              'Acesse "Agenda de Vacinas" no menu lateral e clique em "+ Agendar / Registrar Vacina".',
          },
          {
            title: 'Identificação do Paciente',
            description:
              'Para farmácia, informe Nome do Paciente, CPF, Data de Nascimento e Telefone. Se for Pet Shop, informe o Nome do Pet, Espécie (Cão, Gato) e o Nome do Tutor responsável.',
          },
          {
            title: 'Dados Técnicos da Vacina',
            description:
              'Informe a Vacina aplicada (Gripe Tetravalente, HPV, Raiva Canina, V10, etc.), o Fabricante, o Número do Lote e a Data de Validade da ampola.',
          },
          {
            title: 'Dose e Local de Aplicação',
            description:
              'Selecione se é 1ª Dose, 2ª Dose ou Reforço Anual. Indique o local anatômico (ex: Deltoide Direito, Glúteo ou Subcutâneo) e o nome do profissional aplicador com número do CRF/CRMV.',
          },
          {
            title: 'Emissão da Carteirinha e Próxima Dose',
            description:
              'O sistema gera na hora a Carteirinha de Vacinação oficial pronta para impressão ou envio por WhatsApp para o cliente não esquecer a data do reforço.',
          },
        ],
        goldenTips: [
          'Você pode usar a busca rápida pelo nome do paciente para ver todo o histórico de vacinas tomadas ao longo dos anos.',
        ],
      },
      {
        id: 'clientes_nota_paulista',
        category: 'operacao',
        title: '7. Clientes & CPF na Nota (Nota Paulista)',
        subtitle: 'Cadastro de clientes fiéis, limite de crédito e benefícios fiscais',
        icon: Users,
        targetTab: 'clientes',
        readTime: '4 min',
        description:
          'Gerencie sua carteira de clientes, fidelize consumidores com histórico de compras e cumpra os requisitos do programa Nota Fiscal Paulista e programas de cidadania fiscal.',
        forWhom: 'Vendedores e Atendentes de Balcão.',
        steps: [
          {
            title: 'Como cadastrar um cliente',
            description:
              'Acesse "Clientes & Nota Paulista" e clique em "+ Cadastrar Cliente". Informe o Nome Completo, CPF ou CNPJ, Telefone/WhatsApp e E-mail.',
          },
          {
            title: 'Opção "CPF na Nota Paulista"',
            description:
              'Marque a opção "Participa da Nota Fiscal Paulista" se o cliente desejar receber créditos do governo e participar dos sorteios mensais da SEFAZ.',
          },
          {
            title: 'Preferências por Nicho de Consumo',
            description:
              'No cadastro do cliente, você pode registrar informações úteis: se tiver alergia a remédios (Farmácia), nome do cão/gato (Pet Shop) ou numeração de roupas e sapatos (Moda). Isso impressiona o cliente no atendimento!',
          },
          {
            title: 'Histórico e Limite de Fiado (Crediário Próprio)',
            description:
              'Você pode definir um Limite de Crédito para clientes antigos comprarem a prazo, com acompanhamento de faturas em aberto.',
          },
        ],
      },
      {
        id: 'fiscal_nfce',
        category: 'fiscal',
        title: '8. Gestão Fiscal: Emissão de NFC-e e NF-e',
        subtitle: 'Entenda os cupons eletrônicos, DANFE, NCM e regras da SEFAZ',
        icon: Receipt,
        targetTab: 'fiscal',
        readTime: '5 min',
        description:
          'Descomplique as obrigações fiscais da sua loja. O sistema gera automaticamente as notas com chave de acesso de 44 dígitos, XML e QR Code homologado.',
        forWhom: 'Contabilidade, Gerentes e Administradores.',
        steps: [
          {
            title: 'Diferença entre NFC-e e NF-e',
            description:
              '• NFC-e (Modelo 65): É o Cupom Fiscal Eletrônico do consumidor final vendido no balcão do dia a dia.\n• NF-e (Modelo 55): É a Nota Fiscal Grande emitida para empresas (PJ), compras de atacado ou devolução de mercadorias.',
          },
          {
            title: 'Configuração Fiscal Inicial',
            description:
              'Acesse a tela "Fiscal (NF-e / NFC-e)". Defina o Regime Tributário da sua empresa (ex: Simples Nacional ou MEI), a Série da Nota (padrão 1) e o Ambiente (Homologação para testes ou Produção para valer).',
          },
          {
            title: 'O que é NCM e por que ele é obrigatório?',
            description:
              'NCM é o código de 8 números que a Receita Federal usa para saber que imposto incide sobre cada produto. Na hora de cadastrar o produto, basta preencher o NCM que vem na nota de compra do fornecedor (ex: 3004.90.99 para medicamentos ou 8205.40.00 para chaves de fenda).',
          },
          {
            title: 'Como imprimir a 2ª via ou cancelar uma nota',
            description:
              'Na aba Fiscal, você pode buscar qualquer nota emitida por data ou número, clicar em "Imprimir DANFE" ou clicar em "Cancelar Nota" caso o cliente tenha desistido da compra em até 30 minutos.',
          },
        ],
        termsGlossary: [
          { term: 'NFC-e', meaning: 'Nota Fiscal de Consumidor Eletrônica (substitui o antigo cupom de ECF).' },
          { term: 'DANFE', meaning: 'Documento Auxiliar da Nota Fiscal Eletrônica (o papel impresso).' },
          { term: 'NCM', meaning: 'Nomenclatura Comum do Mercosul (classificação fiscal dos produtos).' },
        ],
      },
      {
        id: 'financeiro_dre',
        category: 'gestao',
        title: '9. Financeiro, Contas a Pagar/Receber e DRE',
        subtitle: 'Descubra quanto você realmente lucrou e controle os gastos',
        icon: DollarSign,
        targetTab: 'financeiro',
        readTime: '4 min',
        description:
          'Módulo de inteligência financeira para você não trabalhar no escuro. Acompanhe entradas, despesas fixas (aluguel, luz, salários) e o DRE de resultado do mês.',
        forWhom: 'Proprietários e Gestores Financeiros.',
        steps: [
          {
            title: 'Como registrar uma Despesa da Loja',
            description:
              'Na tela Financeiro, clique em "+ Nova Despesa". Digite a descrição (ex: Conta de Energia Cemig, Aluguel do Ponto ou Fornecedor de Bebidas), o valor, a data de vencimento e a categoria de custo.',
          },
          {
            title: 'Acompanhamento do Fluxo de Caixa',
            description:
              'O sistema soma automaticamente todas as vendas finalizadas no PDV como "Receitas" e subtrai as despesas pagas, mostrando o saldo real disponível em caixa.',
          },
          {
            title: 'Entendendo o DRE (Demonstrativo do Resultado do Exercício)',
            description:
              'O DRE mostra a saúde real do seu negócio: Faturamento Bruto (-) Devoluções e Impostos (=) Faturamento Líquido (-) Custo da Mercadoria Vendida (CMV) (=) Lucro Bruto (-) Despesas Operacionais (=) Lucro Líquido Final no seu bolso!',
          },
        ],
        termsGlossary: [
          { term: 'CMV', meaning: 'Custo da Mercadoria Vendida (o quanto você pagou aos fornecedores pelos produtos que saíram).' },
          { term: 'Lucro Líquido', meaning: 'O que sobrou limpo para a empresa depois de pagar todas as contas e compras.' },
        ],
      },
      {
        id: 'filiais_multi_loja',
        category: 'gestao',
        title: '10. Filiais & Gestão Multi-Loja',
        subtitle: 'Como gerenciar matriz e filiais em um único sistema centralizado',
        icon: Building2,
        targetTab: 'filiais',
        readTime: '3 min',
        description:
          'Se você tem mais de uma unidade, quiosque ou loja física, você pode controlar cada uma separadamente com seus próprios operadores de caixa e CNPJs.',
        forWhom: 'Proprietários de Redes e Franquias.',
        steps: [
          {
            title: 'Como cadastrar uma nova Loja / Filial',
            description:
              'Vá em "Filiais & Lojas (PDVs)" no menu lateral. Clique em "+ Nova Filial". Informe o número identificador da loja (ex: "001 - Matriz Centro", "002 - Loja Shopping"), CNPJ e endereço da unidade.',
          },
          {
            title: 'Associação de Caixas e Operadores',
            description:
              'Ao cadastrar um funcionário na tela de Usuários, você pode fixar a qual loja ele pertence. Isso impede que o operador de uma loja abra o caixa da outra por engano.',
          },
        ],
      },
      {
        id: 'usuarios_seguranca',
        category: 'gestao',
        title: '11. Usuários, Senhas e Perfis de Acesso (RBAC)',
        subtitle: 'Proteja seus dados dando a cada funcionário apenas o acesso necessário',
        icon: UserCheck,
        targetTab: 'usuarios',
        readTime: '3 min',
        description:
          'Tenha controle total sobre o que cada colaborador pode ver e fazer no sistema, evitando que operadores vejam relatórios financeiros ou alterem preços indevidamente.',
        forWhom: 'Administradores da Loja.',
        steps: [
          {
            title: 'Os 4 Perfis de Acesso disponíveis',
            description:
              '• Administrador (Gerente/Dono): Acesso total a tudo, faturamento, estoque, relatórios e cancelamento.\n• Operador de Caixa: Acesso focado no PDV para abrir/fechar caixa e passar compras.\n• Vendedor de Balcão: Acesso para consultar produtos, tirar pré-vendas e cadastrar clientes.\n• Super Admin: Controle mestre de filiais e licenças.',
          },
          {
            title: 'Como cadastrar um novo funcionário',
            description:
              'Vá em "Usuários & Perfis" e clique em "+ Adicionar Usuário". Digite o Nome do funcionário, Usuário de login (ex: maria.caixa), E-mail, Senha e escolha a função correspondente.',
          },
          {
            title: 'Como bloquear o acesso de um ex-funcionário',
            description:
              'Basta clicar no interruptor "Ativo / Inativo" ao lado do nome da pessoa. O acesso é revogado imediatamente sem apagar o histórico de vendas que ela fez no passado.',
          },
        ],
        goldenTips: [
          'Nunca compartilhe a senha de Administrador com operadores de caixa para garantir a segurança dos seus relatórios financeiros.',
        ],
      },
      {
        id: 'relatorios_auditoria',
        category: 'gestao',
        title: '12. Relatórios em PDF & Posição de Estoque',
        subtitle: 'Exportação de relatórios profissionais com 1 clique para impressora ou PDF',
        icon: BarChart3,
        targetTab: 'relatorios',
        readTime: '3 min',
        description:
          'Emita relatórios completos prontos para reuniões, contadores ou prestação de contas com gráficos, totais e separação por períodos.',
        forWhom: 'Administradores, Gerentes e Contadores.',
        steps: [
          {
            title: 'Como emitir relatório de vendas por período',
            description:
              'Clique em "Relatórios em PDF" no menu lateral. Escolha o período desejado (Hoje, Esta Semana, Este Mês ou Personalizado).',
          },
          {
            title: 'Relatório de Posição e Custo de Estoque',
            description:
              'Descubra exatamente quanto dinheiro você tem parado em mercadorias na sua loja calculado a preço de custo e a preço de venda com a margem potencial.',
          },
          {
            title: 'Exportação para PDF / Impressão',
            description:
              'Clique no botão "Imprimir / Salvar em PDF". O documento é gerado formatado em folha A4 com logotipo da sua loja no cabeçalho.',
          },
        ],
      },
    ],
    []
  );

  // Filter topics based on category and search
  const filteredTopics = useMemo(() => {
    return manualTopics.filter((t) => {
      const matchesCategory =
        selectedCategory === 'todos' || t.category === selectedCategory;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.steps.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q)
        ) ||
        (t.termsGlossary &&
          t.termsGlossary.some(
            (g) =>
              g.term.toLowerCase().includes(q) ||
              g.meaning.toLowerCase().includes(q)
          ));

      return matchesCategory && matchesSearch;
    });
  }, [manualTopics, selectedCategory, searchTerm]);

  // Current active topic
  const currentTopic = useMemo(() => {
    return (
      manualTopics.find((t) => t.id === activeTopicId) ||
      filteredTopics[0] ||
      manualTopics[0]
    );
  }, [manualTopics, activeTopicId, filteredTopics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Guia Prático Passo a Passo
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manual do Usuário & Operação Simples
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Instruções detalhadas, sem termos complicados, para qualquer pessoa
              cadastrar, operar o caixa e administrar o comércio com facilidade e
              segurança.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <BackButton variant="dark" label="Voltar ao Painel" className="px-3.5 py-2 text-xs" />
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Imprimir Manual Completo"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Imprimir Guia
            </button>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="mt-6 pt-6 border-t border-slate-700/80">
          <div className="relative max-w-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="O que você precisa fazer? Ex: 'abrir caixa', 'cadastrar produto', 'sangria', 'nfc-e', 'vacina', 'validade'..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-400 text-xs sm:text-sm outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-700"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'todos', label: 'Todos os Tópicos' },
          { id: 'iniciante', label: '🌟 Começando do Zero' },
          { id: 'operacao', label: '🛒 Vendas & Caixa (PDV)' },
          { id: 'estoque', label: '📦 Estoque & Validades' },
          { id: 'fiscal', label: '🧾 Fiscal (NFC-e / NF-e)' },
          { id: 'gestao', label: '💰 Gestão & Finanças' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-slate-900 text-amber-400 shadow-sm border border-slate-900'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Topic List Navigation */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Módulos do Sistema ({filteredTopics.length})
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const isSelected = activeTopicId === topic.id;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 text-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {topic.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {topic.readTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {topic.subtitle}
                    </p>
                  </div>

                  {isSelected && (
                    <ChevronRight className="w-4 h-4 text-amber-600 shrink-0 self-center" />
                  )}
                </button>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Nenhum tópico encontrado</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tente buscar por termos mais genéricos como "caixa", "venda" ou "estoque".
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Reading Panel */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {currentTopic ? (
            <>
              {/* Topic Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                      <currentTopic.icon className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Para: {currentTopic.forWhom}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        {currentTopic.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {currentTopic.description}
                  </p>
                </div>

                {currentTopic.targetTab && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(currentTopic.targetTab!)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <span>Ir para esta Tela Agora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Numbered Steps */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Passo a Passo Prático
                </h3>

                <div className="space-y-3.5">
                  {currentTopic.steps.map((step, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {step.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {step.description}
                          </p>
                          {step.tip && (
                            <div className="pt-2 text-xs font-semibold text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 mt-2">
                              {step.tip}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Tips Section */}
              {currentTopic.goldenTips && currentTopic.goldenTips.length > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <Lightbulb className="w-4 h-4 text-emerald-700" />
                    Dicas de Ouro & Melhores Práticas
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-900 list-disc list-inside">
                    {currentTopic.goldenTips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes to Avoid */}
              {currentTopic.commonMistakes && currentTopic.commonMistakes.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-950">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    Erros Comuns para Evitar
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-900 list-disc list-inside">
                    {currentTopic.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Glossary for Beginners */}
              {currentTopic.termsGlossary && currentTopic.termsGlossary.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Dicionário do Varejo (O que significam as siglas)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentTopic.termsGlossary.map((termItem, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1"
                      >
                        <strong className="text-xs text-indigo-950 font-bold block">
                          {termItem.term}
                        </strong>
                        <span className="text-[11px] text-slate-600 leading-snug block">
                          {termItem.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xs text-slate-500">Selecione um tópico ao lado para ver o manual detalhado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
