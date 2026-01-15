import { create } from "zustand";
import { persist } from "zustand/middleware";
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

interface AvaliacaoDemandaState {
  respostas: RespostaAvaliacao[];
}

interface AvaliacaoDemandaActions {
  // CRUD
  getAll: () => RespostaAvaliacao[];
  getByDemanda: (demandaId: string) => RespostaAvaliacao[];
  getByAvaliador: (avaliadorId: string) => RespostaAvaliacao[];
  getResposta: (demandaId: string, perguntaId: string, avaliadorId: string) => RespostaAvaliacao | undefined;

  // Avaliar
  avaliar: (data: Omit<RespostaAvaliacao, "id" | "data">) => RespostaAvaliacao;
  avaliarMultiplas: (
    demandaId: string,
    avaliadorId: string,
    respostas: { perguntaId: string; criterioId: string; valor: number }[]
  ) => void;

  // Cálculos
  calcularPontuacaoCriterio: (demandaId: string, criterioId: string) => PontuacaoCriterio;
  calcularPontuacaoTotal: (demandaId: string) => PontuacaoTotal;
  getStatusAvaliacao: (demandaId: string) => StatusAvaliacao;
  
  // Validações
  todasPerguntasRespondidas: (demandaId: string) => boolean;
  getPerguntasPendentes: (demandaId: string) => string[];
}

export const useAvaliacaoDemandaStore = create<AvaliacaoDemandaState & AvaliacaoDemandaActions>()(
  persist(
    (set, get) => ({
      respostas: [],

      // CRUD
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
            r.avaliadorId === avaliadorId
        ),

      // Avaliar
      avaliar: (data) => {
        const existente = get().getResposta(
          data.demandaId,
          data.perguntaId,
          data.avaliadorId
        );

        if (existente) {
          // Atualiza resposta existente
          set((state) => ({
            respostas: state.respostas.map((r) =>
              r.id === existente.id
                ? { ...r, valor: data.valor, data: new Date() }
                : r
            ),
          }));
          return { ...existente, valor: data.valor, data: new Date() };
        }

        // Cria nova resposta
        const nova: RespostaAvaliacao = {
          ...data,
          id: uuidv4(),
          data: new Date(),
        };
        set((state) => ({ respostas: [...state.respostas, nova] }));
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
      },

      // Cálculos
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
        const respostasCriterio = respostasDemanda.filter(
          (r) => r.criterioId === criterioId
        );

        // Agrupa respostas por pergunta e calcula média por pergunta
        const perguntasIds = criterio.perguntas.map((p) => p.id);
        const mediasPorPergunta: number[] = [];

        perguntasIds.forEach((perguntaId) => {
          const respostasPergunta = respostasCriterio.filter(
            (r) => r.perguntaId === perguntaId
          );
          if (respostasPergunta.length > 0) {
            const media =
              respostasPergunta.reduce((acc, r) => acc + r.valor, 0) /
              respostasPergunta.length;
            mediasPorPergunta.push(media);
          }
        });

        const perguntasRespondidas = mediasPorPergunta.length;
        const totalPerguntas = criterio.perguntas.length;

        // Média geral do critério
        const pontuacaoMedia =
          perguntasRespondidas > 0
            ? mediasPorPergunta.reduce((a, b) => a + b, 0) / perguntasRespondidas
            : 0;

        // Pontuação ponderada pelo peso
        const pontuacaoPonderada = pontuacaoMedia * (criterio.peso / 100);

        return {
          criterioId,
          criterioNome: criterio.nome,
          peso: criterio.peso,
          pontuacaoMedia,
          pontuacaoPonderada,
          perguntasRespondidas,
          totalPerguntas,
        };
      },

      calcularPontuacaoTotal: (demandaId) => {
        const porCriterio = CRITERIOS_AVALIACAO.map((c) =>
          get().calcularPontuacaoCriterio(demandaId, c.id)
        );

        // Soma das pontuações ponderadas
        const pontuacaoPonderada = porCriterio.reduce(
          (acc, c) => acc + c.pontuacaoPonderada,
          0
        );

        // Média das pontuações brutas
        const criteriosComResposta = porCriterio.filter(
          (c) => c.perguntasRespondidas > 0
        );
        const pontuacaoBruta =
          criteriosComResposta.length > 0
            ? criteriosComResposta.reduce((acc, c) => acc + c.pontuacaoMedia, 0) /
              criteriosComResposta.length
            : 0;

        // Percentual de conclusão
        const totalRespondidas = porCriterio.reduce(
          (acc, c) => acc + c.perguntasRespondidas,
          0
        );
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

      // Validações
      todasPerguntasRespondidas: (demandaId) => {
        const respostas = get().getByDemanda(demandaId);
        const perguntasRespondidas = new Set(respostas.map((r) => r.perguntaId));

        for (const criterio of CRITERIOS_AVALIACAO) {
          for (const pergunta of criterio.perguntas) {
            if (!perguntasRespondidas.has(pergunta.id)) {
              return false;
            }
          }
        }
        return true;
      },

      getPerguntasPendentes: (demandaId) => {
        const respostas = get().getByDemanda(demandaId);
        const perguntasRespondidas = new Set(respostas.map((r) => r.perguntaId));

        const pendentes: string[] = [];
        for (const criterio of CRITERIOS_AVALIACAO) {
          for (const pergunta of criterio.perguntas) {
            if (!perguntasRespondidas.has(pergunta.id)) {
              pendentes.push(pergunta.id);
            }
          }
        }
        return pendentes;
      },
    }),
    {
      name: "nexus-avaliacao-demanda-store",
    }
  )
);
