import { create } from "zustand";
import type { Tenant, TenantFormData } from "@/interfaces/tenant.interface";
import { tenantService } from "@/services/tenant.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

interface TenantState {
  tenants: Tenant[];
  isLoading: boolean;
  error: string | null;
}

interface TenantActions {
  getAll: () => Tenant[];
  getById: (id: string) => Tenant | undefined;
  getBySlug: (slug: string) => Tenant | undefined;
  getEmpresasByTenant: (tenantId: string) => string[];
  fetchAll: () => Promise<void>;
  create: (data: TenantFormData) => Promise<Tenant | undefined>;
  update: (id: string, data: Partial<TenantFormData>) => Promise<Tenant | undefined>;
  remove: (id: string) => Promise<boolean>;
}

type TenantStore = TenantState & TenantActions;

export const useTenantStore = create<TenantStore>((set, get) => ({
  tenants: [],
  isLoading: false,
  error: null,

  getAll: () => get().tenants,

  getById: (id) => get().tenants.find((t) => t.id === id),

  getBySlug: (slug) => get().tenants.find((t) => t.slug === slug),

  getEmpresasByTenant: (tenantId) => {
    const tenant = get().tenants.find((t) => t.id === tenantId);
    return tenant?.empresaIds ?? [];
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await tenantService.getAll();
      set({ tenants: deserializeList(data), isLoading: false });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data) => {
    try {
      const novo = await tenantService.create(data);
      const deserialized = deserialize(novo);
      set((state) => ({ tenants: [...state.tenants, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await tenantService.update(id, data);
      const deserialized = deserialize(updated);
      set((state) => ({
        tenants: state.tenants.map((t) => (t.id === id ? deserialized : t)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  remove: async (id) => {
    try {
      await tenantService.remove(id);
      set((state) => ({ tenants: state.tenants.filter((t) => t.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
