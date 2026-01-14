"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDemandaStore } from "@/stores/demanda.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useProdutoStore } from "@/stores/produto.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useSquadStore } from "@/stores/squad.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { STATUS_DEMANDA_LABELS } from "@/interfaces/demanda.interface";
import { STATUS_PROJETO_LABELS } from "@/interfaces/projeto.interface";
import { formatCurrency, formatRelativeDate } from "@/utils/formatters";
import {
  FileText,
  FolderKanban,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";

const COLORS = ["#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#64748b"];

const DashboardPage = () => {
  const { getAll: getDemandas, getPendentes: getDemandasPendentes } = useDemandaStore();
  const { getAll: getProjetos, getAtivos: getProjetosAtivos } = useProjetoStore();
  const { getAll: getProdutos, getAtivos: getProdutosAtivos } = useProdutoStore();
  const { getComOcupacao } = useColaboradorStore();
  const { getAtivos: getSquadsAtivos } = useSquadStore();
  const { getAll: getEmpresas } = useEmpresaStore();

  const demandas = getDemandas();
  const demandasPendentes = getDemandasPendentes();
  const projetos = getProjetos();
  const projetosAtivos = getProjetosAtivos();
  const produtos = getProdutos();
  const produtosAtivos = getProdutosAtivos();
  const colaboradores = getComOcupacao();
  const squadsAtivos = getSquadsAtivos();
  const empresas = getEmpresas();

  const stats = useMemo(() => {
    const custoMensalTotal = squadsAtivos.reduce((acc, s) => acc + s.custoMensal, 0);
    const ocupacaoMedia =
      colaboradores.length > 0
        ? colaboradores.reduce((acc, c) => acc + c.ocupacaoAtual, 0) / colaboradores.length
        : 0;
    const subalocados = colaboradores.filter((c) => c.ocupacaoAtual < 70).length;

    return { custoMensalTotal, ocupacaoMedia, subalocados };
  }, [squadsAtivos, colaboradores]);

  const ocupacaoPorEmpresa = useMemo(() => {
    return empresas.map((empresa) => {
      const colabs = colaboradores.filter((c) => c.empresaId === empresa.id);
      const ocupacaoMedia =
        colabs.length > 0
          ? colabs.reduce((acc, c) => acc + c.ocupacaoAtual, 0) / colabs.length
          : 0;
      return {
        nome: empresa.nome.split(" ")[0],
        ocupacao: Math.round(ocupacaoMedia),
        colaboradores: colabs.length,
      };
    });
  }, [empresas, colaboradores]);

  const statusDemandas = useMemo(() => {
    const counts: Record<string, number> = {};
    demandas.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_DEMANDA_LABELS[status as keyof typeof STATUS_DEMANDA_LABELS] || status,
      value,
    }));
  }, [demandas]);

  const statusProjetos = useMemo(() => {
    const counts: Record<string, number> = {};
    projetos.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_PROJETO_LABELS[status as keyof typeof STATUS_PROJETO_LABELS] || status,
      value,
    }));
  }, [projetos]);

  return (
    <Layout
      title="Dashboard"
      subtitle="Visão geral do portfólio integrado"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Demandas Pendentes"
            value={demandasPendentes.length}
            subtitle="Aguardando análise/aprovação"
            icon={FileText}
          />
          <StatCard
            title="Projetos Ativos"
            value={projetosAtivos.length}
            subtitle={`De ${projetos.length} total`}
            icon={FolderKanban}
          />
          <StatCard
            title="Produtos em Operação"
            value={produtosAtivos.length}
            subtitle={`De ${produtos.length} total`}
            icon={Package}
          />
          <StatCard
            title="Custo Mensal"
            value={formatCurrency(stats.custoMensalTotal)}
            subtitle="Squads ativos"
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ocupação por Empresa</CardTitle>
              <CardDescription>Média de ocupação dos colaboradores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ocupacaoPorEmpresa}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="nome" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Bar dataKey="ocupacao" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status das Demandas</CardTitle>
              <CardDescription>Distribuição por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDemandas}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDemandas.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {statusDemandas.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-slate-400">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recursos Humanos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Total de Colaboradores</dt>
                  <dd className="font-medium text-slate-100">{colaboradores.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Ocupação Média</dt>
                  <dd className="font-medium text-cyan-400">
                    {stats.ocupacaoMedia.toFixed(0)}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Subalocados (&lt;70%)</dt>
                  <dd className="font-medium text-yellow-400">{stats.subalocados}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Squads Ativos</dt>
                  <dd className="font-medium text-slate-100">{squadsAtivos.length}</dd>
                </div>
              </dl>
              <Link href="/colaboradores" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Colaboradores
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Demandas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {demandas.slice(0, 3).map((demanda) => (
                <Link
                  key={demanda.id}
                  href={`/demandas/${demanda.id}`}
                  className="mb-3 block rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 transition-colors hover:bg-slate-800"
                >
                  <p className="font-medium text-slate-100 truncate">
                    {demanda.titulo}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {STATUS_DEMANDA_LABELS[demanda.status]}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatRelativeDate(demanda.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
              <Link href="/demandas" className="mt-2 block">
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.subalocados > 0 && (
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <p className="text-sm text-yellow-400">
                      {stats.subalocados} colaborador(es) com ocupação abaixo de 70%
                    </p>
                  </div>
                )}
                {demandasPendentes.length > 0 && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                    <p className="text-sm text-blue-400">
                      {demandasPendentes.length} demanda(s) aguardando análise
                    </p>
                  </div>
                )}
                {projetosAtivos.filter((p) => p.status === "aguardando_aprovacao").length >
                  0 && (
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
                    <p className="text-sm text-orange-400">
                      {
                        projetosAtivos.filter((p) => p.status === "aguardando_aprovacao")
                          .length
                      }{" "}
                      projeto(s) aguardando aprovação
                    </p>
                  </div>
                )}
                {stats.subalocados === 0 &&
                  demandasPendentes.length === 0 &&
                  projetosAtivos.filter((p) => p.status === "aguardando_aprovacao")
                    .length === 0 && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                      <p className="text-sm text-green-400">
                        Nenhum alerta no momento
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
