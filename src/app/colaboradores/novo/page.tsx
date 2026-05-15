"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EspecialidadeSelector } from "@/components/EspecialidadeSelector";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useSetorStore } from "@/stores/setor.store";
import { colaboradorSchema, type ColaboradorSchemaType } from "@/schemas/colaborador.schema";
import { ArrowLeft, Save, Building2, Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { coerceDate } from "@/utils/formatters";

const NovoColaboradorPage = () => {
  const router = useRouter();
  const { create } = useColaboradorStore();
  const { getAll: getEmpresas } = useEmpresaStore();
  const { getAtivos: getSetores } = useSetorStore();
  const empresas = getEmpresas();
  const setores = getSetores();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ColaboradorSchemaType>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      ativo: true,
      cargaHorariaMensal: 160,
      especialidades: [],
      dataAdmissao: new Date(),
      empresaIds: [],
      setorIds: [],
    },
  });

  const watchedEmpresaIds = watch("empresaIds") || [];
  const watchedSetorIds = watch("setorIds") || [];

  const handleToggleEmpresa = (empresaId: string) => {
    const current = watchedEmpresaIds;
    const updated = current.includes(empresaId)
      ? current.filter((id) => id !== empresaId)
      : [...current, empresaId];
    setValue("empresaIds", updated, { shouldValidate: true });
  };

  const handleToggleSetor = (setorId: string) => {
    const current = watchedSetorIds;
    const updated = current.includes(setorId)
      ? current.filter((id) => id !== setorId)
      : [...current, setorId];
    setValue("setorIds", updated);
  };

  const handleFormSubmit = async (data: ColaboradorSchemaType) => {
    const result = await create({
      ...data,
      dataAdmissao: new Date(data.dataAdmissao),
    });

    if (!result) {
      toast.error("Erro ao criar colaborador. Tente novamente.");
      return;
    }

    toast.success("Colaborador criado com sucesso!");
    router.push("/colaboradores");
  };

  return (
    <Layout
      title="Novo Colaborador"
      subtitle="Cadastrar um novo profissional"
    >
      <div className="mb-6">
        <Link href="/colaboradores">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para Colaboradores
          </Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nome Completo"
                placeholder="Digite o nome completo"
                error={errors.nome?.message}
                {...register("nome")}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="email@empresa.com.br"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Matrícula"
                placeholder="MAT0001"
                error={errors.matricula?.message}
                {...register("matricula")}
              />
              <Input
                label="Cargo"
                placeholder="Ex: Desenvolvedor Backend"
                error={errors.cargo?.message}
                {...register("cargo")}
              />
              <Input
                label="Data de Admissão"
                type="date"
                error={errors.dataAdmissao?.message}
                {...register("dataAdmissao", { setValueAs: coerceDate })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Empresas — N para N */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresas
              <span className="text-sm font-normal text-slate-400">(pode pertencer a várias)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {empresas.map((empresa) => {
                const isSelected = watchedEmpresaIds.includes(empresa.id);
                return (
                  <button
                    key={empresa.id}
                    type="button"
                    onClick={() => handleToggleEmpresa(empresa.id)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                        : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                    )}
                    aria-pressed={isSelected}
                  >
                    {empresa.nome}
                  </button>
                );
              })}
            </div>
            {errors.empresaIds && (
              <p className="mt-2 text-sm text-red-400">{errors.empresaIds.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Setores — N para N */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Setores
              <span className="text-sm font-normal text-slate-400">(pode pertencer a vários)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {setores.map((setor) => {
                const isSelected = watchedSetorIds.includes(setor.id);
                return (
                  <button
                    key={setor.id}
                    type="button"
                    onClick={() => handleToggleSetor(setor.id)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      isSelected
                        ? "border-violet-500 bg-violet-500/20 text-violet-300"
                        : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                    )}
                    aria-pressed={isSelected}
                  >
                    {setor.nome}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Especialidades e Tecnologias</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="especialidades"
              control={control}
              render={({ field }) => (
                <EspecialidadeSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.especialidades?.message}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Financeiras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Custo/Hora (R$)"
                type="number"
                step="0.01"
                placeholder="150.00"
                error={errors.custoHora?.message}
                {...register("custoHora", { valueAsNumber: true })}
              />
              <Input
                label="Carga Horária Mensal"
                type="number"
                placeholder="160"
                error={errors.cargaHorariaMensal?.message}
                {...register("cargaHorariaMensal", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/colaboradores">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Salvar Colaborador
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default NovoColaboradorPage;
