import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Squad, SquadFormData, StatusSquad } from "@/interfaces/squad.interface";
import { mockSquads } from "@/utils/mock-data";

interface SquadState {
  squads: Squad[];
  isLoading: boolean;
}

interface SquadActions {
  getAll: () => Squad[];
  getById: (id: string) => Squad | undefined;
  getByProjeto: (projetoId: string) => Squad | undefined;
  getByStatus: (status: StatusSquad) => Squad[];
  getAtivos: () => Squad[];
  create: (data: SquadFormData) => Squad;
  update: (id: string, data: Partial<SquadFormData>) => Squad | undefined;
  updateStatus: (id: string, status: StatusSquad) => Squad | undefined;
  ativar: (id: string) => Squad | undefined;
  iniciarHandover: (id: string) => Squad | undefined;
  encerrar: (id: string) => Squad | undefined;
  atualizarCustoMensal: (id: string, custo: number) => Squad | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type SquadStore = SquadState & SquadActions;

export const useSquadStore = create<SquadStore>((set, get) => ({
  squads: mockSquads,
  isLoading: false,

  getAll: () => get().squads,

  getById: (id: string) => get().squads.find((s) => s.id === id),

  getByProjeto: (projetoId: string) =>
    get().squads.find((s) => s.projetoId === projetoId),

  getByStatus: (status: StatusSquad) =>
    get().squads.filter((s) => s.status === status),

  getAtivos: () =>
    get().squads.filter((s) => s.status === "ativo" || s.status === "formando"),

  create: (data: SquadFormData) => {
    const newSquad: Squad = {
      ...data,
      id: uuidv4(),
      status: "formando",
      dataInicio: new Date(),
      custoMensal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      squads: [...state.squads, newSquad],
    }));
    return newSquad;
  },

  update: (id: string, data: Partial<SquadFormData>) => {
    let updated: Squad | undefined;
    set((state) => ({
      squads: state.squads.map((s) => {
        if (s.id === id) {
          updated = { ...s, ...data, updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));
    return updated;
  },

  updateStatus: (id: string, status: StatusSquad) => {
    let updated: Squad | undefined;
    set((state) => ({
      squads: state.squads.map((s) => {
        if (s.id === id) {
          updated = { ...s, status, updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));
    return updated;
  },

  ativar: (id: string) => {
    return get().updateStatus(id, "ativo");
  },

  iniciarHandover: (id: string) => {
    return get().updateStatus(id, "em_handover");
  },

  encerrar: (id: string) => {
    let updated: Squad | undefined;
    set((state) => ({
      squads: state.squads.map((s) => {
        if (s.id === id) {
          updated = {
            ...s,
            status: "encerrado",
            dataFim: new Date(),
            updatedAt: new Date(),
          };
          return updated;
        }
        return s;
      }),
    }));
    return updated;
  },

  atualizarCustoMensal: (id: string, custo: number) => {
    let updated: Squad | undefined;
    set((state) => ({
      squads: state.squads.map((s) => {
        if (s.id === id) {
          updated = { ...s, custoMensal: custo, updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().squads.some((s) => s.id === id);
    if (exists) {
      set((state) => ({
        squads: state.squads.filter((s) => s.id !== id),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
