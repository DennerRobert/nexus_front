"use client";

import { cn } from "@/utils/cn";
import type { Sprint } from "@/interfaces/sprint.interface";
import { STATUS_SPRINT_LABELS, STATUS_SPRINT_COLORS } from "@/interfaces/sprint.interface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/formatters";
import { useSprintStore } from "@/stores/sprint.store";
import {
  Calendar,
  Target,
  CheckCircle2,
  Play,
  Square,
  Settings,
} from "lucide-react";

interface SprintHeaderProps {
  sprint: Sprint;
  onEdit?: () => void;
}

export const SprintHeader = ({ sprint, onEdit }: SprintHeaderProps) => {
  const { getProgresso, iniciarSprint, concluirSprint } = useSprintStore();
  const progresso = getProgresso(sprint.id);

  // Calcula dias restantes
  const hoje = new Date();
  const dataFim = new Date(sprint.dataFim);
  const diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  const handleIniciar = () => {
    iniciarSprint(sprint.id);
  };

  const handleConcluir = () => {
    if (window.confirm("Tem certeza que deseja concluir esta sprint? Tarefas não concluídas voltarão para o backlog.")) {
      concluirSprint(sprint.id);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Target className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100">{sprint.nome}</h3>
              <Badge className={STATUS_SPRINT_COLORS[sprint.status]}>
                {STATUS_SPRINT_LABELS[sprint.status]}
              </Badge>
            </div>
            {sprint.objetivo && (
              <p className="text-sm text-slate-400 mt-0.5">{sprint.objetivo}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sprint.status === "planejamento" && (
            <Button size="sm" onClick={handleIniciar}>
              <Play className="h-4 w-4 mr-1" />
              Iniciar Sprint
            </Button>
          )}
          {sprint.status === "ativa" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleConcluir}
              className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Concluir Sprint
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Informações e progresso */}
      <div className="grid grid-cols-4 gap-4">
        {/* Período */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-slate-400">
            {formatDate(sprint.dataInicio)} - {formatDate(sprint.dataFim)}
          </span>
        </div>

        {/* Dias restantes (apenas para sprint ativa) */}
        {sprint.status === "ativa" && (
          <div className="flex items-center gap-2 text-sm">
            <Square className="h-4 w-4 text-slate-500" />
            <span
              className={cn(
                diasRestantes <= 0
                  ? "text-red-400"
                  : diasRestantes <= 3
                  ? "text-orange-400"
                  : "text-slate-400"
              )}
            >
              {diasRestantes <= 0
                ? "Sprint encerrada"
                : `${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} restante${diasRestantes !== 1 ? "s" : ""}`}
            </span>
          </div>
        )}

        {/* Progresso */}
        <div className="col-span-2 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${progresso.percentual}%` }}
            />
          </div>
          <span className="text-sm text-slate-400 whitespace-nowrap">
            {progresso.concluidas}/{progresso.total} tarefas ({progresso.percentual}%)
          </span>
        </div>
      </div>
    </div>
  );
};
