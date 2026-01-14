import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Demanda, DemandaFormData, StatusDemanda } from "@/interfaces/demanda.interface";
import { mockDemandas } from "@/utils/mock-data";

interface DemandaState {
  demandas: Demanda[];
  isLoading: boolean;
}

interface DemandaActions {
  getAll: () => Demanda[];
  getById: (id: string) => Demanda | undefined;
  getByStatus: (status: StatusDemanda) => Demanda[];
  getPendentes: () => Demanda[];
  create: (data: DemandaFormData, solicitanteId: string) => Demanda;
  update: (id: string, data: Partial<DemandaFormData>) => Demanda | undefined;
  updateStatus: (id: string, status: StatusDemanda, observacao?: string) => Demanda | undefined;
  aprovar: (id: string) => Demanda | undefined;
  rejeitar: (id: string, motivo: string) => Demanda | undefined;
  solicitarAjustes: (id: string, observacao: string) => Demanda | undefined;
  converterEmProjeto: (id: string, projetoId: string) => Demanda | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type DemandaStore = DemandaState & DemandaActions;

export const useDemandaStore = create<DemandaStore>((set, get) => ({
  demandas: mockDemandas,
  isLoading: false,

  getAll: () => get().demandas,

  getById: (id: string) => get().demandas.find((d) => d.id === id),

  getByStatus: (status: StatusDemanda) =>
    get().demandas.filter((d) => d.status === status),

  getPendentes: () =>
    get().demandas.filter(
      (d) => d.status === "aguardando_aprovacao" || d.status === "em_analise"
    ),

  create: (data: DemandaFormData, solicitanteId: string) => {
    const newDemanda: Demanda = {
      ...data,
      id: uuidv4(),
      solicitanteId,
      status: "rascunho",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      demandas: [...state.demandas, newDemanda],
    }));
    return newDemanda;
  },

  update: (id: string, data: Partial<DemandaFormData>) => {
    let updated: Demanda | undefined;
    set((state) => ({
      demandas: state.demandas.map((d) => {
        if (d.id === id) {
          updated = { ...d, ...data, updatedAt: new Date() };
          return updated;
        }
        return d;
      }),
    }));
    return updated;
  },

  updateStatus: (id: string, status: StatusDemanda, observacao?: string) => {
    let updated: Demanda | undefined;
    set((state) => ({
      demandas: state.demandas.map((d) => {
        if (d.id === id) {
          updated = {
            ...d,
            status,
            observacoes: observacao || d.observacoes,
            updatedAt: new Date(),
          };
          return updated;
        }
        return d;
      }),
    }));
    return updated;
  },

  aprovar: (id: string) => {
    return get().updateStatus(id, "aprovada");
  },

  rejeitar: (id: string, motivo: string) => {
    let updated: Demanda | undefined;
    set((state) => ({
      demandas: state.demandas.map((d) => {
        if (d.id === id) {
          updated = {
            ...d,
            status: "rejeitada",
            motivoRejeicao: motivo,
            updatedAt: new Date(),
          };
          return updated;
        }
        return d;
      }),
    }));
    return updated;
  },

  solicitarAjustes: (id: string, observacao: string) => {
    let updated: Demanda | undefined;
    set((state) => ({
      demandas: state.demandas.map((d) => {
        if (d.id === id) {
          updated = {
            ...d,
            status: "em_ajustes",
            observacoes: observacao,
            updatedAt: new Date(),
          };
          return updated;
        }
        return d;
      }),
    }));
    return updated;
  },

  converterEmProjeto: (id: string, projetoId: string) => {
    let updated: Demanda | undefined;
    set((state) => ({
      demandas: state.demandas.map((d) => {
        if (d.id === id) {
          updated = {
            ...d,
            status: "convertida",
            projetoId,
            updatedAt: new Date(),
          };
          return updated;
        }
        return d;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().demandas.some((d) => d.id === id);
    if (exists) {
      set((state) => ({
        demandas: state.demandas.filter((d) => d.id !== id),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
