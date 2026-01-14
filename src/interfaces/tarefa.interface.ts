export type StatusTarefa =
  | "backlog"
  | "a_fazer"
  | "em_progresso"
  | "em_revisao"
  | "concluido";

export type PrioridadeTarefa = "baixa" | "media" | "alta" | "urgente";

export interface Tarefa {
  id: string;
  projetoId: string;
  titulo: string;
  descricao?: string;
  responsavelId?: string;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  estimativaHoras?: number;
  horasRealizadas?: number;
  dataLimite?: Date;
  tags?: string[];
  ordem: number; // Para ordenação dentro da coluna
  createdAt: Date;
  updatedAt: Date;
}

export interface TarefaFormData {
  titulo: string;
  descricao?: string;
  responsavelId?: string;
  prioridade: PrioridadeTarefa;
  estimativaHoras?: number;
  dataLimite?: Date;
  tags?: string[];
}

export const STATUS_TAREFA_LABELS: Record<StatusTarefa, string> = {
  backlog: "Backlog",
  a_fazer: "A Fazer",
  em_progresso: "Em Progresso",
  em_revisao: "Em Revisão",
  concluido: "Concluído",
};

export const STATUS_TAREFA_ORDEM: StatusTarefa[] = [
  "backlog",
  "a_fazer",
  "em_progresso",
  "em_revisao",
  "concluido",
];

export const PRIORIDADE_TAREFA_LABELS: Record<PrioridadeTarefa, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORIDADE_TAREFA_COLORS: Record<PrioridadeTarefa, string> = {
  baixa: "bg-slate-500",
  media: "bg-blue-500",
  alta: "bg-orange-500",
  urgente: "bg-red-500",
};
