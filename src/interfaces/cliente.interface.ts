export type OrigemCliente = "externo" | "interno" | "investimento_interno";

export type NaturezaJuridica =
  | "empresa_privada"
  | "orgao_municipal"
  | "orgao_estadual"
  | "orgao_federal"
  | "terceiro_setor"
  | "internacional";

export type ModeloReceita =
  | "recorrencia"
  | "projeto_fechado"
  | "rateio_custo"
  | "sem_receita";

export interface Cliente {
  id: string;
  nome: string;
  origem: OrigemCliente;
  naturezaJuridica?: NaturezaJuridica;
  cnpj?: string;
  email?: string;
  telefone?: string;
  modeloReceita?: ModeloReceita;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClienteFormData {
  nome: string;
  origem: OrigemCliente;
  naturezaJuridica?: NaturezaJuridica;
  cnpj?: string;
  email?: string;
  telefone?: string;
  modeloReceita?: ModeloReceita;
  ativo: boolean;
}

export const ORIGEM_CLIENTE_LABELS: Record<OrigemCliente, string> = {
  externo: "Cliente Externo",
  interno: "Cliente Interno (Intercompany)",
  investimento_interno: "Investimento Interno",
};

export const NATUREZA_JURIDICA_LABELS: Record<NaturezaJuridica, string> = {
  empresa_privada: "Empresa Privada",
  orgao_municipal: "Órgão Público Municipal",
  orgao_estadual: "Órgão Público Estadual",
  orgao_federal: "Órgão Público Federal",
  terceiro_setor: "Terceiro Setor",
  internacional: "Internacional",
};

export const MODELO_RECEITA_LABELS: Record<ModeloReceita, string> = {
  recorrencia: "Recorrência (SaaS)",
  projeto_fechado: "Projeto Fechado",
  rateio_custo: "Rateio de Custo",
  sem_receita: "Sem Receita",
};
