"use client";

import Link from "next/link";
import { Trash2, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/formatters";
import { getNotificacaoConfig } from "@/utils/notificacao";
import type { Notificacao } from "@/interfaces/notificacao.interface";

interface NotificacaoItemProps {
  notificacao: Notificacao;
  compact?: boolean;
  onMarcarLida?: (id: string) => void;
  onRemover?: (id: string) => void;
}

export const NotificacaoItem = ({
  notificacao,
  compact = false,
  onMarcarLida,
  onRemover,
}: NotificacaoItemProps) => {
  const config = getNotificacaoConfig(notificacao.tipo);
  const Icon = config.icon;

  const handleMarcarLida = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarcarLida?.(notificacao.id);
  };

  const handleRemover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemover?.(notificacao.id);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    action: (ev: React.MouseEvent) => void
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action(e as unknown as React.MouseEvent);
    }
  };

  const content = (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border px-4 py-3 transition-all duration-200",
        notificacao.lida
          ? "border-slate-700/40 bg-transparent hover:bg-slate-800/40"
          : "border-slate-600/60 bg-slate-800/60 hover:bg-slate-800"
      )}
    >
      {/* Indicador não lida */}
      {!notificacao.lida && (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" aria-label="Não lida" />
      )}
      {notificacao.lida && !compact && (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-transparent" aria-hidden />
      )}

      {/* Ícone */}
      <div
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
          config.bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", config.iconColor)} aria-hidden />
      </div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            notificacao.lida ? "text-slate-400" : "text-slate-100"
          )}
        >
          {notificacao.titulo}
        </p>
        <p
          className={cn(
            "mt-0.5 text-xs leading-relaxed",
            compact ? "line-clamp-2" : "line-clamp-3",
            notificacao.lida ? "text-slate-500" : "text-slate-400"
          )}
        >
          {notificacao.mensagem}
        </p>
        <p className="mt-1.5 text-[11px] text-slate-600">
          {formatRelativeDate(notificacao.createdAt)}
        </p>
      </div>

      {/* Ações */}
      {!compact && (
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!notificacao.lida && onMarcarLida && (
            <button
              onClick={handleMarcarLida}
              onKeyDown={(e) => handleKeyDown(e, handleMarcarLida)}
              tabIndex={0}
              aria-label="Marcar como lida"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-700 hover:text-cyan-400"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          {onRemover && (
            <button
              onClick={handleRemover}
              onKeyDown={(e) => handleKeyDown(e, handleRemover)}
              tabIndex={0}
              aria-label="Remover notificação"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (notificacao.link) {
    return (
      <Link
        href={notificacao.link}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
        aria-label={notificacao.titulo}
      >
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
};
