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
import { useProjetoStore } from "@/stores/projeto.store";
import { useProjetosContexto } from "@/hooks/useContextoData";
import { PageSkeleton } from "@/components/ui/Skeleton";
import type { Projeto, StatusProjeto } from "@/interfaces/projeto.interface";
import { STATUS_PROJETO_LABELS } from "@/interfaces/projeto.interface";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { FolderKanban, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";

const statusVariantMap: Record<StatusProjeto, BadgeVariant> = {
  aguardando_aprovacao: "warning",
  aprovado: "info",
  em_execucao: "primary",
  pausado: "secondary",
  concluido: "success",
  cancelado: "danger",
};

const ProjetosPage = () => {
  const { projetos } = useProjetosContexto();
  const { getById: getEmpresa } = useEmpresaStore();
  const isLoading = useProjetoStore((s) => s.isLoading);
  const error = useProjetoStore((s) => s.error);

  const stats = useMemo(() => {
    const total = projetos.length;
    const emExecucao = projetos.filter((p) => p.status === "em_execucao").length;
    const aguardando = projetos.filter((p) => p.status === "aguardando_aprovacao").length;
    const concluidos = projetos.filter((p) => p.status === "concluido").length;

    return { total, emExecucao, aguardando, concluidos };
  }, [projetos]);

  const columns: ColumnDef<Projeto>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: "Nome",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.nome}</p>
            <p className="text-xs text-slate-500 line-clamp-1">
              {row.original.descricao}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "empresaDonaId",
        header: "Empresa",
        cell: ({ row }) => {
          const empresa = getEmpresa(row.original.empresaDonaId);
          return empresa?.nome || "-";
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariantMap[row.original.status]}>
            {STATUS_PROJETO_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "orcamento",
        header: "Orçamento",
        cell: ({ row }) => formatCurrency(row.original.orcamento),
      },
      {
        accessorKey: "custoAtual",
        header: "Custo Atual",
        cell: ({ row }) => {
          const percentual = (row.original.custoAtual / row.original.orcamento) * 100;
          return (
            <div>
              <p className="text-cyan-400">{formatCurrency(row.original.custoAtual)}</p>
              <p className="text-xs text-slate-500">{percentual.toFixed(0)}% consumido</p>
            </div>
          );
        },
      },
      {
        accessorKey: "dataFimPrevista",
        header: "Prazo",
        cell: ({ row }) =>
          row.original.dataFimPrevista
            ? formatDate(row.original.dataFimPrevista)
            : "-",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link href={`/projetos/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        ),
      },
    ],
    [getEmpresa]
  );

  if (isLoading && projetos.length === 0) {
    return (
      <Layout title="Projetos" subtitle="Gestão do ciclo de vida dos projetos">
        <PageSkeleton stats={4} tableRows={6} tableCols={5} />
      </Layout>
    );
  }

  if (error && projetos.length === 0) {
    return (
      <Layout title="Projetos" subtitle="Gestão do ciclo de vida dos projetos">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-2">
          <p className="text-red-400 font-medium">Erro ao carregar projetos</p>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Projetos"
      subtitle="Gestão do ciclo de vida dos projetos"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Projetos"
            value={stats.total}
            icon={FolderKanban}
          />
          <StatCard
            title="Em Execução"
            value={stats.emExecucao}
            icon={Clock}
          />
          <StatCard
            title="Aguardando Aprovação"
            value={stats.aguardando}
            icon={AlertTriangle}
          />
          <StatCard
            title="Concluídos"
            value={stats.concluidos}
            icon={CheckCircle}
          />
        </div>

        <DataTable
          columns={columns}
          data={projetos}
          searchPlaceholder="Buscar por nome..."
          searchColumn="nome"
        />
      </div>
    </Layout>
  );
};

export default ProjetosPage;
