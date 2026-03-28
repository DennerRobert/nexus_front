"use client";

import Link from "next/link";
import { Search, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { NotificacaoDropdown } from "@/components/Notificacoes/NotificacaoDropdown";
import { PERFIL_USUARIO_LABELS } from "@/interfaces/usuario.interface";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header = ({ title, subtitle, actions }: HeaderProps) => {
  const { usuario } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Título da página */}
        <div className="flex items-center gap-4">
          {title && (
            <div>
              <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-400">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Ações do header */}
        <div className="flex items-center gap-3">
          {actions}

          {/* Busca */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              placeholder="Buscar..."
              aria-label="Buscar no sistema"
              className="h-9 w-64 rounded-lg border border-slate-700 bg-slate-800/50 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Dropdown de notificações */}
          <NotificacaoDropdown />

          {/* Informações do usuário */}
          <div className="ml-2 flex items-center gap-3 border-l border-slate-700 pl-4">
            {usuario && (
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-slate-200 leading-tight">
                  {usuario.nome}
                </p>
                <p className="text-xs text-slate-500">
                  {PERFIL_USUARIO_LABELS[usuario.perfil]}
                </p>
              </div>
            )}
            <Link
              href="/perfil"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 transition-opacity hover:opacity-80"
              title="Meu Perfil"
              aria-label="Ir para meu perfil"
            >
              <User className="h-5 w-5 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
