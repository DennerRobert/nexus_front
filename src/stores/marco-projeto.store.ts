import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  MarcoProjeto,
  MarcoProjetoFormData,
} from "@/interfaces/marco-projeto.interface";
import { mockProjetos, mockDemandas, mockColaboradores } from "@/utils/mock-data";

interface MarcoProjetoState {
  marcos: MarcoProjeto[];
  isLoading: boolean;
}

interface MarcoProjetoActions {
  getAll: () => MarcoProjeto[];
  getById: (id: string) => MarcoProjeto | undefined;
  getByProjeto: (projetoId: string) => MarcoProjeto[];
  create: (projetoId: string, data: MarcoProjetoFormData) => MarcoProjeto;
  update: (id: string, data: Partial<MarcoProjetoFormData>) => MarcoProjeto | undefined;
  remove: (id: string) => boolean;
  criarMarcoAutomatico: (
    projetoId: string,
    titulo: string,
    icone: MarcoProjeto["icone"],
    responsavelId?: string
  ) => MarcoProjeto;
  setLoading: (loading: boolean) => void;
}

type MarcoProjetoStore = MarcoProjetoState & MarcoProjetoActions;

// Cria marcos mockados baseados nos projetos reais
const createMockMarcos = (): MarcoProjeto[] => {
  const marcos: MarcoProjeto[] = [];

  mockProjetos.forEach((projeto) => {
    const demanda = mockDemandas.find((d) => d.id === projeto.demandaId);
    const solicitante = demanda
      ? mockColaboradores.find((c) => c.id === demanda.solicitanteId)
      : null;

    // Datas base
    const dataBase = projeto.createdAt;
    const agora = new Date();

    // Marco 1: Demanda recebida
    if (demanda) {
      marcos.push({
        id: uuidv4(),
        projetoId: projeto.id,
        titulo: "Demanda recebida",
        descricao: `A demanda "${demanda.titulo}" foi submetida por ${solicitante?.nome || "colaborador"} para análise do comitê de inovação.`,
        data: demanda.createdAt,
        responsavelId: demanda.solicitanteId,
        tipo: "automatico",
        icone: "inbox",
        createdAt: demanda.createdAt,
        updatedAt: demanda.createdAt,
      });
    }

    // Marco 2: Demanda aprovada pelo comitê
    if (demanda && demanda.status !== "em_analise") {
      const dataAprovacao = new Date(dataBase.getTime() - 15 * 24 * 60 * 60 * 1000);
      marcos.push({
        id: uuidv4(),
        projetoId: projeto.id,
        titulo: "Demanda aprovada pelo comitê",
        descricao: "O comitê de inovação aprovou a demanda para desenvolvimento do projeto.",
        data: dataAprovacao,
        tipo: "automatico",
        icone: "check_circle",
        createdAt: dataAprovacao,
        updatedAt: dataAprovacao,
      });
    }

    // Marco 3: Projeto criado/iniciado
    if (projeto.status !== "aguardando_aprovacao") {
      marcos.push({
        id: uuidv4(),
        projetoId: projeto.id,
        titulo: "Projeto aprovado e criado",
        descricao: `O projeto "${projeto.nome}" foi oficialmente criado e aprovado para execução.`,
        data: dataBase,
        tipo: "automatico",
        icone: "play_circle",
        createdAt: dataBase,
        updatedAt: dataBase,
      });
    }

    // Marco 4: Projeto iniciado (se em execução ou concluído)
    if (projeto.status === "em_execucao" || projeto.status === "concluido") {
      const dataInicio = projeto.dataInicio || new Date(dataBase.getTime() + 5 * 24 * 60 * 60 * 1000);
      marcos.push({
        id: uuidv4(),
        projetoId: projeto.id,
        titulo: "Execução do projeto iniciada",
        descricao: "O projeto entrou em fase de execução com o squad montado.",
        data: dataInicio,
        tipo: "automatico",
        icone: "play_circle",
        createdAt: dataInicio,
        updatedAt: dataInicio,
      });

      // Marco manual: Kickoff
      const dataKickoff = new Date(new Date(dataInicio).getTime() + 3 * 24 * 60 * 60 * 1000);
      marcos.push({
        id: uuidv4(),
        projetoId: projeto.id,
        titulo: "Kickoff realizado",
        descricao: "Reunião de kickoff com toda a equipe e stakeholders para alinhamento de expectativas.",
        data: dataKickoff,
        tipo: "manual",
        icone: "users",
        createdAt: dataKickoff,
        updatedAt: dataKickoff,
      });

      // Marco manual: Sprint 1
      const dataSprint1 = new Date(new Date(dataInicio).getTime() + 17 * 24 * 60 * 60 * 1000);
      if (dataSprint1 < agora) {
        marcos.push({
          id: uuidv4(),
          projetoId: projeto.id,
          titulo: "Sprint 1 concluída",
          descricao: "Primeira sprint finalizada com sucesso. Entregas: setup do ambiente, autenticação base e estrutura inicial do projeto.",
          data: dataSprint1,
          tipo: "manual",
          icone: "flag",
          createdAt: dataSprint1,
          updatedAt: dataSprint1,
        });
      }

      // Marco manual: Sprint 2
      const dataSprint2 = new Date(new Date(dataInicio).getTime() + 31 * 24 * 60 * 60 * 1000);
      if (dataSprint2 < agora) {
        marcos.push({
          id: uuidv4(),
          projetoId: projeto.id,
          titulo: "Sprint 2 concluída",
          descricao: "Segunda sprint finalizada. Entregas: telas principais, integrações com APIs e módulo de notificações.",
          data: dataSprint2,
          tipo: "manual",
          icone: "flag",
          createdAt: dataSprint2,
          updatedAt: dataSprint2,
        });
      }

      // Marco manual: Primeira versão para testes
      const dataTestesInternos = new Date(new Date(dataInicio).getTime() + 40 * 24 * 60 * 60 * 1000);
      if (dataTestesInternos < agora) {
        marcos.push({
          id: uuidv4(),
          projetoId: projeto.id,
          titulo: "Primeira versão para testes internos",
          descricao: "Versão alpha disponibilizada para testes da equipe interna e stakeholders.",
          data: dataTestesInternos,
          tipo: "manual",
          icone: "package",
          createdAt: dataTestesInternos,
          updatedAt: dataTestesInternos,
        });

        // Marco manual: Feedback recebido
        const dataFeedback = new Date(dataTestesInternos.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (dataFeedback < agora) {
          marcos.push({
            id: uuidv4(),
            projetoId: projeto.id,
            titulo: "Feedback de stakeholders recebido",
            descricao: "Coletados feedbacks da primeira rodada de testes internos. Ajustes identificados para próximas sprints.",
            data: dataFeedback,
            tipo: "manual",
            icone: "message_circle",
            createdAt: dataFeedback,
            updatedAt: dataFeedback,
          });
        }
      }
    }

    // Marco: Projeto concluído
    if (projeto.status === "concluido" && projeto.dataFimReal) {
      marcos.push({
        id: uuidv4(),
        projetoId: projeto.id,
        titulo: "Projeto concluído",
        descricao: "O projeto foi finalizado com sucesso e entregue ao cliente.",
        data: projeto.dataFimReal,
        tipo: "automatico",
        icone: "check_circle",
        createdAt: projeto.dataFimReal,
        updatedAt: projeto.dataFimReal,
      });
    }
  });

  return marcos;
};

export const useMarcoProjetoStore = create<MarcoProjetoStore>((set, get) => ({
  marcos: createMockMarcos(),
  isLoading: false,

  getAll: () => get().marcos,

  getById: (id: string) => get().marcos.find((m) => m.id === id),

  getByProjeto: (projetoId: string) =>
    get()
      .marcos.filter((m) => m.projetoId === projetoId)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),

  create: (projetoId: string, data: MarcoProjetoFormData) => {
    const novoMarco: MarcoProjeto = {
      ...data,
      id: uuidv4(),
      projetoId,
      tipo: "manual",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      marcos: [...state.marcos, novoMarco],
    }));
    return novoMarco;
  },

  update: (id: string, data: Partial<MarcoProjetoFormData>) => {
    let updated: MarcoProjeto | undefined;
    set((state) => ({
      marcos: state.marcos.map((m) => {
        if (m.id === id) {
          updated = { ...m, ...data, updatedAt: new Date() };
          return updated;
        }
        return m;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const marco = get().marcos.find((m) => m.id === id);
    // Não permite remover marcos automáticos
    if (!marco || marco.tipo === "automatico") return false;

    set((state) => ({
      marcos: state.marcos.filter((m) => m.id !== id),
    }));
    return true;
  },

  criarMarcoAutomatico: (
    projetoId: string,
    titulo: string,
    icone: MarcoProjeto["icone"],
    responsavelId?: string
  ) => {
    const novoMarco: MarcoProjeto = {
      id: uuidv4(),
      projetoId,
      titulo,
      data: new Date(),
      responsavelId,
      tipo: "automatico",
      icone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      marcos: [...state.marcos, novoMarco],
    }));
    return novoMarco;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
