"use client";

import { cn } from "@/utils/cn";
import type { NotificacaoFiltro } from "@/interfaces/notificacao.interface";
import { NOTIFICACAO_FILTRO_LABELS } from "@/interfaces/notificacao.interface";

const FILTROS: NotificacaoFiltro[] = [
  "todas",
  "nao_lidas",
  "demanda",
  "projeto",
  "tarefa",
  "sistema",
];

interface NotificacaoFiltrosProps {
  filtroAtivo: NotificacaoFiltro;
  contagemPorFiltro: Partial<Record<NotificacaoFiltro, number>>;
  onFiltroChange: (filtro: NotificacaoFiltro) => void;
}

export const NotificacaoFiltros = ({
  filtroAtivo,
  contagemPorFiltro,
  onFiltroChange,
}: NotificacaoFiltrosProps) => {
  return (
    <nav
      className="flex flex-wrap gap-1.5"
      aria-label="Filtros de notificações"
    >
      {FILTROS.map((filtro) => {
        const count = contagemPorFiltro[filtro] ?? 0;
        const isAtivo = filtroAtivo === filtro;

        return (
          <button
            key={filtro}
            onClick={() => onFiltroChange(filtro)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onFiltroChange(filtro);
              }
            }}
            tabIndex={0}
            aria-pressed={isAtivo}
            aria-label={`Filtrar por ${NOTIFICACAO_FILTRO_LABELS[filtro]}${count > 0 ? `, ${count} notificações` : ""}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
              isAtivo
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            {NOTIFICACAO_FILTRO_LABELS[filtro]}
            {count > 0 && (
              <span
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  isAtivo
                    ? "bg-cyan-500/30 text-cyan-300"
                    : "bg-slate-700 text-slate-400"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
