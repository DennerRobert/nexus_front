"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, type Tab } from "@/components/Tabs";
import { KanbanDemandas } from "@/components/KanbanDemandas";
import { KanbanConfigModal } from "@/components/KanbanConfigModal";
import { FormularioEmpresaTab } from "@/components/FormularioEmpresaTab";
import { DataTable } from "@/components/DataTable";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useDemandaStore } from "@/stores/demanda.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useKanbanConfigStore } from "@/stores/kanban-config.store";
import { useAuth } from "@/hooks/useAuth";
import {
  FORMULARIO_TIPO_LABELS,
  type FormularioTipo,
} from "@/interfaces/empresa.interface";
import {
  AREA_ESPECIALIDADE_LABELS,
  SENIORIDADE_LABELS,
  type Colaborador,
} from "@/interfaces/colaborador.interface";
import {
  STATUS_DEMANDA_LABELS,
  type StatusDemanda,
} from "@/interfaces/demanda.interface";
import {
  STATUS_PROJETO_LABELS,
  type StatusProjeto,
} from "@/interfaces/projeto.interface";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  ArrowLeft,
  Building2,
  Users,
  FolderKanban,
  LayoutGrid,
  FileText,
  Lightbulb,
  Wrench,
  Target,
  Calendar,
  Plus,
  Eye,
  Hash,
  Briefcase,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";

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

interface EmpresaDetailPageProps {
  params: Promise<{ id: string }>;
}

const EmpresaDetailPage = ({ params }: EmpresaDetailPageProps) => {
  const { id } = use(params);
  const { usuarioId } = useAuth();

  const [showKanbanConfig, setShowKanbanConfig] = useState(false);

  const { getById: getEmpresa } = useEmpresaStore();
  const { getByEmpresa: getColaboradoresByEmpresa, getOcupacao } =
    useColaboradorStore();
  const { getAll: getDemandas } = useDemandaStore();
  const { getByEmpresa: getProjetosByEmpresa } = useProjetoStore();
  const { getConfig: getKanbanConfig } = useKanbanConfigStore();

  const empresa = getEmpresa(id);
  const colaboradores = getColaboradoresByEmpresa(id);

  const demandas = useMemo(
    () => getDemandas().filter((d) => d.empresaUnidadeApoioId === id),
    [getDemandas, id]
  );

  const projetos = useMemo(
    () => getProjetosByEmpresa(id),
    [getProjetosByEmpresa, id]
  );

  if (!empresa) {
    return (
      <Layout title="Empresa não encontrada">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">
            A empresa solicitada não foi encontrada.
          </p>
          <Link href="/empresas" className="mt-4">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar para Empresas
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const tipo = (empresa.formularioTipo ?? "inovacao") as FormularioTipo;
  const BannerIcon = FORMULARIO_TIPO_ICON[tipo];
  const iconColor = FORMULARIO_TIPO_COLOR[tipo];

  const stats = useMemo(
    () => ({
      totalColaboradores: colaboradores.length,
      totalDemandas: demandas.length,
      demandasEmAnalise: demandas.filter(
        (d) =>
          d.status === "em_analise" || d.status === "aguardando_aprovacao"
      ).length,
      totalProjetos: projetos.length,
      projetosAtivos: projetos.filter((p) => p.status === "em_execucao")
        .length,
    }),
    [colaboradores.length, demandas, projetos]
  );

  const colaboradoresPorArea = useMemo(() => {
    const mapa: Record<
      string,
      { area: string; label: string; count: number }
    > = {};

    colaboradores.forEach((colab) => {
      colab.especialidades.forEach((esp) => {
        if (!mapa[esp.area]) {
          mapa[esp.area] = {
            area: esp.area,
            label: AREA_ESPECIALIDADE_LABELS[esp.area],
            count: 0,
          };
        }
        mapa[esp.area].count += 1;
      });
    });

    return Object.values(mapa).sort((a, b) => b.count - a.count);
  }, [colaboradores]);

  const demandasPorStatus = useMemo(() => {
    const mapa: Partial<Record<StatusDemanda, number>> = {};
    demandas.forEach((d) => {
      mapa[d.status] = (mapa[d.status] ?? 0) + 1;
    });
    return Object.entries(mapa) as [StatusDemanda, number][];
  }, [demandas]);

  const projetosPorStatus = useMemo(() => {
    const mapa: Partial<Record<StatusProjeto, number>> = {};
    projetos.forEach((p) => {
      mapa[p.status] = (mapa[p.status] ?? 0) + 1;
    });
    return Object.entries(mapa) as [StatusProjeto, number][];
  }, [projetos]);

  const kanbanConfig = getKanbanConfig(id);

  const colaboradoresColumns: ColumnDef<Colaborador>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: "Nome",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.nome}</p>
            <p className="text-xs text-slate-500">{row.original.cargo}</p>
          </div>
        ),
      },
      {
        accessorKey: "matricula",
        header: "Matrícula",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-slate-400">
            {row.original.matricula}
          </span>
        ),
      },
      {
        id: "especialidades",
        header: "Especialidades",
        cell: ({ row }) => {
          const areas = row.original.especialidades.map(
            (e) => AREA_ESPECIALIDADE_LABELS[e.area]
          );
          return (
            <div className="flex flex-wrap gap-1">
              {areas.slice(0, 2).map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {areas.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{areas.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "senioridade",
        header: "Senioridade",
        cell: ({ row }) => {
          const especialidade = row.original.especialidades[0];
          if (!especialidade)
            return <span className="text-slate-500">-</span>;
          return (
            <Badge variant="info">
              {SENIORIDADE_LABELS[especialidade.senioridade]}
            </Badge>
          );
        },
      },
      {
        id: "ocupacao",
        header: "Ocupação",
        cell: ({ row }) => {
          const ocupacao = getOcupacao(row.original.id);
          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-700">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    ocupacao >= 100
                      ? "bg-red-500"
                      : ocupacao >= 70
                      ? "bg-amber-500"
                      : "bg-green-500"
                  )}
                  style={{ width: `${Math.min(ocupacao, 100)}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  ocupacao >= 100
                    ? "text-red-400"
                    : ocupacao >= 70
                    ? "text-amber-400"
                    : "text-green-400"
                )}
              >
                {ocupacao}%
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link href={`/colaboradores/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        ),
      },
    ],
    [getOcupacao]
  );

  const etapasVisiveis = useMemo(
    () => kanbanConfig.etapas.filter((e) => e.visivel).length,
    [kanbanConfig]
  );

  const kanbanContent = useMemo(
    () => (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {demandas.length === 0
              ? "Nenhuma demanda cadastrada para esta empresa."
              : `${demandas.length} demanda${
                  demandas.length > 1 ? "s" : ""
                } no pipeline`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKanbanConfig(true)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Configurar etapas
              {etapasVisiveis > 0 && (
                <span className="ml-1.5 rounded-full bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">
                  {etapasVisiveis}
                </span>
              )}
            </Button>
            <Link href={`/demandas/empresa/${id}/nova`}>
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Nova Demanda
              </Button>
            </Link>
          </div>
        </div>

        {demandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16 text-center">
            <LayoutGrid className="mb-3 h-10 w-10 text-slate-600" />
            <p className="text-slate-500">
              Nenhuma demanda para exibir no Kanban
            </p>
          </div>
        ) : (
          <KanbanDemandas
            demandas={demandas}
            usuarioId={usuarioId || "demo-user-id"}
            etapasConfig={kanbanConfig.etapas}
          />
        )}
      </div>
    ),
    [demandas, id, usuarioId, kanbanConfig, etapasVisiveis]
  );

  const setoresContent = useMemo(
    () => (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Distribuição por Área de Especialidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {colaboradoresPorArea.length === 0 ? (
              <p className="py-6 text-center text-slate-500">
                Nenhum colaborador cadastrado nesta empresa
              </p>
            ) : (
              <div className="space-y-3">
                {colaboradoresPorArea.map(({ area, label, count }) => {
                  const pct =
                    colaboradores.length > 0
                      ? Math.round((count / colaboradores.length) * 100)
                      : 0;
                  return (
                    <div key={area}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-slate-300">{label}</span>
                        <span className="text-xs text-slate-500">
                          {count} colaborador{count > 1 ? "es" : ""} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Demandas por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {demandasPorStatus.length === 0 ? (
              <p className="py-6 text-center text-slate-500">
                Nenhuma demanda cadastrada
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {demandasPorStatus.map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">
                      {STATUS_DEMANDA_LABELS[status]}
                    </span>
                    <span className="text-lg font-bold text-slate-100">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projetos por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projetosPorStatus.length === 0 ? (
              <p className="py-6 text-center text-slate-500">
                Nenhum projeto cadastrado
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {projetosPorStatus.map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">
                      {STATUS_PROJETO_LABELS[status]}
                    </span>
                    <span className="text-lg font-bold text-slate-100">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    ),
    [
      colaboradoresPorArea,
      colaboradores.length,
      demandasPorStatus,
      projetosPorStatus,
    ]
  );


  const colaboradoresContent = useMemo(
    () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {colaboradores.length === 0
              ? "Nenhum colaborador cadastrado para esta empresa."
              : `${colaboradores.length} colaborador${
                  colaboradores.length > 1 ? "es" : ""
                } ativo${colaboradores.length > 1 ? "s" : ""}`}
          </p>
          <Link href="/colaboradores/novo">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Novo Colaborador
            </Button>
          </Link>
        </div>
        <DataTable
          columns={colaboradoresColumns}
          data={colaboradores}
          searchPlaceholder="Buscar por nome..."
          searchColumn="nome"
        />
      </div>
    ),
    [colaboradores, colaboradoresColumns]
  );

  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "kanban",
        label: "Kanban",
        icon: <LayoutGrid className="h-4 w-4" />,
        content: kanbanContent,
      },
      {
        id: "setores",
        label: "Setores",
        icon: <BarChart3 className="h-4 w-4" />,
        content: setoresContent,
      },
      {
        id: "formulario",
        label: "Formulário",
        icon: <FileText className="h-4 w-4" />,
        content: <FormularioEmpresaTab empresaId={id} />,
      },
      {
        id: "colaboradores",
        label: "Colaboradores",
        icon: <Users className="h-4 w-4" />,
        content: colaboradoresContent,
      },
    ],
    [kanbanContent, setoresContent, colaboradoresContent, id]
  );

  return (
    <Layout
      title={empresa.nome}
      subtitle={
        empresa.setor
          ? `${empresa.setor} · ${empresa.cnpj}`
          : empresa.cnpj
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/empresas">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Voltar para Empresas
          </Button>
        </Link>
        <Badge variant={empresa.ativa ? "success" : "secondary"}>
          {empresa.ativa ? "Ativa" : "Inativa"}
        </Badge>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/40 px-5 py-4">
        <div
          className={cn(
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
            iconColor
          )}
        >
          <BannerIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-slate-100">{empresa.nome}</h2>
            <span className="font-mono text-xs text-slate-500">
              {empresa.cnpj}
            </span>
          </div>
          {empresa.descricao && (
            <p className="mt-0.5 truncate text-sm text-slate-400">
              {empresa.descricao}
            </p>
          )}
        </div>
        <span
          className={cn(
            "hidden flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium sm:flex",
            iconColor,
            "border-current/30"
          )}
        >
          {FORMULARIO_TIPO_LABELS[tipo]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs tabs={tabs} defaultTab="kanban" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="h-4 w-4" />
                    Colaboradores
                  </dt>
                  <dd className="font-medium text-slate-100">
                    {stats.totalColaboradores}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm text-slate-400">
                    <FileText className="h-4 w-4" />
                    Demandas
                  </dt>
                  <dd className="font-medium text-slate-100">
                    {stats.totalDemandas}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm text-slate-400">
                    <FolderKanban className="h-4 w-4" />
                    Projetos
                  </dt>
                  <dd className="font-medium text-slate-100">
                    {stats.totalProjetos}
                  </dd>
                </div>
                {stats.projetosAtivos > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-slate-400">Em execução</dt>
                    <dd>
                      <Badge variant="info">{stats.projetosAtivos}</Badge>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {empresa.setor && (
                  <div>
                    <dt className="text-sm text-slate-400">Setor</dt>
                    <dd className="font-medium text-slate-100">
                      {empresa.setor}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-slate-400">CNPJ</dt>
                  <dd className="font-mono text-slate-300">{empresa.cnpj}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Tipo de Formulário</dt>
                  <dd className="mt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        iconColor,
                        "border-current/30"
                      )}
                    >
                      <BannerIcon className="h-3.5 w-3.5" />
                      {FORMULARIO_TIPO_LABELS[tipo]}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-400">Cadastrada em</dt>
                  <dd className="font-medium text-slate-100">
                    {formatDate(empresa.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">
                    Última atualização
                  </dt>
                  <dd className="text-slate-300">
                    {formatDate(empresa.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/demandas/empresa/${id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  Ver todas as demandas
                </Button>
              </Link>
              <Link href={`/demandas/empresa/${id}/nova`} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Nova demanda
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <KanbanConfigModal
        empresaId={id}
        isOpen={showKanbanConfig}
        onClose={() => setShowKanbanConfig(false)}
      />
    </Layout>
  );
};

export default EmpresaDetailPage;
