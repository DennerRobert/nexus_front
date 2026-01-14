import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Projeto, ProjetoFormData, StatusProjeto } from "@/interfaces/projeto.interface";
import { mockProjetos } from "@/utils/mock-data";

interface ProjetoState {
  projetos: Projeto[];
  isLoading: boolean;
}

interface ProjetoActions {
  getAll: () => Projeto[];
  getById: (id: string) => Projeto | undefined;
  getByStatus: (status: StatusProjeto) => Projeto[];
  getByEmpresa: (empresaId: string) => Projeto[];
  getAtivos: () => Projeto[];
  getPendentesAprovacao: () => Projeto[];
  create: (data: ProjetoFormData, demandaId?: string) => Projeto;
  update: (id: string, data: Partial<ProjetoFormData>) => Projeto | undefined;
  updateStatus: (id: string, status: StatusProjeto, observacao?: string) => Projeto | undefined;
  aprovar: (id: string) => Projeto | undefined;
  rejeitar: (id: string, motivo: string) => Projeto | undefined;
  iniciarExecucao: (id: string) => Projeto | undefined;
  concluir: (id: string) => Projeto | undefined;
  cancelar: (id: string, motivo: string) => Projeto | undefined;
  vincularSquad: (id: string, squadId: string) => Projeto | undefined;
  atualizarCusto: (id: string, custo: number) => Projeto | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type ProjetoStore = ProjetoState & ProjetoActions;

export const useProjetoStore = create<ProjetoStore>((set, get) => ({
  projetos: mockProjetos,
  isLoading: false,

  getAll: () => get().projetos,

  getById: (id: string) => get().projetos.find((p) => p.id === id),

  getByStatus: (status: StatusProjeto) =>
    get().projetos.filter((p) => p.status === status),

  getByEmpresa: (empresaId: string) =>
    get().projetos.filter((p) => p.empresaDonaId === empresaId),

  getAtivos: () =>
    get().projetos.filter(
      (p) => p.status === "em_execucao" || p.status === "aprovado"
    ),

  getPendentesAprovacao: () =>
    get().projetos.filter((p) => p.status === "aguardando_aprovacao"),

  create: (data: ProjetoFormData, demandaId?: string) => {
    const newProjeto: Projeto = {
      ...data,
      id: uuidv4(),
      demandaId,
      status: "aguardando_aprovacao",
      custoAtual: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      projetos: [...state.projetos, newProjeto],
    }));
    return newProjeto;
  },

  update: (id: string, data: Partial<ProjetoFormData>) => {
    let updated: Projeto | undefined;
    set((state) => ({
      projetos: state.projetos.map((p) => {
        if (p.id === id) {
          updated = { ...p, ...data, updatedAt: new Date() };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  updateStatus: (id: string, status: StatusProjeto, observacao?: string) => {
    let updated: Projeto | undefined;
    set((state) => ({
      projetos: state.projetos.map((p) => {
        if (p.id === id) {
          updated = {
            ...p,
            status,
            observacoes: observacao || p.observacoes,
            updatedAt: new Date(),
          };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  aprovar: (id: string) => {
    return get().updateStatus(id, "aprovado");
  },

  rejeitar: (id: string, motivo: string) => {
    let updated: Projeto | undefined;
    set((state) => ({
      projetos: state.projetos.map((p) => {
        if (p.id === id) {
          updated = {
            ...p,
            status: "cancelado",
            motivoRejeicao: motivo,
            updatedAt: new Date(),
          };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  iniciarExecucao: (id: string) => {
    let updated: Projeto | undefined;
    set((state) => ({
      projetos: state.projetos.map((p) => {
        if (p.id === id) {
          updated = {
            ...p,
            status: "em_execucao",
            dataInicio: p.dataInicio || new Date(),
            updatedAt: new Date(),
          };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  concluir: (id: string) => {
    let updated: Projeto | undefined;
    set((state) => ({
      projetos: state.projetos.map((p) => {
        if (p.id === id) {
          updated = {
            ...p,
            status: "concluido",
            dataFimReal: new Date(),
            updatedAt: new Date(),
          };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  cancelar: (id: string, motivo: string) => {
    return get().rejeitar(id, motivo);
  },

  vincularSquad: (id: string, squadId: string) => {
    let updated: Projeto | undefined;
    set((state) => ({
      projetos: state.projetos.map((p) => {
        if (p.id === id) {
          updated = { ...p, squadId, updatedAt: new Date() };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  atualizarCusto: (id: string, custo: number) => {
    let updated: Projeto | undefined;
    set((state) => ({
      projetos: state.projetos.map((p) => {
        if (p.id === id) {
          updated = { ...p, custoAtual: custo, updatedAt: new Date() };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().projetos.some((p) => p.id === id);
    if (exists) {
      set((state) => ({
        projetos: state.projetos.filter((p) => p.id !== id),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
