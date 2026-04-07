import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Colaborador, ColaboradorFormData, ColaboradorComOcupacao } from "@/interfaces/colaborador.interface";
import { mockColaboradores, mockAlocacoes } from "@/utils/mock-data";

interface ColaboradorState {
  colaboradores: Colaborador[];
  isLoading: boolean;
}

interface ColaboradorActions {
  getAll: () => Colaborador[];
  getById: (id: string) => Colaborador | undefined;
  getByEmpresa: (empresaId: string) => Colaborador[];
  getComOcupacao: () => ColaboradorComOcupacao[];
  getOcupacao: (colaboradorId: string) => number;
  getDisponibilidade: (colaboradorId: string) => number;
  create: (data: ColaboradorFormData) => Colaborador;
  update: (id: string, data: Partial<ColaboradorFormData>) => Colaborador | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type ColaboradorStore = ColaboradorState & ColaboradorActions;

export const useColaboradorStore = create<ColaboradorStore>((set, get) => ({
  colaboradores: mockColaboradores,
  isLoading: false,

  getAll: () => get().colaboradores.filter((c) => c.ativo),

  getById: (id: string) => get().colaboradores.find((c) => c.id === id),

  getByEmpresa: (empresaId: string) =>
    get().colaboradores.filter((c) => c.empresaIds.includes(empresaId) && c.ativo),

  getOcupacao: (colaboradorId: string) => {
    const alocacoesAtivas = mockAlocacoes.filter(
      (a) => a.colaboradorId === colaboradorId && a.status === "ativa"
    );
    return alocacoesAtivas.reduce((total, a) => total + a.percentual, 0);
  },

  getDisponibilidade: (colaboradorId: string) => {
    const ocupacao = get().getOcupacao(colaboradorId);
    return Math.max(0, 100 - ocupacao);
  },

  getComOcupacao: () => {
    return get()
      .colaboradores.filter((c) => c.ativo)
      .map((colaborador) => {
        const alocacoesAtivas = mockAlocacoes.filter(
          (a) => a.colaboradorId === colaborador.id && a.status === "ativa"
        );
        const ocupacaoAtual = alocacoesAtivas.reduce((total, a) => total + a.percentual, 0);
        return {
          ...colaborador,
          ocupacaoAtual,
          disponibilidade: Math.max(0, 100 - ocupacaoAtual),
          alocacoes: alocacoesAtivas.length,
        };
      });
  },

  create: (data: ColaboradorFormData) => {
    const newColaborador: Colaborador = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      colaboradores: [...state.colaboradores, newColaborador],
    }));
    return newColaborador;
  },

  update: (id: string, data: Partial<ColaboradorFormData>) => {
    let updated: Colaborador | undefined;
    set((state) => ({
      colaboradores: state.colaboradores.map((c) => {
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
    const exists = get().colaboradores.some((c) => c.id === id);
    if (exists) {
      set((state) => ({
        colaboradores: state.colaboradores.map((c) =>
          c.id === id ? { ...c, ativo: false, updatedAt: new Date() } : c
        ),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
