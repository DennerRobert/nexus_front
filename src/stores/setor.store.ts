import { create } from "zustand";
import type { Setor, SetorFormData } from "@/interfaces/setor.interface";
import { setorService } from "@/services/setor.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

interface SetorState {
  setores: Setor[];
  isLoading: boolean;
  error: string | null;
}

interface SetorActions {
  getAll: () => Setor[];
  getById: (id: string) => Setor | undefined;
  getAtivos: () => Setor[];
  fetchAll: () => Promise<void>;
  create: (data: SetorFormData) => Promise<Setor | undefined>;
  update: (id: string, data: Partial<SetorFormData>) => Promise<Setor | undefined>;
  remove: (id: string) => Promise<boolean>;
}

type SetorStore = SetorState & SetorActions;

export const useSetorStore = create<SetorStore>((set, get) => ({
  setores: [],
  isLoading: false,
  error: null,

  getAll: () => get().setores,

  getById: (id) => get().setores.find((s) => s.id === id),

  getAtivos: () => get().setores.filter((s) => s.ativo),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await setorService.getAll();
      set({ setores: deserializeList(data), isLoading: false });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data) => {
    try {
      const novo = await setorService.create(data);
      const deserialized = deserialize(novo);
      set((state) => ({ setores: [...state.setores, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await setorService.update(id, data);
      const deserialized = deserialize(updated);
      set((state) => ({
        setores: state.setores.map((s) => (s.id === id ? deserialized : s)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  remove: async (id) => {
    try {
      await setorService.remove(id);
      // Soft-delete: marca como inativo localmente
      set((state) => ({
        setores: state.setores.map((s) =>
          s.id === id ? { ...s, ativo: false, updatedAt: new Date() } : s,
        ),
      }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
