export type StatusRegistroHoras = "pendente" | "aprovado" | "rejeitado";

export interface RegistroHoras {
  id: string;
  tarefaId: string;
  colaboradorId: string;
  horas: number;
  data: Date;
  descricao: string;
  status: StatusRegistroHoras;
  aprovadorId?: string;
  dataAprovacao?: Date;
  motivoRejeicao?: string;
  createdAt: Date;
}

export interface RegistroHorasFormData {
  horas: number;
  data: Date;
  descricao: string;
}

export const STATUS_REGISTRO_HORAS_LABELS: Record<StatusRegistroHoras, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export const STATUS_REGISTRO_HORAS_COLORS: Record<StatusRegistroHoras, string> = {
  pendente: "bg-yellow-500",
  aprovado: "bg-green-500",
  rejeitado: "bg-red-500",
};
