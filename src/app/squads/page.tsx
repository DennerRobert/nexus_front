"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { useSquadStore } from "@/stores/squad.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useAlocacaoStore } from "@/stores/alocacao.store";
import type { Squad, StatusSquad } from "@/interfaces/squad.interface";
import { STATUS_SQUAD_LABELS } from "@/interfaces/squad.interface";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { Plus, Users, PlayCircle, Clock, DollarSign, Eye } from "lucide-react";

const statusVariantMap: Record<StatusSquad, BadgeVariant> = {
  formando: "warning",
  ativo: "success",
  em_handover: "info",
  encerrado: "secondary",
};

const SquadsPage = () => {
  const { getAll } = useSquadStore();
  const { getById: getProjeto } = useProjetoStore();
  const { getAtivasBySquad } = useAlocacaoStore();
  const squads = getAll();

  const stats = useMemo(() => {
    const total = squads.length;
    const ativos = squads.filter((s) => s.status === "ativo").length;
    const formando = squads.filter((s) => s.status === "formando").length;
    const custoMensalTotal = squads
      .filter((s) => s.status === "ativo")
      .reduce((acc, s) => acc + s.custoMensal, 0);

    return { total, ativos, formando, custoMensalTotal };
  }, [squads]);

  const columns: ColumnDef<Squad>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: "Squad",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.nome}</p>
            <p className="text-xs text-slate-500 truncate max-w-xs">
              {row.original.objetivo}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "projetoId",
        header: "Projeto",
        cell: ({ row }) => {
          const projeto = getProjeto(row.original.projetoId);
          return projeto?.nome || "-";
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariantMap[row.original.status]}>
            {STATUS_SQUAD_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "membros",
        header: "Membros",
        cell: ({ row }) => {
          const alocacoes = getAtivasBySquad(row.original.id);
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span>{alocacoes.length}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "custoMensal",
        header: "Custo Mensal",
        cell: ({ row }) => formatCurrency(row.original.custoMensal),
      },
      {
        accessorKey: "dataInicio",
        header: "Início",
        cell: ({ row }) => formatDate(row.original.dataInicio),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link href={`/squads/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        ),
      },
    ],
    [getProjeto, getAtivasBySquad]
  );

  return (
    <Layout
      title="Squads"
      subtitle="Gestão de squads transversais"
      actions={
        <Link href="/squads/novo">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Novo Squad</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total de Squads" value={stats.total} icon={Users} />
          <StatCard title="Ativos" value={stats.ativos} icon={PlayCircle} />
          <StatCard title="Em Formação" value={stats.formando} icon={Clock} />
          <StatCard
            title="Custo Mensal Total"
            value={formatCurrency(stats.custoMensalTotal)}
            subtitle="Squads ativos"
            icon={DollarSign}
          />
        </div>

        <DataTable
          columns={columns}
          data={squads}
          searchPlaceholder="Buscar por nome..."
          searchColumn="nome"
        />
      </div>
    </Layout>
  );
};

export default SquadsPage;
