// Critério de avaliação
export interface CriterioAvaliacao {
  id: string;
  nome: string;
  descricao: string;
  peso: number; // Percentual (10-20)
  perguntas: PerguntaAvaliacao[];
}

// Pergunta de avaliação
export interface PerguntaAvaliacao {
  id: string;
  criterioId: string;
  texto: string;
  opcoes: OpcaoAvaliacao[];
}

// Opção de resposta (1-5)
export interface OpcaoAvaliacao {
  valor: number; // 1 a 5
  descricao: string;
}

// Resposta de avaliação
export interface RespostaAvaliacao {
  id: string;
  demandaId: string;
  perguntaId: string;
  criterioId: string;
  valor: number; // 1 a 5
  avaliadorId: string;
  data: Date;
}

// Pontuação calculada por critério
export interface PontuacaoCriterio {
  criterioId: string;
  criterioNome: string;
  peso: number;
  pontuacaoMedia: number; // Média das respostas (1-5)
  pontuacaoPonderada: number; // pontuacaoMedia * (peso/100)
  perguntasRespondidas: number;
  totalPerguntas: number;
}

// Pontuação total da demanda
export interface PontuacaoTotal {
  demandaId: string;
  pontuacaoBruta: number; // Soma das médias (0-5)
  pontuacaoPonderada: number; // Soma ponderada (0-5)
  percentualConclusao: number; // % de perguntas respondidas
  porCriterio: PontuacaoCriterio[];
  ultimaAtualizacao: Date;
}

// Status da avaliação
export type StatusAvaliacao = "pendente" | "em_andamento" | "concluida";

export const STATUS_AVALIACAO_LABELS: Record<StatusAvaliacao, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
};
