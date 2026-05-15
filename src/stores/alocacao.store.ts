import { create } from "zustand";
import type { Alocacao, AlocacaoFormData, StatusAlocacao } from "@/interfaces/alocacao.interface";
import type { Colaborador } from "@/interfaces/colaborador.interface";
import { alocacaoService } from "@/services/alocacao.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

/**
 * Retorna os colaboradores da store sem criar dependência circular.
 */
const getColaboradores = (): Colaborador[] => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useColaboradorStore } = require("@/stores/colaborador.store");
  return (useColaboradorStore.getState().colaboradores as Colaborador[]) ?? [];
};

interface AlocacaoState {
  alocacoes: Alocacao[];
  isLoading: boolean;
  error: string | null;
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
  fetchAll: () => Promise<void>;
  create: (data: AlocacaoFormData) => Promise<Alocacao | undefined>;
  update: (id: string, data: Partial<AlocacaoFormData>) => Promise<Alocacao | undefined>;
  updateStatus: (id: string, status: StatusAlocacao) => void;
  aprovar: (id: string) => void;
  ativar: (id: string) => void;
  encerrar: (id: string) => void;
  rejeitar: (id: string) => void;
  remove: (id: string) => Promise<boolean>;
}

type AlocacaoStore = AlocacaoState & AlocacaoActions;

export const useAlocacaoStore = create<AlocacaoStore>((set, get) => ({
  alocacoes: [],
  isLoading: false,
  error: null,

  getAll: () => get().alocacoes,

  getById: (id) => get().alocacoes.find((a) => a.id === id),

  getBySquad: (squadId) => get().alocacoes.filter((a) => a.squadId === squadId),

  getByColaborador: (colaboradorId) =>
    get().alocacoes.filter((a) => a.colaboradorId === colaboradorId),

  getAtivasByColaborador: (colaboradorId) =>
    get().alocacoes.filter((a) => a.colaboradorId === colaboradorId && a.status === "ativa"),

  getAtivasBySquad: (squadId) =>
    get().alocacoes.filter((a) => a.squadId === squadId && a.status === "ativa"),

  calcularOcupacaoColaborador: (colaboradorId) =>
    get()
      .getAtivasByColaborador(colaboradorId)
      .reduce((total, a) => total + a.percentual, 0),

  calcularCustoSquad: (squadId) => {
    const colaboradores = getColaboradores();
    return get()
      .getAtivasBySquad(squadId)
      .reduce((total, a) => {
        const colab = colaboradores.find((c) => c.id === a.colaboradorId);
        if (!colab) return total;
        const horas = (colab.cargaHorariaMensal * a.percentual) / 100;
        return total + colab.custoHora * horas;
      }, 0);
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await alocacaoService.getAll();
      set({
        alocacoes: deserializeList(data, ["dataInicio", "dataFim"]),
        isLoading: false,
      });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data) => {
    try {
      const nova = await alocacaoService.create(data);
      const deserialized = deserialize(nova, ["dataInicio", "dataFim"]);
      set((state) => ({ alocacoes: [...state.alocacoes, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await alocacaoService.update(id, data);
      const deserialized = deserialize(updated, ["dataInicio", "dataFim"]);
      set((state) => ({
        alocacoes: state.alocacoes.map((a) => (a.id === id ? deserialized : a)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  // Mutations de status: otimistas (atualiza estado imediatamente + sincroniza em background)
  updateStatus: (id, status) => {
    set((state) => ({
      alocacoes: state.alocacoes.map((a) =>
        a.id === id ? { ...a, status, updatedAt: new Date() } : a,
      ),
    }));
    // status não está em AlocacaoFormData, mas o endpoint PATCH aceita campos parciais
    void alocacaoService
      .update(id, { status } as unknown as Partial<AlocacaoFormData>)
      .catch(() => set({ error: "Erro ao atualizar status da alocação." }));
  },

  aprovar: (id) => get().updateStatus(id, "aprovada"),
  ativar: (id) => get().updateStatus(id, "ativa"),

  encerrar: (id) => {
    set((state) => ({
      alocacoes: state.alocacoes.map((a) =>
        a.id === id
          ? { ...a, status: "encerrada" as StatusAlocacao, dataFim: new Date(), updatedAt: new Date() }
          : a,
      ),
    }));
    void alocacaoService
      .update(id, { status: "encerrada" } as unknown as Partial<AlocacaoFormData>)
      .catch(() => set({ error: "Erro ao encerrar alocação." }));
  },

  rejeitar: (id) => get().updateStatus(id, "rejeitada"),

  remove: async (id) => {
    try {
      await alocacaoService.remove(id);
      set((state) => ({ alocacoes: state.alocacoes.filter((a) => a.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
