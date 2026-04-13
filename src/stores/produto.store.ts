import { create } from "zustand";
import type {
  Produto,
  ProdutoFormData,
  StatusProduto,
  ClassificacaoProduto,
} from "@/interfaces/produto.interface";
import type { Projeto } from "@/interfaces/projeto.interface";
import { produtoService } from "@/services/produto.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

const PRODUTO_DATE_FIELDS = ["dataLancamento", "dataDescontinuacao"];

interface ProdutoState {
  produtos: Produto[];
  isLoading: boolean;
  error: string | null;
}

interface ProdutoActions {
  getAll: () => Produto[];
  getById: (id: string) => Produto | undefined;
  getByStatus: (status: StatusProduto) => Produto[];
  getByClassificacao: (classificacao: ClassificacaoProduto) => Produto[];
  getByEmpresa: (empresaId: string) => Produto[];
  getAtivos: () => Produto[];
  fetchAll: () => Promise<void>;
  criarDeProjeto: (projeto: Projeto, data: ProdutoFormData) => Promise<Produto | undefined>;
  update: (id: string, data: Partial<ProdutoFormData>) => Promise<Produto | undefined>;

  // Status mutations: otimistas + background API
  updateStatus: (id: string, status: StatusProduto) => void;
  iniciarOperacao: (id: string) => void;
  descontinuar: (id: string) => void;
  remove: (id: string) => Promise<boolean>;
}

type ProdutoStore = ProdutoState & ProdutoActions;

export const useProdutoStore = create<ProdutoStore>((set, get) => ({
  produtos: [],
  isLoading: false,
  error: null,

  getAll: () => get().produtos,

  getById: (id) => get().produtos.find((p) => p.id === id),

  getByStatus: (status) => get().produtos.filter((p) => p.status === status),

  getByClassificacao: (classificacao) =>
    get().produtos.filter((p) => p.classificacao === classificacao),

  getByEmpresa: (empresaId) =>
    get().produtos.filter((p) => p.empresaDonaId === empresaId),

  getAtivos: () =>
    get().produtos.filter(
      (p) => p.status === "em_operacao" || p.status === "em_transicao",
    ),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await produtoService.getAll();
      set({ produtos: deserializeList(data, PRODUTO_DATE_FIELDS), isLoading: false });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  criarDeProjeto: async (projeto, data) => {
    try {
      const payload = {
        nome: data.nome,
        descricao: data.descricao,
        empresaDonaId: projeto.empresaDonaId,
        projetoOrigemId: projeto.id,
        clienteIds: projeto.clienteIds,
        status: "em_transicao" as StatusProduto,
        classificacao: data.classificacao,
        responsavelOperacaoId: data.responsavelOperacaoId,
        custoDesenvolvimento: projeto.custoAtual,
        custoOperacaoMensal: 0,
        dataLancamento: new Date().toISOString(),
      };
      const novo = await produtoService.create(payload);
      const deserialized = deserialize(novo, PRODUTO_DATE_FIELDS);
      set((state) => ({ produtos: [...state.produtos, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await produtoService.update(id, data);
      const deserialized = deserialize(updated, PRODUTO_DATE_FIELDS);
      set((state) => ({
        produtos: state.produtos.map((p) => (p.id === id ? deserialized : p)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  updateStatus: (id, status) => {
    set((state) => ({
      produtos: state.produtos.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date() } : p,
      ),
    }));
    void produtoService
      .update(id, { status } as unknown as Partial<ProdutoFormData>)
      .catch(() => set({ error: "Erro ao atualizar status do produto." }));
  },

  iniciarOperacao: (id) => get().updateStatus(id, "em_operacao"),

  descontinuar: (id) => {
    set((state) => ({
      produtos: state.produtos.map((p) =>
        p.id === id
          ? { ...p, status: "descontinuado" as StatusProduto, dataDescontinuacao: new Date(), updatedAt: new Date() }
          : p,
      ),
    }));
    void produtoService
      .update(id, { status: "descontinuado" } as unknown as Partial<ProdutoFormData>)
      .catch(() => set({ error: "Erro ao descontinuar produto." }));
  },

  remove: async (id) => {
    try {
      await produtoService.remove(id);
      set((state) => ({ produtos: state.produtos.filter((p) => p.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },
}));
