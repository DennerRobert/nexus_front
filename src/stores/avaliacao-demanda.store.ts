import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  RespostaAvaliacao,
  PontuacaoCriterio,
  PontuacaoTotal,
  StatusAvaliacao,
} from "@/interfaces/avaliacao-demanda.interface";
import {
  CRITERIOS_AVALIACAO,
  TOTAL_PERGUNTAS,
  getCriterioById,
} from "@/config/criterios-avaliacao.config";
import { avaliacaoDemandaService } from "@/services/avaliacao-demanda.service";

interface AvaliacaoDemandaState {
  respostas: RespostaAvaliacao[];
  isLoading: boolean;
  error: string | null;
}

interface AvaliacaoDemandaActions {
  // Leitura
  getAll: () => RespostaAvaliacao[];
  getByDemanda: (demandaId: string) => RespostaAvaliacao[];
  getByAvaliador: (avaliadorId: string) => RespostaAvaliacao[];
  getResposta: (
    demandaId: string,
    perguntaId: string,
    avaliadorId: string,
  ) => RespostaAvaliacao | undefined;

  // Async
  fetchByDemanda: (demandaId: string) => Promise<void>;

  // Avaliação (otimista + background API)
  avaliar: (data: Omit<RespostaAvaliacao, "id" | "data">) => RespostaAvaliacao;
  avaliarMultiplas: (
    demandaId: string,
    avaliadorId: string,
    respostas: { perguntaId: string; criterioId: string; valor: number }[],
  ) => void;

  // Cálculos (síncronos, baseados no estado local)
  calcularPontuacaoCriterio: (demandaId: string, criterioId: string) => PontuacaoCriterio;
  calcularPontuacaoTotal: (demandaId: string) => PontuacaoTotal;
  getStatusAvaliacao: (demandaId: string) => StatusAvaliacao;
  todasPerguntasRespondidas: (demandaId: string) => boolean;
  getPerguntasPendentes: (demandaId: string) => string[];
}

export const useAvaliacaoDemandaStore = create<
  AvaliacaoDemandaState & AvaliacaoDemandaActions
>((set, get) => ({
  respostas: [],
  isLoading: false,
  error: null,

  getAll: () => get().respostas,

  getByDemanda: (demandaId) =>
    get().respostas.filter((r) => r.demandaId === demandaId),

  getByAvaliador: (avaliadorId) =>
    get().respostas.filter((r) => r.avaliadorId === avaliadorId),

  getResposta: (demandaId, perguntaId, avaliadorId) =>
    get().respostas.find(
      (r) =>
        r.demandaId === demandaId &&
        r.perguntaId === perguntaId &&
        r.avaliadorId === avaliadorId,
    ),

  fetchByDemanda: async (demandaId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await avaliacaoDemandaService.getByDemanda(demandaId);
      set((state) => {
        // Remove respostas anteriores desta demanda e adiciona as novas
        const outras = state.respostas.filter((r) => r.demandaId !== demandaId);
        return { respostas: [...outras, ...data], isLoading: false };
      });
    } catch {
      set({ isLoading: false });
    }
  },

  avaliar: (data) => {
    const existente = get().getResposta(data.demandaId, data.perguntaId, data.avaliadorId);

    if (existente) {
      const atualizada = { ...existente, valor: data.valor, data: new Date() };
      set((state) => ({
        respostas: state.respostas.map((r) =>
          r.id === existente.id ? atualizada : r,
        ),
      }));
      void avaliacaoDemandaService.avaliar(data).catch(() => {});
      return atualizada;
    }

    const nova: RespostaAvaliacao = { ...data, id: uuidv4(), data: new Date() };
    set((state) => ({ respostas: [...state.respostas, nova] }));
    void avaliacaoDemandaService.avaliar(data).catch(() => {});
    return nova;
  },

  avaliarMultiplas: (demandaId, avaliadorId, respostas) => {
    respostas.forEach((r) => {
      get().avaliar({
        demandaId,
        avaliadorId,
        perguntaId: r.perguntaId,
        criterioId: r.criterioId,
        valor: r.valor,
      });
    });
    void avaliacaoDemandaService
      .avaliarMultiplas(demandaId, avaliadorId, respostas)
      .catch(() => {});
  },

  // ── Cálculos (puros — operam sobre get().respostas) ─────────────────────────
  calcularPontuacaoCriterio: (demandaId, criterioId) => {
    const criterio = getCriterioById(criterioId);
    if (!criterio) {
      return {
        criterioId,
        criterioNome: "Desconhecido",
        peso: 0,
        pontuacaoMedia: 0,
        pontuacaoPonderada: 0,
        perguntasRespondidas: 0,
        totalPerguntas: 0,
      };
    }

    const respostasDemanda = get().getByDemanda(demandaId);
    const respostasCriterio = respostasDemanda.filter((r) => r.criterioId === criterioId);

    const mediasPorPergunta: number[] = criterio.perguntas
      .map((p) => {
        const rpg = respostasCriterio.filter((r) => r.perguntaId === p.id);
        if (rpg.length === 0) return null;
        return rpg.reduce((acc, r) => acc + r.valor, 0) / rpg.length;
      })
      .filter((v): v is number => v !== null);

    const perguntasRespondidas = mediasPorPergunta.length;
    const totalPerguntas = criterio.perguntas.length;
    const pontuacaoMedia =
      perguntasRespondidas > 0
        ? mediasPorPergunta.reduce((a, b) => a + b, 0) / perguntasRespondidas
        : 0;

    return {
      criterioId,
      criterioNome: criterio.nome,
      peso: criterio.peso,
      pontuacaoMedia,
      pontuacaoPonderada: pontuacaoMedia * (criterio.peso / 100),
      perguntasRespondidas,
      totalPerguntas,
    };
  },

  calcularPontuacaoTotal: (demandaId) => {
    const porCriterio = CRITERIOS_AVALIACAO.map((c) =>
      get().calcularPontuacaoCriterio(demandaId, c.id),
    );

    const pontuacaoPonderada = porCriterio.reduce((acc, c) => acc + c.pontuacaoPonderada, 0);

    const criteriosComResposta = porCriterio.filter((c) => c.perguntasRespondidas > 0);
    const pontuacaoBruta =
      criteriosComResposta.length > 0
        ? criteriosComResposta.reduce((acc, c) => acc + c.pontuacaoMedia, 0) /
          criteriosComResposta.length
        : 0;

    const totalRespondidas = porCriterio.reduce((acc, c) => acc + c.perguntasRespondidas, 0);
    const percentualConclusao = (totalRespondidas / TOTAL_PERGUNTAS) * 100;

    return {
      demandaId,
      pontuacaoBruta,
      pontuacaoPonderada,
      percentualConclusao,
      porCriterio,
      ultimaAtualizacao: new Date(),
    };
  },

  getStatusAvaliacao: (demandaId) => {
    const respostas = get().getByDemanda(demandaId);
    if (respostas.length === 0) return "pendente";
    const pontuacao = get().calcularPontuacaoTotal(demandaId);
    if (pontuacao.percentualConclusao >= 100) return "concluida";
    return "em_andamento";
  },

  todasPerguntasRespondidas: (demandaId) => {
    const respondidas = new Set(get().getByDemanda(demandaId).map((r) => r.perguntaId));
    return CRITERIOS_AVALIACAO.every((c) => c.perguntas.every((p) => respondidas.has(p.id)));
  },

  getPerguntasPendentes: (demandaId) => {
    const respondidas = new Set(get().getByDemanda(demandaId).map((r) => r.perguntaId));
    return CRITERIOS_AVALIACAO.flatMap((c) =>
      c.perguntas.filter((p) => !respondidas.has(p.id)).map((p) => p.id),
    );
  },
}));
