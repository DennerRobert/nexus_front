"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useColaboradoresContexto } from "@/hooks/useContextoData";
import type { ColaboradorComOcupacao } from "@/interfaces/colaborador.interface";
import {
  AREA_ESPECIALIDADE_LABELS,
  SENIORIDADE_ABREV,
} from "@/interfaces/colaborador.interface";
import { formatCurrency } from "@/utils/formatters";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Plus, Users, AlertTriangle, CheckCircle, Eye, Edit } from "lucide-react";

const ColaboradoresPage = () => {
  const { colaboradoresComOcupacao } = useColaboradoresContexto();
  const { getById: getEmpresa } = useEmpresaStore();
  const isLoading = useColaboradorStore((s) => s.isLoading);
  const error = useColaboradorStore((s) => s.error);

  const stats = useMemo(() => {
    const total = colaboradoresComOcupacao.length;
    const subalocados = colaboradoresComOcupacao.filter((c) => c.ocupacaoAtual < 70).length;
    const superalocados = colaboradoresComOcupacao.filter((c) => c.ocupacaoAtual > 100).length;
    const disponiveis = colaboradoresComOcupacao.filter((c) => c.disponibilidade >= 20).length;
    const ocupacaoMedia = total > 0
      ? colaboradoresComOcupacao.reduce((acc, c) => acc + c.ocupacaoAtual, 0) / total
      : 0;

    return { total, subalocados, superalocados, disponiveis, ocupacaoMedia };
  }, [colaboradoresComOcupacao]);

  const columns: ColumnDef<ColaboradorComOcupacao>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: "Nome",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.nome}</p>
            <p className="text-xs text-slate-500">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "empresaIds",
        header: "Empresas",
        cell: ({ row }) => {
          const ids = row.original.empresaIds || [];
          if (ids.length === 0) return <span className="text-slate-500">-</span>;
          return (
            <div className="flex flex-col gap-0.5">
              {ids.slice(0, 2).map((eid) => {
                const empresa = getEmpresa(eid);
                return empresa ? (
                  <span key={eid} className="text-sm text-slate-200">{empresa.nome}</span>
                ) : null;
              })}
              {ids.length > 2 && (
                <span className="text-xs text-slate-500">+{ids.length - 2} mais</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "cargo",
        header: "Cargo",
        cell: ({ row }) => (
          <p>{row.original.cargo}</p>
        ),
      },
      {
        accessorKey: "especialidades",
        header: "Especialidades",
        cell: ({ row }) => {
          const especialidades = row.original.especialidades;

          if (!especialidades || especialidades.length === 0) {
            return <span className="text-slate-500">-</span>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {especialidades.slice(0, 2).map((esp, index) => (
                <Badge key={index} variant="primary" className="text-xs">
                  {AREA_ESPECIALIDADE_LABELS[esp.area]} ({SENIORIDADE_ABREV[esp.senioridade]})
                </Badge>
              ))}
              {especialidades.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{especialidades.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "ocupacaoAtual",
        header: "Ocupação",
        cell: ({ row }) => {
          const ocupacao = row.original.ocupacaoAtual;
          let variant: "success" | "warning" | "danger" = "success";
          if (ocupacao < 70) variant = "warning";
          if (ocupacao > 100) variant = "danger";

          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-700">
                <div
                  className={`h-full transition-all ${
                    variant === "success"
                      ? "bg-green-500"
                      : variant === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(ocupacao, 100)}%` }}
                />
              </div>
              <span className="text-sm">{ocupacao}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: "custoHora",
        header: "Custo/Hora",
        cell: ({ row }) => formatCurrency(row.original.custoHora),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link href={`/colaboradores/${row.original.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/colaboradores/${row.original.id}?edit=true`}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [getEmpresa]
  );

  if (isLoading && colaboradoresComOcupacao.length === 0) {
    return (
      <Layout title="Colaboradores" subtitle="Gestão de recursos humanos e especialidades">
        <PageSkeleton stats={5} tableRows={6} tableCols={6} />
      </Layout>
    );
  }

  if (error && colaboradoresComOcupacao.length === 0) {
    return (
      <Layout title="Colaboradores" subtitle="Gestão de recursos humanos e especialidades">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-2">
          <p className="text-red-400 font-medium">Erro ao carregar colaboradores</p>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Colaboradores"
      subtitle="Gestão de recursos humanos e especialidades"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link href="/colaboradores/novo">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Novo Colaborador
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Colaboradores"
            value={stats.total}
            icon={Users}
          />
          <StatCard
            title="Ocupação Média"
            value={`${stats.ocupacaoMedia.toFixed(0)}%`}
            subtitle="Da capacidade total"
            icon={CheckCircle}
          />
          <StatCard
            title="Subalocados"
            value={stats.subalocados}
            subtitle="Ocupação < 70%"
            icon={AlertTriangle}
          />
          <StatCard
            title="Disponíveis"
            value={stats.disponiveis}
            subtitle="≥ 20% disponível"
            icon={Users}
          />
        </div>

        <DataTable
          columns={columns}
          data={colaboradoresComOcupacao}
          searchPlaceholder="Buscar por nome..."
          searchColumn="nome"
        />
      </div>
    </Layout>
  );
};

export default ColaboradoresPage;
