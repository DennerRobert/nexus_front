"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PlanoTrabalho, FaseProjeto } from "@/interfaces/planejamento.interface";
import { formatDate } from "@/utils/formatters";
import {
  Calendar,
  Clock,
  Target,
  Users,
  ChevronRight,
  Milestone,
  BarChart3,
} from "lucide-react";

interface PlanoTrabalhoViewProps {
  plano: PlanoTrabalho;
}

const statusFaseConfig: Record<FaseProjeto["status"], { label: string; variant: "success" | "warning" | "secondary" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_andamento: { label: "Em Andamento", variant: "warning" },
  concluida: { label: "Concluída", variant: "success" },
};

export const PlanoTrabalhoView = ({ plano }: PlanoTrabalhoViewProps) => {
  const totalHoras = plano.estimativaTotal.totalHoras;

  const fasesOrdenadas = useMemo(() => {
    return [...plano.fases].sort((a, b) => a.ordem - b.ordem);
  }, [plano.fases]);

  return (
    <div className="space-y-6">
      {/* Resumo do Cronograma */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Cronograma Macro</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Data de Início</p>
            <p className="text-lg font-semibold text-slate-100">
              {formatDate(plano.cronogramaMacro.dataInicioPrevista)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Data de Término</p>
            <p className="text-lg font-semibold text-slate-100">
              {formatDate(plano.cronogramaMacro.dataFimPrevista)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-sm text-slate-400">Duração Total</p>
            <p className="text-lg font-semibold text-slate-100">
              {plano.cronogramaMacro.duracaoSemanas} semanas
            </p>
          </div>
        </div>

        {/* Timeline Visual */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300 mb-3">Distribuição por Fase</p>
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            {plano.cronogramaMacro.fases.map((fase, index) => {
              const colors = [
                "bg-cyan-500",
                "bg-violet-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-rose-500",
                "bg-blue-500",
              ];
              return (
                <div
                  key={fase.faseId}
                  className={`${colors[index % colors.length]} flex items-center justify-center text-xs font-medium text-white`}
                  style={{ width: `${fase.percentualDuracao}%` }}
                  title={`${fase.nome}: ${fase.percentualDuracao}%`}
                >
                  {fase.percentualDuracao >= 10 && `${fase.percentualDuracao}%`}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {plano.cronogramaMacro.fases.map((fase, index) => {
              const colors = [
                "bg-cyan-500",
                "bg-violet-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-rose-500",
                "bg-blue-500",
              ];
              return (
                <div key={fase.faseId} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className={`h-2.5 w-2.5 rounded-sm ${colors[index % colors.length]}`} />
                  <span>{fase.nome}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Fases do Projeto */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Fases do Projeto</h3>
        </div>

        <div className="space-y-4">
          {fasesOrdenadas.map((fase, index) => (
            <div
              key={fase.id}
              className="relative rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
            >
              {index < fasesOrdenadas.length - 1 && (
                <div className="absolute -bottom-4 left-8 h-4 w-px bg-slate-700" />
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-semibold text-sm">
                    {fase.ordem}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-100">{fase.nome}</h4>
                      <Badge variant={statusFaseConfig[fase.status].variant}>
                        {statusFaseConfig[fase.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{fase.descricao}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(fase.dataInicio)} - {formatDate(fase.dataFim)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>{fase.horasEstimadas}h estimadas</span>
                      </div>
                    </div>

                    {fase.dependencias.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                        <ChevronRight className="h-3 w-3" />
                        <span>
                          Depende de: {fase.dependencias
                            .map((depId) => fasesOrdenadas.find((f) => f.id === depId)?.nome)
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Marcos */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Milestone className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Marcos (Milestones)</h3>
        </div>

        <div className="space-y-3">
          {plano.marcos.map((marco) => {
            const fase = plano.fases.find((f) => f.id === marco.faseId);
            return (
              <div
                key={marco.id}
                className="flex items-start gap-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/20">
                  <Milestone className="h-5 w-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-100">{marco.titulo}</h4>
                    {fase && (
                      <Badge variant="secondary" className="text-xs">
                        {fase.nome}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{marco.descricao}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(marco.dataPrevista)}</span>
                    </div>
                  </div>
                  {marco.entregaveis.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-500 mb-1.5">Entregáveis:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {marco.entregaveis.map((entregavel, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
                          >
                            {entregavel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Estimativa de Esforço */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Estimativa de Esforço</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Por Especialidade */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Por Especialidade</p>
            <div className="space-y-2">
              {plano.estimativaTotal.porEspecialidade.map((item) => {
                const percentual = Math.round((item.horas / totalHoras) * 100);
                return (
                  <div key={item.especialidade}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">{item.especialidade}</span>
                      <span className="text-slate-300">{item.horas}h ({percentual}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full bg-cyan-500 transition-all"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totalizadores */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-3">Resumo</p>
            <div className="rounded-lg bg-slate-800/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total de Horas</span>
                <span className="text-xl font-bold text-cyan-400">{totalHoras}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Fases</span>
                <span className="text-lg font-semibold text-slate-100">{plano.fases.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Marcos</span>
                <span className="text-lg font-semibold text-slate-100">{plano.marcos.length}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
