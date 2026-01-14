import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Tenant, TenantFormData } from "@/interfaces/tenant.interface";
import { mockEmpresas } from "@/utils/mock-data";

interface TenantState {
  tenants: Tenant[];
  isLoading: boolean;
}

interface TenantActions {
  getAll: () => Tenant[];
  getById: (id: string) => Tenant | undefined;
  getBySlug: (slug: string) => Tenant | undefined;
  getEmpresasByTenant: (tenantId: string) => string[];
  create: (data: TenantFormData) => Tenant;
  update: (id: string, data: Partial<TenantFormData>) => Tenant | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type TenantStore = TenantState & TenantActions;

// Criar mock de tenants baseado nas empresas existentes
const createMockTenants = (): Tenant[] => {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Pega os IDs das empresas mockadas
  const empresaIds = mockEmpresas.map((e) => e.id);

  // Cria dois tenants de exemplo
  return [
    {
      id: uuidv4(),
      nome: "Grupo Alpha",
      slug: "grupo-alpha",
      descricao: "Holding principal com foco em tecnologia e inovação",
      ativo: true,
      empresaIds: empresaIds, // Todas as empresas pertencem a este tenant
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      nome: "Consórcio Beta",
      slug: "consorcio-beta",
      descricao: "Consórcio de empresas parceiras",
      ativo: true,
      empresaIds: empresaIds.slice(0, 2), // Apenas as duas primeiras empresas
      createdAt: threeMonthsAgo,
      updatedAt: now,
    },
  ];
};

const mockTenants = createMockTenants();

export const useTenantStore = create<TenantStore>((set, get) => ({
  tenants: mockTenants,
  isLoading: false,

  getAll: () => get().tenants.filter((t) => t.ativo),

  getById: (id: string) => get().tenants.find((t) => t.id === id),

  getBySlug: (slug: string) => get().tenants.find((t) => t.slug === slug),

  getEmpresasByTenant: (tenantId: string) => {
    const tenant = get().getById(tenantId);
    return tenant?.empresaIds || [];
  },

  create: (data: TenantFormData) => {
    const novoTenant: Tenant = {
      ...data,
      id: uuidv4(),
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      tenants: [...state.tenants, novoTenant],
    }));
    return novoTenant;
  },

  update: (id: string, data: Partial<TenantFormData>) => {
    let updated: Tenant | undefined;
    set((state) => ({
      tenants: state.tenants.map((t) => {
        if (t.id === id) {
          updated = { ...t, ...data, updatedAt: new Date() };
          return updated;
        }
        return t;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().tenants.some((t) => t.id === id);
    if (exists) {
      set((state) => ({
        tenants: state.tenants.map((t) =>
          t.id === id ? { ...t, ativo: false, updatedAt: new Date() } : t
        ),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Exportar os tenants mockados para uso em outras stores
export { mockTenants };
