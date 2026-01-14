export type StatusSaudeProjeto = "no_prazo" | "atencao" | "critico";

export interface HorasColaborador {
  colaboradorId: string;
  horasRegistradas: number;
  horasEstimadas: number;
}

export interface HorasProjeto {
  projetoId: string;
  horasPorColaborador: HorasColaborador[];
  totalHorasRegistradas: number;
  totalHorasEstimadas: number;
}

export interface ScoreParticipacao {
  colaboradorId: string;
  score: number; // 0-100
  horasTrabalhadas: number;
  tarefasConcluidas: number;
  complexidadeMedia: number; // 1-5
}

export interface ScoresProjeto {
  projetoId: string;
  scores: ScoreParticipacao[];
}

export interface SaudeProjeto {
  projetoId: string;
  percentualConcluido: number; // 0-100
  diasRestantes: number;
  diasTotais: number;
  tendenciaAtraso: number; // Dias de atraso previstos (negativo = adiantado)
  previsaoConclusao: Date;
  status: StatusSaudeProjeto;
  velocidadeAtual: number; // Tarefas por semana
  velocidadeNecessaria: number; // Tarefas por semana para cumprir prazo
}

export const STATUS_SAUDE_LABELS: Record<StatusSaudeProjeto, string> = {
  no_prazo: "No Prazo",
  atencao: "Atenção",
  critico: "Crítico",
};

export const STATUS_SAUDE_COLORS: Record<StatusSaudeProjeto, string> = {
  no_prazo: "text-green-400",
  atencao: "text-yellow-400",
  critico: "text-red-400",
};

export const STATUS_SAUDE_BG_COLORS: Record<StatusSaudeProjeto, string> = {
  no_prazo: "bg-green-500/20 border-green-500/30",
  atencao: "bg-yellow-500/20 border-yellow-500/30",
  critico: "bg-red-500/20 border-red-500/30",
};
