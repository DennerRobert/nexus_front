"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useKanbanConfigStore } from "@/stores/kanban-config.store";
import type { EtapaDemanda } from "@/interfaces/etapa-demanda.interface";
import {
  ETAPAS_ORDEM,
  ETAPA_DEMANDA_LABELS,
} from "@/interfaces/etapa-demanda.interface";
import { cn } from "@/utils/cn";
import {
  GripVertical,
  Trash2,
  Plus,
  RotateCcw,
  Save,
  Settings2,
} from "lucide-react";

interface EtapaAtiva {
  etapa: EtapaDemanda;
  titulo: string;
}

interface KanbanConfigModalProps {
  empresaId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const KanbanConfigModal = ({
  empresaId,
  isOpen,
  onClose,
}: KanbanConfigModalProps) => {
  const { getConfig, updateConfig, resetConfig } = useKanbanConfigStore();

  const [etapasAtivas, setEtapasAtivas] = useState<EtapaAtiva[]>([]);
  const [etapasOcultas, setEtapasOcultas] = useState<EtapaDemanda[]>([]);

  const carregarConfig = () => {
    const config = getConfig(empresaId);
    const ativas = config.etapas
      .filter((e) => e.visivel)
      .sort((a, b) => a.ordem - b.ordem)
      .map((e) => ({ etapa: e.etapa, titulo: e.titulo }));

    const ocultas = config.etapas
      .filter((e) => !e.visivel)
      .sort((a, b) => a.ordem - b.ordem)
      .map((e) => e.etapa);

    setEtapasAtivas(ativas);
    setEtapasOcultas(ocultas);
  };

  useEffect(() => {
    if (isOpen) carregarConfig();
  }, [isOpen, empresaId]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const novaLista = Array.from(etapasAtivas);
    const [movido] = novaLista.splice(result.source.index, 1);
    novaLista.splice(result.destination.index, 0, movido);
    setEtapasAtivas(novaLista);
  };

  const handleRemover = (etapa: EtapaDemanda) => {
    if (etapasAtivas.length <= 1) {
      toast.error("O Kanban precisa ter ao menos uma etapa.");
      return;
    }
    setEtapasAtivas((prev) => prev.filter((e) => e.etapa !== etapa));
    setEtapasOcultas((prev) => [...prev, etapa]);
  };

  const handleAdicionar = (etapa: EtapaDemanda) => {
    setEtapasOcultas((prev) => prev.filter((e) => e !== etapa));
    setEtapasAtivas((prev) => [
      ...prev,
      { etapa, titulo: ETAPA_DEMANDA_LABELS[etapa] },
    ]);
  };

  const handleRenomear = (etapa: EtapaDemanda, novoTitulo: string) => {
    setEtapasAtivas((prev) =>
      prev.map((e) => (e.etapa === etapa ? { ...e, titulo: novoTitulo } : e))
    );
  };

  const handleSalvar = () => {
    const todasEtapas = [
      ...etapasAtivas.map((e, i) => ({
        etapa: e.etapa,
        titulo: e.titulo.trim() || ETAPA_DEMANDA_LABELS[e.etapa],
        visivel: true,
        ordem: i,
      })),
      ...etapasOcultas.map((etapa, i) => ({
        etapa,
        titulo: ETAPA_DEMANDA_LABELS[etapa],
        visivel: false,
        ordem: etapasAtivas.length + i,
      })),
    ];

    // Garantir que todas as etapas de ETAPAS_ORDEM estejam na config
    const etapasPresentes = new Set(todasEtapas.map((e) => e.etapa));
    ETAPAS_ORDEM.forEach((etapa, i) => {
      if (!etapasPresentes.has(etapa)) {
        todasEtapas.push({
          etapa,
          titulo: ETAPA_DEMANDA_LABELS[etapa],
          visivel: false,
          ordem: todasEtapas.length + i,
        });
      }
    });

    updateConfig(empresaId, todasEtapas);
    toast.success("Configuração do Kanban salva!");
    onClose();
  };

  const handleReset = () => {
    resetConfig(empresaId);
    carregarConfig();
    toast.success("Configuração restaurada para o padrão.");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Kanban"
      description="Adicione, remova ou renomeie as etapas do Kanban desta empresa."
      size="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Etapas ativas */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">
              Etapas ativas
            </h3>
            <Badge variant="secondary" className="text-xs">
              {etapasAtivas.length}
            </Badge>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="etapas-ativas">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="max-h-72 space-y-2 overflow-y-auto pr-1"
                >
                  {etapasAtivas.map((item, index) => (
                    <Draggable
                      key={item.etapa}
                      draggableId={item.etapa}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
                            snapshot.isDragging
                              ? "border-cyan-500/60 bg-slate-700 shadow-lg"
                              : "border-slate-700/50 bg-slate-800/60"
                          )}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                            aria-label="Arrastar etapa"
                          >
                            <GripVertical className="h-4 w-4 text-slate-500" />
                          </div>

                          <span className="w-5 text-center text-xs text-slate-600">
                            {index + 1}
                          </span>

                          <input
                            type="text"
                            value={item.titulo}
                            onChange={(e) =>
                              handleRenomear(item.etapa, e.target.value)
                            }
                            aria-label={`Título da etapa ${item.titulo}`}
                            className={cn(
                              "flex-1 rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1.5",
                              "text-sm text-slate-100 placeholder-slate-500 outline-none transition-all",
                              "focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                            )}
                            placeholder={ETAPA_DEMANDA_LABELS[item.etapa]}
                          />

                          <span className="hidden text-xs text-slate-600 sm:block">
                            {ETAPA_DEMANDA_LABELS[item.etapa]}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemover(item.etapa)}
                            aria-label={`Remover etapa ${item.titulo}`}
                            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {etapasAtivas.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-700 py-6 text-center text-sm text-slate-500">
              Nenhuma etapa ativa. Adicione etapas abaixo.
            </p>
          )}
        </div>

        {/* Etapas ocultas */}
        {etapasOcultas.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-medium text-slate-400">
                Etapas disponíveis para adicionar
              </h3>
              <Badge variant="secondary" className="text-xs">
                {etapasOcultas.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {etapasOcultas.map((etapa) => (
                <button
                  key={etapa}
                  type="button"
                  onClick={() => handleAdicionar(etapa)}
                  aria-label={`Adicionar etapa ${ETAPA_DEMANDA_LABELS[etapa]}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800/50 px-3 py-1.5",
                    "text-xs text-slate-400 transition-all",
                    "hover:border-cyan-500/60 hover:bg-cyan-500/10 hover:text-cyan-400"
                  )}
                >
                  <Plus className="h-3 w-3" />
                  {ETAPA_DEMANDA_LABELS[etapa]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divisor */}
        <div className="border-t border-slate-700/50" />

        {/* Ações do footer */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            aria-label="Restaurar configuração padrão"
            className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-amber-400"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
