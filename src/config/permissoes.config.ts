import type { PerfilUsuario } from "@/interfaces/usuario.interface";

// Módulos do sistema
export type Modulo =
  | "dashboard"
  | "demandas"
  | "projetos"
  | "produtos"
  | "squads"
  | "colaboradores"
  | "empresas"
  | "clientes";

// Ações possíveis em cada módulo
export type AcaoModulo =
  | "visualizar"
  | "criar"
  | "editar"
  | "excluir"
  | "aprovar"
  | "todas";

// Restrições específicas
export interface RestricoesModulo {
  apenasPropriosSquads?: boolean;
  apenasAbas?: string[];
  apenasVitrineIdeias?: boolean;
  apenasSubmissao?: boolean;
}

// Configuração de permissão por módulo
export interface PermissaoModulo {
  modulo: Modulo | "*";
  acoes: AcaoModulo[];
  restricoes?: RestricoesModulo;
}

// Mapeamento completo de permissões por perfil
export const PERMISSOES_POR_PERFIL: Record<PerfilUsuario, PermissaoModulo[]> = {
  // Administrador - Acesso total a tudo
  administrador: [
    { modulo: "*", acoes: ["todas"] },
  ],

  // Gestor de Inovação - Acesso completo a demandas, limitado em projetos, acesso total a clientes
  gestor_inovacao: [
    { modulo: "dashboard", acoes: ["todas"] },
    { modulo: "demandas", acoes: ["todas"] },
    {
      modulo: "projetos",
      acoes: ["visualizar"],
      restricoes: { apenasAbas: ["detalhes", "acompanhamento"] },
    },
    { modulo: "clientes", acoes: ["todas"] },
  ],

  // Analista de Inovação - Similar ao gestor
  analista_inovacao: [
    { modulo: "dashboard", acoes: ["todas"] },
    { modulo: "demandas", acoes: ["todas"] },
    {
      modulo: "projetos",
      acoes: ["visualizar"],
      restricoes: { apenasAbas: ["detalhes", "acompanhamento"] },
    },
    { modulo: "clientes", acoes: ["todas"] },
  ],

  // Assistente de Inovação - Visualização de clientes
  assistente_inovacao: [
    { modulo: "dashboard", acoes: ["todas"] },
    { modulo: "demandas", acoes: ["todas"] },
    {
      modulo: "projetos",
      acoes: ["visualizar"],
      restricoes: { apenasAbas: ["detalhes", "acompanhamento"] },
    },
    { modulo: "clientes", acoes: ["visualizar"] },
  ],

  // Product Owner - Demandas limitado, projetos dos seus squads
  product_owner: [
    { modulo: "dashboard", acoes: ["visualizar"] },
    {
      modulo: "demandas",
      acoes: ["visualizar", "criar"],
      restricoes: { apenasVitrineIdeias: true, apenasSubmissao: true },
    },
    {
      modulo: "projetos",
      acoes: ["todas"],
      restricoes: { apenasPropriosSquads: true },
    },
  ],

  // Especialista Multidisciplinar - Similar ao PO
  especialista: [
    { modulo: "dashboard", acoes: ["visualizar"] },
    {
      modulo: "demandas",
      acoes: ["visualizar", "criar"],
      restricoes: { apenasVitrineIdeias: true, apenasSubmissao: true },
    },
    {
      modulo: "projetos",
      acoes: ["todas"],
      restricoes: { apenasPropriosSquads: true },
    },
  ],

  // Cliente - Apenas demandas limitado
  cliente: [
    {
      modulo: "demandas",
      acoes: ["visualizar", "criar"],
      restricoes: { apenasVitrineIdeias: true, apenasSubmissao: true },
    },
  ],

  // Comercial - Demandas limitado + acesso total a clientes
  comercial: [
    {
      modulo: "demandas",
      acoes: ["visualizar", "criar"],
      restricoes: { apenasVitrineIdeias: true, apenasSubmissao: true },
    },
    { modulo: "clientes", acoes: ["todas"] },
  ],
};

// Lista de todos os módulos
export const TODOS_MODULOS: Modulo[] = [
  "dashboard",
  "demandas",
  "projetos",
  "produtos",
  "squads",
  "colaboradores",
  "empresas",
  "clientes",
];

// Mapeamento de rotas para módulos
export const ROTA_PARA_MODULO: Record<string, Modulo> = {
  "/": "dashboard",
  "/demandas": "demandas",
  "/projetos": "projetos",
  "/produtos": "produtos",
  "/squads": "squads",
  "/colaboradores": "colaboradores",
  "/empresas": "empresas",
  "/clientes": "clientes",
};

// Labels dos módulos
export const MODULO_LABELS: Record<Modulo, string> = {
  dashboard: "Dashboard",
  demandas: "Demandas",
  projetos: "Projetos",
  produtos: "Produtos",
  squads: "Squads",
  colaboradores: "Colaboradores",
  empresas: "Empresas",
  clientes: "Clientes",
};
