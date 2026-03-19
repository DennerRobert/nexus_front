"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EtapaBadge } from "@/components/EtapaBadge";
import { KanbanDemandas } from "@/components/KanbanDemandas";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useDemandaStore } from "@/stores/demanda.store";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useAuth } from "@/hooks/useAuth";
import type { Demanda, StatusDemanda } from "@/interfaces/demanda.interface";
import { STATUS_DEMANDA_LABELS } from "@/interfaces/demanda.interface";
import {
  FORMULARIO_TIPO_LABELS,
  FORMULARIO_TIPO_DESCRICAO,
  type FormularioTipo,
} from "@/interfaces/empresa.interface";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  Plus,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Table,
  LayoutGrid,
  Lightbulb,
  Wrench,
  Target,
  Building2,
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

const FORMULARIO_TIPO_ICON: Record<FormularioTipo, typeof Lightbulb> = {
  inovacao: Lightbulb,
  operacional: Wrench,
  estrategico: Target,
};

const FORMULARIO_TIPO_COLOR: Record<FormularioTipo, string> = {
  inovacao: "text-cyan-400 bg-cyan-500/20",
  operacional: "text-amber-400 bg-amber-500/20",
  estrategico: "text-violet-400 bg-violet-500/20",
};

type VisualizacaoTipo = "tabela" | "kanban";

const EmpresaDemandasPage = () => {
  const params = useParams();
  const empresaId = params.empresaId as string;

  const { getById: getEmpresa } = useEmpresaStore();
  const { getAll: getDemandas } = useDemandaStore();
  const { podeExecutarAcao } = usePermissoes();
  const { usuarioId } = useAuth();

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>("tabela");

  const empresa = getEmpresa(empresaId);
  const podeCriar = podeExecutarAcao("demandas", "criar");

  const demandasEmpresa = useMemo(
    () => getDemandas().filter((d) => d.empresaUnidadeApoioId === empresaId),
    [getDemandas, empresaId]
  );

  const stats = useMemo(() => {
    const total = demandasEmpresa.length;
    const emAnalise = demandasEmpresa.filter(
      (d) => d.status === "em_analise"
    ).length;
    const aguardando = demandasEmpresa.filter(
      (d) => d.status === "aguardando_aprovacao"
    ).length;
    const aprovadas = demandasEmpresa.filter(
      (d) => d.status === "aprovada" || d.status === "convertida"
    ).length;
    return { total, emAnalise, aguardando, aprovadas };
  }, [demandasEmpresa]);

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
    []
  );

  if (!empresa) {
    return (
      <Layout title="Empresa não encontrada">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">Empresa não encontrada</p>
          <Link href="/demandas" className="mt-4">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const tipo = (empresa.formularioTipo ?? "inovacao") as FormularioTipo;
  const Icon = FORMULARIO_TIPO_ICON[tipo];
  const iconColor = FORMULARIO_TIPO_COLOR[tipo];

  return (
    <Layout
      title={empresa.nome}
      subtitle={
        empresa.setor
          ? `${empresa.setor} · ${FORMULARIO_TIPO_DESCRICAO[tipo]}`
          : FORMULARIO_TIPO_DESCRICAO[tipo]
      }
      actions={
        <div className="flex items-center gap-3">
          <Link href="/demandas">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Empresas
            </Button>
          </Link>

          {/* Toggle de visualização */}
          <div className="flex items-center rounded-lg border border-slate-700 p-1">
            <button
              onClick={() => setVisualizacao("tabela")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
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
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                visualizacao === "kanban"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
          </div>

          {podeCriar && (
            <Link href={`/demandas/empresa/${empresaId}/nova`}>
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Nova Demanda
              </Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner da empresa */}
        <div className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/40 px-5 py-4">
          <div
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
              iconColor
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-slate-100">{empresa.nome}</h2>
              <span className="text-xs text-slate-500 font-mono">{empresa.cnpj}</span>
            </div>
            {empresa.descricao && (
              <p className="mt-0.5 text-sm text-slate-400 truncate">
                {empresa.descricao}
              </p>
            )}
          </div>
          <span
            className={cn(
              "flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
              iconColor,
              "border-current/30"
            )}
          >
            {FORMULARIO_TIPO_LABELS[tipo]}
          </span>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3">
            <FileText className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-xl font-bold text-slate-100">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3">
            <Clock className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xl font-bold text-blue-400">{stats.emAnalise}</p>
              <p className="text-xs text-slate-500">Em Análise</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3">
            <XCircle className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xl font-bold text-yellow-400">{stats.aguardando}</p>
              <p className="text-xs text-slate-500">Aguardando</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-xl font-bold text-green-400">{stats.aprovadas}</p>
              <p className="text-xs text-slate-500">Aprovadas</p>
            </div>
          </div>
        </div>

        {/* Lista de demandas */}
        {visualizacao === "tabela" ? (
          <DataTable
            columns={columns}
            data={demandasEmpresa}
            searchPlaceholder="Buscar por título..."
            searchColumn="titulo"
          />
        ) : (
          <KanbanDemandas
            demandas={demandasEmpresa}
            usuarioId={usuarioId || "demo-user-id"}
          />
        )}
      </div>
    </Layout>
  );
};

export default EmpresaDemandasPage;
