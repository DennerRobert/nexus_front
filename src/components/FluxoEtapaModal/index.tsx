"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { EtapaBadge } from "@/components/EtapaBadge";
import { cn } from "@/utils/cn";
import type { EtapaDemanda } from "@/interfaces/etapa-demanda.interface";
import {
  ETAPA_DEMANDA_LABELS,
  TRANSICOES_PERMITIDAS,
} from "@/interfaces/etapa-demanda.interface";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Archive,
} from "lucide-react";

interface FluxoEtapaModalProps {
  isOpen: boolean;
  onClose: () => void;
  etapaAtual: EtapaDemanda;
  onMudarEtapa: (
    novaEtapa: EtapaDemanda,
    dados: { observacao?: string; justificativa?: string }
  ) => Promise<{ sucesso: boolean; erro?: string }>;
  criteriosPreenchidos?: boolean;
  aprovadoComite?: boolean;
}

export const FluxoEtapaModal = ({
  isOpen,
  onClose,
  etapaAtual,
  onMudarEtapa,
  criteriosPreenchidos = true,
  aprovadoComite = false,
}: FluxoEtapaModalProps) => {
  const [etapaSelecionada, setEtapaSelecionada] = useState<EtapaDemanda | null>(null);
  const [observacao, setObservacao] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const transicoesPermitidas = TRANSICOES_PERMITIDAS[etapaAtual] || [];

  // Verificações especiais
  const requerCriterios = etapaAtual === "ideia_recebida" && !criteriosPreenchidos;
  const requerAprovacaoComite = (etapa: EtapaDemanda) =>
    etapa === "encaminhado_grupo_trabalho" && !aprovadoComite;
  const requerJustificativa = (etapa: EtapaDemanda) => etapa === "arquivado";

  const handleConfirmar = async () => {
    if (!etapaSelecionada) return;

    // Validações
    if (requerCriterios) {
      setErro("Todos os critérios de avaliação devem ser preenchidos antes de prosseguir.");
      return;
    }

    if (requerAprovacaoComite(etapaSelecionada)) {
      setErro("É necessária a aprovação do comitê para encaminhar ao grupo de trabalho.");
      return;
    }

    if (requerJustificativa(etapaSelecionada) && !justificativa.trim()) {
      setErro("É necessário informar uma justificativa para arquivar a demanda.");
      return;
    }

    setIsLoading(true);
    setErro(null);

    const resultado = await onMudarEtapa(etapaSelecionada, {
      observacao: observacao.trim() || undefined,
      justificativa: justificativa.trim() || undefined,
    });

    setIsLoading(false);

    if (resultado.sucesso) {
      handleClose();
    } else {
      setErro(resultado.erro || "Erro ao mudar etapa");
    }
  };

  const handleClose = () => {
    setEtapaSelecionada(null);
    setObservacao("");
    setJustificativa("");
    setErro(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Alterar Etapa da Demanda"
      size="lg"
    >
      <div className="space-y-6">
        {/* Etapa atual */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <span className="text-sm text-slate-400">Etapa atual:</span>
          <EtapaBadge etapa={etapaAtual} size="lg" />
        </div>

        {/* Avisos */}
        {requerCriterios && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">
                Avaliação de critérios pendente
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Todos os critérios de avaliação devem ser preenchidos antes de
                prosseguir para a próxima etapa.
              </p>
            </div>
          </div>
        )}

        {/* Transições permitidas */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">
            Selecione a próxima etapa:
          </p>

          {transicoesPermitidas.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Info className="h-5 w-5 text-slate-400" />
              <p className="text-sm text-slate-400">
                Esta demanda não pode mais mudar de etapa.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {transicoesPermitidas.map((etapa) => {
                const isSelected = etapaSelecionada === etapa;
                const isBloqueada = requerAprovacaoComite(etapa);
                const isArquivamento = etapa === "arquivado";

                return (
                  <button
                    key={etapa}
                    onClick={() => !isBloqueada && setEtapaSelecionada(etapa)}
                    disabled={isBloqueada}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-700 hover:border-slate-600 bg-slate-800/30",
                      isBloqueada && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ArrowRight
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "text-cyan-400" : "text-slate-500"
                        )}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <EtapaBadge etapa={etapa} size="sm" />
                          {isArquivamento && (
                            <Archive className="h-3.5 w-3.5 text-slate-500" />
                          )}
                        </div>
                        {isBloqueada && (
                          <p className="text-xs text-amber-400 mt-1">
                            Requer aprovação do comitê
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Campos adicionais */}
        {etapaSelecionada && (
          <div className="space-y-4">
            {/* Justificativa para arquivamento */}
            {requerJustificativa(etapaSelecionada) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Justificativa do arquivamento *
                </label>
                <Textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Informe o motivo do arquivamento..."
                  rows={3}
                />
              </div>
            )}

            {/* Observação opcional */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Observação (opcional)
              </label>
              <Textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Adicione uma observação sobre a mudança de etapa..."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{erro}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!etapaSelecionada || isLoading || requerCriterios}
            isLoading={isLoading}
          >
            Confirmar Mudança
          </Button>
        </div>
      </div>
    </Modal>
  );
};
