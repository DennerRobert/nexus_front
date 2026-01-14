"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { PlanejamentoProjeto } from "@/interfaces/planejamento.interface";
import { FileText, FileCode, Download, Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  planejamento: PlanejamentoProjeto;
  projetoNome: string;
}

type ExportFormat = "pdf" | "markdown";

export const ExportModal = ({
  isOpen,
  onClose,
  planejamento,
  projetoNome,
}: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    // Simular exportação
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Gerar conteúdo baseado no formato
    if (selectedFormat === "markdown") {
      const markdown = generateMarkdown(planejamento, projetoNome);
      downloadFile(markdown, `planejamento-${projetoNome}.md`, "text/markdown");
    } else {
      // Para PDF, por enquanto só mostramos mensagem de sucesso
      // Em produção, usaria uma biblioteca como jsPDF ou chamaria um backend
      alert("Exportação PDF seria gerada aqui. Funcionalidade completa requer integração com backend.");
    }

    setIsExporting(false);
    setExportSuccess(true);

    setTimeout(() => {
      setExportSuccess(false);
      onClose();
    }, 1500);
  };

  const generateMarkdown = (plan: PlanejamentoProjeto, nome: string): string => {
    let md = `# Planejamento do Projeto: ${nome}\n\n`;
    md += `**Versão:** ${plan.versao}\n`;
    md += `**Status:** ${plan.status}\n`;
    md += `**Gerado em:** ${new Date(plan.geradoEm).toLocaleDateString("pt-BR")}\n\n`;

    // Plano de Trabalho
    md += `## 1. Plano de Trabalho\n\n`;
    md += `### 1.1 Cronograma\n`;
    md += `- **Início:** ${new Date(plan.planoTrabalho.cronogramaMacro.dataInicioPrevista).toLocaleDateString("pt-BR")}\n`;
    md += `- **Término:** ${new Date(plan.planoTrabalho.cronogramaMacro.dataFimPrevista).toLocaleDateString("pt-BR")}\n`;
    md += `- **Duração:** ${plan.planoTrabalho.cronogramaMacro.duracaoSemanas} semanas\n\n`;

    md += `### 1.2 Fases\n\n`;
    plan.planoTrabalho.fases.forEach((fase) => {
      md += `#### ${fase.ordem}. ${fase.nome}\n`;
      md += `${fase.descricao}\n`;
      md += `- **Período:** ${new Date(fase.dataInicio).toLocaleDateString("pt-BR")} - ${new Date(fase.dataFim).toLocaleDateString("pt-BR")}\n`;
      md += `- **Horas Estimadas:** ${fase.horasEstimadas}h\n\n`;
    });

    md += `### 1.3 Marcos\n\n`;
    plan.planoTrabalho.marcos.forEach((marco) => {
      md += `- **${marco.titulo}** (${new Date(marco.dataPrevista).toLocaleDateString("pt-BR")})\n`;
      md += `  ${marco.descricao}\n`;
      if (marco.entregaveis.length > 0) {
        md += `  - Entregáveis: ${marco.entregaveis.join(", ")}\n`;
      }
      md += `\n`;
    });

    // Requisitos
    md += `## 2. Requisitos do Sistema\n\n`;
    
    md += `### 2.1 Requisitos Funcionais\n\n`;
    plan.requisitos.funcionais.forEach((rf) => {
      md += `#### ${rf.codigo} - ${rf.titulo}\n`;
      md += `${rf.descricao}\n`;
      md += `- **Prioridade:** ${rf.prioridade}\n`;
      if (rf.criteriosAceitacao.length > 0) {
        md += `- **Critérios de Aceitação:**\n`;
        rf.criteriosAceitacao.forEach((ca) => {
          md += `  - [ ] ${ca}\n`;
        });
      }
      md += `\n`;
    });

    md += `### 2.2 Requisitos Não-Funcionais\n\n`;
    plan.requisitos.naoFuncionais.forEach((rnf) => {
      md += `#### ${rnf.codigo} - ${rnf.titulo}\n`;
      md += `${rnf.descricao}\n`;
      md += `- **Categoria:** ${rnf.categoria}\n`;
      md += `- **Prioridade:** ${rnf.prioridade}\n`;
      if (rnf.metrica) {
        md += `- **Métrica:** ${rnf.metrica}\n`;
      }
      md += `\n`;
    });

    md += `### 2.3 User Stories\n\n`;
    plan.requisitos.userStories.forEach((us) => {
      md += `#### ${us.codigo}\n`;
      md += `> Como **${us.persona}**, quero **${us.acao}**, para **${us.beneficio}**.\n\n`;
      md += `- **Prioridade:** ${us.prioridade}\n`;
      if (us.criteriosAceitacao.length > 0) {
        md += `- **Critérios de Aceitação:**\n`;
        us.criteriosAceitacao.forEach((ca) => {
          md += `  - [ ] ${ca}\n`;
        });
      }
      md += `\n`;
    });

    // Arquitetura
    md += `## 3. Arquitetura Técnica\n\n`;

    md += `### 3.1 Stack Tecnológica\n\n`;
    const { stackSugerida } = plan.arquitetura;
    
    if (stackSugerida.frontend.length > 0) {
      md += `**Frontend:**\n`;
      stackSugerida.frontend.forEach((t) => {
        md += `- ${t.nome}${t.versao ? ` (${t.versao})` : ""} - ${t.justificativa}\n`;
      });
      md += `\n`;
    }

    if (stackSugerida.backend.length > 0) {
      md += `**Backend:**\n`;
      stackSugerida.backend.forEach((t) => {
        md += `- ${t.nome}${t.versao ? ` (${t.versao})` : ""} - ${t.justificativa}\n`;
      });
      md += `\n`;
    }

    if (stackSugerida.banco.length > 0) {
      md += `**Banco de Dados:**\n`;
      stackSugerida.banco.forEach((t) => {
        md += `- ${t.nome}${t.versao ? ` (${t.versao})` : ""} - ${t.justificativa}\n`;
      });
      md += `\n`;
    }

    md += `### 3.2 Riscos Técnicos\n\n`;
    plan.arquitetura.riscos.forEach((r) => {
      md += `#### ${r.titulo} (${r.severidade.toUpperCase()})\n`;
      md += `${r.descricao}\n`;
      md += `- **Probabilidade:** ${r.probabilidade}\n`;
      md += `- **Impacto:** ${r.impacto}\n`;
      md += `- **Mitigação:** ${r.mitigacao}\n\n`;
    });

    md += `### 3.3 Premissas\n\n`;
    plan.arquitetura.premissas.forEach((p) => {
      md += `- ${p}\n`;
    });

    md += `\n### 3.4 Restrições\n\n`;
    plan.arquitetura.restricoes.forEach((r) => {
      md += `- ${r}\n`;
    });

    md += `\n---\n\n*Documento gerado automaticamente pelo SGPI*`;

    return md;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Planejamento">
      <div className="space-y-6">
        {exportSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-lg font-medium text-slate-100">Exportação concluída!</p>
            <p className="text-sm text-slate-400">O arquivo foi baixado com sucesso.</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm text-slate-400 mb-4">
                Escolha o formato de exportação do planejamento do projeto{" "}
                <span className="font-medium text-slate-200">{projetoNome}</span>.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  onClick={() => setSelectedFormat("pdf")}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-lg border p-6 transition-all",
                    selectedFormat === "pdf"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      selectedFormat === "pdf"
                        ? "bg-cyan-500/20"
                        : "bg-slate-700/50"
                    )}
                  >
                    <FileText
                      className={cn(
                        "h-6 w-6",
                        selectedFormat === "pdf"
                          ? "text-cyan-400"
                          : "text-slate-400"
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "font-medium",
                        selectedFormat === "pdf"
                          ? "text-cyan-400"
                          : "text-slate-200"
                      )}
                    >
                      PDF
                    </p>
                    <p className="text-xs text-slate-500">
                      Documento formatado para impressão
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFormat("markdown")}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-lg border p-6 transition-all",
                    selectedFormat === "markdown"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      selectedFormat === "markdown"
                        ? "bg-cyan-500/20"
                        : "bg-slate-700/50"
                    )}
                  >
                    <FileCode
                      className={cn(
                        "h-6 w-6",
                        selectedFormat === "markdown"
                          ? "text-cyan-400"
                          : "text-slate-400"
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "font-medium",
                        selectedFormat === "markdown"
                          ? "text-cyan-400"
                          : "text-slate-200"
                      )}
                    >
                      Markdown
                    </p>
                    <p className="text-xs text-slate-500">
                      Texto para versionamento
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleExport}
                isLoading={isExporting}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Exportar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
