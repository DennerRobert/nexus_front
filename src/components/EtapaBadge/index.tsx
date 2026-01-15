"use client";

import { cn } from "@/utils/cn";
import type { EtapaDemanda } from "@/interfaces/etapa-demanda.interface";
import {
  ETAPA_DEMANDA_LABELS,
  ETAPA_DEMANDA_COLORS,
} from "@/interfaces/etapa-demanda.interface";

interface EtapaBadgeProps {
  etapa: EtapaDemanda;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const EtapaBadge = ({
  etapa,
  size = "md",
  showLabel = true,
  className,
}: EtapaBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        ETAPA_DEMANDA_COLORS[etapa],
        sizeClasses[size],
        className
      )}
    >
      {showLabel ? ETAPA_DEMANDA_LABELS[etapa] : null}
    </span>
  );
};

// Componente para exibir o fluxo de etapas
interface FluxoEtapasProps {
  etapaAtual: EtapaDemanda;
  className?: string;
}

export const FluxoEtapas = ({ etapaAtual, className }: FluxoEtapasProps) => {
  const etapasOrdenadas: EtapaDemanda[] = [
    "ideia_recebida",
    "analise_inicial",
    "analise_comite",
    "validacao_problema",
    "encaminhado_grupo_trabalho",
    "concluido",
  ];

  const getEtapaIndex = (etapa: EtapaDemanda) => {
    const index = etapasOrdenadas.indexOf(etapa);
    if (index >= 0) return index;
    // Etapas especiais
    if (etapa === "devolucao_proponente" || etapa === "readequacao_recebida")
      return 2.5;
    if (etapa === "arquivado") return -1;
    if (etapa === "fora_time_estrategico") return -2;
    return 0;
  };

  const etapaAtualIndex = getEtapaIndex(etapaAtual);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {etapasOrdenadas.map((etapa, index) => {
        const isAtual = etapa === etapaAtual;
        const isPassed = index < etapaAtualIndex;
        const isSpecialStatus =
          etapaAtual === "arquivado" || etapaAtual === "fora_time_estrategico";

        return (
          <div key={etapa} className="flex items-center">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isAtual && "w-3 h-3",
                isAtual && ETAPA_DEMANDA_COLORS[etapa].split(" ")[0],
                isPassed && !isSpecialStatus && "bg-green-500",
                !isAtual && !isPassed && "bg-slate-600"
              )}
              title={ETAPA_DEMANDA_LABELS[etapa]}
            />
            {index < etapasOrdenadas.length - 1 && (
              <div
                className={cn(
                  "w-4 h-0.5",
                  isPassed && !isSpecialStatus ? "bg-green-500" : "bg-slate-600"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
