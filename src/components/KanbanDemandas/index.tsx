"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { EtapaBadge } from "@/components/EtapaBadge";
import { FluxoEtapaModal } from "@/components/FluxoEtapaModal";
import { useDemandaStore } from "@/stores/demanda.store";
import { useAvaliacaoDemandaStore } from "@/stores/avaliacao-demanda.store";
import { useComiteStore } from "@/stores/comite.store";
import type { Demanda } from "@/interfaces/demanda.interface";
import type { EtapaDemanda } from "@/interfaces/etapa-demanda.interface";
import {
  ETAPAS_ORDEM,
  ETAPA_DEMANDA_LABELS,
  ETAPA_DEMANDA_COLORS,
  TRANSICOES_PERMITIDAS,
} from "@/interfaces/etapa-demanda.interface";
import type { EtapaKanbanConfig } from "@/interfaces/kanban-config.interface";
import { HORIZONTE_INOVACAO_LABELS } from "@/interfaces/demanda.interface";
import {
  GripVertical,
  Eye,
  Clock,
  User,
  Building2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KanbanDemandasProps {
  demandas: Demanda[];
  usuarioId: string;
  className?: string;
  etapasConfig?: EtapaKanbanConfig[];
}

export const KanbanDemandas = ({
  demandas,
  usuarioId,
  className,
  etapasConfig,
}: KanbanDemandasProps) => {
  const { mudarEtapa, podeTransicionar } = useDemandaStore();
  const { todasPerguntasRespondidas } = useAvaliacaoDemandaStore();
  const { verificarAprovacao } = useComiteStore();

  const [demandaSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null);
  const [showFluxoModal, setShowFluxoModal] = useState(false);

  // Etapas a exibir: usa config customizada se fornecida, senão o padrão global
  const etapasVisiveis = useMemo(() => {
    if (etapasConfig) {
      return etapasConfig
        .filter((c) => c.visivel)
        .sort((a, b) => a.ordem - b.ordem)
        .map((c) => c.etapa);
    }
    return ETAPAS_ORDEM;
  }, [etapasConfig]);

  // Retorna o título customizado para uma etapa, ou o label padrão
  const getTituloEtapa = (etapa: EtapaDemanda): string => {
    if (etapasConfig) {
      const config = etapasConfig.find((c) => c.etapa === etapa);
      if (config) return config.titulo;
    }
    return ETAPA_DEMANDA_LABELS[etapa];
  };

  // Organiza demandas por etapa (inclui todas, mesmo as ocultas, para não perder cards)
  const demandasPorEtapa = useMemo(() => {
    const resultado: Record<EtapaDemanda, Demanda[]> = {} as Record<EtapaDemanda, Demanda[]>;
    ETAPAS_ORDEM.forEach((etapa) => {
      resultado[etapa] = [];
    });
    demandas.forEach((demanda) => {
      if (resultado[demanda.etapa]) {
        resultado[demanda.etapa].push(demanda);
      }
    });
    return resultado;
  }, [demandas]);

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const etapaOrigem = source.droppableId as EtapaDemanda;
    const etapaDestino = destination.droppableId as EtapaDemanda;
    const demanda = demandas.find((d) => d.id === draggableId);

    if (!demanda) return;

    // Verificar se a transição é permitida
    if (!podeTransicionar(etapaOrigem, etapaDestino)) {
      // Abre modal para mostrar opções
      setDemandaSelecionada(demanda);
      setShowFluxoModal(true);
      return;
    }

    // Se for arquivamento, precisa de justificativa
    if (etapaDestino === "arquivado") {
      setDemandaSelecionada(demanda);
      setShowFluxoModal(true);
      return;
    }

    // Transição direta
    mudarEtapa(demanda.id, etapaDestino, usuarioId, {});
  };

  const handleMudarEtapa = async (
    novaEtapa: EtapaDemanda,
    dados: { observacao?: string; justificativa?: string }
  ) => {
    if (!demandaSelecionada) return { sucesso: false };

    const criteriosOk = todasPerguntasRespondidas(demandaSelecionada.id);
    const comiteId = demandaSelecionada.comiteId;
    const comiteAprovado = comiteId
      ? verificarAprovacao(demandaSelecionada.id, comiteId)
      : false;

    const resultado = mudarEtapa(
      demandaSelecionada.id,
      novaEtapa,
      usuarioId,
      dados,
      true,
      () => comiteAprovado
    );

    return resultado;
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className={cn(
            "flex gap-4 overflow-x-auto pb-4 min-h-[600px]",
            className
          )}
        >
          {etapasVisiveis.map((etapa) => (
            <KanbanColuna
              key={etapa}
              etapa={etapa}
              titulo={getTituloEtapa(etapa)}
              demandas={demandasPorEtapa[etapa]}
              onCardClick={(demanda) => {
                setDemandaSelecionada(demanda);
                setShowFluxoModal(true);
              }}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Modal de mudança de etapa */}
      {demandaSelecionada && (
        <FluxoEtapaModal
          isOpen={showFluxoModal}
          onClose={() => {
            setShowFluxoModal(false);
            setDemandaSelecionada(null);
          }}
          etapaAtual={demandaSelecionada.etapa}
          onMudarEtapa={handleMudarEtapa}
          criteriosPreenchidos={todasPerguntasRespondidas(demandaSelecionada.id)}
          aprovadoComite={
            demandaSelecionada.comiteId
              ? verificarAprovacao(
                  demandaSelecionada.id,
                  demandaSelecionada.comiteId
                )
              : false
          }
        />
      )}
    </>
  );
};

// Coluna do Kanban
interface KanbanColunaProps {
  etapa: EtapaDemanda;
  titulo: string;
  demandas: Demanda[];
  onCardClick: (demanda: Demanda) => void;
}

const KanbanColuna = ({ etapa, titulo, demandas, onCardClick }: KanbanColunaProps) => {
  const corBase = ETAPA_DEMANDA_COLORS[etapa].split(" ")[0];

  return (
    <div className="flex-shrink-0 w-72">
      {/* Header da coluna */}
      <div
        className={cn(
          "p-3 rounded-t-lg border-t-2",
          corBase.replace("bg-", "border-t-").replace("/20", "")
        )}
        style={{
          backgroundColor: "rgb(30 41 59 / 0.5)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200" title={ETAPA_DEMANDA_LABELS[etapa]}>
            {titulo}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {demandas.length}
          </Badge>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={etapa}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[500px] p-2 rounded-b-lg space-y-2 transition-colors",
              snapshot.isDraggingOver
                ? "bg-slate-700/50"
                : "bg-slate-800/30"
            )}
          >
            {demandas.map((demanda, index) => (
              <KanbanCard
                key={demanda.id}
                demanda={demanda}
                index={index}
                onClick={() => onCardClick(demanda)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

// Card de demanda
interface KanbanCardProps {
  demanda: Demanda;
  index: number;
  onClick: () => void;
}

const KanbanCard = ({ demanda, index, onClick }: KanbanCardProps) => {
  return (
    <Draggable draggableId={demanda.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "p-3 rounded-lg border bg-slate-800/80 transition-all",
            snapshot.isDragging
              ? "border-cyan-500 shadow-lg shadow-cyan-500/20"
              : "border-slate-700 hover:border-slate-600"
          )}
        >
          {/* Header com grip e ações */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-slate-500" />
            </div>
            <Link href={`/demandas/${demanda.id}`}>
              <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                <Eye className="h-4 w-4 text-slate-400" />
              </button>
            </Link>
          </div>

          {/* Título */}
          <button
            onClick={onClick}
            className="text-left w-full"
          >
            <h4 className="text-sm font-medium text-slate-200 line-clamp-2 hover:text-cyan-400 transition-colors">
              {demanda.titulo}
            </h4>
          </button>

          {/* Proponente */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <User className="h-3 w-3" />
            <span className="truncate">{demanda.nomeProponente}</span>
          </div>

          {/* Horizonte */}
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {HORIZONTE_INOVACAO_LABELS[demanda.horizonteInovacao].split(" - ")[0]}
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(demanda.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            {demanda.exibirVitrine && (
              <Badge variant="primary" className="text-xs">
                Vitrine
              </Badge>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
