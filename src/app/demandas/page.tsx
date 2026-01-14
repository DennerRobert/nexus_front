"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useDemandasContexto } from "@/hooks/useContextoData";
import type { Demanda, StatusDemanda } from "@/interfaces/demanda.interface";
import {
  STATUS_DEMANDA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
} from "@/interfaces/demanda.interface";
import { formatDate } from "@/utils/formatters";
import { Plus, FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

const statusVariantMap: Record<StatusDemanda, BadgeVariant> = {
  rascunho: "secondary",
  em_analise: "info",
  aguardando_aprovacao: "warning",
  aprovada: "success",
  em_ajustes: "warning",
  rejeitada: "danger",
  convertida: "primary",
};

const DemandasPage = () => {
  const { demandas } = useDemandasContexto();
  const { getById: getEmpresa } = useEmpresaStore();

  const stats = useMemo(() => {
    const total = demandas.length;
    const emAnalise = demandas.filter((d) => d.status === "em_analise").length;
    const aguardando = demandas.filter((d) => d.status === "aguardando_aprovacao").length;
    const aprovadas = demandas.filter((d) => d.status === "aprovada" || d.status === "convertida").length;

    return { total, emAnalise, aguardando, aprovadas };
  }, [demandas]);

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
      title="Demandas"
      subtitle="Gestão de demandas e ideias de inovação"
      actions={
        <Link href="/demandas/nova">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Nova Demanda
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
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

        <DataTable
          columns={columns}
          data={demandas}
          searchPlaceholder="Buscar por título..."
          searchColumn="titulo"
        />
      </div>
    </Layout>
  );
};

export default DemandasPage;
