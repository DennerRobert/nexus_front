"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { EmpresaFormModal } from "@/components/EmpresaFormModal";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useProjetoStore } from "@/stores/projeto.store";
import type { Empresa, EmpresaFormData } from "@/interfaces/empresa.interface";
import { formatDate } from "@/utils/formatters";
import { Plus, Building2, Users, FolderKanban, Edit, Eye } from "lucide-react";

const EmpresasPage = () => {
  const { getAll, create, update } = useEmpresaStore();
  const { getByEmpresa } = useColaboradorStore();
  const { getByEmpresa: getProjetosByEmpresa } = useProjetoStore();
  const empresas = getAll();

  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  const handleOpenCreate = () => {
    setEditingEmpresa(null);
    setShowModal(true);
  };

  const handleOpenEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setShowModal(true);
  };

  const handleSalvar = (data: EmpresaFormData) => {
    try {
      if (editingEmpresa) {
        update(editingEmpresa.id, data);
        toast.success("Empresa atualizada com sucesso!");
      } else {
        create(data);
        toast.success("Empresa criada com sucesso!");
      }
      setShowModal(false);
    } catch {
      toast.error("Erro ao salvar empresa");
    }
  };

  const stats = useMemo(() => {
    const total = empresas.length;
    const ativas = empresas.filter((e) => e.ativa).length;
    const totalColaboradores = empresas.reduce(
      (acc, e) => acc + getByEmpresa(e.id).length,
      0
    );
    const totalProjetos = empresas.reduce(
      (acc, e) => acc + getProjetosByEmpresa(e.id).length,
      0
    );
    return { total, ativas, totalColaboradores, totalProjetos };
  }, [empresas, getByEmpresa, getProjetosByEmpresa]);

  const columns: ColumnDef<Empresa>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: "Nome",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.nome}</p>
            <p className="text-xs text-slate-500">{row.original.cnpj}</p>
          </div>
        ),
      },
      {
        accessorKey: "setor",
        header: "Setor",
        cell: ({ row }) => (
          <p className="text-sm text-slate-400">
            {row.original.setor || "-"}
          </p>
        ),
      },
      {
        id: "colaboradores",
        header: "Colaboradores",
        cell: ({ row }) => {
          const count = getByEmpresa(row.original.id).length;
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span>{count}</span>
            </div>
          );
        },
      },
      {
        id: "projetos",
        header: "Projetos",
        cell: ({ row }) => {
          const count = getProjetosByEmpresa(row.original.id).length;
          return (
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-slate-400" />
              <span>{count}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "ativa",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.ativa ? "success" : "secondary"}>
            {row.original.ativa ? "Ativa" : "Inativa"}
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
          <div className="flex items-center gap-1">
            <Link href={`/empresas/${row.original.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [getByEmpresa, getProjetosByEmpresa]
  );

  return (
    <Layout
      title="Empresas"
      subtitle="Gestão das empresas do grupo econômico"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={handleOpenCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Nova Empresa
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total de Empresas" value={stats.total} icon={Building2} />
          <StatCard title="Empresas Ativas" value={stats.ativas} icon={Building2} />
          <StatCard
            title="Total Colaboradores"
            value={stats.totalColaboradores}
            icon={Users}
          />
          <StatCard
            title="Total Projetos"
            value={stats.totalProjetos}
            icon={FolderKanban}
          />
        </div>

        <DataTable
          columns={columns}
          data={empresas}
          searchPlaceholder="Buscar por nome..."
          searchColumn="nome"
        />
      </div>

      <EmpresaFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        empresa={editingEmpresa ?? undefined}
        onSalvar={handleSalvar}
      />
    </Layout>
  );
};

export default EmpresasPage;
