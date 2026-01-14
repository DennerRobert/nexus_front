export type TipoMarco = "automatico" | "manual";

export type IconeMarco =
  | "inbox" // Demanda recebida
  | "check_circle" // Aprovação
  | "play_circle" // Início de execução
  | "users" // Kickoff
  | "flag" // Marco de sprint
  | "package" // Entrega
  | "star" // Destaque
  | "alert_triangle" // Alerta
  | "message_circle" // Feedback
  | "calendar"; // Evento geral

export interface MarcoProjeto {
  id: string;
  projetoId: string;
  titulo: string;
  descricao?: string;
  data: Date;
  responsavelId?: string;
  tipo: TipoMarco;
  icone: IconeMarco;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarcoProjetoFormData {
  titulo: string;
  descricao?: string;
  data: Date;
  responsavelId?: string;
  icone: IconeMarco;
}

export const TIPO_MARCO_LABELS: Record<TipoMarco, string> = {
  automatico: "Automático",
  manual: "Manual",
};

export const ICONE_MARCO_LABELS: Record<IconeMarco, string> = {
  inbox: "Entrada",
  check_circle: "Aprovação",
  play_circle: "Início",
  users: "Kickoff",
  flag: "Marco",
  package: "Entrega",
  star: "Destaque",
  alert_triangle: "Alerta",
  message_circle: "Feedback",
  calendar: "Evento",
};
