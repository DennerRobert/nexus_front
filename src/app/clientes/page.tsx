"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Layout } from "@/components/Layout";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useClienteStore } from "@/stores/cliente.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { clienteSchema, type ClienteSchemaType } from "@/schemas/cliente.schema";
import type { Cliente, OrigemCliente } from "@/interfaces/cliente.interface";
import {
  ORIGEM_CLIENTE_LABELS,
  NATUREZA_JURIDICA_LABELS,
  MODELO_RECEITA_LABELS,
} from "@/interfaces/cliente.interface";
import { formatDate } from "@/utils/formatters";
import { Plus, Briefcase, Building2, Users, Save, Edit } from "lucide-react";

const origemVariantMap: Record<OrigemCliente, BadgeVariant> = {
  externo: "primary",
  interno: "info",
  investimento_interno: "secondary",
};

const ClientesPage = () => {
  const { create, update } = useClienteStore();
  const todosClientes = useClienteStore((s) => s.clientes);
  const clientes = useMemo(() => todosClientes.filter((c) => c.ativo), [todosClientes]);
  const todasEmpresas = useEmpresaStore((s) => s.empresas);
  const empresas = useMemo(() => todasEmpresas.filter((e) => e.ativa), [todasEmpresas]);

  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isClienteInterno, setIsClienteInterno] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ClienteSchemaType>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      ativo: true,
      origem: "externo",
    },
  });

  const origem = watch("origem");

  const handleClienteInternoToggle = (checked: boolean) => {
    setIsClienteInterno(checked);
    if (checked) {
      setValue("origem", "interno");
    } else {
      setValue("origem", "externo");
      setValue("empresaId", undefined);
    }
  };

  const handleEmpresaInternaSelect = (empresaId: string) => {
    const empresa = empresas.find((e) => e.id === empresaId);
    if (!empresa) return;

    setValue("empresaId", empresaId);
    setValue("nome", empresa.nome);
    setValue("cnpj", empresa.cnpj ?? "");
    setValue("email", empresa.email ?? "");
    setValue("telefone", empresa.telefone ?? "");
    setValue("modeloReceita", "rateio_custo");
  };

  const handleOpenCreate = () => {
    setEditingCliente(null);
    setIsClienteInterno(false);
    reset({ nome: "", origem: "externo", ativo: true });
    setShowModal(true);
  };

  const handleOpenEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    const interno = cliente.origem === "interno" || cliente.origem === "investimento_interno";
    setIsClienteInterno(interno);
    reset({
      nome: cliente.nome,
      origem: cliente.origem,
      empresaId: cliente.empresaId,
      naturezaJuridica: cliente.naturezaJuridica,
      cnpj: cliente.cnpj || "",
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      modeloReceita: cliente.modeloReceita,
      ativo: cliente.ativo,
    });
    setShowModal(true);
  };

  const handleFormSubmit = (data: ClienteSchemaType) => {
    try {
      if (editingCliente) {
        update(editingCliente.id, data);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        create(data);
        toast.success("Cliente criado com sucesso!");
      }
      setShowModal(false);
      reset();
    } catch {
      toast.error("Erro ao salvar cliente");
    }
  };

  const stats = useMemo(() => {
    const total = clientes.length;
    const externos = clientes.filter((c) => c.origem === "externo").length;
    const internos = clientes.filter((c) => c.origem === "interno").length;
    const ativos = clientes.filter((c) => c.ativo).length;

    return { total, externos, internos, ativos };
  }, [clientes]);

  const columns: ColumnDef<Cliente>[] = useMemo(
    () => [
      {
        accessorKey: "nome",
        header: "Nome",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-100">{row.original.nome}</p>
            {row.original.cnpj && (
              <p className="text-xs text-slate-500">{row.original.cnpj}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "origem",
        header: "Origem",
        cell: ({ row }) => (
          <Badge variant={origemVariantMap[row.original.origem]}>
            {ORIGEM_CLIENTE_LABELS[row.original.origem]}
          </Badge>
        ),
      },
      {
        accessorKey: "naturezaJuridica",
        header: "Natureza Jurídica",
        cell: ({ row }) =>
          row.original.naturezaJuridica
            ? NATUREZA_JURIDICA_LABELS[row.original.naturezaJuridica]
            : "-",
      },
      {
        accessorKey: "modeloReceita",
        header: "Modelo de Receita",
        cell: ({ row }) =>
          row.original.modeloReceita
            ? MODELO_RECEITA_LABELS[row.original.modeloReceita]
            : "-",
      },
      {
        accessorKey: "ativo",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.ativo ? "success" : "secondary"}>
            {row.original.ativo ? "Ativo" : "Inativo"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Criado em",
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
    []
  );

  return (
    <Layout
      title="Clientes"
      subtitle="Gestão de clientes e modelos de receita"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Novo Cliente
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total de Clientes" value={stats.total} icon={Briefcase} />
          <StatCard title="Clientes Externos" value={stats.externos} icon={Building2} />
          <StatCard title="Clientes Internos" value={stats.internos} icon={Users} />
          <StatCard title="Clientes Ativos" value={stats.ativos} icon={Briefcase} />
        </div>

        <DataTable
          columns={columns}
          data={clientes}
          searchPlaceholder="Buscar por nome..."
          searchColumn="nome"
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCliente ? "Editar Cliente" : "Novo Cliente"}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

          {/* ─── Checkbox: Cliente Interno ─────────────────────────────────── */}
          {!editingCliente && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
              <label
                htmlFor="clienteInterno"
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300 hover:text-slate-100"
              >
                <input
                  type="checkbox"
                  id="clienteInterno"
                  checked={isClienteInterno}
                  onChange={(e) => handleClienteInternoToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="font-medium">Cliente interno</span>
                <span className="text-slate-500">— vinculado a uma empresa do grupo</span>
              </label>
            </div>
          )}

          {/* ─── Select de empresa interna ─────────────────────────────────── */}
          {isClienteInterno && !editingCliente && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Empresa interna
              </label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                defaultValue=""
                onChange={(e) => handleEmpresaInternaSelect(e.target.value)}
                aria-label="Selecione a empresa interna"
              >
                <option value="" disabled className="bg-slate-800">
                  Selecione uma empresa...
                </option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id} className="bg-slate-800">
                    {empresa.nome}
                  </option>
                ))}
              </select>
              {errors.empresaId && (
                <p className="mt-1.5 text-sm text-red-400">{errors.empresaId.message}</p>
              )}
            </div>
          )}

          <Input
            label="Nome do Cliente"
            placeholder="Ex: Varejo ABC"
            error={errors.nome?.message}
            {...register("nome")}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Origem"
              options={Object.entries(ORIGEM_CLIENTE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              error={errors.origem?.message}
              {...register("origem")}
            />

            {origem === "externo" && (
              <Select
                label="Natureza Jurídica"
                placeholder="Selecione..."
                options={Object.entries(NATUREZA_JURIDICA_LABELS).map(
                  ([value, label]) => ({
                    value,
                    label,
                  })
                )}
                error={errors.naturezaJuridica?.message}
                {...register("naturezaJuridica")}
              />
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              error={errors.cnpj?.message}
              {...register("cnpj")}
            />
            <Select
              label="Modelo de Receita"
              placeholder="Selecione..."
              options={Object.entries(MODELO_RECEITA_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              error={errors.modeloReceita?.message}
              {...register("modeloReceita")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="E-mail"
              type="email"
              placeholder="contato@cliente.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              error={errors.telefone?.message}
              {...register("telefone")}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
              {...register("ativo")}
            />
            <label htmlFor="ativo" className="text-sm text-slate-300">
              Cliente ativo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
              {editingCliente ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ClientesPage;
