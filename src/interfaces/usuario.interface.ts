// Perfis de usuário do sistema
export type PerfilUsuario =
  | "administrador"
  | "gestor_inovacao"
  | "analista_inovacao"
  | "assistente_inovacao"
  | "product_owner"
  | "especialista"
  | "cliente"
  | "comercial";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string; // mockado - em produção seria hash
  avatarUrl?: string;
  perfil: PerfilUsuario;
  colaboradorId?: string; // vínculo opcional com colaborador
  tenantId: string;
  empresaId: string; // empresa principal / home do usuário
  empresaIds: string[]; // todas as empresas que tem acesso
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginFormData {
  email: string;
  senha: string;
}

export interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const PERFIL_USUARIO_LABELS: Record<PerfilUsuario, string> = {
  administrador: "Administrador",
  gestor_inovacao: "Gestor de Inovação",
  analista_inovacao: "Analista de Inovação",
  assistente_inovacao: "Assistente de Inovação",
  product_owner: "Product Owner",
  especialista: "Especialista Multidisciplinar",
  cliente: "Cliente",
  comercial: "Comercial",
};

export const PERFIL_USUARIO_COLORS: Record<PerfilUsuario, string> = {
  administrador: "bg-purple-500",
  gestor_inovacao: "bg-blue-500",
  analista_inovacao: "bg-cyan-500",
  assistente_inovacao: "bg-teal-500",
  product_owner: "bg-orange-500",
  especialista: "bg-green-500",
  cliente: "bg-slate-500",
  comercial: "bg-amber-500",
};
