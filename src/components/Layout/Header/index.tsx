"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header = ({ title, subtitle, actions }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
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

        <div className="flex items-center gap-3">
          {actions}

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-9 w-64 rounded-lg border border-slate-700 bg-slate-800/50 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan-500" />
          </Button>

          <div className="ml-2 flex items-center gap-3 border-l border-slate-700 pl-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-slate-200">Usuário Demo</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
