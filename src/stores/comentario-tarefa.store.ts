import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { ComentarioTarefa, ComentarioTarefaFormData } from "@/interfaces/comentario-tarefa.interface";
import { useTarefaStore } from "./tarefa.store";
import { mockColaboradores } from "@/utils/mock-data";

interface ComentarioTarefaState {
  comentarios: ComentarioTarefa[];
  isLoading: boolean;
}

interface ComentarioTarefaActions {
  getByTarefa: (tarefaId: string) => ComentarioTarefa[];
  create: (tarefaId: string, autorId: string, data: ComentarioTarefaFormData) => ComentarioTarefa;
  update: (id: string, conteudo: string) => ComentarioTarefa | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type ComentarioTarefaStore = ComentarioTarefaState & ComentarioTarefaActions;

// Cria mock de comentários para as tarefas existentes
const createMockComentarios = (): ComentarioTarefa[] => {
  const comentarios: ComentarioTarefa[] = [];
  const now = new Date();

  // Pega algumas tarefas do store para criar comentários
  const tarefas = useTarefaStore.getState().getAll();

  // Comentários de exemplo
  const comentariosTexto = [
    "Iniciando a análise dos requisitos técnicos.",
    "Encontrei um problema com a integração, vou investigar mais.",
    "Implementação concluída, aguardando revisão de código.",
    "Preciso de mais detalhes sobre o comportamento esperado.",
    "Feito ajuste conforme solicitado na última reunião.",
    "Testes unitários passando, seguindo para testes de integração.",
    "Documentação atualizada com as novas APIs.",
    "Refatoração concluída, código mais limpo agora.",
  ];

  // Cria comentários para algumas tarefas (não todas)
  tarefas.slice(0, 8).forEach((tarefa, index) => {
    // 1-3 comentários por tarefa
    const numComentarios = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numComentarios; i++) {
      const autorIndex = Math.floor(Math.random() * mockColaboradores.length);
      const diasAtras = Math.floor(Math.random() * 10);

      comentarios.push({
        id: uuidv4(),
        tarefaId: tarefa.id,
        autorId: mockColaboradores[autorIndex].id,
        conteudo: comentariosTexto[(index + i) % comentariosTexto.length],
        createdAt: new Date(now.getTime() - diasAtras * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - diasAtras * 24 * 60 * 60 * 1000),
      });
    }
  });

  return comentarios;
};

export const useComentarioTarefaStore = create<ComentarioTarefaStore>((set, get) => ({
  comentarios: createMockComentarios(),
  isLoading: false,

  getByTarefa: (tarefaId: string) =>
    get()
      .comentarios.filter((c) => c.tarefaId === tarefaId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),

  create: (tarefaId: string, autorId: string, data: ComentarioTarefaFormData) => {
    const novoComentario: ComentarioTarefa = {
      id: uuidv4(),
      tarefaId,
      autorId,
      conteudo: data.conteudo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      comentarios: [...state.comentarios, novoComentario],
    }));

    return novoComentario;
  },

  update: (id: string, conteudo: string) => {
    let updated: ComentarioTarefa | undefined;

    set((state) => ({
      comentarios: state.comentarios.map((c) => {
        if (c.id === id) {
          updated = { ...c, conteudo, updatedAt: new Date() };
          return updated;
        }
        return c;
      }),
    }));

    return updated;
  },

  remove: (id: string) => {
    const exists = get().comentarios.some((c) => c.id === id);
    if (exists) {
      set((state) => ({
        comentarios: state.comentarios.filter((c) => c.id !== id),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
