"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import type {
  ArquiteturaTecnica,
  SeveridadeRisco,
  TecnologiaStack,
} from "@/interfaces/planejamento.interface";
import { SEVERIDADE_RISCO_LABELS } from "@/interfaces/planejamento.interface";
import {
  Layers,
  Server,
  Database,
  Cloud,
  Link2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Box,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface ArquiteturaViewProps {
  arquitetura: ArquiteturaTecnica;
}

const severidadeVariantMap: Record<SeveridadeRisco, BadgeVariant> = {
  baixa: "success",
  media: "warning",
  alta: "danger",
  critica: "danger",
};

const categoriaIconMap: Record<TecnologiaStack["categoria"], React.ReactNode> = {
  linguagem: <span className="text-cyan-400">💻</span>,
  framework: <span className="text-violet-400">🛠️</span>,
  biblioteca: <span className="text-emerald-400">📚</span>,
  ferramenta: <span className="text-amber-400">🔧</span>,
  infra: <span className="text-rose-400">☁️</span>,
};

interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const ExpandableSection = ({
  title,
  icon,
  children,
  defaultExpanded = true,
}: ExpandableSectionProps) => {
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
          <h3 className="font-semibold text-slate-100">{title}</h3>
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

const TechCard = ({ tech }: { tech: TecnologiaStack }) => (
  <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
    <div className="flex items-center gap-2 mb-1">
      {categoriaIconMap[tech.categoria]}
      <span className="font-medium text-slate-100">{tech.nome}</span>
      {tech.versao && (
        <span className="text-xs text-slate-500">v{tech.versao}</span>
      )}
    </div>
    <p className="text-sm text-slate-400">{tech.justificativa}</p>
  </div>
);

export const ArquiteturaView = ({ arquitetura }: ArquiteturaViewProps) => {
  const { stackSugerida } = arquitetura;

  return (
    <div className="space-y-4">
      {/* Stack Tecnológica */}
      <ExpandableSection
        title="Stack Tecnológica"
        icon={<Layers className="h-5 w-5 text-cyan-400" />}
      >
        <div className="space-y-6">
          {/* Frontend */}
          {stackSugerida.frontend.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <h4 className="font-medium text-slate-200">Frontend</h4>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {stackSugerida.frontend.map((tech, idx) => (
                  <TechCard key={idx} tech={tech} />
                ))}
              </div>
            </div>
          )}

          {/* Backend */}
          {stackSugerida.backend.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <h4 className="font-medium text-slate-200">Backend</h4>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {stackSugerida.backend.map((tech, idx) => (
                  <TechCard key={idx} tech={tech} />
                ))}
              </div>
            </div>
          )}

          {/* Banco de Dados */}
          {stackSugerida.banco.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <h4 className="font-medium text-slate-200">Banco de Dados</h4>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {stackSugerida.banco.map((tech, idx) => (
                  <TechCard key={idx} tech={tech} />
                ))}
              </div>
            </div>
          )}

          {/* Infraestrutura */}
          {stackSugerida.infra.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <h4 className="font-medium text-slate-200">Infraestrutura</h4>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {stackSugerida.infra.map((tech, idx) => (
                  <TechCard key={idx} tech={tech} />
                ))}
              </div>
            </div>
          )}

          {/* Outros */}
          {stackSugerida.outros.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <h4 className="font-medium text-slate-200">Ferramentas</h4>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {stackSugerida.outros.map((tech, idx) => (
                  <TechCard key={idx} tech={tech} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Componentes */}
      <ExpandableSection
        title="Componentes da Arquitetura"
        icon={<Box className="h-5 w-5 text-cyan-400" />}
      >
        <div className="space-y-3">
          {arquitetura.componentes.map((comp) => (
            <div
              key={comp.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{comp.tipo}</Badge>
                <h4 className="font-semibold text-slate-100">{comp.nome}</h4>
              </div>
              <p className="text-sm text-slate-400 mb-3">{comp.descricao}</p>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Responsabilidades:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.responsabilidades.map((resp, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
                      >
                        {resp}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Tecnologias:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.tecnologias.map((tech, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-xs text-cyan-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* Integrações */}
      <ExpandableSection
        title="Integrações"
        icon={<Link2 className="h-5 w-5 text-cyan-400" />}
        defaultExpanded={false}
      >
        <div className="space-y-3">
          {arquitetura.integracoes.map((integ) => (
            <div
              key={integ.id}
              className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info">{integ.tipo.replace(/_/g, " ")}</Badge>
                <h4 className="font-semibold text-slate-100">{integ.nome}</h4>
              </div>
              <p className="text-sm text-slate-400 mb-2">{integ.descricao}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Autenticação: </span>
                  <span className="text-slate-300">{integ.autenticacao}</span>
                </div>
              </div>
              
              {integ.observacoes && (
                <p className="text-xs text-slate-500 mt-2 italic">{integ.observacoes}</p>
              )}
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* Riscos Técnicos */}
      <ExpandableSection
        title="Riscos Técnicos"
        icon={<AlertTriangle className="h-5 w-5 text-cyan-400" />}
      >
        <div className="space-y-3">
          {arquitetura.riscos.map((risco) => (
            <div
              key={risco.id}
              className={cn(
                "rounded-lg border p-4",
                risco.severidade === "critica"
                  ? "border-red-500/50 bg-red-500/5"
                  : risco.severidade === "alta"
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "border-slate-700/50 bg-slate-800/30"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={severidadeVariantMap[risco.severidade]}>
                  {SEVERIDADE_RISCO_LABELS[risco.severidade]}
                </Badge>
                <h4 className="font-semibold text-slate-100">{risco.titulo}</h4>
              </div>
              <p className="text-sm text-slate-400 mb-3">{risco.descricao}</p>

              <div className="grid gap-3 md:grid-cols-2 text-sm">
                <div className="rounded-md bg-slate-900/50 p-2">
                  <span className="text-slate-500">Probabilidade: </span>
                  <span className="text-slate-200 capitalize">{risco.probabilidade}</span>
                </div>
                <div className="rounded-md bg-slate-900/50 p-2">
                  <span className="text-slate-500">Impacto: </span>
                  <span className="text-slate-200">{risco.impacto}</span>
                </div>
              </div>

              <div className="mt-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 p-3">
                <p className="text-xs font-medium text-emerald-400 mb-1">Mitigação:</p>
                <p className="text-sm text-slate-300">{risco.mitigacao}</p>
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* Premissas e Restrições */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100">Premissas</h3>
          </div>
          <ul className="space-y-2">
            {arquitetura.premissas.map((premissa, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="text-cyan-400 mt-1">•</span>
                {premissa}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100">Restrições</h3>
          </div>
          <ul className="space-y-2">
            {arquitetura.restricoes.map((restricao, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="text-amber-400 mt-1">•</span>
                {restricao}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
