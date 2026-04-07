import { v4 as uuidv4 } from "uuid";
import type { Empresa } from "@/interfaces/empresa.interface";
import type { KanbanEmpresaConfig } from "@/interfaces/kanban-config.interface";
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
import type { RespostaAvaliacao } from "@/interfaces/avaliacao-demanda.interface";

const now = new Date();
const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
const sixMonthsAhead = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

// IDs fixos para referências
export const empresaIds = {
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

// IDs fixos para garantir consistência entre demandas e avaliações
export const demandaIds = {
  demanda1: "demanda-app-mobile-varejo-001",
  demanda2: "demanda-gestao-contratos-techcorp-002",
  demanda3: "demanda-portal-transparencia-003",
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
    formularioTipo: "inovacao",
    setor: "Tecnologia da Informação",
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: empresaIds.beta,
    nome: "Beta Solutions",
    cnpj: "23.456.789/0001-01",
    descricao:
      "Especializada em automação, digitalização e ganhos de produtividade",
    ativa: true,
    formularioTipo: "operacional",
    setor: "Transformação Digital",
    createdAt: threeMonthsAgo,
    updatedAt: now,
  },
  {
    id: empresaIds.gama,
    nome: "Gama Labs",
    cnpj: "34.567.890/0001-12",
    descricao: "Centro de inovação e P&D do grupo",
    ativa: true,
    formularioTipo: "estrategico",
    setor: "Pesquisa & Desenvolvimento",
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

// Especialidades com a nova estrutura (area, senioridade, frameworkPrincipal, tecnologias)
const especialidadesDistribuidas: EspecialidadeColaborador[][] = [
  // Colab 1 - Arquiteto de Software
  [
    {
      area: "backend",
      senioridade: "senior",
      frameworkPrincipal: "nestjs",
      tecnologias: ["nodejs", "python", "postgresql", "docker", "aws", "apollo", "socket_io", "jsonwebtoken", "winston"],
    },
    {
      area: "arquitetura",
      senioridade: "senior",
      frameworkPrincipal: "aws",
      tecnologias: ["kubernetes", "kafka", "mongodb", "terraform", "grpc", "apollo"],
    },
  ],
  // Colab 2 - UX Designer
  [
    {
      area: "ux_ui",
      senioridade: "pleno",
      frameworkPrincipal: "figma",
      tecnologias: ["adobe_xd", "html_css", "framer_motion"],
    },
    {
      area: "frontend",
      senioridade: "junior",
      frameworkPrincipal: "react",
      tecnologias: ["tailwind", "javascript", "radix_ui", "axios"],
    },
  ],
  // Colab 3 - Desenvolvedor Fullstack
  [
    {
      area: "fullstack",
      senioridade: "senior",
      frameworkPrincipal: "nextjs",
      tecnologias: ["react", "nodejs", "typescript", "postgresql", "tanstack_query", "axios", "socket_io", "jsonwebtoken"],
    },
  ],
  // Colab 4 - Desenvolvedor Mobile
  [
    {
      area: "mobile",
      senioridade: "pleno",
      frameworkPrincipal: "react_native",
      tecnologias: ["expo", "typescript", "kotlin", "axios", "tanstack_query"],
    },
  ],
  // Colab 5 - Engenheiro DevOps
  [
    {
      area: "devops",
      senioridade: "senior",
      frameworkPrincipal: "kubernetes",
      tecnologias: ["docker", "terraform", "aws", "github_actions", "prometheus", "grafana", "boto3", "checkov"],
    },
    {
      area: "cloud",
      senioridade: "senior",
      frameworkPrincipal: "aws",
      tecnologias: ["azure", "gcp", "terraform", "boto3", "inspec"],
    },
  ],
  // Colab 6 - Cientista de Dados
  [
    {
      area: "dados",
      senioridade: "especialista",
      frameworkPrincipal: "spark",
      tecnologias: ["python", "airflow", "sql", "databricks", "kafka", "matplotlib", "scipy"],
    },
    {
      area: "ia_ml",
      senioridade: "pleno",
      frameworkPrincipal: "pytorch",
      tecnologias: ["scikit_learn", "pandas", "numpy", "langchain", "spacy", "nltk", "huggingface"],
    },
  ],
  // Colab 7 - Analista de QA
  [
    {
      area: "qa",
      senioridade: "pleno",
      frameworkPrincipal: "cypress",
      tecnologias: ["jest", "playwright", "postman", "appium", "faker_js", "msw", "sinon", "chai"],
    },
  ],
  // Colab 8 - Product Owner
  [
    {
      area: "frontend",
      senioridade: "pleno",
      frameworkPrincipal: "react",
      tecnologias: ["html_css", "tailwind", "axios", "date_fns"],
      tecnologiasCustom: ["Jira", "Confluence"],
    },
  ],
  // Colab 9 - Scrum Master
  [
    {
      area: "devops",
      senioridade: "pleno",
      frameworkPrincipal: "github_actions",
      tecnologias: ["gitlab_ci", "docker", "checkov", "inspec"],
      tecnologiasCustom: ["Jira", "Miro"],
    },
  ],
  // Colab 10 - Desenvolvedor Backend
  [
    {
      area: "backend",
      senioridade: "junior",
      frameworkPrincipal: "express",
      tecnologias: ["nodejs", "typescript", "postgresql", "jsonwebtoken", "bcrypt", "winston", "lodash"],
    },
  ],
  // Colab 11 - Desenvolvedor Frontend
  [
    {
      area: "frontend",
      senioridade: "pleno",
      frameworkPrincipal: "nextjs",
      tecnologias: ["react", "tailwind", "typescript", "zustand", "tanstack_query", "radix_ui", "shadcn_ui", "axios", "date_fns"],
    },
  ],
  // Colab 12 - Desenvolvedor Fullstack
  [
    {
      area: "fullstack",
      senioridade: "senior",
      frameworkPrincipal: "react",
      tecnologias: ["nodejs", "typescript", "mongodb", "tanstack_query", "axios", "socket_io", "jsonwebtoken"],
    },
    {
      area: "mobile",
      senioridade: "pleno",
      frameworkPrincipal: "react_native",
      tecnologias: ["expo", "typescript", "axios"],
    },
  ],
  // Colab 13 - Engenheiro DevOps
  [
    {
      area: "devops",
      senioridade: "pleno",
      frameworkPrincipal: "terraform",
      tecnologias: ["docker", "kubernetes", "aws", "grafana", "prometheus", "boto3", "checkov", "inspec"],
    },
  ],
  // Colab 14 - UX/UI Designer
  [
    {
      area: "ux_ui",
      senioridade: "junior",
      frameworkPrincipal: "figma",
      tecnologias: ["sketch", "photoshop", "illustrator", "framer_motion"],
    },
  ],
  // Colab 15 - Engenheiro de Dados
  [
    {
      area: "dados",
      senioridade: "senior",
      frameworkPrincipal: "airflow",
      tecnologias: ["python", "spark", "dbt", "snowflake", "kafka", "powerbi", "matplotlib", "scipy"],
    },
    {
      area: "backend",
      senioridade: "pleno",
      frameworkPrincipal: "fastapi",
      tecnologias: ["python", "postgresql", "sqlalchemy", "psycopg2", "alembic"],
    },
  ],
  // Colab 16 - Desenvolvedor Frontend
  [
    {
      area: "frontend",
      senioridade: "junior",
      frameworkPrincipal: "react",
      tecnologias: ["javascript", "html_css", "tailwind", "redux", "axios", "dayjs"],
    },
  ],
  // Colab 17 - QA Engineer
  [
    {
      area: "qa",
      senioridade: "pleno",
      frameworkPrincipal: "playwright",
      tecnologias: ["selenium", "cypress", "jest", "pytest", "faker_js", "chai", "sinon", "msw"],
    },
    {
      area: "devops",
      senioridade: "junior",
      frameworkPrincipal: "github_actions",
      tecnologias: ["docker", "checkov"],
    },
  ],
  // Colab 18 - Tech Lead
  [
    {
      area: "arquitetura",
      senioridade: "lider",
      frameworkPrincipal: "aws",
      tecnologias: ["kubernetes", "kafka", "postgresql", "redis", "terraform", "grpc", "apollo"],
    },
    {
      area: "backend",
      senioridade: "senior",
      frameworkPrincipal: "nestjs",
      tecnologias: ["nodejs", "python", "go", "typescript", "passport_js", "jsonwebtoken", "socket_io", "winston"],
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

// Distribuição de empresas por colaborador (N para N: alguns pertencem a mais de uma)
const getEmpresaIdsForColab = (index: number): string[] => {
  const primary = [empresaIds.alpha, empresaIds.beta, empresaIds.gama][index % 3];
  // alguns colaboradores pertencem a mais de uma empresa (ex: índices múltiplos de 5)
  if (index % 5 === 0 && index > 0) {
    const secondary = [empresaIds.alpha, empresaIds.beta, empresaIds.gama][(index + 1) % 3];
    return [primary, secondary];
  }
  return [primary];
};

export const mockColaboradores: Colaborador[] = nomes.map((nome, index) => {
  const especialidades = especialidadesDistribuidas[index];
  const custoBase = getCustoHoraBase(especialidades);

  return {
    id: colaboradorIds[`colab${index + 1}`],
    nome,
    email: `${nome.toLowerCase().replace(" ", ".")}@grupo.com.br`,
    matricula: `MAT${String(index + 1).padStart(4, "0")}`,
    empresaIds: getEmpresaIdsForColab(index),
    setorIds: [],
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

// ─── Mock Kanban Configs por Empresa ─────────────────────────────────────────
// Cada empresa possui um fluxo de demandas customizado que reflete sua natureza.

// Alpha Tecnologia — Fluxo ágil focado em inovação de produto digital.
// Etapas de comitê e devoluções ficam ocultas: o processo é direto da ideia à entrega.
const kanbanConfigAlpha: KanbanEmpresaConfig = {
  empresaId: empresaIds.alpha,
  etapas: [
    { etapa: "ideia_recebida",             titulo: "Nova Ideia",         visivel: true,  ordem: 0 },
    { etapa: "analise_inicial",             titulo: "Triagem Técnica",    visivel: true,  ordem: 1 },
    { etapa: "analise_comite",              titulo: "Análise Comitê",     visivel: false, ordem: 2 },
    { etapa: "devolucao_proponente",        titulo: "Devolução",          visivel: false, ordem: 3 },
    { etapa: "readequacao_recebida",        titulo: "Readequação",        visivel: false, ordem: 4 },
    { etapa: "validacao_problema",          titulo: "Prova de Conceito",  visivel: true,  ordem: 5 },
    { etapa: "encaminhado_grupo_trabalho",  titulo: "Em Desenvolvimento", visivel: true,  ordem: 6 },
    { etapa: "arquivado",                   titulo: "Arquivado",          visivel: false, ordem: 7 },
    { etapa: "fora_time_estrategico",       titulo: "Descartado",         visivel: false, ordem: 8 },
    { etapa: "concluido",                   titulo: "Entregue",           visivel: true,  ordem: 9 },
  ],
  updatedAt: new Date(),
};

// Beta Solutions — Fluxo operacional completo com aprovação gerencial e ciclos de revisão.
// Foco em automação e digitalização: demandas passam por comitê antes de ir para implementação.
const kanbanConfigBeta: KanbanEmpresaConfig = {
  empresaId: empresaIds.beta,
  etapas: [
    { etapa: "ideia_recebida",             titulo: "Solicitação",          visivel: true,  ordem: 0 },
    { etapa: "analise_inicial",             titulo: "Análise de Viabilidade", visivel: true, ordem: 1 },
    { etapa: "analise_comite",              titulo: "Aprovação Gerencial", visivel: true,  ordem: 2 },
    { etapa: "devolucao_proponente",        titulo: "Revisão Necessária",  visivel: true,  ordem: 3 },
    { etapa: "readequacao_recebida",        titulo: "Revisão Recebida",    visivel: true,  ordem: 4 },
    { etapa: "validacao_problema",          titulo: "Validação",           visivel: false, ordem: 5 },
    { etapa: "encaminhado_grupo_trabalho",  titulo: "Em Implementação",    visivel: true,  ordem: 6 },
    { etapa: "arquivado",                   titulo: "Arquivado",           visivel: false, ordem: 7 },
    { etapa: "fora_time_estrategico",       titulo: "Fora do Escopo",      visivel: false, ordem: 8 },
    { etapa: "concluido",                   titulo: "Implementado",        visivel: true,  ordem: 9 },
  ],
  updatedAt: new Date(),
};

// Gama Labs — Fluxo científico de P&D com validação de hipóteses e arquivamento explícito.
// Centro de inovação e pesquisa: etapas de devoluções são substituídas por revisão de conselho.
const kanbanConfigGama: KanbanEmpresaConfig = {
  empresaId: empresaIds.gama,
  etapas: [
    { etapa: "ideia_recebida",             titulo: "Hipótese",              visivel: true, ordem: 0 },
    { etapa: "analise_inicial",             titulo: "Revisão Científica",   visivel: true, ordem: 1 },
    { etapa: "analise_comite",              titulo: "Avaliação do Conselho",visivel: true, ordem: 2 },
    { etapa: "devolucao_proponente",        titulo: "Devolução",            visivel: false, ordem: 3 },
    { etapa: "readequacao_recebida",        titulo: "Readequação",          visivel: false, ordem: 4 },
    { etapa: "validacao_problema",          titulo: "Validação de Hipótese",visivel: true, ordem: 5 },
    { etapa: "encaminhado_grupo_trabalho",  titulo: "Pesquisa Ativa",       visivel: true, ordem: 6 },
    { etapa: "arquivado",                   titulo: "Descontinuado",        visivel: true, ordem: 7 },
    { etapa: "fora_time_estrategico",       titulo: "Fora do Roadmap",      visivel: true, ordem: 8 },
    { etapa: "concluido",                   titulo: "Publicado",            visivel: true, ordem: 9 },
  ],
  updatedAt: new Date(),
};

export const mockKanbanConfigs: Record<string, KanbanEmpresaConfig> = {
  [empresaIds.alpha]: kanbanConfigAlpha,
  [empresaIds.beta]: kanbanConfigBeta,
  [empresaIds.gama]: kanbanConfigGama,
};

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

// IDs fictícios de avaliadores para os mocks
const AVALIADOR_ANA = "mock-avaliador-ana-oliveira";
const AVALIADOR_JOAO = "mock-avaliador-joao-santos";

// Avaliações fictícias para as demandas de demonstração
// Demanda 1 (App Mobile Varejo ABC) → pontuação ~4.5 — excelente
// Demanda 2 (Gestão de Contratos TechCorp) → pontuação ~3.4 — boa
// Demanda 3 (Portal Transparência) → pontuação ~2.3 — razoável
export const mockRespostasAvaliacao: RespostaAvaliacao[] = [
  // ─── DEMANDA 1: App Mobile Varejo ABC ─────────────────────────────────────
  // Avaliadora: Ana Oliveira
  { id: "rv-d1-a1-p1-1", demandaId: demandaIds.demanda1, criterioId: "criterio_1", perguntaId: "pergunta_1_1", valor: 5, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p1-2", demandaId: demandaIds.demanda1, criterioId: "criterio_1", perguntaId: "pergunta_1_2", valor: 5, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p2-1", demandaId: demandaIds.demanda1, criterioId: "criterio_2", perguntaId: "pergunta_2_1", valor: 4, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p2-2", demandaId: demandaIds.demanda1, criterioId: "criterio_2", perguntaId: "pergunta_2_2", valor: 4, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p3-1", demandaId: demandaIds.demanda1, criterioId: "criterio_3", perguntaId: "pergunta_3_1", valor: 4, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p3-2", demandaId: demandaIds.demanda1, criterioId: "criterio_3", perguntaId: "pergunta_3_2", valor: 5, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p4-1", demandaId: demandaIds.demanda1, criterioId: "criterio_4", perguntaId: "pergunta_4_1", valor: 4, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p4-2", demandaId: demandaIds.demanda1, criterioId: "criterio_4", perguntaId: "pergunta_4_2", valor: 4, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p5-1", demandaId: demandaIds.demanda1, criterioId: "criterio_5", perguntaId: "pergunta_5_1", valor: 5, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p5-2", demandaId: demandaIds.demanda1, criterioId: "criterio_5", perguntaId: "pergunta_5_2", valor: 5, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  { id: "rv-d1-a1-p6-1", demandaId: demandaIds.demanda1, criterioId: "criterio_6", perguntaId: "pergunta_6_1", valor: 4, avaliadorId: AVALIADOR_ANA, data: monthAgo },
  // Avaliador: João Santos (segunda opinião)
  { id: "rv-d1-a2-p1-1", demandaId: demandaIds.demanda1, criterioId: "criterio_1", perguntaId: "pergunta_1_1", valor: 5, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p1-2", demandaId: demandaIds.demanda1, criterioId: "criterio_1", perguntaId: "pergunta_1_2", valor: 4, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p2-1", demandaId: demandaIds.demanda1, criterioId: "criterio_2", perguntaId: "pergunta_2_1", valor: 5, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p2-2", demandaId: demandaIds.demanda1, criterioId: "criterio_2", perguntaId: "pergunta_2_2", valor: 4, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p3-1", demandaId: demandaIds.demanda1, criterioId: "criterio_3", perguntaId: "pergunta_3_1", valor: 5, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p3-2", demandaId: demandaIds.demanda1, criterioId: "criterio_3", perguntaId: "pergunta_3_2", valor: 5, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p4-1", demandaId: demandaIds.demanda1, criterioId: "criterio_4", perguntaId: "pergunta_4_1", valor: 4, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p4-2", demandaId: demandaIds.demanda1, criterioId: "criterio_4", perguntaId: "pergunta_4_2", valor: 5, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p5-1", demandaId: demandaIds.demanda1, criterioId: "criterio_5", perguntaId: "pergunta_5_1", valor: 5, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p5-2", demandaId: demandaIds.demanda1, criterioId: "criterio_5", perguntaId: "pergunta_5_2", valor: 4, avaliadorId: AVALIADOR_JOAO, data: monthAgo },
  { id: "rv-d1-a2-p6-1", demandaId: demandaIds.demanda1, criterioId: "criterio_6", perguntaId: "pergunta_6_1", valor: 4, avaliadorId: AVALIADOR_JOAO, data: monthAgo },

  // ─── DEMANDA 2: Gestão de Contratos TechCorp ──────────────────────────────
  // Avaliadora: Ana Oliveira
  { id: "rv-d2-a1-p1-1", demandaId: demandaIds.demanda2, criterioId: "criterio_1", perguntaId: "pergunta_1_1", valor: 4, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p1-2", demandaId: demandaIds.demanda2, criterioId: "criterio_1", perguntaId: "pergunta_1_2", valor: 4, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p2-1", demandaId: demandaIds.demanda2, criterioId: "criterio_2", perguntaId: "pergunta_2_1", valor: 3, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p2-2", demandaId: demandaIds.demanda2, criterioId: "criterio_2", perguntaId: "pergunta_2_2", valor: 3, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p3-1", demandaId: demandaIds.demanda2, criterioId: "criterio_3", perguntaId: "pergunta_3_1", valor: 3, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p3-2", demandaId: demandaIds.demanda2, criterioId: "criterio_3", perguntaId: "pergunta_3_2", valor: 4, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p4-1", demandaId: demandaIds.demanda2, criterioId: "criterio_4", perguntaId: "pergunta_4_1", valor: 4, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p4-2", demandaId: demandaIds.demanda2, criterioId: "criterio_4", perguntaId: "pergunta_4_2", valor: 3, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p5-1", demandaId: demandaIds.demanda2, criterioId: "criterio_5", perguntaId: "pergunta_5_1", valor: 3, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p5-2", demandaId: demandaIds.demanda2, criterioId: "criterio_5", perguntaId: "pergunta_5_2", valor: 3, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "rv-d2-a1-p6-1", demandaId: demandaIds.demanda2, criterioId: "criterio_6", perguntaId: "pergunta_6_1", valor: 3, avaliadorId: AVALIADOR_ANA, data: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },

  // ─── DEMANDA 3: Portal de Transparência ───────────────────────────────────
  // Avaliador: João Santos (avaliação parcial — em andamento)
  { id: "rv-d3-a2-p1-1", demandaId: demandaIds.demanda3, criterioId: "criterio_1", perguntaId: "pergunta_1_1", valor: 3, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p1-2", demandaId: demandaIds.demanda3, criterioId: "criterio_1", perguntaId: "pergunta_1_2", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p2-1", demandaId: demandaIds.demanda3, criterioId: "criterio_2", perguntaId: "pergunta_2_1", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p2-2", demandaId: demandaIds.demanda3, criterioId: "criterio_2", perguntaId: "pergunta_2_2", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p3-1", demandaId: demandaIds.demanda3, criterioId: "criterio_3", perguntaId: "pergunta_3_1", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p3-2", demandaId: demandaIds.demanda3, criterioId: "criterio_3", perguntaId: "pergunta_3_2", valor: 3, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p4-1", demandaId: demandaIds.demanda3, criterioId: "criterio_4", perguntaId: "pergunta_4_1", valor: 3, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p4-2", demandaId: demandaIds.demanda3, criterioId: "criterio_4", perguntaId: "pergunta_4_2", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p5-1", demandaId: demandaIds.demanda3, criterioId: "criterio_5", perguntaId: "pergunta_5_1", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p5-2", demandaId: demandaIds.demanda3, criterioId: "criterio_5", perguntaId: "pergunta_5_2", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "rv-d3-a2-p6-1", demandaId: demandaIds.demanda3, criterioId: "criterio_6", perguntaId: "pergunta_6_1", valor: 2, avaliadorId: AVALIADOR_JOAO, data: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
];
