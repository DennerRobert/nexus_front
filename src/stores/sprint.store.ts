import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Sprint, SprintFormData, StatusSprint } from "@/interfaces/sprint.interface";
import { SPRINT_DURACAO_PADRAO } from "@/interfaces/sprint.interface";
import { mockProjetos } from "@/utils/mock-data";
import { useTarefaStore } from "./tarefa.store";

interface SprintState {
  sprints: Sprint[];
  isLoading: boolean;
}

interface SprintActions {
  getAll: () => Sprint[];
  getById: (id: string) => Sprint | undefined;
  getByProjeto: (projetoId: string) => Sprint[];
  getAtiva: (projetoId: string) => Sprint | undefined;
  create: (projetoId: string, data: SprintFormData) => Sprint;
  update: (id: string, data: Partial<SprintFormData>) => Sprint | undefined;
  remove: (id: string) => boolean;
  iniciarSprint: (id: string) => Sprint | undefined;
  concluirSprint: (id: string) => Sprint | undefined;
  cancelarSprint: (id: string) => Sprint | undefined;
  getProgresso: (sprintId: string) => { total: number; concluidas: number; percentual: number };
  setLoading: (loading: boolean) => void;
}

type SprintStore = SprintState & SprintActions;

// Cria mock de sprints para projetos em execução
const createMockSprints = (): Sprint[] => {
  const sprints: Sprint[] = [];
  const now = new Date();

  // Apenas projetos em execução têm sprints
  const projetosAtivos = mockProjetos.filter((p) => p.status === "em_execucao");

  projetosAtivos.forEach((projeto) => {
    const dataInicioProjeto = projeto.dataInicio || new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Sprint 1 - Concluída
    const sprint1Inicio = new Date(dataInicioProjeto);
    const sprint1Fim = new Date(sprint1Inicio.getTime() + SPRINT_DURACAO_PADRAO * 24 * 60 * 60 * 1000);

    sprints.push({
      id: uuidv4(),
      projetoId: projeto.id,
      nome: "Sprint 1",
      objetivo: "Setup inicial e estruturação do projeto",
      numero: 1,
      dataInicio: sprint1Inicio,
      dataFim: sprint1Fim,
      status: "concluida",
      createdAt: sprint1Inicio,
      updatedAt: sprint1Fim,
    });

    // Sprint 2 - Concluída
    const sprint2Inicio = new Date(sprint1Fim.getTime() + 1 * 24 * 60 * 60 * 1000);
    const sprint2Fim = new Date(sprint2Inicio.getTime() + SPRINT_DURACAO_PADRAO * 24 * 60 * 60 * 1000);

    sprints.push({
      id: uuidv4(),
      projetoId: projeto.id,
      nome: "Sprint 2",
      objetivo: "Implementação das funcionalidades core",
      numero: 2,
      dataInicio: sprint2Inicio,
      dataFim: sprint2Fim,
      status: "concluida",
      createdAt: sprint2Inicio,
      updatedAt: sprint2Fim,
    });

    // Sprint 3 - Ativa (atual)
    const sprint3Inicio = new Date(sprint2Fim.getTime() + 1 * 24 * 60 * 60 * 1000);
    const sprint3Fim = new Date(sprint3Inicio.getTime() + SPRINT_DURACAO_PADRAO * 24 * 60 * 60 * 1000);

    const sprint3Id = uuidv4();
    sprints.push({
      id: sprint3Id,
      projetoId: projeto.id,
      nome: "Sprint 3",
      objetivo: "Integração com APIs e testes",
      numero: 3,
      dataInicio: sprint3Inicio,
      dataFim: sprint3Fim,
      status: "ativa",
      createdAt: sprint3Inicio,
      updatedAt: now,
    });

    // Sprint 4 - Planejamento
    const sprint4Inicio = new Date(sprint3Fim.getTime() + 1 * 24 * 60 * 60 * 1000);
    const sprint4Fim = new Date(sprint4Inicio.getTime() + SPRINT_DURACAO_PADRAO * 24 * 60 * 60 * 1000);

    sprints.push({
      id: uuidv4(),
      projetoId: projeto.id,
      nome: "Sprint 4",
      objetivo: "Refinamentos e preparação para release",
      numero: 4,
      dataInicio: sprint4Inicio,
      dataFim: sprint4Fim,
      status: "planejamento",
      createdAt: now,
      updatedAt: now,
    });
  });

  return sprints;
};

// IDs das sprints criadas para vincular às tarefas
let mockSprintsCache: Sprint[] | null = null;

const getMockSprints = (): Sprint[] => {
  if (!mockSprintsCache) {
    mockSprintsCache = createMockSprints();
  }
  return mockSprintsCache;
};

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: getMockSprints(),
  isLoading: false,

  getAll: () => get().sprints,

  getById: (id: string) => get().sprints.find((s) => s.id === id),

  getByProjeto: (projetoId: string) =>
    get()
      .sprints.filter((s) => s.projetoId === projetoId)
      .sort((a, b) => a.numero - b.numero),

  getAtiva: (projetoId: string) =>
    get().sprints.find((s) => s.projetoId === projetoId && s.status === "ativa"),

  create: (projetoId: string, data: SprintFormData) => {
    const sprintsDoProjeto = get().getByProjeto(projetoId);
    const proximoNumero = sprintsDoProjeto.length > 0 ? Math.max(...sprintsDoProjeto.map((s) => s.numero)) + 1 : 1;

    const novaSprint: Sprint = {
      id: uuidv4(),
      projetoId,
      nome: data.nome,
      objetivo: data.objetivo,
      numero: proximoNumero,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      status: "planejamento",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      sprints: [...state.sprints, novaSprint],
    }));

    return novaSprint;
  },

  update: (id: string, data: Partial<SprintFormData>) => {
    let updated: Sprint | undefined;

    set((state) => ({
      sprints: state.sprints.map((s) => {
        if (s.id === id) {
          updated = { ...s, ...data, updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));

    return updated;
  },

  remove: (id: string) => {
    const sprint = get().getById(id);
    if (!sprint || sprint.status === "ativa" || sprint.status === "concluida") {
      return false; // Não pode remover sprints ativas ou concluídas
    }

    set((state) => ({
      sprints: state.sprints.filter((s) => s.id !== id),
    }));

    return true;
  },

  iniciarSprint: (id: string) => {
    const sprint = get().getById(id);
    if (!sprint || sprint.status !== "planejamento") {
      return undefined;
    }

    // Verifica se já existe sprint ativa no projeto
    const sprintAtiva = get().getAtiva(sprint.projetoId);
    if (sprintAtiva) {
      return undefined; // Já existe sprint ativa
    }

    let updated: Sprint | undefined;

    set((state) => ({
      sprints: state.sprints.map((s) => {
        if (s.id === id) {
          updated = { ...s, status: "ativa", updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));

    return updated;
  },

  concluirSprint: (id: string) => {
    const sprint = get().getById(id);
    if (!sprint || sprint.status !== "ativa") {
      return undefined;
    }

    let updated: Sprint | undefined;

    set((state) => ({
      sprints: state.sprints.map((s) => {
        if (s.id === id) {
          updated = { ...s, status: "concluida", updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));

    // Move tarefas não concluídas para o backlog (sem sprint)
    const tarefas = useTarefaStore.getState().getByProjeto(sprint.projetoId);
    tarefas.forEach((tarefa) => {
      if (tarefa.sprintId === id && tarefa.status !== "concluido") {
        useTarefaStore.getState().update(tarefa.id, { sprintId: undefined } as any);
      }
    });

    return updated;
  },

  cancelarSprint: (id: string) => {
    const sprint = get().getById(id);
    if (!sprint || sprint.status === "concluida") {
      return undefined;
    }

    let updated: Sprint | undefined;

    set((state) => ({
      sprints: state.sprints.map((s) => {
        if (s.id === id) {
          updated = { ...s, status: "cancelada", updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));

    // Remove sprint das tarefas
    const tarefas = useTarefaStore.getState().getByProjeto(sprint.projetoId);
    tarefas.forEach((tarefa) => {
      if (tarefa.sprintId === id) {
        useTarefaStore.getState().update(tarefa.id, { sprintId: undefined } as any);
      }
    });

    return updated;
  },

  getProgresso: (sprintId: string) => {
    const sprint = get().getById(sprintId);
    if (!sprint) {
      return { total: 0, concluidas: 0, percentual: 0 };
    }

    const tarefas = useTarefaStore.getState().getByProjeto(sprint.projetoId);
    const tarefasDaSprint = tarefas.filter((t) => t.sprintId === sprintId);
    const concluidas = tarefasDaSprint.filter((t) => t.status === "concluido").length;
    const total = tarefasDaSprint.length;

    return {
      total,
      concluidas,
      percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0,
    };
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Vincula tarefas às sprints após criação
export const vincularTarefasAsSprints = () => {
  const sprints = useSprintStore.getState().getAll();
  const tarefas = useTarefaStore.getState().getAll();

  // Agrupa sprints por projeto
  const sprintsPorProjeto = new Map<string, Sprint[]>();
  sprints.forEach((sprint) => {
    const list = sprintsPorProjeto.get(sprint.projetoId) || [];
    list.push(sprint);
    sprintsPorProjeto.set(sprint.projetoId, list);
  });

  // Para cada tarefa, vincula a uma sprint baseado no status
  tarefas.forEach((tarefa) => {
    const sprintsDoProjeto = sprintsPorProjeto.get(tarefa.projetoId);
    if (!sprintsDoProjeto || sprintsDoProjeto.length === 0) return;

    // Sprints ordenadas por número
    const sprintsOrdenadas = [...sprintsDoProjeto].sort((a, b) => a.numero - b.numero);
    const sprintAtiva = sprintsOrdenadas.find((s) => s.status === "ativa");
    const sprintsConcluidas = sprintsOrdenadas.filter((s) => s.status === "concluida");

    let sprintId: string | undefined;

    if (tarefa.status === "concluido") {
      // Tarefas concluídas vão para a última sprint concluída
      sprintId = sprintsConcluidas[sprintsConcluidas.length - 1]?.id;
    } else if (tarefa.status === "em_progresso" || tarefa.status === "em_revisao") {
      // Tarefas em progresso/revisão vão para a sprint ativa
      sprintId = sprintAtiva?.id;
    } else if (tarefa.status === "a_fazer") {
      // Tarefas a fazer vão para a sprint ativa
      sprintId = sprintAtiva?.id;
    }
    // Backlog não tem sprint

    if (sprintId && !tarefa.sprintId) {
      useTarefaStore.getState().update(tarefa.id, { sprintId } as any);
    }
  });
};
