"use client";

import { cn } from "@/utils/cn";
import type { StatusPlanejamento } from "@/interfaces/planejamento.interface";
import { STATUS_PLANEJAMENTO_LABELS } from "@/interfaces/planejamento.interface";
import { FileEdit, Clock, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: StatusPlanejamento;
  className?: string;
}

const statusConfig: Record<
  StatusPlanejamento,
  { icon: typeof FileEdit; bgColor: string; textColor: string; borderColor: string }
> = {
  rascunho: {
    icon: FileEdit,
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-400",
    borderColor: "border-slate-500/30",
  },
  em_revisao: {
    icon: Clock,
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
  },
  aprovado: {
    icon: CheckCircle2,
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {STATUS_PLANEJAMENTO_LABELS[status]}
    </span>
  );
};
