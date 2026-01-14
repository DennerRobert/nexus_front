export type StatusProjeto =
  | "aguardando_aprovacao"
  | "aprovado"
  | "em_execucao"
  | "pausado"
  | "concluido"
  | "cancelado";

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  empresaDonaId: string;
  demandaId?: string;
  clienteIds: string[];
  status: StatusProjeto;
  dataInicio?: Date;
  dataFimPrevista?: Date;
  dataFimReal?: Date;
  orcamento: number;
  custoAtual: number;
  squadId?: string;
  observacoes?: string;
  motivoRejeicao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjetoFormData {
  nome: string;
  descricao: string;
  empresaDonaId: string;
  clienteIds: string[];
  dataInicio?: Date;
  dataFimPrevista?: Date;
  orcamento: number;
}

export const STATUS_PROJETO_LABELS: Record<StatusProjeto, string> = {
  aguardando_aprovacao: "Aguardando Aprovação",
  aprovado: "Aprovado",
  em_execucao: "Em Execução",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_PROJETO_COLORS: Record<StatusProjeto, string> = {
  aguardando_aprovacao: "bg-yellow-500",
  aprovado: "bg-blue-500",
  em_execucao: "bg-cyan-500",
  pausado: "bg-orange-500",
  concluido: "bg-green-500",
  cancelado: "bg-red-500",
};
