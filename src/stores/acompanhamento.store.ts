import { create } from "zustand";
import type {
  HorasProjeto,
  ScoresProjeto,
  SaudeProjeto,
  StatusSaudeProjeto,
} from "@/interfaces/acompanhamento-projeto.interface";
import { mockProjetos, mockSquads, mockAlocacoes } from "@/utils/mock-data";

interface AcompanhamentoState {
  isLoading: boolean;
}

interface AcompanhamentoActions {
  getHorasPorProjeto: (projetoId: string) => HorasProjeto;
  getScoresPorProjeto: (projetoId: string) => ScoresProjeto;
  getSaudeProjeto: (projetoId: string) => SaudeProjeto;
  setLoading: (loading: boolean) => void;
}

type AcompanhamentoStore = AcompanhamentoState & AcompanhamentoActions;

// Busca os colaboradores alocados no squad do projeto
const getColaboradoresDoSquad = (projetoId: string) => {
  const projeto = mockProjetos.find((p) => p.id === projetoId);
  if (!projeto) return [];

  const squad = mockSquads.find((s) => s.id === projeto.squadId);
  if (!squad) return [];

  const alocacoesAtivas = mockAlocacoes.filter(
    (a) => a.squadId === squad.id && a.status === "ativa"
  );

  return alocacoesAtivas;
};

// Gera dados de horas mockados baseados nas alocações reais do squad
const generateHorasProjeto = (projetoId: string): HorasProjeto => {
  const alocacoes = getColaboradoresDoSquad(projetoId);

  if (alocacoes.length === 0) {
    return {
      projetoId,
      horasPorColaborador: [],
      totalHorasRegistradas: 0,
      totalHorasEstimadas: 0,
    };
  }

  const horasPorColaborador = alocacoes.map((alocacao) => {
    // Horas estimadas baseadas no percentual de alocação (160h = 100%)
    const horasEstimadas = Math.round((alocacao.percentual / 100) * 160);
    // Horas registradas são um valor mockado (60-95% das estimadas)
    const percentualCompleto = 0.6 + Math.random() * 0.35;
    const horasRegistradas = Math.round(horasEstimadas * percentualCompleto);

    return {
      colaboradorId: alocacao.colaboradorId,
      horasRegistradas,
      horasEstimadas,
    };
  });

  const totalHorasRegistradas = horasPorColaborador.reduce(
    (sum, h) => sum + h.horasRegistradas,
    0
  );
  const totalHorasEstimadas = horasPorColaborador.reduce(
    (sum, h) => sum + h.horasEstimadas,
    0
  );

  return {
    projetoId,
    horasPorColaborador,
    totalHorasRegistradas,
    totalHorasEstimadas,
  };
};

// Gera dados de score mockados baseados nas alocações reais do squad
const generateScoresProjeto = (projetoId: string): ScoresProjeto => {
  const alocacoes = getColaboradoresDoSquad(projetoId);

  if (alocacoes.length === 0) {
    return {
      projetoId,
      scores: [],
    };
  }

  const scores = alocacoes.map((alocacao) => {
    // Score baseado em vários fatores mockados
    const baseScore = 50 + Math.random() * 50;
    // Tarefas concluídas (3-12)
    const tarefasConcluidas = Math.floor(3 + Math.random() * 10);
    // Horas trabalhadas baseadas na alocação
    const horasTrabalhadas = Math.round((alocacao.percentual / 100) * 160 * (0.6 + Math.random() * 0.35));
    // Complexidade média (1-5)
    const complexidadeMedia = 1 + Math.random() * 4;

    // Score final ponderado
    const score = Math.min(100, Math.round(
      baseScore * 0.3 +
      (tarefasConcluidas / 12) * 100 * 0.3 +
      (horasTrabalhadas / 160) * 100 * 0.2 +
      complexidadeMedia * 20 * 0.2
    ));

    return {
      colaboradorId: alocacao.colaboradorId,
      score,
      horasTrabalhadas,
      tarefasConcluidas,
      complexidadeMedia: Math.round(complexidadeMedia * 10) / 10,
    };
  });

  return {
    projetoId,
    scores,
  };
};

// Gera dados de saúde do projeto baseados no projeto real
const generateSaudeProjeto = (projetoId: string): SaudeProjeto => {
  const projeto = mockProjetos.find((p) => p.id === projetoId);
  const now = new Date();

  if (!projeto || !projeto.dataInicio || !projeto.dataFimPrevista) {
    return {
      projetoId,
      percentualConcluido: 0,
      diasRestantes: 0,
      diasTotais: 0,
      tendenciaAtraso: 0,
      previsaoConclusao: now,
      status: "atencao" as StatusSaudeProjeto,
      velocidadeAtual: 0,
      velocidadeNecessaria: 0,
    };
  }

  const dataInicio = new Date(projeto.dataInicio);
  const dataFimPrevista = new Date(projeto.dataFimPrevista);

  // Dias totais e restantes
  const diasTotais = Math.ceil(
    (dataFimPrevista.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
  );
  const diasDecorridos = Math.ceil(
    (now.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
  );
  const diasRestantes = Math.max(0, diasTotais - diasDecorridos);

  // Percentual concluído (baseado no tempo + variação aleatória)
  const percentualTempo = Math.min(100, (diasDecorridos / diasTotais) * 100);
  // Adicionamos uma variação: projeto pode estar adiantado ou atrasado
  const variacaoDesempenho = -10 + Math.random() * 15; // -10% a +5%
  const percentualConcluido = Math.max(0, Math.min(100, Math.round(percentualTempo + variacaoDesempenho)));

  // Tendência de atraso
  const diferencaProgresso = percentualTempo - percentualConcluido;
  const tendenciaAtraso = Math.round((diferencaProgresso / 100) * diasTotais);

  // Data prevista de conclusão
  const diasAjustados = diasRestantes + tendenciaAtraso;
  const previsaoConclusao = new Date(now.getTime() + diasAjustados * 24 * 60 * 60 * 1000);

  // Status baseado na tendência
  let status: StatusSaudeProjeto = "no_prazo";
  if (tendenciaAtraso > 7) {
    status = "critico";
  } else if (tendenciaAtraso > 2) {
    status = "atencao";
  }

  // Velocidades
  const semanasDecorridas = Math.max(1, diasDecorridos / 7);
  const tarefasEstimadas = 20; // Estimativa mockada
  const tarefasConcluidas = Math.round((percentualConcluido / 100) * tarefasEstimadas);
  const velocidadeAtual = Math.round((tarefasConcluidas / semanasDecorridas) * 10) / 10;

  const semanasRestantes = Math.max(1, diasRestantes / 7);
  const tarefasRestantes = tarefasEstimadas - tarefasConcluidas;
  const velocidadeNecessaria = Math.round((tarefasRestantes / semanasRestantes) * 10) / 10;

  return {
    projetoId,
    percentualConcluido,
    diasRestantes,
    diasTotais,
    tendenciaAtraso,
    previsaoConclusao,
    status,
    velocidadeAtual,
    velocidadeNecessaria,
  };
};

// Cache para manter consistência durante a sessão
const cachedData: {
  horas: Map<string, HorasProjeto>;
  scores: Map<string, ScoresProjeto>;
  saude: Map<string, SaudeProjeto>;
} = {
  horas: new Map(),
  scores: new Map(),
  saude: new Map(),
};

export const useAcompanhamentoStore = create<AcompanhamentoStore>((set) => ({
  isLoading: false,

  getHorasPorProjeto: (projetoId: string): HorasProjeto => {
    if (!cachedData.horas.has(projetoId)) {
      cachedData.horas.set(projetoId, generateHorasProjeto(projetoId));
    }
    return cachedData.horas.get(projetoId)!;
  },

  getScoresPorProjeto: (projetoId: string): ScoresProjeto => {
    if (!cachedData.scores.has(projetoId)) {
      cachedData.scores.set(projetoId, generateScoresProjeto(projetoId));
    }
    return cachedData.scores.get(projetoId)!;
  },

  getSaudeProjeto: (projetoId: string): SaudeProjeto => {
    if (!cachedData.saude.has(projetoId)) {
      cachedData.saude.set(projetoId, generateSaudeProjeto(projetoId));
    }
    return cachedData.saude.get(projetoId)!;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
