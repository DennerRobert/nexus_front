import { create } from "zustand";
import type { Squad, SquadFormData, StatusSquad } from "@/interfaces/squad.interface";
import { squadService } from "@/services/squad.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

const SQUAD_DATE_FIELDS = ["dataInicio", "dataFim"];

interface SquadState {
  squads: Squad[];
  isLoading: boolean;
  error: string | null;
}

interface SquadActions {
  getAll: () => Squad[];
  getById: (id: string) => Squad | undefined;
  getByProjeto: (projetoId: string) => Squad | undefined;
  getByStatus: (status: StatusSquad) => Squad[];
  getAtivos: () => Squad[];
  fetchAll: () => Promise<void>;
  create: (data: SquadFormData) => Promise<Squad | undefined>;
  update: (id: string, data: Partial<SquadFormData>) => Promise<Squad | undefined>;

  // Status mutations: otimistas + background API
  updateStatus: (id: string, status: StatusSquad) => void;
  ativar: (id: string) => void;
  iniciarHandover: (id: string) => void;
  encerrar: (id: string) => void;
  atualizarCustoMensal: (id: string, custo: number) => void;
  remove: (id: string) => Promise<boolean>;
}

type SquadStore = SquadState & SquadActions;

export const useSquadStore = create<SquadStore>((set, get) => ({
  squads: [],
  isLoading: false,
  error: null,

  getAll: () => get().squads,

  getById: (id) => get().squads.find((s) => s.id === id),

  getByProjeto: (projetoId) => get().squads.find((s) => s.projetoId === projetoId),

  getByStatus: (status) => get().squads.filter((s) => s.status === status),

  getAtivos: () =>
    get().squads.filter((s) => s.status === "ativo" || s.status === "formando"),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await squadService.getAll();
      set({ squads: deserializeList(data, SQUAD_DATE_FIELDS), isLoading: false });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data) => {
    try {
      const novo = await squadService.create(data);
      const deserialized = deserialize(novo, SQUAD_DATE_FIELDS);
      set((state) => ({ squads: [...state.squads, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await squadService.update(id, data);
      const deserialized = deserialize(updated, SQUAD_DATE_FIELDS);
      set((state) => ({
        squads: state.squads.map((s) => (s.id === id ? deserialized : s)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  updateStatus: (id, status) => {
    set((state) => ({
      squads: state.squads.map((s) =>
        s.id === id ? { ...s, status, updatedAt: new Date() } : s,
      ),
    }));
    void squadService
      .update(id, { status } as unknown as Partial<SquadFormData>)
      .catch(() => set({ error: "Erro ao atualizar status do squad." }));
  },

  ativar: (id) => get().updateStatus(id, "ativo"),

  iniciarHandover: (id) => get().updateStatus(id, "em_handover"),

  encerrar: (id) => {
    set((state) => ({
      squads: state.squads.map((s) =>
        s.id === id
          ? { ...s, status: "encerrado" as StatusSquad, dataFim: new Date(), updatedAt: new Date() }
          : s,
      ),
    }));
    void squadService
      .update(id, { status: "encerrado" } as unknown as Partial<SquadFormData>)
      .catch(() => set({ error: "Erro ao encerrar squad." }));
  },

  atualizarCustoMensal: (id, custo) => {
    set((state) => ({
      squads: state.squads.map((s) =>
        s.id === id ? { ...s, custoMensal: custo, updatedAt: new Date() } : s,
      ),
    }));
    void squadService
      .update(id, { custoMensal: custo } as unknown as Partial<SquadFormData>)
      .catch(() => set({ error: "Erro ao atualizar custo mensal do squad." }));
  },

  remove: async (id) => {
    try {
      await squadService.remove(id);
      set((state) => ({ squads: state.squads.filter((s) => s.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
