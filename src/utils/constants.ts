export const APP_NAME = "SGPI";
export const APP_DESCRIPTION = "Sistema de Gestão de Portfólio Integrado";

export const CURRENCY_FORMAT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const PERCENT_FORMAT = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const DATETIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const SIDEBAR_LINKS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/demandas", label: "Demandas", icon: "FileText" },
  { href: "/projetos", label: "Projetos", icon: "FolderKanban" },
  { href: "/produtos", label: "Produtos", icon: "Package" },
  { href: "/squads", label: "Squads", icon: "Users" },
  { href: "/colaboradores", label: "Colaboradores", icon: "UserCircle" },
  { href: "/empresas", label: "Empresas", icon: "Building2" },
  { href: "/clientes", label: "Clientes", icon: "Briefcase" },
] as const;

export const OCUPACAO_THRESHOLDS = {
  SUBALOCADO: 70,
  IDEAL_MIN: 70,
  IDEAL_MAX: 100,
  SUPERALOCADO: 100,
} as const;
