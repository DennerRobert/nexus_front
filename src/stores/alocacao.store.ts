import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Alocacao, AlocacaoFormData, StatusAlocacao } from "@/interfaces/alocacao.interface";
import { mockAlocacoes, mockColaboradores } from "@/utils/mock-data";

interface AlocacaoState {
  alocacoes: Alocacao[];
  isLoading: boolean;
}

interface AlocacaoActions {
  getAll: () => Alocacao[];
  getById: (id: string) => Alocacao | undefined;
  getBySquad: (squadId: string) => Alocacao[];
  getByColaborador: (colaboradorId: string) => Alocacao[];
  getAtivasByColaborador: (colaboradorId: string) => Alocacao[];
  getAtivasBySquad: (squadId: string) => Alocacao[];
  calcularOcupacaoColaborador: (colaboradorId: string) => number;
  calcularCustoSquad: (squadId: string) => number;
  create: (data: AlocacaoFormData) => Alocacao;
  update: (id: string, data: Partial<AlocacaoFormData>) => Alocacao | undefined;
  updateStatus: (id: string, status: StatusAlocacao) => Alocacao | undefined;
  aprovar: (id: string) => Alocacao | undefined;
  ativar: (id: string) => Alocacao | undefined;
  encerrar: (id: string) => Alocacao | undefined;
  rejeitar: (id: string) => Alocacao | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type AlocacaoStore = AlocacaoState & AlocacaoActions;

export const useAlocacaoStore = create<AlocacaoStore>((set, get) => ({
  alocacoes: mockAlocacoes,
  isLoading: false,

  getAll: () => get().alocacoes,

  getById: (id: string) => get().alocacoes.find((a) => a.id === id),

  getBySquad: (squadId: string) =>
    get().alocacoes.filter((a) => a.squadId === squadId),

  getByColaborador: (colaboradorId: string) =>
    get().alocacoes.filter((a) => a.colaboradorId === colaboradorId),

  getAtivasByColaborador: (colaboradorId: string) =>
    get().alocacoes.filter(
      (a) => a.colaboradorId === colaboradorId && a.status === "ativa"
    ),

  getAtivasBySquad: (squadId: string) =>
    get().alocacoes.filter(
      (a) => a.squadId === squadId && a.status === "ativa"
    ),

  calcularOcupacaoColaborador: (colaboradorId: string) => {
    const ativas = get().getAtivasByColaborador(colaboradorId);
    return ativas.reduce((total, a) => total + a.percentual, 0);
  },

  calcularCustoSquad: (squadId: string) => {
    const alocacoes = get().getAtivasBySquad(squadId);
    return alocacoes.reduce((total, a) => {
      const colaborador = mockColaboradores.find((c) => c.id === a.colaboradorId);
      if (!colaborador) return total;
      const horasMensais = (colaborador.cargaHorariaMensal * a.percentual) / 100;
      return total + colaborador.custoHora * horasMensais;
    }, 0);
  },

  create: (data: AlocacaoFormData) => {
    const colaborador = mockColaboradores.find((c) => c.id === data.colaboradorId);
    const horasMensais = colaborador
      ? (colaborador.cargaHorariaMensal * data.percentual) / 100
      : 0;
    const custoMensal = colaborador ? colaborador.custoHora * horasMensais : 0;

    const newAlocacao: Alocacao = {
      ...data,
      id: uuidv4(),
      status: "pendente",
      custoMensal,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      alocacoes: [...state.alocacoes, newAlocacao],
    }));
    return newAlocacao;
  },

  update: (id: string, data: Partial<AlocacaoFormData>) => {
    let updated: Alocacao | undefined;
    set((state) => ({
      alocacoes: state.alocacoes.map((a) => {
        if (a.id === id) {
          const colaborador = mockColaboradores.find(
            (c) => c.id === (data.colaboradorId || a.colaboradorId)
          );
          const percentual = data.percentual ?? a.percentual;
          const horasMensais = colaborador
            ? (colaborador.cargaHorariaMensal * percentual) / 100
            : 0;
          const custoMensal = colaborador ? colaborador.custoHora * horasMensais : a.custoMensal;

          updated = { ...a, ...data, custoMensal, updatedAt: new Date() };
          return updated;
        }
        return a;
      }),
    }));
    return updated;
  },

  updateStatus: (id: string, status: StatusAlocacao) => {
    let updated: Alocacao | undefined;
    set((state) => ({
      alocacoes: state.alocacoes.map((a) => {
        if (a.id === id) {
          updated = { ...a, status, updatedAt: new Date() };
          return updated;
        }
        return a;
      }),
    }));
    return updated;
  },

  aprovar: (id: string) => {
    return get().updateStatus(id, "aprovada");
  },

  ativar: (id: string) => {
    return get().updateStatus(id, "ativa");
  },

  encerrar: (id: string) => {
    let updated: Alocacao | undefined;
    set((state) => ({
      alocacoes: state.alocacoes.map((a) => {
        if (a.id === id) {
          updated = {
            ...a,
            status: "encerrada",
            dataFim: new Date(),
            updatedAt: new Date(),
          };
          return updated;
        }
        return a;
      }),
    }));
    return updated;
  },

  rejeitar: (id: string) => {
    return get().updateStatus(id, "rejeitada");
  },

  remove: (id: string) => {
    const exists = get().alocacoes.some((a) => a.id === id);
    if (exists) {
      set((state) => ({
        alocacoes: state.alocacoes.filter((a) => a.id !== id),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
