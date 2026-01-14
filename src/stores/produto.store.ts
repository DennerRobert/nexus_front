import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Produto, ProdutoFormData, StatusProduto, ClassificacaoProduto } from "@/interfaces/produto.interface";
import type { Projeto } from "@/interfaces/projeto.interface";
import { mockProdutos } from "@/utils/mock-data";

interface ProdutoState {
  produtos: Produto[];
  isLoading: boolean;
}

interface ProdutoActions {
  getAll: () => Produto[];
  getById: (id: string) => Produto | undefined;
  getByStatus: (status: StatusProduto) => Produto[];
  getByClassificacao: (classificacao: ClassificacaoProduto) => Produto[];
  getByEmpresa: (empresaId: string) => Produto[];
  getAtivos: () => Produto[];
  criarDeProjeto: (projeto: Projeto, data: ProdutoFormData) => Produto;
  update: (id: string, data: Partial<ProdutoFormData>) => Produto | undefined;
  updateStatus: (id: string, status: StatusProduto) => Produto | undefined;
  iniciarOperacao: (id: string) => Produto | undefined;
  descontinuar: (id: string) => Produto | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type ProdutoStore = ProdutoState & ProdutoActions;

export const useProdutoStore = create<ProdutoStore>((set, get) => ({
  produtos: mockProdutos,
  isLoading: false,

  getAll: () => get().produtos,

  getById: (id: string) => get().produtos.find((p) => p.id === id),

  getByStatus: (status: StatusProduto) =>
    get().produtos.filter((p) => p.status === status),

  getByClassificacao: (classificacao: ClassificacaoProduto) =>
    get().produtos.filter((p) => p.classificacao === classificacao),

  getByEmpresa: (empresaId: string) =>
    get().produtos.filter((p) => p.empresaDonaId === empresaId),

  getAtivos: () =>
    get().produtos.filter(
      (p) => p.status === "em_operacao" || p.status === "em_transicao"
    ),

  criarDeProjeto: (projeto: Projeto, data: ProdutoFormData) => {
    const newProduto: Produto = {
      id: uuidv4(),
      nome: data.nome,
      descricao: data.descricao,
      empresaDonaId: projeto.empresaDonaId,
      projetoOrigemId: projeto.id,
      clienteIds: projeto.clienteIds,
      status: "em_transicao",
      classificacao: data.classificacao,
      responsavelOperacaoId: data.responsavelOperacaoId,
      custoDesenvolvimento: projeto.custoAtual,
      custoOperacaoMensal: 0,
      dataLancamento: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      produtos: [...state.produtos, newProduto],
    }));
    return newProduto;
  },

  update: (id: string, data: Partial<ProdutoFormData>) => {
    let updated: Produto | undefined;
    set((state) => ({
      produtos: state.produtos.map((p) => {
        if (p.id === id) {
          updated = { ...p, ...data, updatedAt: new Date() };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  updateStatus: (id: string, status: StatusProduto) => {
    let updated: Produto | undefined;
    set((state) => ({
      produtos: state.produtos.map((p) => {
        if (p.id === id) {
          updated = { ...p, status, updatedAt: new Date() };
          return updated;
        }
        return p;
      }),
    }));
    return updated;
  },

  iniciarOperacao: (id: string) => {
    return get().updateStatus(id, "em_operacao");
  },

  descontinuar: (id: string) => {
    return get().updateStatus(id, "descontinuado");
  },

  remove: (id: string) => {
    const exists = get().produtos.some((p) => p.id === id);
    if (exists) {
      set((state) => ({
        produtos: state.produtos.filter((p) => p.id !== id),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
