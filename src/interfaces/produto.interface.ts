export type StatusProduto =
  | "em_transicao"
  | "em_operacao"
  | "descontinuado";

export type ClassificacaoProduto =
  | "mercado_externo"
  | "intercompany"
  | "interno";

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  empresaDonaId: string;
  projetoOrigemId: string;
  clienteIds: string[];
  status: StatusProduto;
  classificacao: ClassificacaoProduto;
  responsavelOperacaoId?: string;
  custoDesenvolvimento: number;
  custoOperacaoMensal: number;
  dataLancamento: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProdutoFormData {
  nome: string;
  descricao: string;
  classificacao: ClassificacaoProduto;
  responsavelOperacaoId?: string;
}

export const STATUS_PRODUTO_LABELS: Record<StatusProduto, string> = {
  em_transicao: "Em Transição",
  em_operacao: "Em Operação",
  descontinuado: "Descontinuado",
};

export const STATUS_PRODUTO_COLORS: Record<StatusProduto, string> = {
  em_transicao: "bg-yellow-500",
  em_operacao: "bg-green-500",
  descontinuado: "bg-slate-500",
};

export const CLASSIFICACAO_PRODUTO_LABELS: Record<ClassificacaoProduto, string> = {
  mercado_externo: "Mercado Externo",
  intercompany: "Intercompany",
  interno: "Interno",
};
