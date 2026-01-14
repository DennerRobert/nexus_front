"use client";

import { cn } from "@/utils/cn";
import type { Tarefa } from "@/interfaces/tarefa.interface";
import {
  PRIORIDADE_TAREFA_LABELS,
  PRIORIDADE_TAREFA_COLORS,
} from "@/interfaces/tarefa.interface";
import { Badge } from "@/components/ui/Badge";
import { Clock, User, Calendar } from "lucide-react";
import { formatDate } from "@/utils/formatters";

interface KanbanCardProps {
  tarefa: Tarefa;
  colaboradorNome?: string;
  onClick?: () => void;
  isDragging?: boolean;
}

export const KanbanCard = ({
  tarefa,
  colaboradorNome,
  onClick,
  isDragging,
}: KanbanCardProps) => {
  const isAtrasada =
    tarefa.dataLimite && new Date(tarefa.dataLimite) < new Date() && tarefa.status !== "concluido";

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border border-slate-700/50 bg-slate-800/50 p-3",
        "hover:border-slate-600 hover:bg-slate-800",
        "cursor-pointer transition-all",
        isDragging && "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20",
        isAtrasada && "border-red-500/50"
      )}
    >
      {/* Tags e Prioridade */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-1">
          {tarefa.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <div
          className={cn(
            "w-2 h-2 rounded-full shrink-0",
            PRIORIDADE_TAREFA_COLORS[tarefa.prioridade]
          )}
          title={PRIORIDADE_TAREFA_LABELS[tarefa.prioridade]}
        />
      </div>

      {/* Título */}
      <h4 className="font-medium text-slate-100 text-sm mb-2 line-clamp-2">
        {tarefa.titulo}
      </h4>

      {/* Descrição (truncada) */}
      {tarefa.descricao && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
          {tarefa.descricao}
        </p>
      )}

      {/* Footer com metadados */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Horas */}
          {(tarefa.estimativaHoras || tarefa.horasRealizadas) && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {tarefa.horasRealizadas || 0}/{tarefa.estimativaHoras || "?"}h
              </span>
            </div>
          )}

          {/* Responsável */}
          {colaboradorNome && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{colaboradorNome}</span>
            </div>
          )}
        </div>

        {/* Data limite */}
        {tarefa.dataLimite && (
          <div
            className={cn(
              "flex items-center gap-1",
              isAtrasada && "text-red-400"
            )}
          >
            <Calendar className="h-3 w-3" />
            <span>{formatDate(tarefa.dataLimite)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
