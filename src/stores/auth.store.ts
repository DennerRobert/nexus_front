import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Usuario, LoginFormData, PerfilUsuario } from "@/interfaces/usuario.interface";
import { mockEmpresas } from "@/utils/mock-data";
import { mockTenants } from "./tenant.store";

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginFormData) => Promise<boolean>;
  logout: () => void;
  getUsuarioAtual: () => Usuario | null;
  getUsuarioAtualId: () => string | null;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// Pegar IDs do primeiro tenant e empresas para os usuários mock
const defaultTenantId = mockTenants[0]?.id || uuidv4();
const defaultEmpresaIds = mockEmpresas.map((e) => e.id);

// Criar usuários mock para testes
const createMockUsuarios = (): Usuario[] => {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  return [
    {
      id: uuidv4(),
      nome: "Administrador do Sistema",
      email: "admin@nexus.com",
      senha: "123456",
      perfil: "administrador",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[0],
      empresaIds: defaultEmpresaIds,
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "Maria Silva",
      email: "gestor@nexus.com",
      senha: "123456",
      perfil: "gestor_inovacao",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[0],
      empresaIds: defaultEmpresaIds,
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "João Santos",
      email: "analista@nexus.com",
      senha: "123456",
      perfil: "analista_inovacao",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[1],
      empresaIds: defaultEmpresaIds.slice(0, 2),
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "Ana Oliveira",
      email: "po@nexus.com",
      senha: "123456",
      perfil: "product_owner",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[0],
      empresaIds: defaultEmpresaIds.slice(0, 1),
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "Carlos Dev",
      email: "dev@nexus.com",
      senha: "123456",
      perfil: "especialista",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[2],
      empresaIds: defaultEmpresaIds,
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "Fernanda Assistente",
      email: "assistente@nexus.com",
      senha: "123456",
      perfil: "assistente_inovacao",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[0],
      empresaIds: defaultEmpresaIds,
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "Roberto Cliente",
      email: "cliente@nexus.com",
      senha: "123456",
      perfil: "cliente",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[0],
      empresaIds: defaultEmpresaIds.slice(0, 1),
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "Paula Comercial",
      email: "comercial@nexus.com",
      senha: "123456",
      perfil: "comercial",
      tenantId: defaultTenantId,
      empresaId: defaultEmpresaIds[1],
      empresaIds: defaultEmpresaIds,
      ativo: true,
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
  ];
};

const mockUsuarios = createMockUsuarios();

export const useAuthStore = create<AuthStore>((set, get) => ({
  usuario: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data: LoginFormData) => {
    set({ isLoading: true, error: null });

    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    const usuario = mockUsuarios.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase() && u.senha === data.senha
    );

    if (usuario) {
      if (!usuario.ativo) {
        set({ isLoading: false, error: "Usuário inativo. Entre em contato com o administrador." });
        return false;
      }

      set({
        usuario,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    }

    set({
      isLoading: false,
      error: "Email ou senha incorretos.",
    });
    return false;
  },

  logout: () => {
    set({
      usuario: null,
      isAuthenticated: false,
      error: null,
    });
  },

  getUsuarioAtual: () => get().usuario,

  getUsuarioAtualId: () => get().usuario?.id || null,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clearError: () => set({ error: null }),
}));

// Exportar usuários mock para referência
export { mockUsuarios };
