"use client";

import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/formatters";
import type { MarcoProjeto, IconeMarco } from "@/interfaces/marco-projeto.interface";
import { Badge } from "@/components/ui/Badge";
import {
  Inbox,
  CheckCircle,
  PlayCircle,
  Users,
  Flag,
  Package,
  Star,
  AlertTriangle,
  MessageCircle,
  Calendar,
} from "lucide-react";

interface TimelineProps {
  marcos: MarcoProjeto[];
  className?: string;
}

const iconeMap: Record<IconeMarco, ReactNode> = {
  inbox: <Inbox className="h-4 w-4" />,
  check_circle: <CheckCircle className="h-4 w-4" />,
  play_circle: <PlayCircle className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  flag: <Flag className="h-4 w-4" />,
  package: <Package className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  alert_triangle: <AlertTriangle className="h-4 w-4" />,
  message_circle: <MessageCircle className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
};

const iconeColorMap: Record<IconeMarco, string> = {
  inbox: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  check_circle: "bg-green-500/20 text-green-400 border-green-500/30",
  play_circle: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  users: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  flag: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  package: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  star: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  alert_triangle: "bg-red-500/20 text-red-400 border-red-500/30",
  message_circle: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  calendar: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export const Timeline = ({ marcos, className }: TimelineProps) => {
  if (marcos.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Nenhum marco registrado para este projeto.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Linha vertical */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700/50" />

      <div className="space-y-6">
        {marcos.map((marco, index) => (
          <div key={marco.id} className="relative flex gap-4">
            {/* Ícone do marco */}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                iconeColorMap[marco.icone]
              )}
            >
              {iconeMap[marco.icone]}
            </div>

            {/* Conteúdo do marco */}
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-slate-100">{marco.titulo}</h4>
                  {marco.descricao && (
                    <p className="mt-1 text-sm text-slate-400">{marco.descricao}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm text-slate-500">
                    {formatDate(marco.data)}
                  </span>
                  <Badge
                    variant={marco.tipo === "automatico" ? "secondary" : "primary"}
                    className="text-xs"
                  >
                    {marco.tipo === "automatico" ? "Auto" : "Manual"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para adicionar novo marco
interface AddMarcoButtonProps {
  onClick: () => void;
}

export const AddMarcoButton = ({ onClick }: AddMarcoButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg",
        "border border-dashed border-slate-600",
        "text-sm text-slate-400 hover:text-slate-200",
        "hover:border-slate-500 hover:bg-slate-800/50",
        "transition-all"
      )}
    >
      <Flag className="h-4 w-4" />
      Adicionar Marco
    </button>
  );
};
