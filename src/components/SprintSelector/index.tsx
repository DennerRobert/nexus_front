"use client";

import { cn } from "@/utils/cn";
import type { Sprint } from "@/interfaces/sprint.interface";
import { STATUS_SPRINT_LABELS, STATUS_SPRINT_COLORS } from "@/interfaces/sprint.interface";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, Target, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SprintSelectorProps {
  sprints: Sprint[];
  selectedSprintId: string | null; // null = todas as tarefas (incluindo backlog)
  onSelect: (sprintId: string | null) => void;
  onCreateSprint?: () => void;
}

export const SprintSelector = ({
  sprints,
  selectedSprintId,
  onSelect,
  onCreateSprint,
}: SprintSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sprintAtiva = sprints.find((s) => s.status === "ativa");
  const sprintsOrdenadas = [...sprints].sort((a, b) => b.numero - a.numero);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-slate-800 border border-slate-700",
          "hover:bg-slate-700 hover:border-slate-600",
          "transition-all text-left min-w-[200px]"
        )}
      >
        <Target className="h-4 w-4 text-cyan-400" />
        <span className="flex-1 text-slate-200">
          {selectedSprintId === null
            ? "Todas as tarefas"
            : selectedSprintId === "backlog"
            ? "Backlog"
            : selectedSprint?.nome || "Selecione"}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 mt-1 w-72 z-50",
            "bg-slate-800 border border-slate-700 rounded-lg shadow-xl",
            "py-1 max-h-80 overflow-y-auto"
          )}
        >
          {/* Opção: Todas as tarefas */}
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setIsOpen(false);
            }}
            className={cn(
              "w-full px-4 py-2 text-left flex items-center gap-2",
              "hover:bg-slate-700 transition-colors",
              selectedSprintId === null && "bg-slate-700"
            )}
          >
            <span className="flex-1 text-slate-200">Todas as tarefas</span>
          </button>

          {/* Opção: Backlog */}
          <button
            type="button"
            onClick={() => {
              onSelect("backlog");
              setIsOpen(false);
            }}
            className={cn(
              "w-full px-4 py-2 text-left flex items-center gap-2",
              "hover:bg-slate-700 transition-colors",
              selectedSprintId === "backlog" && "bg-slate-700"
            )}
          >
            <span className="flex-1 text-slate-300">Backlog (sem sprint)</span>
          </button>

          <div className="border-t border-slate-700 my-1" />

          {/* Lista de sprints */}
          {sprintsOrdenadas.map((sprint) => (
            <button
              key={sprint.id}
              type="button"
              onClick={() => {
                onSelect(sprint.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2 text-left",
                "hover:bg-slate-700 transition-colors",
                selectedSprintId === sprint.id && "bg-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-200">{sprint.nome}</span>
                <Badge className={cn("text-xs", STATUS_SPRINT_COLORS[sprint.status])}>
                  {STATUS_SPRINT_LABELS[sprint.status]}
                </Badge>
              </div>
              {sprint.objetivo && (
                <p className="text-xs text-slate-500 mt-1 truncate">{sprint.objetivo}</p>
              )}
            </button>
          ))}

          {/* Botão criar nova sprint */}
          {onCreateSprint && (
            <>
              <div className="border-t border-slate-700 my-1" />
              <button
                type="button"
                onClick={() => {
                  onCreateSprint();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left flex items-center gap-2",
                  "hover:bg-slate-700 transition-colors text-cyan-400"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Criar nova sprint</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
