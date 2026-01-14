export interface Tenant {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  logoUrl?: string;
  ativo: boolean;
  empresaIds: string[]; // IDs das empresas/unidades que pertencem a este tenant
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantFormData {
  nome: string;
  slug: string;
  descricao?: string;
  logoUrl?: string;
  empresaIds: string[];
}

// Contexto atual da aplicação
export interface AppContexto {
  tenantId: string | null;
  unidadeId: string | null; // null = "Todas as Unidades"
}

export const TODAS_UNIDADES = {
  id: "todas",
  nome: "Todas as Unidades",
} as const;
