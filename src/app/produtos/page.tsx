"use client";

import { useMemo } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useProdutoStore } from "@/stores/produto.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import type { Produto, StatusProduto, ClassificacaoProduto } from "@/interfaces/produto.interface";
import { STATUS_PRODUTO_LABELS, CLASSIFICACAO_PRODUTO_LABELS } from "@/interfaces/produto.interface";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { Package, CheckCircle, Clock, Eye } from "lucide-react";

const statusVariantMap: Record<StatusProduto, BadgeVariant> = {
  em_transicao: "warning",
  em_operacao: "success",
  descontinuado: "secondary",
};

const classificacaoVariantMap: Record<ClassificacaoProduto, BadgeVariant> = {
  mercado_externo: "primary",
  intercompany: "info",
  interno: "secondary",
};

const ProdutosPage = () => {
  const { getAll } = useProdutoStore();
  const { getById: getEmpresa } = useEmpresaStore();
  const produtos = getAll();

  const stats = useMemo(() => {
    const total = produtos.length;
    const emOperacao = produtos.filter((p) => p.status === "em_operacao").length;
    const emTransicao = produtos.filter((p) => p.status === "em_transicao").length;
    const custoTotalDev = produtos.reduce((acc, p) => acc + p.custoDesenvolvimento, 0);

    return { total, emOperacao, emTransicao, custoTotalDev };
  }, [produtos]);

  const columns: ColumnDef<Produto>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: "Produto",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.nome}</p>
            <Badge variant={classificacaoVariantMap[row.original.classificacao]} className="mt-1">
              {CLASSIFICACAO_PRODUTO_LABELS[row.original.classificacao]}
            </Badge>
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
            {STATUS_PRODUTO_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "custoDesenvolvimento",
        header: "Investimento (CAPEX)",
        cell: ({ row }) => formatCurrency(row.original.custoDesenvolvimento),
      },
      {
        accessorKey: "custoOperacaoMensal",
        header: "Custo Mensal (OPEX)",
        cell: ({ row }) => formatCurrency(row.original.custoOperacaoMensal),
      },
      {
        accessorKey: "dataLancamento",
        header: "Lançamento",
        cell: ({ row }) => formatDate(row.original.dataLancamento),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link href={`/produtos/${row.original.id}`}>
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
    <Layout title="Produtos" subtitle="Produtos em operação">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total de Produtos" value={stats.total} icon={Package} />
          <StatCard title="Em Operação" value={stats.emOperacao} icon={CheckCircle} />
          <StatCard title="Em Transição" value={stats.emTransicao} icon={Clock} />
          <StatCard
            title="Investimento Total"
            value={formatCurrency(stats.custoTotalDev)}
            subtitle="CAPEX acumulado"
            icon={Package}
          />
        </div>

        <DataTable
          columns={columns}
          data={produtos}
          searchPlaceholder="Buscar por nome..."
          searchColumn="nome"
        />
      </div>
    </Layout>
  );
};

export default ProdutosPage;
