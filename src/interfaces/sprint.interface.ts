export type StatusSprint = "planejamento" | "ativa" | "concluida" | "cancelada";

export interface Sprint {
  id: string;
  projetoId: string;
  nome: string;
  objetivo?: string;
  numero: number;
  dataInicio: Date;
  dataFim: Date;
  status: StatusSprint;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintFormData {
  nome: string;
  objetivo?: string;
  dataInicio: Date;
  dataFim: Date;
}

export const STATUS_SPRINT_LABELS: Record<StatusSprint, string> = {
  planejamento: "Planejamento",
  ativa: "Ativa",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const STATUS_SPRINT_COLORS: Record<StatusSprint, string> = {
  planejamento: "bg-slate-500",
  ativa: "bg-cyan-500",
  concluida: "bg-green-500",
  cancelada: "bg-red-500",
};

// Duração padrão de sprint em dias
export const SPRINT_DURACAO_PADRAO = 14;
