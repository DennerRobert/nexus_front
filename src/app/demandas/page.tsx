"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { KanbanDemandas } from "@/components/KanbanDemandas";
import { EtapaBadge } from "@/components/EtapaBadge";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useDemandasContexto } from "@/hooks/useContextoData";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useAuth } from "@/hooks/useAuth";
import type { Demanda, StatusDemanda } from "@/interfaces/demanda.interface";
import {
  STATUS_DEMANDA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
} from "@/interfaces/demanda.interface";
import { ETAPA_DEMANDA_LABELS } from "@/interfaces/etapa-demanda.interface";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Lightbulb,
  Table,
  LayoutGrid,
} from "lucide-react";

const statusVariantMap: Record<StatusDemanda, BadgeVariant> = {
  rascunho: "secondary",
  em_analise: "info",
  aguardando_aprovacao: "warning",
  aprovada: "success",
  em_ajustes: "warning",
  rejeitada: "danger",
  convertida: "primary",
};

type VisualizacaoTipo = "tabela" | "kanban";

const DemandasPage = () => {
  const { demandas } = useDemandasContexto();
  const { getById: getEmpresa } = useEmpresaStore();
  const { getRestricoes, podeExecutarAcao } = usePermissoes();
  const { usuarioId } = useAuth();

  // Estado da visualização
  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>("tabela");

  // Verifica restrições de permissão
  const restricoes = getRestricoes("demandas");
  const apenasVitrineIdeias = restricoes?.apenasVitrineIdeias || false;
  const podeCriar = podeExecutarAcao("demandas", "criar");

  // Filtra demandas baseado nas permissões
  // Se só pode ver vitrine de ideias, mostra apenas aprovadas/convertidas
  const demandasFiltradas = apenasVitrineIdeias
    ? demandas.filter((d) => d.status === "aprovada" || d.status === "convertida")
    : demandas;

  const stats = useMemo(() => {
    const total = demandasFiltradas.length;
    const emAnalise = demandasFiltradas.filter((d) => d.status === "em_analise").length;
    const aguardando = demandasFiltradas.filter((d) => d.status === "aguardando_aprovacao").length;
    const aprovadas = demandasFiltradas.filter((d) => d.status === "aprovada" || d.status === "convertida").length;

    return { total, emAnalise, aguardando, aprovadas };
  }, [demandasFiltradas]);

  const columns: ColumnDef<Demanda>[] = useMemo(
    () => [
      {
        accessorKey: "titulo",
        header: "Título",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.titulo}</p>
            <p className="text-xs text-slate-500">
              Por {row.original.nomeProponente}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "empresaUnidadeApoioId",
        header: "Unidade",
        cell: ({ row }) => {
          const empresa = getEmpresa(row.original.empresaUnidadeApoioId);
          return empresa?.nome || "-";
        },
      },
      {
        accessorKey: "etapa",
        header: "Etapa",
        cell: ({ row }) => (
          <EtapaBadge etapa={row.original.etapa} size="sm" />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariantMap[row.original.status]}>
            {STATUS_DEMANDA_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "horizonteInovacao",
        header: "Horizonte",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs">
            {HORIZONTE_INOVACAO_LABELS[row.original.horizonteInovacao].split(" - ")[0]}
          </Badge>
        ),
      },
      {
        accessorKey: "prazoDesejado",
        header: "Prazo Desejado",
        cell: ({ row }) => formatDate(row.original.prazoDesejado),
      },
      {
        accessorKey: "createdAt",
        header: "Criada em",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link href={`/demandas/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        ),
      },
    ],
    [getEmpresa]
  );

  return (
    <Layout
      title={apenasVitrineIdeias ? "Vitrine de Ideias" : "Demandas"}
      subtitle={
        apenasVitrineIdeias
          ? "Explore as ideias de inovação aprovadas"
          : "Gestão de demandas e ideias de inovação"
      }
      actions={
        <div className="flex items-center gap-3">
          {/* Toggle de visualização - apenas para gestão completa */}
          {!apenasVitrineIdeias && (
            <div className="flex items-center rounded-lg border border-slate-700 p-1">
              <button
                onClick={() => setVisualizacao("tabela")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                  visualizacao === "tabela"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Table className="h-4 w-4" />
                Tabela
              </button>
              <button
                onClick={() => setVisualizacao("kanban")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                  visualizacao === "kanban"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
            </div>
          )}
          
          {podeCriar && (
            <Link href="/demandas/nova">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                {apenasVitrineIdeias ? "Submeter Ideia" : "Nova Demanda"}
              </Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cards de estatísticas - esconde para vitrine de ideias */}
        {!apenasVitrineIdeias && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total de Demandas"
              value={stats.total}
              icon={FileText}
            />
            <StatCard
              title="Em Análise"
              value={stats.emAnalise}
              icon={Clock}
            />
            <StatCard
              title="Aguardando Aprovação"
              value={stats.aguardando}
              icon={XCircle}
            />
            <StatCard
              title="Aprovadas/Convertidas"
              value={stats.aprovadas}
              icon={CheckCircle}
            />
          </div>
        )}

        {/* Banner para vitrine de ideias */}
        {apenasVitrineIdeias && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Lightbulb className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-slate-200">Vitrine de Ideias</h3>
                <p className="text-sm text-slate-400">
                  Explore as ideias aprovadas pela comissão de inovação. Você também pode submeter suas próprias ideias!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo baseado na visualização */}
        {visualizacao === "tabela" || apenasVitrineIdeias ? (
          <DataTable
            columns={columns}
            data={demandasFiltradas}
            searchPlaceholder="Buscar por título..."
            searchColumn="titulo"
          />
        ) : (
          <KanbanDemandas
            demandas={demandasFiltradas}
            usuarioId={usuarioId || "demo-user-id"}
          />
        )}
      </div>
    </Layout>
  );
};

export default DemandasPage;
