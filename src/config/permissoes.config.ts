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
  /**
   * Controla visibilidade do campo custo/hora de colaboradores.
   * - "todos"   → vê custo/hora de qualquer colaborador (adm, financeiro, rh)
   * - "setor"   → vê custo/hora apenas dos colaboradores do próprio setor (perfis de gestão)
   * - undefined → não tem acesso ao campo custo/hora
   */
  verCustoHora?: "todos" | "setor";
}

// Configuração de permissão por módulo
export interface PermissaoModulo {
  modulo: Modulo | "*";
  acoes: AcaoModulo[];
  restricoes?: RestricoesModulo;
}

// Mapeamento completo de permissões por perfil
export const PERMISSOES_POR_PERFIL: Record<PerfilUsuario, PermissaoModulo[]> = {
  // Administrador - Acesso total a tudo, inclusive custo/hora de todos os colaboradores
  administrador: [
    { modulo: "*", acoes: ["todas"], restricoes: { verCustoHora: "todos" } },
  ],

  // Financeiro - Acesso total a colaboradores e empresas; vê custo/hora de todos
  financeiro: [
    { modulo: "dashboard", acoes: ["visualizar"] },
    { modulo: "colaboradores", acoes: ["todas"], restricoes: { verCustoHora: "todos" } },
    { modulo: "empresas", acoes: ["visualizar"] },
    { modulo: "clientes", acoes: ["visualizar"] },
  ],

  // RH - Acesso total a colaboradores; vê custo/hora de todos
  rh: [
    { modulo: "dashboard", acoes: ["visualizar"] },
    { modulo: "colaboradores", acoes: ["todas"], restricoes: { verCustoHora: "todos" } },
    { modulo: "empresas", acoes: ["visualizar"] },
  ],

  // Gestor de Inovação - Acesso completo a demandas, limitado em projetos; vê custo/hora do próprio setor
  gestor_inovacao: [
    { modulo: "dashboard", acoes: ["todas"] },
    { modulo: "demandas", acoes: ["todas"] },
    {
      modulo: "projetos",
      acoes: ["visualizar"],
      restricoes: { apenasAbas: ["detalhes", "acompanhamento"] },
    },
    { modulo: "clientes", acoes: ["todas"] },
    { modulo: "colaboradores", acoes: ["visualizar"], restricoes: { verCustoHora: "setor" } },
  ],

  // Analista de Inovação - Similar ao gestor; vê custo/hora do próprio setor
  analista_inovacao: [
    { modulo: "dashboard", acoes: ["todas"] },
    { modulo: "demandas", acoes: ["todas"] },
    {
      modulo: "projetos",
      acoes: ["visualizar"],
      restricoes: { apenasAbas: ["detalhes", "acompanhamento"] },
    },
    { modulo: "clientes", acoes: ["todas"] },
    { modulo: "colaboradores", acoes: ["visualizar"], restricoes: { verCustoHora: "setor" } },
  ],

  // Assistente de Inovação - Visualização de clientes; sem acesso a custo/hora
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

/**
 * Retorna o nível de acesso ao campo custo/hora de colaboradores para um dado perfil.
 * - "todos"  → vê custo/hora de qualquer colaborador
 * - "setor"  → vê custo/hora apenas dos colaboradores do próprio setor
 * - null     → sem acesso ao campo custo/hora
 */
export const getPermissaoCustoHora = (
  perfil: PerfilUsuario,
): "todos" | "setor" | null => {
  const permissoes = PERMISSOES_POR_PERFIL[perfil];
  for (const p of permissoes) {
    if (
      (p.modulo === "colaboradores" || p.modulo === "*") &&
      p.restricoes?.verCustoHora
    ) {
      return p.restricoes.verCustoHora;
    }
  }
  return null;
};
