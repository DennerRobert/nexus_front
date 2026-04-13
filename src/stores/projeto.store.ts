import { create } from "zustand";
import type { Projeto, ProjetoFormData, StatusProjeto } from "@/interfaces/projeto.interface";
import { projetoService } from "@/services/projeto.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

const PROJETO_DATE_FIELDS = ["dataInicio", "dataFimPrevista", "dataFimReal"];

interface ProjetoState {
  projetos: Projeto[];
  isLoading: boolean;
  error: string | null;
}

interface ProjetoActions {
  getAll: () => Projeto[];
  getById: (id: string) => Projeto | undefined;
  getByStatus: (status: StatusProjeto) => Projeto[];
  getByEmpresa: (empresaId: string) => Projeto[];
  getAtivos: () => Projeto[];
  getPendentesAprovacao: () => Projeto[];
  fetchAll: () => Promise<void>;
  create: (data: ProjetoFormData, demandaId?: string) => Promise<Projeto | undefined>;
  update: (id: string, data: Partial<ProjetoFormData>) => Promise<Projeto | undefined>;

  // Status mutations: otimistas + background API
  updateStatus: (id: string, status: StatusProjeto, observacao?: string) => void;
  aprovar: (id: string) => void;
  rejeitar: (id: string, motivo: string) => void;
  iniciarExecucao: (id: string) => void;
  concluir: (id: string) => void;
  cancelar: (id: string, motivo: string) => void;
  vincularSquad: (id: string, squadId: string) => void;
  atualizarCusto: (id: string, custo: number) => void;
  remove: (id: string) => Promise<boolean>;
}

type ProjetoStore = ProjetoState & ProjetoActions;

export const useProjetoStore = create<ProjetoStore>((set, get) => ({
  projetos: [],
  isLoading: false,
  error: null,

  getAll: () => get().projetos,

  getById: (id) => get().projetos.find((p) => p.id === id),

  getByStatus: (status) => get().projetos.filter((p) => p.status === status),

  getByEmpresa: (empresaId) =>
    get().projetos.filter((p) => p.empresaDonaId === empresaId),

  getAtivos: () =>
    get().projetos.filter(
      (p) => p.status === "em_execucao" || p.status === "aprovado",
    ),

  getPendentesAprovacao: () =>
    get().projetos.filter((p) => p.status === "aguardando_aprovacao"),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await projetoService.getAll();
      set({ projetos: deserializeList(data, PROJETO_DATE_FIELDS), isLoading: false });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data, demandaId) => {
    try {
      const novo = await projetoService.create({ ...data, demandaId } as ProjetoFormData);
      const deserialized = deserialize(novo, PROJETO_DATE_FIELDS);
      set((state) => ({ projetos: [...state.projetos, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await projetoService.update(id, data);
      const deserialized = deserialize(updated, PROJETO_DATE_FIELDS);
      set((state) => ({
        projetos: state.projetos.map((p) => (p.id === id ? deserialized : p)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  // ── Mutations otimistas ────────────────────────────────────────────────────
  updateStatus: (id, status, observacao) => {
    set((state) => ({
      projetos: state.projetos.map((p) =>
        p.id === id
          ? { ...p, status, observacoes: observacao ?? p.observacoes, updatedAt: new Date() }
          : p,
      ),
    }));
    void projetoService
      .update(id, { status, ...(observacao ? { observacoes: observacao } : {}) } as unknown as Partial<ProjetoFormData>)
      .catch(() => set({ error: "Erro ao atualizar status do projeto." }));
  },

  aprovar: (id) => get().updateStatus(id, "aprovado"),

  rejeitar: (id, motivo) => {
    set((state) => ({
      projetos: state.projetos.map((p) =>
        p.id === id
          ? { ...p, status: "cancelado", motivoRejeicao: motivo, updatedAt: new Date() }
          : p,
      ),
    }));
    void projetoService
      .update(id, { status: "cancelado", motivoRejeicao: motivo } as unknown as Partial<ProjetoFormData>)
      .catch(() => set({ error: "Erro ao rejeitar projeto." }));
  },

  iniciarExecucao: (id) => {
    set((state) => ({
      projetos: state.projetos.map((p) =>
        p.id === id
          ? { ...p, status: "em_execucao", dataInicio: p.dataInicio ?? new Date(), updatedAt: new Date() }
          : p,
      ),
    }));
    void projetoService
      .update(id, { status: "em_execucao" } as unknown as Partial<ProjetoFormData>)
      .catch(() => set({ error: "Erro ao iniciar execução do projeto." }));
  },

  concluir: (id) => {
    set((state) => ({
      projetos: state.projetos.map((p) =>
        p.id === id
          ? { ...p, status: "concluido", dataFimReal: new Date(), updatedAt: new Date() }
          : p,
      ),
    }));
    void projetoService
      .update(id, { status: "concluido" } as unknown as Partial<ProjetoFormData>)
      .catch(() => set({ error: "Erro ao concluir projeto." }));
  },

  cancelar: (id, motivo) => get().rejeitar(id, motivo),

  vincularSquad: (id, squadId) => {
    set((state) => ({
      projetos: state.projetos.map((p) =>
        p.id === id ? { ...p, squadId, updatedAt: new Date() } : p,
      ),
    }));
    void projetoService
      .update(id, { squadId } as unknown as Partial<ProjetoFormData>)
      .catch(() => set({ error: "Erro ao vincular squad ao projeto." }));
  },

  atualizarCusto: (id, custo) => {
    set((state) => ({
      projetos: state.projetos.map((p) =>
        p.id === id ? { ...p, custoAtual: custo, updatedAt: new Date() } : p,
      ),
    }));
    void projetoService
      .update(id, { custoAtual: custo } as unknown as Partial<ProjetoFormData>)
      .catch(() => set({ error: "Erro ao atualizar custo do projeto." }));
  },

  remove: async (id) => {
    try {
      await projetoService.remove(id);
      set((state) => ({ projetos: state.projetos.filter((p) => p.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
