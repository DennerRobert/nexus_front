import { create } from "zustand";
import type {
  Colaborador,
  ColaboradorFormData,
  ColaboradorComOcupacao,
} from "@/interfaces/colaborador.interface";
import type { Alocacao } from "@/interfaces/alocacao.interface";
import { colaboradorService } from "@/services/colaborador.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

/**
 * Retorna as alocações da store de alocações sem criar dependência circular.
 * O require dinâmico é avaliado em tempo de execução (não em tempo de importação).
 */
const getAlocacoes = (): Alocacao[] => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAlocacaoStore } = require("@/stores/alocacao.store");
  return (useAlocacaoStore.getState().alocacoes as Alocacao[]) ?? [];
};

interface ColaboradorState {
  colaboradores: Colaborador[];
  isLoading: boolean;
  error: string | null;
}

interface ColaboradorActions {
  getAll: () => Colaborador[];
  getById: (id: string) => Colaborador | undefined;
  getByEmpresa: (empresaId: string) => Colaborador[];
  getComOcupacao: () => ColaboradorComOcupacao[];
  getOcupacao: (colaboradorId: string) => number;
  getDisponibilidade: (colaboradorId: string) => number;
  fetchAll: () => Promise<void>;
  create: (data: ColaboradorFormData) => Promise<Colaborador | undefined>;
  update: (id: string, data: Partial<ColaboradorFormData>) => Promise<Colaborador | undefined>;
  remove: (id: string) => Promise<boolean>;
}

type ColaboradorStore = ColaboradorState & ColaboradorActions;

export const useColaboradorStore = create<ColaboradorStore>((set, get) => ({
  colaboradores: [],
  isLoading: false,
  error: null,

  getAll: () => get().colaboradores.filter((c) => c.ativo),

  getById: (id) => get().colaboradores.find((c) => c.id === id),

  getByEmpresa: (empresaId) =>
    get().colaboradores.filter((c) => c.empresaIds.includes(empresaId) && c.ativo),

  getOcupacao: (colaboradorId) => {
    const alocacoes = getAlocacoes();
    return alocacoes
      .filter((a) => a.colaboradorId === colaboradorId && a.status === "ativa")
      .reduce((total, a) => total + a.percentual, 0);
  },

  getDisponibilidade: (colaboradorId) =>
    Math.max(0, 100 - get().getOcupacao(colaboradorId)),

  getComOcupacao: () => {
    const alocacoes = getAlocacoes();
    return get()
      .colaboradores.filter((c) => c.ativo)
      .map((colaborador) => {
        const ativas = alocacoes.filter(
          (a) => a.colaboradorId === colaborador.id && a.status === "ativa",
        );
        const ocupacaoAtual = ativas.reduce((total, a) => total + a.percentual, 0);
        return {
          ...colaborador,
          ocupacaoAtual,
          disponibilidade: Math.max(0, 100 - ocupacaoAtual),
          alocacoes: ativas.length,
        };
      });
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await colaboradorService.getAll();
      set({
        colaboradores: deserializeList(data, ["dataAdmissao", "dataDemissao"]),
        isLoading: false,
      });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data) => {
    try {
      const novo = await colaboradorService.create(data);
      const deserialized = deserialize(novo, ["dataAdmissao", "dataDemissao"]);
      set((state) => ({ colaboradores: [...state.colaboradores, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await colaboradorService.update(id, data);
      const deserialized = deserialize(updated, ["dataAdmissao", "dataDemissao"]);
      set((state) => ({
        colaboradores: state.colaboradores.map((c) => (c.id === id ? deserialized : c)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  remove: async (id) => {
    try {
      await colaboradorService.remove(id);
      // Soft-delete: marca como inativo localmente
      set((state) => ({
        colaboradores: state.colaboradores.map((c) =>
          c.id === id ? { ...c, ativo: false, updatedAt: new Date() } : c,
        ),
      }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
