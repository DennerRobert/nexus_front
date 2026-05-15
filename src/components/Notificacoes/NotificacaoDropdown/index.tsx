"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ArrowRight, CheckCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { useNotificacaoStore } from "@/stores/notificacao.store";
import { NotificacaoItem } from "../NotificacaoItem";

const MAX_PREVIEW = 5;

export const NotificacaoDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { getAll, countNaoLidas, marcarComoLida, marcarTodasComoLidas } =
    useNotificacaoStore();

  const notificacoes = getAll().slice(0, MAX_PREVIEW);
  const totalNaoLidas = countNaoLidas();
  const temNaoLidas = totalNaoLidas > 0;

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleMarcarTodasLidas = () => {
    marcarTodasComoLidas();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Botão do sino */}
      <button
        onClick={handleToggle}
        tabIndex={0}
        aria-label={`Notificações${temNaoLidas ? `, ${totalNaoLidas} não lidas` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
          isOpen
            ? "bg-slate-700 text-slate-100"
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        )}
      >
        <Bell className="h-5 w-5" />
        {temNaoLidas && (
          <span
            aria-hidden
            className={cn(
              "absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1",
              "bg-cyan-500 text-[10px] font-bold text-white"
            )}
          >
            {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
          </span>
        )}
      </button>

      {/* Painel dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notificações recentes"
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-96",
            "rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/40",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Notificações
              </h2>
              {temNaoLidas && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500/20 px-1.5 text-[10px] font-bold text-cyan-400">
                  {totalNaoLidas}
                </span>
              )}
            </div>
            {temNaoLidas && (
              <button
                onClick={handleMarcarTodasLidas}
                tabIndex={0}
                aria-label="Marcar todas como lidas"
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-400"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[420px] overflow-y-auto">
            {notificacoes.length > 0 ? (
              <div className="space-y-1 p-2">
                {notificacoes.map((notificacao) => (
                  <div key={notificacao.id} onClick={handleClose}>
                    <NotificacaoItem
                      notificacao={notificacao}
                      compact
                      onMarcarLida={marcarComoLida}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                  <Bell className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">Nenhuma notificação</p>
              </div>
            )}
          </div>

          {/* Rodapé */}
          {notificacoes.length > 0 && (
            <div className="border-t border-slate-700/50 p-2">
              <Link
                href="/notificacoes"
                onClick={handleClose}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
                aria-label="Ver todas as notificações"
              >
                Ver todas as notificações
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
