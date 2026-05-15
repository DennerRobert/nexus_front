import { create } from "zustand";
import type { Cliente, ClienteFormData } from "@/interfaces/cliente.interface";
import { clienteService } from "@/services/cliente.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

interface ClienteState {
  clientes: Cliente[];
  isLoading: boolean;
  error: string | null;
}

interface ClienteActions {
  getAll: () => Cliente[];
  getById: (id: string) => Cliente | undefined;
  getExternos: () => Cliente[];
  getInternos: () => Cliente[];
  fetchAll: () => Promise<void>;
  create: (data: ClienteFormData) => Promise<Cliente | undefined>;
  update: (id: string, data: Partial<ClienteFormData>) => Promise<Cliente | undefined>;
  remove: (id: string) => Promise<boolean>;
}

type ClienteStore = ClienteState & ClienteActions;

export const useClienteStore = create<ClienteStore>((set, get) => ({
  clientes: [],
  isLoading: false,
  error: null,

  getAll: () => get().clientes.filter((c) => c.ativo),

  getById: (id) => get().clientes.find((c) => c.id === id),

  getExternos: () => get().clientes.filter((c) => c.ativo && c.origem === "externo"),

  getInternos: () =>
    get().clientes.filter(
      (c) => c.ativo && (c.origem === "interno" || c.origem === "investimento_interno"),
    ),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await clienteService.getAll();
      set({ clientes: deserializeList(data), isLoading: false });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data) => {
    try {
      const novo = await clienteService.create(data);
      const deserialized = deserialize(novo);
      set((state) => ({ clientes: [...state.clientes, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await clienteService.update(id, data);
      const deserialized = deserialize(updated);
      set((state) => ({
        clientes: state.clientes.map((c) => (c.id === id ? deserialized : c)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  remove: async (id) => {
    try {
      await clienteService.remove(id);
      set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
