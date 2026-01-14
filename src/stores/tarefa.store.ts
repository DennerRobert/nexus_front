import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Tarefa, TarefaFormData, StatusTarefa } from "@/interfaces/tarefa.interface";
import { mockProjetos, mockSquads, mockAlocacoes } from "@/utils/mock-data";

interface TarefaState {
  tarefas: Tarefa[];
  isLoading: boolean;
}

interface TarefaActions {
  getAll: () => Tarefa[];
  getById: (id: string) => Tarefa | undefined;
  getByProjeto: (projetoId: string) => Tarefa[];
  getByStatus: (projetoId: string, status: StatusTarefa) => Tarefa[];
  create: (projetoId: string, data: TarefaFormData) => Tarefa;
  update: (id: string, data: Partial<TarefaFormData>) => Tarefa | undefined;
  remove: (id: string) => boolean;
  moverTarefa: (tarefaId: string, novoStatus: StatusTarefa, novaOrdem?: number) => void;
  reordenar: (projetoId: string, status: StatusTarefa, tarefaIds: string[]) => void;
  setLoading: (loading: boolean) => void;
}

type TarefaStore = TarefaState & TarefaActions;

// Busca os colaboradores alocados no squad do projeto
const getColaboradoresDoSquad = (projetoId: string) => {
  const projeto = mockProjetos.find((p) => p.id === projetoId);
  if (!projeto) return [];

  const squad = mockSquads.find((s) => s.id === projeto.squadId);
  if (!squad) return [];

  const alocacoesAtivas = mockAlocacoes.filter(
    (a) => a.squadId === squad.id && a.status === "ativa"
  );

  return alocacoesAtivas.map((a) => a.colaboradorId);
};

// Cria mock de tarefas baseado nos projetos reais
const createMockTarefas = (): Tarefa[] => {
  const tarefas: Tarefa[] = [];
  const now = new Date();

  // Template de tarefas por projeto
  const tarefasTemplate = [
    { titulo: "Configurar ambiente de desenvolvimento", tags: ["setup", "devops"], estimativa: 4, status: "concluido" as StatusTarefa, prioridade: "alta" as const },
    { titulo: "Implementar autenticação de usuários", tags: ["auth", "backend"], estimativa: 16, status: "concluido" as StatusTarefa, prioridade: "alta" as const },
    { titulo: "Criar tela de dashboard", tags: ["frontend", "dashboard"], estimativa: 12, status: "em_revisao" as StatusTarefa, prioridade: "media" as const },
    { titulo: "Integrar API de notificações push", tags: ["mobile", "push"], estimativa: 20, status: "em_progresso" as StatusTarefa, prioridade: "alta" as const },
    { titulo: "Desenvolver módulo de rastreamento", tags: ["frontend", "tracking"], estimativa: 16, status: "em_progresso" as StatusTarefa, prioridade: "alta" as const },
    { titulo: "Implementar cache de dados offline", tags: ["mobile", "offline"], estimativa: 12, status: "a_fazer" as StatusTarefa, prioridade: "media" as const },
    { titulo: "Criar tela de configurações do usuário", tags: ["frontend", "settings"], estimativa: 8, status: "a_fazer" as StatusTarefa, prioridade: "baixa" as const },
    { titulo: "Testes de integração das APIs", tags: ["testing", "qa"], estimativa: 24, status: "backlog" as StatusTarefa, prioridade: "media" as const },
    { titulo: "Documentação da API", tags: ["docs", "api"], estimativa: 8, status: "backlog" as StatusTarefa, prioridade: "baixa" as const },
    { titulo: "Otimização de performance", tags: ["performance", "optimization"], estimativa: 16, status: "backlog" as StatusTarefa, prioridade: "baixa" as const },
    { titulo: "Implementar sistema de favoritos", tags: ["frontend", "feature"], estimativa: 6, status: "backlog" as StatusTarefa, prioridade: "baixa" as const },
    { titulo: "Ajustes de acessibilidade", tags: ["a11y", "ux"], estimativa: 10, status: "backlog" as StatusTarefa, prioridade: "media" as const },
  ];

  // Cria tarefas para cada projeto com squad ativo
  mockProjetos.forEach((projeto) => {
    if (projeto.status !== "em_execucao" && projeto.status !== "concluido") {
      return; // Só projetos em execução/concluídos têm tarefas
    }

    const colaboradoresIds = getColaboradoresDoSquad(projeto.id);
    if (colaboradoresIds.length === 0) return;

    // Distribui as tarefas entre os status
    const ordensPorStatus: Record<StatusTarefa, number> = {
      backlog: 0,
      a_fazer: 0,
      em_progresso: 0,
      em_revisao: 0,
      concluido: 0,
    };

    tarefasTemplate.forEach((template, index) => {
      // Atribui responsável aleatoriamente entre os membros do squad
      const responsavelId = colaboradoresIds[index % colaboradoresIds.length];

      // Calcula horas realizadas baseado no status
      let horasRealizadas: number | undefined;
      if (template.status === "concluido") {
        horasRealizadas = template.estimativa;
      } else if (template.status === "em_revisao") {
        horasRealizadas = Math.round(template.estimativa * 0.9);
      } else if (template.status === "em_progresso") {
        horasRealizadas = Math.round(template.estimativa * (0.3 + Math.random() * 0.4));
      }

      // Data limite baseada no status
      let dataLimite: Date | undefined;
      if (template.status !== "backlog") {
        const diasOffset = {
          concluido: -10,
          em_revisao: 3,
          em_progresso: 7,
          a_fazer: 14,
        };
        dataLimite = new Date(now.getTime() + (diasOffset[template.status as keyof typeof diasOffset] || 0) * 24 * 60 * 60 * 1000);
      }

      tarefas.push({
        id: uuidv4(),
        projetoId: projeto.id,
        titulo: template.titulo,
        descricao: `Tarefa relacionada ao projeto ${projeto.nome}`,
        responsavelId,
        status: template.status,
        prioridade: template.prioridade,
        estimativaHoras: template.estimativa,
        horasRealizadas,
        dataLimite,
        tags: template.tags,
        ordem: ordensPorStatus[template.status]++,
        createdAt: new Date(now.getTime() - (30 - index * 2) * 24 * 60 * 60 * 1000),
        updatedAt: now,
      });
    });
  });

  return tarefas;
};

export const useTarefaStore = create<TarefaStore>((set, get) => ({
  tarefas: createMockTarefas(),
  isLoading: false,

  getAll: () => get().tarefas,

  getById: (id: string) => get().tarefas.find((t) => t.id === id),

  getByProjeto: (projetoId: string) =>
    get().tarefas.filter((t) => t.projetoId === projetoId),

  getByStatus: (projetoId: string, status: StatusTarefa) =>
    get()
      .tarefas.filter((t) => t.projetoId === projetoId && t.status === status)
      .sort((a, b) => a.ordem - b.ordem),

  create: (projetoId: string, data: TarefaFormData) => {
    const tarefasDoStatus = get().getByStatus(projetoId, "backlog");
    const novaOrdem = tarefasDoStatus.length;

    const novaTarefa: Tarefa = {
      ...data,
      id: uuidv4(),
      projetoId,
      status: "backlog",
      ordem: novaOrdem,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      tarefas: [...state.tarefas, novaTarefa],
    }));
    return novaTarefa;
  },

  update: (id: string, data: Partial<TarefaFormData>) => {
    let updated: Tarefa | undefined;
    set((state) => ({
      tarefas: state.tarefas.map((t) => {
        if (t.id === id) {
          updated = { ...t, ...data, updatedAt: new Date() };
          return updated;
        }
        return t;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().tarefas.some((t) => t.id === id);
    if (exists) {
      set((state) => ({
        tarefas: state.tarefas.filter((t) => t.id !== id),
      }));
    }
    return exists;
  },

  moverTarefa: (tarefaId: string, novoStatus: StatusTarefa, novaOrdem?: number) => {
    set((state) => {
      const tarefa = state.tarefas.find((t) => t.id === tarefaId);
      if (!tarefa) return state;

      const tarefasNovoStatus = state.tarefas.filter(
        (t) => t.projetoId === tarefa.projetoId && t.status === novoStatus && t.id !== tarefaId
      );

      const ordem = novaOrdem !== undefined ? novaOrdem : tarefasNovoStatus.length;

      return {
        tarefas: state.tarefas.map((t) => {
          if (t.id === tarefaId) {
            return { ...t, status: novoStatus, ordem, updatedAt: new Date() };
          }
          return t;
        }),
      };
    });
  },

  reordenar: (projetoId: string, status: StatusTarefa, tarefaIds: string[]) => {
    set((state) => ({
      tarefas: state.tarefas.map((t) => {
        if (t.projetoId === projetoId && t.status === status) {
          const novaOrdem = tarefaIds.indexOf(t.id);
          if (novaOrdem !== -1) {
            return { ...t, ordem: novaOrdem, updatedAt: new Date() };
          }
        }
        return t;
      }),
    }));
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
