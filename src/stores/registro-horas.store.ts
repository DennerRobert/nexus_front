import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  RegistroHoras,
  RegistroHorasFormData,
  StatusRegistroHoras,
} from "@/interfaces/registro-horas.interface";
import { useTarefaStore } from "./tarefa.store";
import { mockColaboradores } from "@/utils/mock-data";

interface RegistroHorasState {
  registros: RegistroHoras[];
  isLoading: boolean;
}

interface RegistroHorasActions {
  getByTarefa: (tarefaId: string) => RegistroHoras[];
  getByColaborador: (colaboradorId: string) => RegistroHoras[];
  getPendentes: () => RegistroHoras[];
  getPendentesPorProjeto: (projetoId: string) => RegistroHoras[];
  getTotalHorasAprovadas: (tarefaId: string) => number;
  create: (tarefaId: string, colaboradorId: string, data: RegistroHorasFormData) => RegistroHoras;
  aprovar: (id: string, aprovadorId: string) => RegistroHoras | undefined;
  rejeitar: (id: string, aprovadorId: string, motivo: string) => RegistroHoras | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type RegistroHorasStore = RegistroHorasState & RegistroHorasActions;

// Cria mock de registros de horas
const createMockRegistros = (): RegistroHoras[] => {
  const registros: RegistroHoras[] = [];
  const now = new Date();

  const tarefas = useTarefaStore.getState().getAll();

  // Descrições de exemplo
  const descricoes = [
    "Implementação de funcionalidade conforme especificado",
    "Correção de bug reportado pelo QA",
    "Revisão de código do PR",
    "Reunião de alinhamento técnico",
    "Refatoração para melhorar performance",
    "Escrita de testes unitários",
    "Documentação da API",
    "Análise de requisitos com stakeholders",
  ];

  // Cria registros para tarefas em progresso ou concluídas
  const tarefasComHoras = tarefas.filter(
    (t) => t.status === "em_progresso" || t.status === "em_revisao" || t.status === "concluido"
  );

  tarefasComHoras.forEach((tarefa, index) => {
    // 2-5 registros por tarefa
    const numRegistros = Math.floor(Math.random() * 4) + 2;
    const colaboradorId = tarefa.responsavelId || mockColaboradores[0].id;

    for (let i = 0; i < numRegistros; i++) {
      const diasAtras = Math.floor(Math.random() * 14) + 1;
      const horas = [0.5, 1, 1.5, 2, 3, 4, 6, 8][Math.floor(Math.random() * 8)];

      // Define status baseado na tarefa
      let status: StatusRegistroHoras = "aprovado";
      if (tarefa.status === "em_progresso" && i === numRegistros - 1) {
        status = "pendente"; // Último registro de tarefas em progresso é pendente
      }

      registros.push({
        id: uuidv4(),
        tarefaId: tarefa.id,
        colaboradorId,
        horas,
        data: new Date(now.getTime() - diasAtras * 24 * 60 * 60 * 1000),
        descricao: descricoes[(index + i) % descricoes.length],
        status,
        aprovadorId: status === "aprovado" ? mockColaboradores[0].id : undefined,
        dataAprovacao:
          status === "aprovado"
            ? new Date(now.getTime() - (diasAtras - 1) * 24 * 60 * 60 * 1000)
            : undefined,
        createdAt: new Date(now.getTime() - diasAtras * 24 * 60 * 60 * 1000),
      });
    }
  });

  return registros;
};

export const useRegistroHorasStore = create<RegistroHorasStore>((set, get) => ({
  registros: createMockRegistros(),
  isLoading: false,

  getByTarefa: (tarefaId: string) =>
    get()
      .registros.filter((r) => r.tarefaId === tarefaId)
      .sort((a, b) => b.data.getTime() - a.data.getTime()),

  getByColaborador: (colaboradorId: string) =>
    get()
      .registros.filter((r) => r.colaboradorId === colaboradorId)
      .sort((a, b) => b.data.getTime() - a.data.getTime()),

  getPendentes: () => get().registros.filter((r) => r.status === "pendente"),

  getPendentesPorProjeto: (projetoId: string) => {
    const tarefas = useTarefaStore.getState().getByProjeto(projetoId);
    const tarefaIds = new Set(tarefas.map((t) => t.id));
    return get().registros.filter((r) => r.status === "pendente" && tarefaIds.has(r.tarefaId));
  },

  getTotalHorasAprovadas: (tarefaId: string) =>
    get()
      .registros.filter((r) => r.tarefaId === tarefaId && r.status === "aprovado")
      .reduce((acc, r) => acc + r.horas, 0),

  create: (tarefaId: string, colaboradorId: string, data: RegistroHorasFormData) => {
    const novoRegistro: RegistroHoras = {
      id: uuidv4(),
      tarefaId,
      colaboradorId,
      horas: data.horas,
      data: data.data,
      descricao: data.descricao,
      status: "pendente",
      createdAt: new Date(),
    };

    set((state) => ({
      registros: [...state.registros, novoRegistro],
    }));

    return novoRegistro;
  },

  aprovar: (id: string, aprovadorId: string) => {
    let updated: RegistroHoras | undefined;

    set((state) => ({
      registros: state.registros.map((r) => {
        if (r.id === id && r.status === "pendente") {
          updated = {
            ...r,
            status: "aprovado",
            aprovadorId,
            dataAprovacao: new Date(),
          };

          // Atualiza horasRealizadas na tarefa
          const tarefa = useTarefaStore.getState().getById(r.tarefaId);
          if (tarefa) {
            const novasHoras = (tarefa.horasRealizadas || 0) + r.horas;
            useTarefaStore.getState().update(r.tarefaId, { horasRealizadas: novasHoras } as any);
          }

          return updated;
        }
        return r;
      }),
    }));

    return updated;
  },

  rejeitar: (id: string, aprovadorId: string, motivo: string) => {
    let updated: RegistroHoras | undefined;

    set((state) => ({
      registros: state.registros.map((r) => {
        if (r.id === id && r.status === "pendente") {
          updated = {
            ...r,
            status: "rejeitado",
            aprovadorId,
            motivoRejeicao: motivo,
            dataAprovacao: new Date(),
          };
          return updated;
        }
        return r;
      }),
    }));

    return updated;
  },

  remove: (id: string) => {
    const registro = get().registros.find((r) => r.id === id);
    if (!registro || registro.status === "aprovado") {
      return false; // Não pode remover registros aprovados
    }

    set((state) => ({
      registros: state.registros.filter((r) => r.id !== id),
    }));

    return true;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
