"use client";

import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/formatters";
import type { SaudeProjeto } from "@/interfaces/acompanhamento-projeto.interface";
import {
  STATUS_SAUDE_LABELS,
  STATUS_SAUDE_COLORS,
  STATUS_SAUDE_BG_COLORS,
} from "@/interfaces/acompanhamento-projeto.interface";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Target,
} from "lucide-react";

interface SaudeCronogramaProps {
  saude: SaudeProjeto;
  className?: string;
}

export const SaudeCronograma = ({ saude, className }: SaudeCronogramaProps) => {
  const StatusIcon = saude.status === "critico" 
    ? AlertTriangle 
    : saude.status === "atencao" 
    ? Clock 
    : CheckCircle;

  const tendenciaPositiva = saude.tendenciaAtraso <= 0;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Saúde do Cronograma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status geral */}
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-lg border",
            STATUS_SAUDE_BG_COLORS[saude.status]
          )}
        >
          <div className="flex items-center gap-3">
            <StatusIcon className={cn("h-6 w-6", STATUS_SAUDE_COLORS[saude.status])} />
            <div>
              <p className={cn("font-semibold", STATUS_SAUDE_COLORS[saude.status])}>
                {STATUS_SAUDE_LABELS[saude.status]}
              </p>
              <p className="text-sm text-slate-400">Status atual do projeto</p>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progresso Geral</span>
            <span className="text-sm font-medium text-slate-100">
              {saude.percentualConcluido}%
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                saude.status === "critico"
                  ? "bg-red-500"
                  : saude.status === "atencao"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
              style={{ width: `${saude.percentualConcluido}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Dias restantes */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">Dias Restantes</span>
            </div>
            <p className="text-xl font-semibold text-slate-100">
              {saude.diasRestantes}
              <span className="text-sm text-slate-500 font-normal ml-1">
                / {saude.diasTotais}
              </span>
            </p>
          </div>

          {/* Tendência */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              {tendenciaPositiva ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className="text-xs text-slate-400">Tendência</span>
            </div>
            <p
              className={cn(
                "text-xl font-semibold",
                tendenciaPositiva ? "text-green-400" : "text-red-400"
              )}
            >
              {tendenciaPositiva ? "-" : "+"}
              {Math.abs(saude.tendenciaAtraso)} dias
            </p>
          </div>
        </div>

        {/* Previsão de conclusão */}
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Previsão de Conclusão</span>
              <p className="text-lg font-medium text-slate-100">
                {formatDate(saude.previsaoConclusao)}
              </p>
            </div>
            {saude.tendenciaAtraso > 0 && (
              <div className="text-right">
                <span className="text-xs text-red-400">
                  Atraso previsto
                </span>
                <p className="text-sm text-red-400">
                  {saude.tendenciaAtraso} dias além do prazo
                </p>
              </div>
            )}
            {saude.tendenciaAtraso < 0 && (
              <div className="text-right">
                <span className="text-xs text-green-400">
                  Adiantado
                </span>
                <p className="text-sm text-green-400">
                  {Math.abs(saude.tendenciaAtraso)} dias de folga
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Velocidade */}
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <span className="text-xs text-slate-400 block mb-2">
            Velocidade de Entrega (tarefas/semana)
          </span>
          <div className="flex items-end gap-4">
            <div>
              <span className="text-xs text-slate-500">Atual</span>
              <p className="text-lg font-medium text-cyan-400">
                {saude.velocidadeAtual.toFixed(1)}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Necessária</span>
              <p className="text-lg font-medium text-slate-300">
                {saude.velocidadeNecessaria.toFixed(1)}
              </p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    saude.velocidadeAtual >= saude.velocidadeNecessaria
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  )}
                  style={{
                    width: `${Math.min(
                      (saude.velocidadeAtual / saude.velocidadeNecessaria) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
