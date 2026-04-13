import { create } from "zustand";
import type { Empresa, EmpresaFormData } from "@/interfaces/empresa.interface";
import { empresaService } from "@/services/empresa.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

interface EmpresaState {
  empresas: Empresa[];
  isLoading: boolean;
  error: string | null;
}

interface EmpresaActions {
  getAll: () => Empresa[];
  getById: (id: string) => Empresa | undefined;
  fetchAll: () => Promise<void>;
  create: (data: EmpresaFormData) => Promise<Empresa | undefined>;
  update: (id: string, data: Partial<EmpresaFormData>) => Promise<Empresa | undefined>;
  remove: (id: string) => Promise<boolean>;
}

type EmpresaStore = EmpresaState & EmpresaActions;

export const useEmpresaStore = create<EmpresaStore>((set, get) => ({
  empresas: [],
  isLoading: false,
  error: null,

  getAll: () => get().empresas,

  getById: (id) => get().empresas.find((e) => e.id === id),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await empresaService.getAll();
      set({ empresas: deserializeList(data), isLoading: false });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data) => {
    try {
      const nova = await empresaService.create(data);
      const deserialized = deserialize(nova);
      set((state) => ({ empresas: [...state.empresas, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await empresaService.update(id, data);
      const deserialized = deserialize(updated);
      set((state) => ({
        empresas: state.empresas.map((e) => (e.id === id ? deserialized : e)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  remove: async (id) => {
    try {
      await empresaService.remove(id);
      set((state) => ({ empresas: state.empresas.filter((e) => e.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
