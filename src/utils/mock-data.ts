import { v4 as uuidv4 } from "uuid";
import type { Empresa } from "@/interfaces/empresa.interface";
import type {
  Colaborador,
  EspecialidadeColaborador,
} from "@/interfaces/colaborador.interface";
import type {
  Cliente,
  OrigemCliente,
  NaturezaJuridica,
  ModeloReceita,
} from "@/interfaces/cliente.interface";
import type {
  Demanda,
  StatusDemanda,
  EstagioIdeia,
  HorizonteInovacao,
  ExisteSolucaoMercado,
} from "@/interfaces/demanda.interface";
import type { Projeto, StatusProjeto } from "@/interfaces/projeto.interface";
import type {
  Produto,
  StatusProduto,
  ClassificacaoProduto,
} from "@/interfaces/produto.interface";
import type { Squad, StatusSquad } from "@/interfaces/squad.interface";
import type {
  Alocacao,
  PapelAlocacao,
  StatusAlocacao,
} from "@/interfaces/alocacao.interface";

const now = new Date();
const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
const sixMonthsAhead = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

// IDs fixos para referências
const empresaIds = {
  alpha: uuidv4(),
  beta: uuidv4(),
  gama: uuidv4(),
};

const clienteIds = {
  varejoABC: uuidv4(),
  techCorp: uuidv4(),
  prefeitura: uuidv4(),
  internoAlpha: uuidv4(),
  internoBeta: uuidv4(),
};

const colaboradorIds: Record<string, string> = {};
for (let i = 1; i <= 18; i++) {
  colaboradorIds[`colab${i}`] = uuidv4();
}

const demandaIds = {
  demanda1: uuidv4(),
  demanda2: uuidv4(),
  demanda3: uuidv4(),
};

const projetoIds = {
  projeto1: uuidv4(),
  projeto2: uuidv4(),
};

const produtoIds = {
  produto1: uuidv4(),
};

const squadIds = {
  squad1: uuidv4(),
  squad2: uuidv4(),
};

// Empresas do grupo
export const mockEmpresas: Empresa[] = [
  {
    id: empresaIds.alpha,
    nome: "Alpha Tecnologia",
    cnpj: "12.345.678/0001-90",
    descricao:
      "Empresa principal do grupo, focada em desenvolvimento de software",
    ativa: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: empresaIds.beta,
    nome: "Beta Solutions",
    cnpj: "23.456.789/0001-01",
    descricao:
      "Especializada em consultoria e projetos de transformação digital",
    ativa: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: empresaIds.gama,
    nome: "Gama Labs",
    cnpj: "34.567.890/0001-12",
    descricao: "Centro de inovação e P&D do grupo",
    ativa: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
];

// Clientes
export const mockClientes: Cliente[] = [
  {
    id: clienteIds.varejoABC,
    nome: "Varejo ABC",
    origem: "externo" as OrigemCliente,
    naturezaJuridica: "empresa_privada" as NaturezaJuridica,
    cnpj: "45.678.901/0001-23",
    email: "contato@varejoabc.com.br",
    telefone: "(11) 98765-4321",
    modeloReceita: "recorrencia" as ModeloReceita,
    ativo: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: clienteIds.techCorp,
    nome: "TechCorp International",
    origem: "externo" as OrigemCliente,
    naturezaJuridica: "empresa_privada" as NaturezaJuridica,
    cnpj: "56.789.012/0001-34",
    email: "brasil@techcorp.com",
    telefone: "(11) 3456-7890",
    modeloReceita: "projeto_fechado" as ModeloReceita,
    ativo: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: clienteIds.prefeitura,
    nome: "Prefeitura Municipal de São Paulo",
    origem: "externo" as OrigemCliente,
    naturezaJuridica: "orgao_municipal" as NaturezaJuridica,
    cnpj: "67.890.123/0001-45",
    email: "licitacoes@prefeitura.sp.gov.br",
    modeloReceita: "projeto_fechado" as ModeloReceita,
    ativo: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: clienteIds.internoAlpha,
    nome: "Alpha Tecnologia (Interno)",
    origem: "interno" as OrigemCliente,
    modeloReceita: "rateio_custo" as ModeloReceita,
    ativo: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: clienteIds.internoBeta,
    nome: "Beta Solutions (Interno)",
    origem: "interno" as OrigemCliente,
    modeloReceita: "rateio_custo" as ModeloReceita,
    ativo: true,
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
];

// Especialidades com a nova estrutura (area, senioridade, tecnologias)
const especialidadesDistribuidas: EspecialidadeColaborador[][] = [
  // Colab 1 - Arquiteto de Software
  [
    {
      area: "backend",
      senioridade: "senior",
      tecnologias: ["nodejs", "python", "postgresql", "docker", "aws"],
    },
    {
      area: "arquitetura",
      senioridade: "senior",
      tecnologias: ["aws", "kubernetes", "kafka", "mongodb"],
    },
  ],
  // Colab 2 - UX Designer
  [
    {
      area: "ux_ui",
      senioridade: "pleno",
      tecnologias: ["figma", "adobe_xd", "html_css"],
    },
    {
      area: "frontend",
      senioridade: "junior",
      tecnologias: ["react", "tailwind", "javascript"],
    },
  ],
  // Colab 3 - Desenvolvedor Fullstack
  [
    {
      area: "fullstack",
      senioridade: "senior",
      tecnologias: ["react", "nextjs", "nodejs", "typescript", "postgresql"],
    },
  ],
  // Colab 4 - Desenvolvedor Mobile
  [
    {
      area: "mobile",
      senioridade: "pleno",
      tecnologias: ["react_native", "expo", "typescript", "kotlin"],
    },
  ],
  // Colab 5 - Engenheiro DevOps
  [
    {
      area: "devops",
      senioridade: "senior",
      tecnologias: ["docker", "kubernetes", "terraform", "aws", "github_actions"],
    },
    {
      area: "cloud",
      senioridade: "senior",
      tecnologias: ["aws", "azure", "gcp"],
    },
  ],
  // Colab 6 - Cientista de Dados
  [
    {
      area: "dados",
      senioridade: "especialista",
      tecnologias: ["python", "spark", "airflow", "sql", "databricks"],
    },
    {
      area: "ia_ml",
      senioridade: "pleno",
      tecnologias: ["pytorch", "scikit_learn", "pandas", "numpy"],
    },
  ],
  // Colab 7 - Analista de QA
  [
    {
      area: "qa",
      senioridade: "pleno",
      tecnologias: ["cypress", "jest", "playwright", "postman"],
    },
  ],
  // Colab 8 - Product Owner
  [
    {
      area: "frontend",
      senioridade: "pleno",
      tecnologias: ["figma", "html_css"],
      tecnologiasCustom: ["Jira", "Confluence"],
    },
  ],
  // Colab 9 - Scrum Master
  [
    {
      area: "devops",
      senioridade: "pleno",
      tecnologias: ["github_actions", "gitlab_ci"],
      tecnologiasCustom: ["Jira", "Miro"],
    },
  ],
  // Colab 10 - Desenvolvedor Backend
  [
    {
      area: "backend",
      senioridade: "junior",
      tecnologias: ["nodejs", "express", "typescript", "postgresql"],
    },
  ],
  // Colab 11 - Desenvolvedor Frontend
  [
    {
      area: "frontend",
      senioridade: "pleno",
      tecnologias: ["react", "nextjs", "tailwind", "typescript", "zustand"],
    },
  ],
  // Colab 12 - Desenvolvedor Fullstack
  [
    {
      area: "fullstack",
      senioridade: "senior",
      tecnologias: ["react", "nodejs", "typescript", "mongodb"],
    },
    {
      area: "mobile",
      senioridade: "pleno",
      tecnologias: ["react_native", "expo"],
    },
  ],
  // Colab 13 - Engenheiro DevOps
  [
    {
      area: "devops",
      senioridade: "pleno",
      tecnologias: ["docker", "kubernetes", "aws", "terraform"],
    },
  ],
  // Colab 14 - UX/UI Designer
  [
    {
      area: "ux_ui",
      senioridade: "junior",
      tecnologias: ["figma", "sketch", "photoshop"],
    },
  ],
  // Colab 15 - Engenheiro de Dados
  [
    {
      area: "dados",
      senioridade: "senior",
      tecnologias: ["python", "spark", "airflow", "dbt", "snowflake", "kafka"],
    },
    {
      area: "backend",
      senioridade: "pleno",
      tecnologias: ["python", "fastapi", "postgresql"],
    },
  ],
  // Colab 16 - Desenvolvedor Frontend
  [
    {
      area: "frontend",
      senioridade: "junior",
      tecnologias: ["react", "javascript", "html_css", "tailwind"],
    },
  ],
  // Colab 17 - QA Engineer
  [
    {
      area: "qa",
      senioridade: "pleno",
      tecnologias: ["selenium", "cypress", "jest", "pytest"],
    },
    {
      area: "devops",
      senioridade: "junior",
      tecnologias: ["docker", "github_actions"],
    },
  ],
  // Colab 18 - Tech Lead
  [
    {
      area: "arquitetura",
      senioridade: "lider",
      tecnologias: ["aws", "kubernetes", "kafka", "postgresql", "redis"],
    },
    {
      area: "backend",
      senioridade: "senior",
      tecnologias: ["nodejs", "python", "go", "typescript"],
    },
  ],
];

const cargos = [
  "Arquiteto de Software",
  "UX Designer",
  "Desenvolvedor Fullstack",
  "Desenvolvedor Mobile",
  "Engenheiro DevOps",
  "Cientista de Dados",
  "Analista de QA",
  "Product Owner",
  "Scrum Master",
  "Desenvolvedor Backend",
  "Desenvolvedor Frontend",
  "Desenvolvedor Fullstack",
  "Engenheiro DevOps",
  "UX/UI Designer",
  "Engenheiro de Dados",
  "Desenvolvedor Frontend",
  "QA Engineer",
  "Tech Lead",
];

const nomes = [
  "Maria Silva",
  "João Santos",
  "Ana Oliveira",
  "Pedro Costa",
  "Fernanda Lima",
  "Lucas Pereira",
  "Camila Souza",
  "Rafael Almeida",
  "Juliana Martins",
  "Bruno Rodrigues",
  "Larissa Ferreira",
  "Gabriel Gonçalves",
  "Mariana Ribeiro",
  "Thiago Carvalho",
  "Amanda Nascimento",
  "Felipe Araújo",
  "Carolina Mendes",
  "Ricardo Barbosa",
];

// Calcula o custo/hora baseado na maior senioridade do colaborador
const getCustoHoraBase = (especialidades: EspecialidadeColaborador[]): number => {
  const custoBase = {
    trainee: 50,
    estagiario: 40,
    junior: 80,
    pleno: 120,
    senior: 180,
    especialista: 220,
    lider: 250,
  };

  if (especialidades.length === 0) return custoBase.junior;

  const maiorSenioridade = especialidades.reduce((max, esp) => {
    const ordem = ["trainee", "estagiario", "junior", "pleno", "senior", "especialista", "lider"];
    return ordem.indexOf(esp.senioridade) > ordem.indexOf(max) ? esp.senioridade : max;
  }, especialidades[0].senioridade);

  return custoBase[maiorSenioridade];
};

export const mockColaboradores: Colaborador[] = nomes.map((nome, index) => {
  const empresaIndex = index % 3;
  const empresaId = [empresaIds.alpha, empresaIds.beta, empresaIds.gama][
    empresaIndex
  ];
  const especialidades = especialidadesDistribuidas[index];
  const custoBase = getCustoHoraBase(especialidades);

  return {
    id: colaboradorIds[`colab${index + 1}`],
    nome,
    email: `${nome.toLowerCase().replace(" ", ".")}@grupo.com.br`,
    matricula: `MAT${String(index + 1).padStart(4, "0")}`,
    empresaId,
    cargo: cargos[index],
    especialidades,
    custoHora: custoBase + Math.random() * 30,
    cargaHorariaMensal: 160,
    ativo: true,
    dataAdmissao: new Date(2020 + Math.floor(index / 6), index % 12, 1),
    createdAt: threeMonthsAgo,
    updatedAt: now,
  };
});

// Demandas atualizadas com novos campos
export const mockDemandas: Demanda[] = [
  {
    id: demandaIds.demanda1,
    nomeProponente: "Maria Silva",
    empresaUnidadeApoioId: empresaIds.alpha,
    titulo: "App Mobile para Clientes - Varejo ABC",
    estagioIdeia: "validacao" as EstagioIdeia,
    problemaResolver:
      "Clientes do Varejo ABC não conseguem rastrear pedidos em tempo real e precisam ligar no SAC para obter informações básicas sobre entregas.",
    existeSolucaoMercado: "parcial" as ExisteSolucaoMercado,
    descricaoSolucaoExistente:
      "Existem apps de rastreamento genéricos, mas nenhum integrado diretamente ao sistema do Varejo ABC.",
    quemSofreProblema:
      "Consumidores finais do Varejo ABC e equipe de atendimento ao cliente",
    ideiaSolucao:
      "Aplicativo iOS e Android para clientes consultarem pedidos e rastrearem entregas em tempo real, com notificações push.",
    principaisBeneficios:
      "Redução de 40% nas ligações ao SAC, aumento do NPS, maior engajamento dos clientes",
    recursosNecessarios:
      "2 desenvolvedores mobile, 1 UX designer, 1 backend dev, infraestrutura cloud",
    horizonteInovacao: "h1_curto_prazo" as HorizonteInovacao,
    clienteIds: [clienteIds.varejoABC],
    prazoDesejado: sixMonthsAhead,
    solicitanteId: colaboradorIds.colab1,
    status: "convertida" as StatusDemanda,
    projetoId: projetoIds.projeto1,
    createdAt: threeMonthsAgo,
    updatedAt: monthAgo,
  },
  {
    id: demandaIds.demanda2,
    nomeProponente: "Rafael Almeida",
    empresaUnidadeApoioId: empresaIds.beta,
    titulo: "Sistema de Gestão de Contratos - TechCorp",
    estagioIdeia: "conceito" as EstagioIdeia,
    problemaResolver:
      "TechCorp gerencia mais de 500 contratos ativos manualmente em planilhas, causando riscos de vencimento não monitorado e dificuldade em encontrar informações.",
    existeSolucaoMercado: "sim" as ExisteSolucaoMercado,
    descricaoSolucaoExistente:
      "Existem sistemas como ContractWorks e Concord, mas são caros e não atendem requisitos específicos brasileiros.",
    quemSofreProblema: "Departamento jurídico e financeiro da TechCorp",
    ideiaSolucao:
      "Plataforma web para gestão completa de contratos corporativos, incluindo workflow de aprovação, alertas de vencimento e relatórios.",
    principaisBeneficios:
      "Eliminação de riscos legais, economia de tempo na busca de informações, visibilidade gerencial",
    recursosNecessarios:
      "1 tech lead, 2 fullstack devs, 1 QA, infraestrutura cloud",
    horizonteInovacao: "h1_curto_prazo" as HorizonteInovacao,
    clienteIds: [clienteIds.techCorp],
    prazoDesejado: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
    solicitanteId: colaboradorIds.colab8,
    status: "aguardando_aprovacao" as StatusDemanda,
    createdAt: monthAgo,
    updatedAt: now,
  },
  {
    id: demandaIds.demanda3,
    nomeProponente: "Juliana Martins",
    empresaUnidadeApoioId: empresaIds.gama,
    titulo: "Portal de Transparência - Prefeitura SP",
    estagioIdeia: "conceito" as EstagioIdeia,
    problemaResolver:
      "Cidadãos têm dificuldade em acessar informações sobre licitações e gastos públicos, e o portal atual não atende requisitos de acessibilidade.",
    existeSolucaoMercado: "nao" as ExisteSolucaoMercado,
    quemSofreProblema:
      "Cidadãos de São Paulo e equipe de comunicação da prefeitura",
    ideiaSolucao:
      "Portal web responsivo para consulta pública de licitações, contratos e despesas, atendendo WCAG 2.1 e lei de acesso à informação.",
    principaisBeneficios:
      "Atendimento a requisitos legais, maior transparência, acessibilidade para todos",
    recursosNecessarios:
      "1 UX especialista em acessibilidade, 2 frontend devs, 1 backend dev",
    horizonteInovacao: "h2_medio_prazo" as HorizonteInovacao,
    clienteIds: [clienteIds.prefeitura],
    prazoDesejado: new Date(now.getTime() + 240 * 24 * 60 * 60 * 1000),
    solicitanteId: colaboradorIds.colab9,
    status: "em_analise" as StatusDemanda,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },
];

// Projetos
export const mockProjetos: Projeto[] = [
  {
    id: projetoIds.projeto1,
    nome: "App Clientes Varejo ABC",
    descricao:
      "Aplicativo mobile iOS e Android para clientes do Varejo ABC consultarem pedidos e rastrearem entregas.",
    empresaDonaId: empresaIds.alpha,
    demandaId: demandaIds.demanda1,
    clienteIds: [clienteIds.varejoABC],
    status: "em_execucao" as StatusProjeto,
    dataInicio: monthAgo,
    dataFimPrevista: sixMonthsAhead,
    orcamento: 480000,
    custoAtual: 85000,
    squadId: squadIds.squad1,
    createdAt: monthAgo,
    updatedAt: now,
  },
  {
    id: projetoIds.projeto2,
    nome: "Sistema Gestão Contratos TechCorp",
    descricao:
      "Plataforma web para gestão de contratos corporativos com workflow de aprovação e alertas.",
    empresaDonaId: empresaIds.beta,
    demandaId: demandaIds.demanda2,
    clienteIds: [clienteIds.techCorp],
    status: "aguardando_aprovacao" as StatusProjeto,
    dataInicio: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    dataFimPrevista: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000),
    orcamento: 320000,
    custoAtual: 0,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },
];

// Produtos
export const mockProdutos: Produto[] = [
  {
    id: produtoIds.produto1,
    nome: "SGP - Sistema de Gestão de Projetos",
    descricao:
      "Sistema interno de gestão de projetos utilizado por todas as empresas do grupo.",
    empresaDonaId: empresaIds.alpha,
    projetoOrigemId: uuidv4(),
    clienteIds: [clienteIds.internoAlpha, clienteIds.internoBeta],
    status: "em_operacao" as StatusProduto,
    classificacao: "interno" as ClassificacaoProduto,
    responsavelOperacaoId: colaboradorIds.colab18,
    custoDesenvolvimento: 250000,
    custoOperacaoMensal: 15000,
    dataLancamento: new Date(2024, 6, 1),
    createdAt: new Date(2024, 6, 1),
    updatedAt: now,
  },
];

// Squads
export const mockSquads: Squad[] = [
  {
    id: squadIds.squad1,
    nome: "Squad Varejo ABC",
    objetivo:
      "Desenvolver e entregar o app mobile para clientes do Varejo ABC",
    projetoId: projetoIds.projeto1,
    status: "ativo" as StatusSquad,
    dataInicio: monthAgo,
    custoMensal: 81000,
    createdAt: monthAgo,
    updatedAt: now,
  },
  {
    id: squadIds.squad2,
    nome: "Squad Sustentação SGP",
    objetivo: "Manter e evoluir o Sistema de Gestão de Projetos interno",
    projetoId: uuidv4(),
    status: "ativo" as StatusSquad,
    dataInicio: new Date(2024, 6, 1),
    custoMensal: 35000,
    createdAt: new Date(2024, 6, 1),
    updatedAt: now,
  },
];

// Alocações
export const mockAlocacoes: Alocacao[] = [
  // Squad Varejo ABC
  {
    id: uuidv4(),
    colaboradorId: colaboradorIds.colab1,
    squadId: squadIds.squad1,
    papel: "tech_lead" as PapelAlocacao,
    percentual: 100,
    status: "ativa" as StatusAlocacao,
    dataInicio: monthAgo,
    custoMensal: 180 * 160,
    createdAt: monthAgo,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    colaboradorId: colaboradorIds.colab4,
    squadId: squadIds.squad1,
    papel: "desenvolvedor_pleno" as PapelAlocacao,
    percentual: 80,
    status: "ativa" as StatusAlocacao,
    dataInicio: monthAgo,
    custoMensal: 120 * 128,
    createdAt: monthAgo,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    colaboradorId: colaboradorIds.colab11,
    squadId: squadIds.squad1,
    papel: "desenvolvedor_pleno" as PapelAlocacao,
    percentual: 70,
    status: "ativa" as StatusAlocacao,
    dataInicio: monthAgo,
    custoMensal: 120 * 112,
    createdAt: monthAgo,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    colaboradorId: colaboradorIds.colab2,
    squadId: squadIds.squad1,
    papel: "ux_designer" as PapelAlocacao,
    percentual: 50,
    status: "ativa" as StatusAlocacao,
    dataInicio: monthAgo,
    custoMensal: 120 * 80,
    createdAt: monthAgo,
    updatedAt: now,
  },
  // Squad Sustentação
  {
    id: uuidv4(),
    colaboradorId: colaboradorIds.colab18,
    squadId: squadIds.squad2,
    papel: "tech_lead" as PapelAlocacao,
    percentual: 50,
    status: "ativa" as StatusAlocacao,
    dataInicio: new Date(2024, 6, 1),
    custoMensal: 250 * 80,
    createdAt: new Date(2024, 6, 1),
    updatedAt: now,
  },
  {
    id: uuidv4(),
    colaboradorId: colaboradorIds.colab10,
    squadId: squadIds.squad2,
    papel: "desenvolvedor_junior" as PapelAlocacao,
    percentual: 100,
    status: "ativa" as StatusAlocacao,
    dataInicio: new Date(2024, 6, 1),
    custoMensal: 80 * 160,
    createdAt: new Date(2024, 6, 1),
    updatedAt: now,
  },
];

export const getEmpresaById = (id: string): Empresa | undefined =>
  mockEmpresas.find((e) => e.id === id);

export const getClienteById = (id: string): Cliente | undefined =>
  mockClientes.find((c) => c.id === id);

export const getColaboradorById = (id: string): Colaborador | undefined =>
  mockColaboradores.find((c) => c.id === id);

export const getProjetoById = (id: string): Projeto | undefined =>
  mockProjetos.find((p) => p.id === id);

export const getSquadById = (id: string): Squad | undefined =>
  mockSquads.find((s) => s.id === id);
