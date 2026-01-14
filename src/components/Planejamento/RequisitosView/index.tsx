"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type {
  RequisitosSistema,
  PrioridadeRequisito,
} from "@/interfaces/planejamento.interface";
import {
  PRIORIDADE_REQUISITO_LABELS,
  CATEGORIA_RNF_LABELS,
} from "@/interfaces/planejamento.interface";
import {
  FileCode,
  Shield,
  User,
  GitBranch,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface RequisitosViewProps {
  requisitos: RequisitosSistema;
}

const prioridadeVariantMap: Record<PrioridadeRequisito, BadgeVariant> = {
  essencial: "danger",
  importante: "warning",
  desejavel: "info",
};

interface ExpandableCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const ExpandableCard = ({ title, icon, count, children, defaultExpanded = true }: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-400">{count} itens</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-slate-700/50 p-4">{children}</div>
      )}
    </Card>
  );
};

export const RequisitosView = ({ requisitos }: RequisitosViewProps) => {
  return (
    <div className="space-y-4">
      {/* Requisitos Funcionais */}
      <ExpandableCard
        title="Requisitos Funcionais"
        icon={<FileCode className="h-5 w-5 text-cyan-400" />}
        count={requisitos.funcionais.length}
      >
        <div className="space-y-3">
          {requisitos.funcionais.map((rf) => (
            <div
              key={rf.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-cyan-400">{rf.codigo}</span>
                    <Badge variant={prioridadeVariantMap[rf.prioridade]}>
                      {PRIORIDADE_REQUISITO_LABELS[rf.prioridade]}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-slate-100">{rf.titulo}</h4>
                  <p className="text-sm text-slate-400 mt-1">{rf.descricao}</p>
                  
                  {rf.criteriosAceitacao.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-500 mb-2">Critérios de Aceitação:</p>
                      <ul className="space-y-1">
                        {rf.criteriosAceitacao.map((criterio, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {criterio}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ExpandableCard>

      {/* Requisitos Não-Funcionais */}
      <ExpandableCard
        title="Requisitos Não-Funcionais"
        icon={<Shield className="h-5 w-5 text-cyan-400" />}
        count={requisitos.naoFuncionais.length}
      >
        <div className="space-y-3">
          {requisitos.naoFuncionais.map((rnf) => (
            <div
              key={rnf.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-violet-400">{rnf.codigo}</span>
                    <Badge variant="secondary">
                      {CATEGORIA_RNF_LABELS[rnf.categoria]}
                    </Badge>
                    <Badge variant={prioridadeVariantMap[rnf.prioridade]}>
                      {PRIORIDADE_REQUISITO_LABELS[rnf.prioridade]}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-slate-100">{rnf.titulo}</h4>
                  <p className="text-sm text-slate-400 mt-1">{rnf.descricao}</p>
                  {rnf.metrica && (
                    <div className="mt-2 rounded-md bg-slate-700/30 px-3 py-1.5 text-sm">
                      <span className="text-slate-500">Métrica: </span>
                      <span className="text-emerald-400">{rnf.metrica}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ExpandableCard>

      {/* User Stories */}
      <ExpandableCard
        title="User Stories"
        icon={<User className="h-5 w-5 text-cyan-400" />}
        count={requisitos.userStories.length}
      >
        <div className="space-y-3">
          {requisitos.userStories.map((us) => (
            <div
              key={us.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-amber-400">{us.codigo}</span>
                <Badge variant={prioridadeVariantMap[us.prioridade]}>
                  {PRIORIDADE_REQUISITO_LABELS[us.prioridade]}
                </Badge>
              </div>
              <div className="rounded-lg bg-slate-900/50 p-3 text-sm">
                <p className="text-slate-100">
                  <span className="text-slate-500">Como </span>
                  <span className="font-medium text-cyan-400">{us.persona}</span>
                  <span className="text-slate-500">, quero </span>
                  <span className="font-medium text-slate-100">{us.acao}</span>
                  <span className="text-slate-500">, para </span>
                  <span className="font-medium text-emerald-400">{us.beneficio}</span>
                </p>
              </div>
              {us.criteriosAceitacao.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">Critérios de Aceitação:</p>
                  <ul className="space-y-1">
                    {us.criteriosAceitacao.map((criterio, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {criterio}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </ExpandableCard>

      {/* Casos de Uso */}
      <ExpandableCard
        title="Casos de Uso"
        icon={<GitBranch className="h-5 w-5 text-cyan-400" />}
        count={requisitos.casosUso.length}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          {requisitos.casosUso.map((uc) => (
            <div
              key={uc.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-rose-400">{uc.codigo}</span>
                <h4 className="font-semibold text-slate-100">{uc.titulo}</h4>
              </div>
              
              <div className="text-sm text-slate-400 mb-3">
                <span className="text-slate-500">Ator Principal: </span>
                <span className="text-slate-200">{uc.atorPrincipal}</span>
              </div>

              {/* Pré-condições */}
              {uc.preCondicoes.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">Pré-condições:</p>
                  <ul className="list-disc list-inside text-sm text-slate-400">
                    {uc.preCondicoes.map((pre, idx) => (
                      <li key={idx}>{pre}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fluxo Principal */}
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Fluxo Principal:</p>
                <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
                  {uc.fluxoPrincipal.map((passo, idx) => (
                    <li key={idx}>{passo}</li>
                  ))}
                </ol>
              </div>

              {/* Fluxos Alternativos */}
              {uc.fluxosAlternativos.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">Fluxos Alternativos:</p>
                  {uc.fluxosAlternativos.map((alt) => (
                    <div key={alt.id} className="mt-2 pl-3 border-l-2 border-amber-500/30">
                      <p className="text-sm text-amber-400 font-medium">{alt.condicao}</p>
                      <ol className="list-decimal list-inside text-sm text-slate-400 mt-1">
                        {alt.passos.map((passo, idx) => (
                          <li key={idx}>{passo}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}

              {/* Pós-condições */}
              {uc.posCondicoes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Pós-condições:</p>
                  <ul className="list-disc list-inside text-sm text-slate-400">
                    {uc.posCondicoes.map((pos, idx) => (
                      <li key={idx}>{pos}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </ExpandableCard>

      {/* Regras de Negócio */}
      <ExpandableCard
        title="Regras de Negócio"
        icon={<BookOpen className="h-5 w-5 text-cyan-400" />}
        count={requisitos.regrasNegocio.length}
        defaultExpanded={false}
      >
        <div className="space-y-2">
          {requisitos.regrasNegocio.map((rn) => (
            <div
              key={rn.id}
              className="flex items-start gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
            >
              <span className="font-mono text-sm text-emerald-400 flex-shrink-0">{rn.codigo}</span>
              <div>
                <h4 className="font-medium text-slate-100">{rn.titulo}</h4>
                <p className="text-sm text-slate-400">{rn.descricao}</p>
                <span className="text-xs text-slate-500">Módulo: {rn.modulo}</span>
              </div>
            </div>
          ))}
        </div>
      </ExpandableCard>
    </div>
  );
};
