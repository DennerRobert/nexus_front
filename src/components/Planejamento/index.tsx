"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/Tabs";
import { StatusBadge } from "./StatusBadge";
import { PlanoTrabalhoView } from "./PlanoTrabalhoView";
import { RequisitosView } from "./RequisitosView";
import { ArquiteturaView } from "./ArquiteturaView";
import { ExportModal } from "./ExportModal";
import { usePlanejamentoStore } from "@/stores/planejamento.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import type { Projeto } from "@/interfaces/projeto.interface";
import type { Demanda } from "@/interfaces/demanda.interface";
import { formatDate } from "@/utils/formatters";
import {
  Sparkles,
  FileText,
  Code2,
  Layers,
  Download,
  RefreshCw,
  Send,
  CheckCircle2,
  History,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";

interface PlanejamentoProps {
  projeto: Projeto;
  demanda: Demanda | null;
}

export const Planejamento = ({ projeto, demanda }: PlanejamentoProps) => {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  const {
    getByProjeto,
    gerarPlanejamento,
    atualizarStatus,
    aprovar,
    regenerar,
    getHistoricoVersoes,
  } = usePlanejamentoStore();
  const { getById: getColaborador } = useColaboradorStore();

  const planejamento = getByProjeto(projeto.id);
  const historico = getHistoricoVersoes(projeto.id);

  // Mock do usuário atual (em produção viria do contexto de auth)
  const usuarioAtualId = "user-mock-id";

  const handleGerar = async () => {
    setIsGenerating(true);
    // Simular delay de geração
    await new Promise((resolve) => setTimeout(resolve, 2000));
    gerarPlanejamento(projeto.id, usuarioAtualId);
    setIsGenerating(false);
  };

  const handleRegenerar = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    regenerar(projeto.id, usuarioAtualId);
    setIsGenerating(false);
  };

  const handleEnviarParaRevisao = () => {
    if (planejamento) {
      atualizarStatus(planejamento.id, "em_revisao", usuarioAtualId);
    }
  };

  const handleAprovar = () => {
    if (planejamento) {
      aprovar(planejamento.id, usuarioAtualId);
    }
  };

  const subTabs = [
    { label: "Plano de Trabalho", icon: <FileText className="h-4 w-4" /> },
    { label: "Requisitos", icon: <Code2 className="h-4 w-4" /> },
    { label: "Arquitetura", icon: <Layers className="h-4 w-4" /> },
  ];

  // Se não houver demanda de origem, mostrar mensagem
  if (!demanda) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Demanda de origem não encontrada"
        description="Este projeto não possui uma demanda de origem vinculada. O planejamento só pode ser gerado para projetos criados a partir de uma demanda."
      />
    );
  }

  // Se não houver planejamento, mostrar estado vazio com botão de gerar
  if (!planejamento) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 mb-6">
          <Sparkles className="h-10 w-10 text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-100 mb-2">
          Gerar Planejamento
        </h3>
        <p className="text-slate-400 text-center max-w-md mb-6">
          Gere automaticamente o plano de trabalho, requisitos e arquitetura técnica
          baseados nos dados da demanda <span className="text-cyan-400">"{demanda.titulo}"</span>.
        </p>

        {/* Preview dos dados que serão usados */}
        <Card className="p-4 mb-6 max-w-lg w-full">
          <p className="text-xs font-medium text-slate-500 mb-3">
            Dados que serão utilizados:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-slate-500 flex-shrink-0">Problema:</span>
              <span className="text-slate-300 line-clamp-2">{demanda.problemaResolver}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-slate-500 flex-shrink-0">Solução:</span>
              <span className="text-slate-300 line-clamp-2">{demanda.ideiaSolucao}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-slate-500 flex-shrink-0">Horizonte:</span>
              <span className="text-slate-300">{demanda.horizonteInovacao}</span>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          onClick={handleGerar}
          isLoading={isGenerating}
          leftIcon={<Sparkles className="h-5 w-5" />}
        >
          {isGenerating ? "Gerando planejamento..." : "Gerar Planejamento com IA"}
        </Button>
      </div>
    );
  }

  // Renderizar planejamento existente
  return (
    <div className="space-y-6">
      {/* Header do Planejamento */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={planejamento.status} />
            <div className="text-sm text-slate-400">
              <span>Versão {planejamento.versao}</span>
              <span className="mx-2">•</span>
              <span>Gerado em {formatDate(planejamento.geradoEm)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão de Histórico */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistorico(!showHistorico)}
              leftIcon={<History className="h-4 w-4" />}
            >
              Histórico
            </Button>

            {/* Botão de Exportar */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Exportar
            </Button>

            {/* Botão de Regenerar */}
            {planejamento.status !== "aprovado" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRegenerar}
                isLoading={isGenerating}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Regenerar
              </Button>
            )}

            {/* Botões de Workflow */}
            {planejamento.status === "rascunho" && (
              <Button
                size="sm"
                onClick={handleEnviarParaRevisao}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Enviar para Revisão
              </Button>
            )}

            {planejamento.status === "em_revisao" && (
              <Button
                size="sm"
                onClick={handleAprovar}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Aprovar
              </Button>
            )}
          </div>
        </div>

        {/* Informações de aprovação */}
        {planejamento.status === "aprovado" && planejamento.aprovadoEm && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Aprovado</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(planejamento.aprovadoEm)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Histórico de Versões */}
      {showHistorico && historico.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-slate-100 mb-3">Histórico de Versões</h4>
          <div className="space-y-2">
            {historico.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 text-sm rounded-lg bg-slate-800/30 px-3 py-2"
              >
                <Badge variant="secondary">v{item.versao}</Badge>
                <span className="text-slate-400">{formatDate(item.data)}</span>
                <span className="text-slate-300">{item.descricao}</span>
                <Badge
                  variant={
                    item.acao === "aprovacao"
                      ? "success"
                      : item.acao === "criacao"
                      ? "primary"
                      : "secondary"
                  }
                >
                  {item.acao}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sub-abas */}
      <div className="border-b border-slate-700/50">
        <div className="flex gap-1">
          {subTabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveSubTab(index)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeSubTab === index
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das sub-abas */}
      <div>
        {activeSubTab === 0 && (
          <PlanoTrabalhoView plano={planejamento.planoTrabalho} />
        )}
        {activeSubTab === 1 && (
          <RequisitosView requisitos={planejamento.requisitos} />
        )}
        {activeSubTab === 2 && (
          <ArquiteturaView arquitetura={planejamento.arquitetura} />
        )}
      </div>

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        planejamento={planejamento}
        projetoNome={projeto.nome}
      />
    </div>
  );
};
