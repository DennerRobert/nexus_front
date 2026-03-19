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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDemandaStore } from "@/stores/demanda.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { STATUS_DEMANDA_LABELS } from "@/interfaces/demanda.interface";
import { ETAPA_DEMANDA_LABELS } from "@/interfaces/etapa-demanda.interface";
import { formatRelativeDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  rascunho: "#64748b",
  em_analise: "#06b6d4",
  aguardando_aprovacao: "#f59e0b",
  aprovada: "#22c55e",
  em_ajustes: "#f97316",
  rejeitada: "#ef4444",
  convertida: "#8b5cf6",
};

const DashboardPage = () => {
  const { getAll: getDemandas, getPendentes: getDemandasPendentes } = useDemandaStore();
  const { getAll: getEmpresas } = useEmpresaStore();

  const demandas = getDemandas();
  const demandasPendentes = getDemandasPendentes();
  const empresas = getEmpresas().filter((e) => e.ativa);

  const statCards = useMemo(() => {
    const total = demandas.length;
    const emAnalise = demandas.filter((d) => d.status === "em_analise").length;
    const aguardando = demandas.filter((d) => d.status === "aguardando_aprovacao").length;
    const aprovadas = demandas.filter(
      (d) => d.status === "aprovada" || d.status === "convertida"
    ).length;
    return { total, emAnalise, aguardando, aprovadas };
  }, [demandas]);

  const statusDemandas = useMemo(() => {
    const counts: Record<string, number> = {};
    demandas.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_DEMANDA_LABELS[status as keyof typeof STATUS_DEMANDA_LABELS] || status,
      value,
      color: STATUS_COLORS[status] || "#64748b",
    }));
  }, [demandas]);

  const demandasPorEmpresa = useMemo(() => {
    return empresas.map((empresa) => {
      const total = demandas.filter((d) => d.empresaUnidadeApoioId === empresa.id).length;
      const pendentes = demandas.filter(
        (d) =>
          d.empresaUnidadeApoioId === empresa.id &&
          (d.status === "em_analise" || d.status === "aguardando_aprovacao")
      ).length;
      return {
        nome: empresa.nome.split(" ")[0],
        total,
        pendentes,
      };
    });
  }, [empresas, demandas]);

  const etapasDemandas = useMemo(() => {
    const counts: Record<string, number> = {};
    demandas.forEach((d) => {
      counts[d.etapa] = (counts[d.etapa] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([etapa, total]) => ({
        etapa: ETAPA_DEMANDA_LABELS[etapa as keyof typeof ETAPA_DEMANDA_LABELS] || etapa,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [demandas]);

  return (
    <Layout
      title="Dashboard"
      subtitle="Acompanhe o status e evolução das demandas"
    >
      <div className="space-y-6">
        {/* Stat cards de demandas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/40 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700/60">
              <FileText className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{statCards.total}</p>
              <p className="text-sm text-slate-500">Total de demandas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20">
              <Clock className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">{statCards.emAnalise}</p>
              <p className="text-sm text-slate-500">Em análise</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{statCards.aguardando}</p>
              <p className="text-sm text-slate-500">Aguardando aprovação</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{statCards.aprovadas}</p>
              <p className="text-sm text-slate-500">Aprovadas</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-400" />
                Demandas por Empresa
              </CardTitle>
              <CardDescription>Total e pendentes por empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demandasPorEmpresa} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="nome" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Bar dataKey="total" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Total" />
                    <Bar dataKey="pendentes" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pendentes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-400" />
                Distribuição por Status
              </CardTitle>
              <CardDescription>Visão geral do funil de demandas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDemandas}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusDemandas.map((item, index) => (
                        <Cell key={`cell-${index}`} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {statusDemandas.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-400">
                      {item.name} <span className="font-medium text-slate-300">({item.value})</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Etapas + Recentes */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Demandas por Etapa do Fluxo</CardTitle>
              <CardDescription>Distribuição no pipeline de análise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={etapasDemandas} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="etapa"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      width={160}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Demandas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" />
                Demandas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demandas.slice(0, 4).map((demanda) => (
                  <Link
                    key={demanda.id}
                    href={`/demandas/${demanda.id}`}
                    className="block rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 transition-colors hover:bg-slate-800"
                  >
                    <p className="truncate text-sm font-medium text-slate-100">
                      {demanda.titulo}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {STATUS_DEMANDA_LABELS[demanda.status]}
                      </Badge>
                      <span className="text-xs text-slate-600">
                        {formatRelativeDate(demanda.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/demandas" className="mt-4 block">
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de demandas pendentes */}
        {demandasPendentes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                Atenção necessária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demandasPendentes.slice(0, 3).map((demanda) => (
                  <Link
                    key={demanda.id}
                    href={`/demandas/${demanda.id}`}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-800",
                      demanda.status === "aguardando_aprovacao"
                        ? "border-yellow-500/30 bg-yellow-500/5"
                        : "border-blue-500/30 bg-blue-500/5"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {demanda.titulo}
                      </p>
                      <p className="text-xs text-slate-500">
                        {STATUS_DEMANDA_LABELS[demanda.status]} · {formatRelativeDate(demanda.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="ml-3 h-4 w-4 flex-shrink-0 text-slate-500" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
