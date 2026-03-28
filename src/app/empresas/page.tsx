"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { empresaSchema, type EmpresaSchemaType } from "@/schemas/empresa.schema";
import type { Empresa } from "@/interfaces/empresa.interface";
import { formatDate } from "@/utils/formatters";
import { Plus, Building2, Users, FolderKanban, Save, Edit } from "lucide-react";

const EmpresasPage = () => {
  const { getAll, create, update } = useEmpresaStore();
  const { getByEmpresa } = useColaboradorStore();
  const { getByEmpresa: getProjetosByEmpresa } = useProjetoStore();
  const empresas = getAll();

  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmpresaSchemaType>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      ativa: true,
    },
  });

  const handleOpenCreate = () => {
    setEditingEmpresa(null);
    reset({ nome: "", cnpj: "", descricao: "", ativa: true });
    setShowModal(true);
  };

  const handleOpenEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    reset({
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      descricao: empresa.descricao || "",
      ativa: empresa.ativa,
    });
    setShowModal(true);
  };

  const handleFormSubmit = (data: EmpresaSchemaType) => {
    try {
      if (editingEmpresa) {
        update(editingEmpresa.id, data);
        toast.success("Empresa atualizada com sucesso!");
      } else {
        create(data);
        toast.success("Empresa criada com sucesso!");
      }
      setShowModal(false);
      reset();
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
        accessorKey: "descricao",
        header: "Descrição",
        cell: ({ row }) => (
          <p className="text-sm text-slate-400 truncate max-w-xs">
            {row.original.descricao || "-"}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
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
          <Button onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEmpresa ? "Editar Empresa" : "Nova Empresa"}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Nome da Empresa"
            placeholder="Ex: Alpha Tecnologia"
            error={errors.nome?.message}
            {...register("nome")}
          />
          <Input
            label="CNPJ"
            placeholder="00.000.000/0000-00"
            error={errors.cnpj?.message}
            {...register("cnpj")}
          />
          <Textarea
            label="Descrição"
            placeholder="Breve descrição da empresa..."
            rows={3}
            error={errors.descricao?.message}
            {...register("descricao")}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativa"
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
              {...register("ativa")}
            />
            <label htmlFor="ativa" className="text-sm text-slate-300">
              Empresa ativa
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
              {editingEmpresa ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default EmpresasPage;
