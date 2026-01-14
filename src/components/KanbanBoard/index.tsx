"use client";

import { useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/utils/cn";
import type { Tarefa, StatusTarefa } from "@/interfaces/tarefa.interface";
import {
  STATUS_TAREFA_LABELS,
  STATUS_TAREFA_ORDEM,
} from "@/interfaces/tarefa.interface";
import { KanbanCard } from "@/components/KanbanCard";
import { useTarefaStore } from "@/stores/tarefa.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { Plus } from "lucide-react";

interface KanbanBoardProps {
  projetoId: string;
  tarefas: Tarefa[];
  onAddTarefa?: (status: StatusTarefa) => void;
  onEditTarefa?: (tarefa: Tarefa) => void;
}

const columnColors: Record<StatusTarefa, string> = {
  backlog: "border-t-slate-500",
  a_fazer: "border-t-blue-500",
  em_progresso: "border-t-cyan-500",
  em_revisao: "border-t-purple-500",
  concluido: "border-t-green-500",
};

export const KanbanBoard = ({
  projetoId,
  tarefas,
  onAddTarefa,
  onEditTarefa,
}: KanbanBoardProps) => {
  const { moverTarefa, reordenar } = useTarefaStore();
  const { getById: getColaborador } = useColaboradorStore();

  const getTarefasPorStatus = useCallback(
    (status: StatusTarefa) => {
      return tarefas
        .filter((t) => t.status === status)
        .sort((a, b) => a.ordem - b.ordem);
    },
    [tarefas]
  );

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não há destino ou é o mesmo lugar, não faz nada
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const novoStatus = destination.droppableId as StatusTarefa;
    const tarefasDestino = getTarefasPorStatus(novoStatus);

    // Se moveu para outra coluna
    if (source.droppableId !== destination.droppableId) {
      moverTarefa(draggableId, novoStatus, destination.index);
    } else {
      // Reordenar dentro da mesma coluna
      const novaOrdem = tarefasDestino.map((t) => t.id);
      novaOrdem.splice(source.index, 1);
      novaOrdem.splice(destination.index, 0, draggableId);
      reordenar(projetoId, novoStatus, novaOrdem);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_TAREFA_ORDEM.map((status) => {
          const tarefasColuna = getTarefasPorStatus(status);

          return (
            <div
              key={status}
              className={cn(
                "flex-shrink-0 w-72 rounded-lg bg-slate-800/30 border border-slate-700/50 border-t-2",
                columnColors[status]
              )}
            >
              {/* Header da coluna */}
              <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-200 text-sm">
                    {STATUS_TAREFA_LABELS[status]}
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                    {tarefasColuna.length}
                  </span>
                </div>
              </div>

              {/* Área de drop */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "p-2 min-h-[200px] space-y-2",
                      snapshot.isDraggingOver && "bg-slate-700/20"
                    )}
                  >
                    {tarefasColuna.map((tarefa, index) => {
                      const colaborador = tarefa.responsavelId
                        ? getColaborador(tarefa.responsavelId)
                        : undefined;

                      return (
                        <Draggable
                          key={tarefa.id}
                          draggableId={tarefa.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <KanbanCard
                                tarefa={tarefa}
                                colaboradorNome={colaborador?.nome}
                                onClick={() => onEditTarefa?.(tarefa)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Botão de adicionar tarefa */}
              {onAddTarefa && (
                <div className="p-2 border-t border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => onAddTarefa(status)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-3 py-2 rounded",
                      "text-sm text-slate-400 hover:text-slate-200",
                      "hover:bg-slate-700/50 transition-all"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
