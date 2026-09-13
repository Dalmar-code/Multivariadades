export type RetailNicheId =
  | 'farmacia'
  | 'supermercado'
  | 'moda'
  | 'petshop'
  | 'autopecas'
  | 'construcao'
  | 'eletronicos'
  | 'restaurante'
  | 'otica'
  | 'variedades';

export interface RetailNicheInfo {
  id: RetailNicheId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  primaryColor: string;
  accentColor: string;
  departments: {
    name: string;
    categories: string[];
  }[];
  features: {
    hasVaccineSchedule: boolean;
    hasStrictExpiryBatch: boolean;
    hasBatchControl?: boolean;
    hasAnvisaControl: boolean;
    hasScaleIntegration: boolean;
    hasSizeColorGrid: boolean;
    hasVehicleApplication: boolean;
    hasPetProfile: boolean;
    hasSerialImei: boolean;
    hasRecipeOptometry: boolean;
    hasFractionalSale: boolean;
  };
}

export const RETAIL_NICHES: Record<RetailNicheId, RetailNicheInfo> = {
  farmacia: {
    id: 'farmacia',
    name: 'Farmácia & Drogaria',
    tagline: 'Saúde, Medicamentos, Vacinas & Bem-Estar',
    description: 'Gestão completa com agenda de vacinas e injetáveis, controle de lote e validade (SNGPC/ANVISA), medicamentos controlados, dermocosméticos e conveniência.',
    iconName: 'Pill',
    primaryColor: '#059669', // Emerald Green Saúde
    accentColor: '#0d9488',
    features: {
      hasVaccineSchedule: true,
      hasStrictExpiryBatch: true,
      hasAnvisaControl: true,
      hasScaleIntegration: false,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: false,
      hasRecipeOptometry: false,
      hasFractionalSale: true,
    },
    departments: [
      {
        name: 'Medicamentos Éticos & Referência',
        categories: ['Cardiovasculares', 'Antibióticos', 'Anti-inflamatórios', 'Analgésicos & Antitérmicos', 'Psicotrópicos & Controlados (Portaria 344)', 'Antialérgicos', 'Gastroenterologia', 'Oftalmológicos & Otológicos'],
      },
      {
        name: 'Medicamentos Genéricos (Lei 9.787)',
        categories: ['Genéricos de Uso Contínuo', 'Genéricos Antibióticos', 'Genéricos Dermatológicos', 'Genéricos Injetáveis', 'Genéricos Orais'],
      },
      {
        name: 'Medicamentos Similares & Equivalentes',
        categories: ['Similares Bonificados', 'Similares Tarjados', 'Fitoterápicos Registrados'],
      },
      {
        name: 'MIPs - Medicamentos Isentos de Prescrição',
        categories: ['Gripes & Resfriados', 'Digestivos & Antiácidos', 'Pomadas & Cicatrizantes', 'Relaxantes Musculares', 'Antigases & Laxantes', 'Pastilhas para Garganta'],
      },
      {
        name: 'Vacinas & Serviços Farmacêuticos (RDC 197)',
        categories: ['Vacinas Adulto', 'Vacinas Pediátricas', 'Vacinas do Idoso', 'Injetáveis & Aplicação', 'Testes Rápidos & Glicemia', 'Aferição de Pressão'],
      },
      {
        name: 'Dermocosméticos & Cuidados com a Pele',
        categories: ['Protetores Solares & Pós-Sol', 'Anti-idade & Séruns', 'Limpeza Facial & Sabonetes', 'Hidratantes Terapêuticos', 'Tratamento de Acne'],
      },
      {
        name: 'Higiene Pessoal & Beleza',
        categories: ['Higiene Bucal (Escovas, Fios, Cremes)', 'Desodorantes & Banho', 'Absorventes & Higiene Íntima', 'Cabelos & Tinturas', 'Aparelhos de Barbear & Cuidados Masculinos'],
      },
      {
        name: 'Mamãe & Bebê',
        categories: ['Fraldas Descartáveis', 'Fórmulas Infantis & Leites', 'Lenços Umedecidos', 'Chupetas, Mamadeiras & Acessórios', 'Pomadas para Assaduras', 'Shampoos Infantis'],
      },
      {
        name: 'Nutrição, Vitaminas & Suplementos',
        categories: ['Polivitamínicos A a Z', 'Vitamina C, D e Zinco', 'Colágeno & Ômega 3', 'Suplementos para Idosos (Ensure/Nutren)', 'Whey Protein & Creatina', 'Termogênicos & Fibras'],
      },
      {
        name: 'Ortopedia & Primeiros Socorros',
        categories: ['Termômetros & Aparelhos de Pressão', 'Curativos, Gazes & Esparadrapos', 'Tornozeleiras, Joelheiras & Tipóias', 'Bengalas & Muletas', 'Bolsas Térmicas & Gelo'],
      },
    ],
  },

  supermercado: {
    id: 'supermercado',
    name: 'Supermercado, Mercearia & Hortifrúti',
    tagline: 'Alimentos, Perecíveis, Bebidas & Balança',
    description: 'Varejo supermercadista completo com integração de balança (código de barras 2xxxx), controle de validade de perecíveis, açougue, padaria e gôndolas.',
    iconName: 'ShoppingBag',
    primaryColor: '#dc2626', // Red Supermercado
    accentColor: '#ea580c',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: true,
      hasAnvisaControl: false,
      hasScaleIntegration: true,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: false,
      hasRecipeOptometry: false,
      hasFractionalSale: true,
    },
    departments: [
      {
        name: 'Hortifrúti & Feira (Pesáveis)',
        categories: ['Frutas Nacionais & Importadas', 'Legumes & Raízes', 'Verduras & Folhagens Frescas', 'Ovos Caipiras & Brancos', 'Temperos Frescos & Ervas'],
      },
      {
        name: 'Açougue, Aves & Carnes Nobres',
        categories: ['Carnes Bovinas Resfriadas', 'Cortes Suínos', 'Aves & Frangos', 'Carnes para Churrasco', 'Embutidos & Linguiças Frescas', 'Peixes & Frutos do Mar'],
      },
      {
        name: 'Frios & Laticínios',
        categories: ['Queijos Prato, Mussarela & Nobres', 'Presuntos, Peitos de Peru & Mortadelas', 'Iogurtes & Sobremesas Lácteas', 'Leites UHT & Pasteurizados', 'Manteigas & Requeijão'],
      },
      {
        name: 'Padaria & Confeitaria',
        categories: ['Pães Franceses & Especiais', 'Pães de Forma & Torradas', 'Bolos Prontos & Tortas', 'Salgados Assados & Folhados', 'Doces Tradicionais'],
      },
      {
        name: 'Mercearia Salgada & Básicos',
        categories: ['Arroz, Feijão & Farináceos', 'Massas, Macarrão & Molhos', 'Óleos, Azeites & Vinagres', 'Enlatados & Conservas', 'Temperos & Condimentos Prontos', 'Grãos & Cereais'],
      },
      {
        name: 'Mercearia Doce & Matinais',
        categories: ['Cafés Moídos, Grãos & Cápsulas', 'Açúcares & Adoçantes', 'Biscoitos Doces, Salgados & Recheados', 'Chocolates & Bombons', 'Cereais Matinais & Granola', 'Geleias & Cremes de Avelã'],
      },
      {
        name: 'Bebidas Alcoólicas & Não Alcoólicas',
        categories: ['Cervejas Especiais & Tradicionais', 'Refrigerantes & Sucos Prontos', 'Águas Minerais & Isotônicos', 'Vinhos Finos & Espumantes', 'Destilados (Uísque, Gin, Vodka)', 'Energéticos'],
      },
      {
        name: 'Limpeza Doméstica',
        categories: ['Sabões em Pó & Líquidos para Roupas', 'Amaciantes & Alvejantes', 'Detergentes & Desengordurantes', 'Desinfetantes & Limpadores Multiuso', 'Papel Higiênico & Toalhas de Papel', 'Sacos de Lixo & Esponjas'],
      },
      {
        name: 'Congelados & Sorvetes',
        categories: ['Pratos Prontos & Lasanhas', 'Pizzas Congeladas', 'Vegetais Congelados & Batatas', 'Sorvetes de Pote & Picolés', 'Hambúrgueres & Empanados'],
      },
    ],
  },

  moda: {
    id: 'moda',
    name: 'Moda, Roupas & Calçados',
    tagline: 'Vestuário, Grade de Tamanhos & Cores',
    description: 'Gestão têxtil e calçadista com controle de grade de tamanhos (PP ao XGG, 34 ao 46), cores, coleções de estação, trocas e catálogo visual rico.',
    iconName: 'Shirt',
    primaryColor: '#7c3aed', // Purple Fashion
    accentColor: '#db2777',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: false,
      hasAnvisaControl: false,
      hasScaleIntegration: false,
      hasSizeColorGrid: true,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: false,
      hasRecipeOptometry: false,
      hasFractionalSale: false,
    },
    departments: [
      {
        name: 'Moda Feminina',
        categories: ['Vestidos & Macacões', 'Blusas, Camisetas & Croppeds', 'Calças Jeans & Alfaiataria', 'Saias & Shorts', 'Casacos, Blazers & Tricots', 'Conjuntos'],
      },
      {
        name: 'Moda Masculina',
        categories: ['Camisas Sociais & Gola Polo', 'Camisetas Básicas & Estampadas', 'Calças Jeans, Sarja & Chino', 'Bermudas & Shorts', 'Casacos, Jaquetas & Moletons', 'Ternos & Blazers'],
      },
      {
        name: 'Moda Infantil & Teen',
        categories: ['Roupas para Bebê (Body e Macacão)', 'Infantil Menina (2 a 12 anos)', 'Infantil Menino (2 a 12 anos)', 'Juvenil & Teen (12 a 16 anos)', 'Uniformes Escolares'],
      },
      {
        name: 'Calçados & Tênis',
        categories: ['Tênis Esportivos & Casuais', 'Sapatos Sociais Masculinos', 'Sandálias, Saltos & Rasteiras', 'Chinelos & Slides', 'Botas & Coturnos', 'Calçados Infantis'],
      },
      {
        name: 'Moda Íntima & Sleepwear',
        categories: ['Lingeries & Sutiãs', 'Calcinhas & Cuecas', 'Pijamas & Camisolas', 'Meias & Meias-Calças', 'Modeladores & Cintas'],
      },
      {
        name: 'Moda Praia & Fitness (Activewear)',
        categories: ['Biquínis, Maiôs & Sungas', 'Saídas de Praia', 'Leggings & Tops Fitness', 'Bermudas de Compressão & Regatas'],
      },
      {
        name: 'Bolsas & Acessórios',
        categories: ['Bolsas de Couro & Mochilas', 'Cintos & Carteiras', 'Bonés, Chapéus & Gorros', 'Bijuterias Finas & Semijoias', 'Lenços & Echarpes'],
      },
    ],
  },

  petshop: {
    id: 'petshop',
    name: 'Pet Shop & Clínica Veterinária',
    tagline: 'Rações, Banho & Tosa, Vacinas e Cuidados Pet',
    description: 'Gestão completa para pets: agenda de vacinas animais (V8, V10, Raiva), banho e tosa, rações com controle de validade e pesagem a granel, medicamentos veterinários e ficha do pet.',
    iconName: 'Dog',
    primaryColor: '#0284c7', // Sky Blue Pet
    accentColor: '#f97316',
    features: {
      hasVaccineSchedule: true,
      hasStrictExpiryBatch: true,
      hasAnvisaControl: false,
      hasScaleIntegration: true,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: true,
      hasSerialImei: false,
      hasRecipeOptometry: false,
      hasFractionalSale: true,
    },
    departments: [
      {
        name: 'Rações & Alimentação (Cães e Gatos)',
        categories: ['Rações Super Premium Cães', 'Rações Premium Especial & Standard', 'Rações Super Premium Gatos', 'Rações Medicamentosas (Renal, Obesidade)', 'Rações Úmidas (Sachês & Latas)', 'Rações a Granel (KG)'],
      },
      {
        name: 'Petiscos & Mastigação',
        categories: ['Biscoitos & Bifinhos', 'Ossos Naturais & Odontológicos', 'Snacks Funcionais & Calmantes', 'Catnip & Erva de Gato'],
      },
      {
        name: 'Farmácia Veterinária & Medicamentos',
        categories: ['Antipulgas & Carrapatos (Simparic, Bravecto)', 'Vermífugos para Cães e Gatos', 'Antibióticos & Anti-inflamatórios Veterinários', 'Colírios & Soluções Otológicas', 'Vitaminas & Suplementos Pet', 'Pomadas Cicatrizantes'],
      },
      {
        name: 'Agenda de Vacinas & Serviços Veterinários',
        categories: ['Vacinas Caninas (V8, V10, Antirrábica, Gripe, Giardia)', 'Vacinas Felinas (V3, V4, V5, Raiva)', 'Banho & Tosa com Agendamento', 'Consultas Clínicas Veterinárias', 'Microchipagem'],
      },
      {
        name: 'Higiene & Cuidados Sanitários',
        categories: ['Shampoos & Condicionadores Pet', 'Tapetes Higiênicos & Fraldas', 'Areias Sanitárias para Gatos', 'Eliminadores de Odor & Desinfetantes Pet', 'Perfumes & Banho a Seco'],
      },
      {
        name: 'Acessórios, Passeio & Conforto',
        categories: ['Camas, Almofadas & Casinhas', 'Coleiras, Guias & Peitorais', 'Caixas de Transporte & Bolsas', 'Comedouros & Bebedouros Automáticos', 'Roupas & Capas de Chuva Pet'],
      },
      {
        name: 'Brinquedos & Enriquecimento Ambiental',
        categories: ['Bolinhas & Brinquedos de Borracha', 'Arranhadores para Gatos', 'Brinquedos Interativos & Dispenser de Petisco', 'Pelúcias com Apito'],
      },
      {
        name: 'Outros Animais (Pássaros, Peixes, Roedores)',
        categories: ['Alimentos para Pássaros & Sementes', 'Rações para Peixes de Aquário', 'Alimentos para Hamster & Coelhos', 'Gaiolas & Gaiolas de Transporte'],
      },
    ],
  },

  autopecas: {
    id: 'autopecas',
    name: 'Autopeças, Motopeças & Acessórios',
    tagline: 'Veículos, Código Original OEM & Aplicação',
    description: 'Catálogo automotivo com vinculação por montadora/modelo/ano, códigos originais (OEM), freios, suspensão, elétrica, lubrificantes e acessórios.',
    iconName: 'Car',
    primaryColor: '#0284c7',
    accentColor: '#d97706',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: false,
      hasAnvisaControl: false,
      hasScaleIntegration: false,
      hasSizeColorGrid: false,
      hasVehicleApplication: true,
      hasPetProfile: false,
      hasSerialImei: true,
      hasRecipeOptometry: false,
      hasFractionalSale: false,
    },
    departments: [
      {
        name: 'Motor & Câmbio',
        categories: ['Correias Dentadas & Tensores', 'Juntas de Motor & Retentores', 'Velas de Ignição & Cabos', 'Bombas de Água & Combustível', 'Pistões, Bielas & Anéis', 'Kits de Embreagem'],
      },
      {
        name: 'Freios & Suspensão',
        categories: ['Pastilhas & Discos de Freio', 'Amortecedores Dianteiros & Traseiros', 'Molas Helicoidais & Feixes', 'Pivôs, Terminais & Barras Estabilizadoras', 'Cilindros de Roda & Fluídos de Freio'],
      },
      {
        name: 'Óleos, Lubrificantes & Filtros',
        categories: ['Óleos Sintéticos, Semissintéticos & Minerais', 'Filtros de Óleo', 'Filtros de Ar do Motor', 'Filtros de Combustível', 'Filtros de Cabine / Ar Condicionado', 'Aditivos de Radiador (Inorgânico & Orgânico)'],
      },
      {
        name: 'Elétrica, Baterias & Iluminação',
        categories: ['Baterias Automotivas (45Ah a 100Ah)', 'Lâmpadas Halógenas, LED & Xenon', 'Alternadores & Motores de Partida', 'Bobinas de Ignição', 'Sensores de Oxigênio (Sonda Lambda)', 'Fusíveis & Relés'],
      },
      {
        name: 'Pneus, Rodas & Alinhamento',
        categories: ['Pneus de Passeio Aro 13 a 18', 'Pneus SUV & Caminhonete', 'Câmaras de Ar & Válvulas', 'Calotas & Parafusos de Roda'],
      },
      {
        name: 'Motopeças & Linha Duas Rodas',
        categories: ['Kits Relação (Coroa, Pinhão, Corrente)', 'Pneus para Motocicletas', 'Baterias de Moto', 'Capacetes & Viseiras', 'Óleos 4 Tempos para Moto'],
      },
      {
        name: 'Acessórios & Estética Automotiva',
        categories: ['Palhetas de Limpador de Para-brisa', 'Som Automotivo, Alto-falantes & Centrais Multimídia', 'Ceras, Shampoos & Polidores', 'Aromatizantes & Cheirinhos', 'Alarmes & Travas Elétricas'],
      },
    ],
  },

  construcao: {
    id: 'construcao',
    name: 'Materiais de Construção, Tintas & Ferragens',
    tagline: 'Obras, Ferramentas, Elétrica & Hidráulica',
    description: 'Gestão para depósitos e lojas de materiais com venda fracionada (m², metro, litro, kg), controle de tintas, lote de pisos e ferragens.',
    iconName: 'Hammer',
    primaryColor: '#b45309', // Amber industrial
    accentColor: '#ea580c',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: false,
      hasAnvisaControl: false,
      hasScaleIntegration: true,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: false,
      hasRecipeOptometry: false,
      hasFractionalSale: true,
    },
    departments: [
      {
        name: 'Materiais Básicos & Estruturais',
        categories: ['Cimentos & Cales', 'Areia & Pedra Brita (Saco/M³)', 'Tijolos, Blocos & Canaletas', 'Argamassas Colantes & Rejuntes', 'Aço, Vergalhões & Telas Soldadas', 'Telhas de Fibrocimento & Cerâmicas'],
      },
      {
        name: 'Tintas & Acessórios de Pintura',
        categories: ['Tintas Acrílicas Fosca, Semibrilho & Acetinada', 'Esmaltes Sintéticos & Base Água', 'Seladores, Fundos Preparadores & Vernizes', 'Massas Corridas & Acrílicas', 'Rolos de Lã, Pincéis & Trinchas', 'Fitas Crepe, Lixas & Solventes'],
      },
      {
        name: 'Ferramentas Elétricas & Manuais',
        categories: ['Furadeiras, Parafusadeiras & Maratonas', 'Esmerilhadeiras & Serras Mármore', 'Martelos, Alicates & Chaves de Fenda', 'Trena, Nível & Prumo', 'Discos de Corte & Brocas'],
      },
      {
        name: 'Hidráulica & Conexões',
        categories: ['Tubos & Conexões de PVC Água Fria', 'Tubos & Conexões de Esgoto', 'Tubos PPR & CPVC Água Quente', 'Caixas d’Água & Boias', 'Registros, Válvulas & Torneiras', 'Sifões, Ralos & Grelhas'],
      },
      {
        name: 'Elétrica & Iluminação',
        categories: ['Fios & Cabos Flexíveis (1,5mm a 16mm)', 'Interruptores, Tomadas & Placas', 'Disjuntores & Quadros de Distribuição', 'Lâmpadas LED, Painéis & Refletores', 'Conduítes Corrugados & Canaletas'],
      },
      {
        name: 'Pisos, Revestimentos & Louças Sanitárias',
        categories: ['Pisos Cerâmicos & Porcelanatos (M²)', 'Revestimentos de Parede', 'Bacias Sanitárias & Caixas Acopladas', 'Cubas de Embutir & Sobrepor', 'Gabinetes para Banheiro'],
      },
      {
        name: 'Ferragens & Segurança',
        categories: ['Fechaduras de Entrada & Internas', 'Dobradiças & Fechos', 'Cadeados de Latão & Segredos', 'Parafusos, Porcas, Arruelas & Buchas', 'Cabos de Aço & Correntes'],
      },
    ],
  },

  eletronicos: {
    id: 'eletronicos',
    name: 'Eletrônicos, Celulares & Informática',
    tagline: 'Smartphones, Hardware, Seriais & Garantia',
    description: 'Gestão de tecnologia com rastreabilidade por IMEI e número de série, controle de termos de garantia, acessórios para celular e suprimentos de TI.',
    iconName: 'Smartphone',
    primaryColor: '#0284c7', // Cyan Tech
    accentColor: '#6366f1',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: false,
      hasAnvisaControl: false,
      hasScaleIntegration: false,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: true,
      hasRecipeOptometry: false,
      hasFractionalSale: false,
    },
    departments: [
      {
        name: 'Smartphones & Telefonia',
        categories: ['Smartphones Android', 'iPhones & Linha Apple', 'Telefones de Mesa & Sem Fio', 'Walkie-Talkies & Rádios'],
      },
      {
        name: 'Acessórios para Celular',
        categories: ['Capas Anti-impacto & Silicone', 'Películas de Vidro & Cerâmica 3D', 'Cabos Lightning, Type-C & Micro USB', 'Carregadores de Tomada Rápidos (20W a 65W)', 'Carregadores Portáteis (Power Banks)', 'Suportes Veiculares'],
      },
      {
        name: 'Informática & Computadores',
        categories: ['Notebooks & Ultrabooks', 'Computadores Desktop & All-in-One', 'Monitores LED & Gamer', 'Teclados & Mouses Sem Fio', 'Impressoras & Multifuncionais'],
      },
      {
        name: 'Áudio & Som Pessoal',
        categories: ['Fones de Ouvido Bluetooth (TWS)', 'Headsets Gamer com Microfone', 'Caixas de Som Bluetooth Portáteis', 'Microfones & Lapelas'],
      },
      {
        name: 'Hardware & Armazenamento',
        categories: ['SSDs M.2 NVMe & SATA', 'HDs Externos & Pen Drives', 'Memórias RAM DDR4/DDR5', 'Fontes de Alimentação', 'Placas de Vídeo'],
      },
      {
        name: 'Redes & Conectividade',
        categories: ['Roteadores Wi-Fi 6 & Mesh', 'Repetidores de Sinal', 'Cabos de Rede RJ45 (Cat5e/Cat6)', 'Switches & Adaptadores USB Wi-Fi'],
      },
    ],
  },

  restaurante: {
    id: 'restaurante',
    name: 'Restaurante, Lanchonete, Padaria & Food Service',
    tagline: 'Comandas, Pratos Prontos, Bebidas & Balcão',
    description: 'Frente de caixa ágil para alimentação com mesas e comandas, adicionais e observações de preparo, bebidas geladas e controle de insumos.',
    iconName: 'Utensils',
    primaryColor: '#ea580c', // Orange Food
    accentColor: '#dc2626',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: true,
      hasAnvisaControl: false,
      hasScaleIntegration: true,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: false,
      hasRecipeOptometry: false,
      hasFractionalSale: true,
    },
    departments: [
      {
        name: 'Lanches & Hambúrgueres Artesanais',
        categories: ['Hambúrgueres Especiais', 'Sanduíches Tradicionais (Bauru, X-Salada)', 'Hot Dogs Prensados', 'Wraps & Sanduíches Naturais'],
      },
      {
        name: 'Pratos Executivos & Refeições',
        categories: ['Pratos do Dia (PFs)', 'Grelhados com Acompanhamento', 'Massas & Risotos', 'Saladas & Opções Fitness', 'Comida por Quilo (Balança)'],
      },
      {
        name: 'Pizzas & Calzones',
        categories: ['Pizzas Tradicionais Salgadas', 'Pizzas Especiais & Premium', 'Pizzas Doces', 'Bordas Recheadas'],
      },
      {
        name: 'Porções & Petiscos',
        categories: ['Batatas Fritas & Mandioca', 'Iscas de Peixe & Frutos do Mar', 'Pastéis Fritos na Hora', 'Frango a Passarinho & Polenta'],
      },
      {
        name: 'Bebidas & Cafeteria',
        categories: ['Cafés Expressos & Especiais', 'Sucos Naturais da Fruta', 'Refrigerantes & Chás Gelados', 'Cervejas Artesanais & Chope', 'Drinks & Coquetéis'],
      },
      {
        name: 'Sobremesas & Doces',
        categories: ['Pudins, Mousses & Tortas', 'Sorvetes & Açaí com Acompanhamentos', 'Milk-shakes & Smoothies', 'Brownies & Petit Gâteau'],
      },
    ],
  },

  otica: {
    id: 'otica',
    name: 'Ótica, Óculos & Joalheria',
    tagline: 'Armações, Lentes Oftálmicas & Joias',
    description: 'Gestão especializada para ótica com receita oftalmológica do cliente (esférico, cilíndrico, eixo, DNP), armações receituário e solares, joias e relógios.',
    iconName: 'Eye',
    primaryColor: '#0f766e', // Teal Elegante
    accentColor: '#b45309',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: false,
      hasAnvisaControl: false,
      hasScaleIntegration: false,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: true,
      hasRecipeOptometry: true,
      hasFractionalSale: false,
    },
    departments: [
      {
        name: 'Armações de Grau (Receituário)',
        categories: ['Armações Femininas Acetato & Metal', 'Armações Masculinas', 'Armações Infantis Flexíveis', 'Armações Sem Aro (Três Peças) & Fio de Nylon'],
      },
      {
        name: 'Lentes Oftálmicas',
        categories: ['Lentes Monofocais Antirreflexo', 'Lentes Multifocais Digitais', 'Lentes Fotossensíveis (Transitions)', 'Lentes com Filtro de Luz Azul'],
      },
      {
        name: 'Óculos Solares',
        categories: ['Óculos de Sol Femininos com Proteção UV', 'Óculos de Sol Masculinos Polarizados', 'Óculos de Sol Esportivos', 'Óculos de Sol Infantis'],
      },
      {
        name: 'Lentes de Contato & Soluções',
        categories: ['Lentes de Contato Descartáveis Diárias', 'Lentes Mensais Tórica & Esférica', 'Lentes Coloridas com e sem Grau', 'Soluções Multiuso de Limpeza'],
      },
      {
        name: 'Relógios & Joalheria',
        categories: ['Relógios de Pulso Masculinos & Femininos', 'Alianças de Ouro e Prata', 'Brincos, Colares & Pingentes', 'Pilhas & Pulseiras de Relógio'],
      },
    ],
  },

  variedades: {
    id: 'variedades',
    name: 'Variedades, Papelaria, Casa & Presentes',
    tagline: 'Multi-categorias, Utilidades, Brinquedos & Festa',
    description: 'O grande varejo de utilidades brasileiras: bazar, artigos de cozinha, papelaria escolar e escritório, brinquedos, decoração e presentes.',
    iconName: 'Store',
    primaryColor: '#f59e0b', // Amber Varejo
    accentColor: '#d97706',
    features: {
      hasVaccineSchedule: false,
      hasStrictExpiryBatch: false,
      hasAnvisaControl: false,
      hasScaleIntegration: false,
      hasSizeColorGrid: false,
      hasVehicleApplication: false,
      hasPetProfile: false,
      hasSerialImei: false,
      hasRecipeOptometry: false,
      hasFractionalSale: false,
    },
    departments: [
      {
        name: 'Casa & Utilidades Domésticas',
        categories: ['Potes Herméticos & Plásticos', 'Panelas, Frigideiras & Formas', 'Talheres, Pratos & Copos de Vidro', 'Organizadores de Gaveta & Caixas', 'Lixeiras, Baldes & Vassouras'],
      },
      {
        name: 'Papelaria & Material Escolar',
        categories: ['Cadernos Universitários & Espirais', 'Canetas Esferográficas, Gel & Marca-textos', 'Mochilas, Estojos & Lancheiras', 'Papéis Sulfite A4 & Cartolinas', 'Tesouras, Colas & Réguas'],
      },
      {
        name: 'Brinquedos & Jogos',
        categories: ['Bonecas & Carrinhos', 'Jogos de Tabuleiro & Quebra-cabeças', 'Massinhas de Modelar & Slimes', 'Bolas & Brinquedos de Praia', 'Brinquedos Educativos'],
      },
      {
        name: 'Artigos para Festa & Decoração',
        categories: ['Balões, Bexigas & Infladores', 'Pratos, Copos & Garfos Descartáveis', 'Velas de Aniversário & Painéis', 'Embalagens para Doces & Lembrancinhas'],
      },
      {
        name: 'Presentes & Decoração de Ambientes',
        categories: ['Quadros, Espelhos & Porta-retratos', 'Velas Aromáticas & Difusores', 'Almofadas & Mantas', 'Canecas Personalizadas & Garrafas Térmicas'],
      },
    ],
  },
};

// Types for Vaccine Management (Pharmacy & Pet)
export interface VaccineAppointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  patientType: 'humano' | 'pet';
  patientName?: string; // Para Pet (ex: "Thor") ou Dependente
  patientDocument?: string;
  patientBirthDate?: string;
  vaccineName: string; // ex: "Gripe Tetravalente", "Febre Amarela", "V10 Canina"
  manufacturer: string; // ex: "Sanofi Pasteur", "GSK", "Pfizer", "Zoetis"
  batchNumber: string; // Lote do frasco
  expirationDate: string; // Validade da vacina
  applicationDate: string; // Data agendada ou realizada
  applicationTime?: string;
  doseNumber: '1ª Dose' | '2ª Dose' | '3ª Dose' | 'Reforço Anual' | 'Dose Única';
  applicationSite: 'Deltoide Esquerdo' | 'Deltoide Direito' | 'Vasto Lateral' | 'Glúteo' | 'Subcutânea' | 'Oral';
  professionalName: string; // Farmacêutico ou Veterinário aplicador
  professionalRegistry: string; // ex: "CRF-SP 45890" ou "CRMV-SP 12345"
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
  createdAt: string;
}

export interface ClientPet {
  id?: string;
  name: string;
  species: string;
  breed?: string; // Raça
  birthDate?: string;
  weightKg?: number;
  vaccineHistorySummary?: string;
}

export interface ClientVaccineRecord {
  vaccineName: string;
  date: string;
  dose: string;
  batch: string;
  professional: string;
}
