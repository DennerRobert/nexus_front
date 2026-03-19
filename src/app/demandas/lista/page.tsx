"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EtapaBadge } from "@/components/EtapaBadge";
import { KanbanDemandas } from "@/components/KanbanDemandas";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useDemandaStore } from "@/stores/demanda.store";
import { useAuth } from "@/hooks/useAuth";
import type { Demanda, StatusDemanda } from "@/interfaces/demanda.interface";
import { STATUS_DEMANDA_LABELS } from "@/interfaces/demanda.interface";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  Plus,
  Eye,
  Table,
  LayoutGrid,
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

type VisualizacaoTipo = "tabela" | "kanban";

const DemandasListaPage = () => {
  const router = useRouter();
  const { usuario, usuarioId } = useAuth();
  const { getAll: getDemandas } = useDemandaStore();
  const { getById: getEmpresa } = useEmpresaStore();

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>("tabela");
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("todas");

  // Demandas filtradas pelas empresas que o usuário tem acesso
  const demandasDoUsuario = useMemo(() => {
    if (!usuario) return [];
    const ids = new Set(usuario.empresaIds ?? []);
    return getDemandas().filter((d) => ids.has(d.empresaUnidadeApoioId));
  }, [usuario, getDemandas]);

  // Empresas únicas presentes nas demandas
  const empresasPresentes = useMemo(() => {
    const ids = [...new Set(demandasDoUsuario.map((d) => d.empresaUnidadeApoioId))];
    return ids
      .map((id) => getEmpresa(id))
      .filter(Boolean)
      .sort((a, b) => a!.nome.localeCompare(b!.nome, "pt-BR")) as NonNullable<ReturnType<typeof getEmpresa>>[];
  }, [demandasDoUsuario, getEmpresa]);

  const demandasFiltradas = useMemo(() => {
    if (empresaFiltro === "todas") return demandasDoUsuario;
    return demandasDoUsuario.filter((d) => d.empresaUnidadeApoioId === empresaFiltro);
  }, [demandasDoUsuario, empresaFiltro]);

  const columns: ColumnDef<Demanda>[] = useMemo(
    () => [
      {
        accessorKey: "titulo",
        header: "Título",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.titulo}</p>
            <p className="text-xs text-slate-500">Por {row.original.nomeProponente}</p>
          </div>
        ),
      },
      {
        accessorKey: "empresaUnidadeApoioId",
        header: "Empresa",
        cell: ({ row }) => {
          const empresa = getEmpresa(row.original.empresaUnidadeApoioId);
          return (
            <span className="flex items-center gap-1.5 text-sm text-slate-300">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              {empresa?.nome ?? "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "etapa",
        header: "Etapa",
        cell: ({ row }) => <EtapaBadge etapa={row.original.etapa} size="sm" />,
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
      title="Minhas Demandas"
      subtitle="Demandas das empresas que você tem acesso"
      actions={
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push("/demandas")}
        >
          Nova Demanda
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Filtro por empresa + toggle de visualização */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pills de empresa */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEmpresaFiltro("todas")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                empresaFiltro === "todas"
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                  : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              )}
            >
              Todas ({demandasDoUsuario.length})
            </button>
            {empresasPresentes.map((empresa) => {
              const count = demandasDoUsuario.filter(
                (d) => d.empresaUnidadeApoioId === empresa.id
              ).length;
              const isSelected = empresaFiltro === empresa.id;
              return (
                <button
                  key={empresa.id}
                  onClick={() => setEmpresaFiltro(empresa.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    isSelected
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                  )}
                >
                  {empresa.nome.split(" ")[0]} ({count})
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Toggle tabela/kanban */}
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
        </div>

        {/* Conteúdo */}
        {visualizacao === "tabela" ? (
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

export default DemandasListaPage;
