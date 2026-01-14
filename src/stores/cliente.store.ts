import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Cliente, ClienteFormData } from "@/interfaces/cliente.interface";
import { mockClientes } from "@/utils/mock-data";

interface ClienteState {
  clientes: Cliente[];
  isLoading: boolean;
}

interface ClienteActions {
  getAll: () => Cliente[];
  getById: (id: string) => Cliente | undefined;
  getExternos: () => Cliente[];
  getInternos: () => Cliente[];
  create: (data: ClienteFormData) => Cliente;
  update: (id: string, data: Partial<ClienteFormData>) => Cliente | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type ClienteStore = ClienteState & ClienteActions;

export const useClienteStore = create<ClienteStore>((set, get) => ({
  clientes: mockClientes,
  isLoading: false,

  getAll: () => get().clientes.filter((c) => c.ativo),

  getById: (id: string) => get().clientes.find((c) => c.id === id),

  getExternos: () =>
    get().clientes.filter((c) => c.origem === "externo" && c.ativo),

  getInternos: () =>
    get().clientes.filter((c) => c.origem !== "externo" && c.ativo),

  create: (data: ClienteFormData) => {
    const newCliente: Cliente = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      clientes: [...state.clientes, newCliente],
    }));
    return newCliente;
  },

  update: (id: string, data: Partial<ClienteFormData>) => {
    let updated: Cliente | undefined;
    set((state) => ({
      clientes: state.clientes.map((c) => {
        if (c.id === id) {
          updated = { ...c, ...data, updatedAt: new Date() };
          return updated;
        }
        return c;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().clientes.some((c) => c.id === id);
    if (exists) {
      set((state) => ({
        clientes: state.clientes.map((c) =>
          c.id === id ? { ...c, ativo: false, updatedAt: new Date() } : c
        ),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
