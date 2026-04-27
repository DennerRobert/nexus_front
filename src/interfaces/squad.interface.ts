export type StatusSquad =
  | "formando"
  | "ativo"
  | "em_handover"
  | "encerrado";

export interface Squad {
  id: string;
  nome: string;
  objetivo: string;
  projetoId: string;
  status: StatusSquad;
  dataInicio: Date;
  dataFim?: Date;
  custoMensal: number;
  liderTecnicoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SquadFormData {
  nome: string;
  objetivo: string;
  projetoId: string;
}

export const STATUS_SQUAD_LABELS: Record<StatusSquad, string> = {
  formando: "Em Formação",
  ativo: "Ativo",
  em_handover: "Em Handover",
  encerrado: "Encerrado",
};

export const STATUS_SQUAD_COLORS: Record<StatusSquad, string> = {
  formando: "bg-yellow-500",
  ativo: "bg-green-500",
  em_handover: "bg-orange-500",
  encerrado: "bg-slate-500",
};
