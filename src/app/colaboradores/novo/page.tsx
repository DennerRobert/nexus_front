"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EspecialidadeSelector } from "@/components/EspecialidadeSelector";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { colaboradorSchema, type ColaboradorSchemaType } from "@/schemas/colaborador.schema";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const NovoColaboradorPage = () => {
  const router = useRouter();
  const { create } = useColaboradorStore();
  const { getAll: getEmpresas } = useEmpresaStore();
  const empresas = getEmpresas();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ColaboradorSchemaType>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      ativo: true,
      cargaHorariaMensal: 160,
      especialidades: [],
      dataAdmissao: new Date(),
    },
  });

  const handleFormSubmit = (data: ColaboradorSchemaType) => {
    try {
      create({
        ...data,
        dataAdmissao: new Date(data.dataAdmissao),
      });
      toast.success("Colaborador criado com sucesso!");
      router.push("/colaboradores");
    } catch {
      toast.error("Erro ao criar colaborador");
    }
  };

  return (
    <Layout
      title="Novo Colaborador"
      subtitle="Cadastrar um novo profissional"
      actions={
        <Link href="/colaboradores">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </Link>
      }
    >
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
              <Select
                label="Empresa"
                placeholder="Selecione a empresa"
                options={empresas.map((e) => ({ value: e.id, label: e.nome }))}
                error={errors.empresaId?.message}
                {...register("empresaId")}
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
                {...register("dataAdmissao")}
              />
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
