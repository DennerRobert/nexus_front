export type PapelAlocacao =
  | "tech_lead"
  | "desenvolvedor"
  | "desenvolvedor_senior"
  | "desenvolvedor_pleno"
  | "desenvolvedor_junior"
  | "product_owner"
  | "scrum_master"
  | "ux_designer"
  | "qa"
  | "devops"
  | "arquiteto"
  | "analista";

export type StatusAlocacao =
  | "pendente"
  | "aprovada"
  | "ativa"
  | "encerrada"
  | "rejeitada";

export interface Alocacao {
  id: string;
  colaboradorId: string;
  squadId: string;
  papel: PapelAlocacao;
  percentual: number;
  status: StatusAlocacao;
  dataInicio: Date;
  dataFim?: Date;
  custoMensal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlocacaoFormData {
  colaboradorId: string;
  squadId: string;
  papel: PapelAlocacao;
  percentual: number;
  dataInicio: Date;
  dataFim?: Date;
}

export const PAPEL_ALOCACAO_LABELS: Record<PapelAlocacao, string> = {
  tech_lead: "Tech Lead",
  desenvolvedor: "Desenvolvedor",
  desenvolvedor_senior: "Desenvolvedor Sênior",
  desenvolvedor_pleno: "Desenvolvedor Pleno",
  desenvolvedor_junior: "Desenvolvedor Júnior",
  product_owner: "Product Owner",
  scrum_master: "Scrum Master",
  ux_designer: "UX Designer",
  qa: "QA",
  devops: "DevOps",
  arquiteto: "Arquiteto",
  analista: "Analista",
};

export const STATUS_ALOCACAO_LABELS: Record<StatusAlocacao, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  ativa: "Ativa",
  encerrada: "Encerrada",
  rejeitada: "Rejeitada",
};

export const STATUS_ALOCACAO_COLORS: Record<StatusAlocacao, string> = {
  pendente: "bg-yellow-500",
  aprovada: "bg-blue-500",
  ativa: "bg-green-500",
  encerrada: "bg-slate-500",
  rejeitada: "bg-red-500",
};
