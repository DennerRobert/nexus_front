"use client";

import { use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EspecialidadeSelector } from "@/components/EspecialidadeSelector";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useSetorStore } from "@/stores/setor.store";
import { useAlocacaoStore } from "@/stores/alocacao.store";
import { useSquadStore } from "@/stores/squad.store";
import { colaboradorSchema, type ColaboradorSchemaType } from "@/schemas/colaborador.schema";
import {
  SENIORIDADE_LABELS,
  SENIORIDADE_ABREV,
  AREA_ESPECIALIDADE_LABELS,
  TECNOLOGIA_LABELS,
} from "@/interfaces/colaborador.interface";
import { PAPEL_ALOCACAO_LABELS, STATUS_ALOCACAO_LABELS } from "@/interfaces/alocacao.interface";
import { formatCurrency, formatDate, formatPercent, coerceDate } from "@/utils/formatters";
import {
  ArrowLeft,
  Save,
  Edit,
  User,
  Briefcase,
  Building2,
  Code,
  Layers,
  Star,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface ColaboradorDetailPageProps {
  params: Promise<{ id: string }>;
}

const ColaboradorDetailPage = ({ params }: ColaboradorDetailPageProps) => {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";

  const { getById, update, getOcupacao, getDisponibilidade } = useColaboradorStore();
  const { getAll: getEmpresas, getById: getEmpresa } = useEmpresaStore();
  const { getAtivos: getSetores, getById: getSetor } = useSetorStore();
  const { getByColaborador } = useAlocacaoStore();
  const { getById: getSquad } = useSquadStore();

  const colaborador = getById(id);
  const empresas = getEmpresas();
  const setores = getSetores();
  const alocacoes = getByColaborador(id);
  const ocupacao = getOcupacao(id);
  const disponibilidade = getDisponibilidade(id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ColaboradorSchemaType>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: colaborador
      ? {
          ...colaborador,
          dataAdmissao: colaborador.dataAdmissao,
        }
      : undefined,
  });

  const watchedEmpresaIds = watch("empresaIds") || [];
  const watchedSetorIds = watch("setorIds") || [];

  const handleToggleEmpresa = (empresaId: string) => {
    const current = watchedEmpresaIds;
    const updated = current.includes(empresaId)
      ? current.filter((eid) => eid !== empresaId)
      : [...current, empresaId];
    setValue("empresaIds", updated, { shouldValidate: true });
  };

  const handleToggleSetor = (setorId: string) => {
    const current = watchedSetorIds;
    const updated = current.includes(setorId)
      ? current.filter((sid) => sid !== setorId)
      : [...current, setorId];
    setValue("setorIds", updated);
  };

  const handleFormSubmit = async (data: ColaboradorSchemaType) => {
    const result = await update(id, {
      ...data,
      dataAdmissao: new Date(data.dataAdmissao),
    });

    if (!result) {
      toast.error("Erro ao atualizar colaborador. Tente novamente.");
      return;
    }

    toast.success("Colaborador atualizado com sucesso!");
    router.push(`/colaboradores/${id}`);
  };

  const alocacoesComSquad = useMemo(() => {
    return alocacoes.map((alocacao) => ({
      ...alocacao,
      squad: getSquad(alocacao.squadId),
    }));
  }, [alocacoes, getSquad]);

  if (!colaborador) {
    return (
      <Layout title="Colaborador não encontrado">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-400">O colaborador solicitado não foi encontrado.</p>
          <Link href="/colaboradores" className="mt-4">
            <Button variant="outline">Voltar para lista</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (isEditing) {
    return (
      <Layout
        title={`Editar: ${colaborador.nome}`}
        subtitle="Atualizar informações do colaborador"
      >
        <div className="mb-6 flex justify-start">
          <Link href={`/colaboradores/${id}`}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Cancelar edição
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
                  error={errors.nome?.message}
                  {...register("nome")}
                />
                <Input
                  label="E-mail"
                  type="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Matrícula"
                  error={errors.matricula?.message}
                  {...register("matricula")}
                />
                <Input
                  label="Cargo"
                  error={errors.cargo?.message}
                  {...register("cargo")}
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
                  error={errors.custoHora?.message}
                  {...register("custoHora", { valueAsNumber: true })}
                />
                <Input
                  label="Carga Horária Mensal"
                  type="number"
                  error={errors.cargaHorariaMensal?.message}
                  {...register("cargaHorariaMensal", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/colaboradores/${id}`}>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Layout>
    );
  }

  const empresasDoColaborador = (colaborador.empresaIds || [])
    .map((eid) => getEmpresa(eid))
    .filter(Boolean);

  const setoresDoColaborador = (colaborador.setorIds || [])
    .map((sid) => getSetor(sid))
    .filter(Boolean);

  return (
    <Layout
      title={colaborador.nome}
      subtitle={colaborador.cargo}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/colaboradores">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para Colaboradores
          </Button>
        </Link>
        <Link href={`/colaboradores/${id}?edit=true`}>
          <Button size="sm" leftIcon={<Edit className="h-4 w-4" />}>Editar</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-400">E-mail</dt>
                  <dd className="text-slate-100">{colaborador.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Matrícula</dt>
                  <dd className="text-slate-100">{colaborador.matricula}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Data de Admissão</dt>
                  <dd className="text-slate-100">
                    {formatDate(colaborador.dataAdmissao)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Empresas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresas
              </CardTitle>
              <CardDescription>
                {empresasDoColaborador.length} empresa(s) vinculada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {empresasDoColaborador.length === 0 ? (
                <p className="text-slate-500">Nenhuma empresa vinculada</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {empresasDoColaborador.map((empresa) => (
                    <div
                      key={empresa!.id}
                      className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2"
                    >
                      <p className="font-medium text-cyan-300">{empresa!.nome}</p>
                      {empresa!.setor && (
                        <p className="text-xs text-slate-400">{empresa!.setor}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setores */}
          {setoresDoColaborador.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Setores
                </CardTitle>
                <CardDescription>
                  {setoresDoColaborador.length} setor(es) vinculado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {setoresDoColaborador.map((setor) => (
                    <div
                      key={setor!.id}
                      className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2"
                    >
                      <p className="font-medium text-violet-300">{setor!.nome}</p>
                      {setor!.descricao && (
                        <p className="text-xs text-slate-400">{setor!.descricao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Especialidades e Tecnologias
              </CardTitle>
              <CardDescription>
                {colaborador.especialidades.length} especialidade(s) cadastrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {colaborador.especialidades.map((esp, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="primary">
                        {AREA_ESPECIALIDADE_LABELS[esp.area]}
                      </Badge>
                      <Badge variant="secondary">
                        {SENIORIDADE_LABELS[esp.senioridade]}
                      </Badge>
                    </div>

                    {/* Framework Principal */}
                    <div className="mb-3">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-400">
                        <Star className="h-3 w-3" />
                        Framework Principal
                      </p>
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300">
                        {TECNOLOGIA_LABELS[esp.frameworkPrincipal]}
                      </span>
                    </div>

                    {/* Tecnologias em Geral */}
                    {(esp.tecnologias.length > 0 || (esp.tecnologiasCustom && esp.tecnologiasCustom.length > 0)) && (
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-400">
                          Tecnologias em Geral
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {esp.tecnologias.map((tech) => (
                            <span
                              key={tech}
                              className="rounded bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300"
                            >
                              {TECNOLOGIA_LABELS[tech]}
                            </span>
                          ))}
                          {esp.tecnologiasCustom?.map((tech) => (
                            <span
                              key={tech}
                              className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Alocações Atuais
              </CardTitle>
              <CardDescription>
                {alocacoesComSquad.length} alocação(ões) encontrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alocacoesComSquad.length === 0 ? (
                <p className="text-slate-500">Nenhuma alocação ativa</p>
              ) : (
                <div className="space-y-3">
                  {alocacoesComSquad.map((alocacao) => (
                    <div
                      key={alocacao.id}
                      className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
                    >
                      <div>
                        <p className="font-medium text-slate-100">
                          {alocacao.squad?.nome || "Squad não encontrado"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {PAPEL_ALOCACAO_LABELS[alocacao.papel]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-cyan-400">
                          {formatPercent(alocacao.percentual)}
                        </p>
                        <Badge
                          variant={
                            alocacao.status === "ativa" ? "success" : "secondary"
                          }
                        >
                          {STATUS_ALOCACAO_LABELS[alocacao.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ocupação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">Ocupação Atual</span>
                    <span className="font-medium text-slate-100">
                      {formatPercent(ocupacao)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full transition-all ${
                        ocupacao < 70
                          ? "bg-yellow-500"
                          : ocupacao > 100
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(ocupacao, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">Disponibilidade</span>
                    <span className="font-medium text-cyan-400">
                      {formatPercent(disponibilidade)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {colaborador.especialidades.map((esp, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="text-slate-300">
                        {AREA_ESPECIALIDADE_LABELS[esp.area]}
                      </span>
                      <p className="text-xs text-amber-400/70">
                        {TECNOLOGIA_LABELS[esp.frameworkPrincipal]}
                      </p>
                    </div>
                    <Badge variant="primary" className="text-xs">
                      {SENIORIDADE_ABREV[esp.senioridade]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Custo/Hora</dt>
                  <dd className="font-medium text-slate-100">
                    {formatCurrency(colaborador.custoHora)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Carga Horária</dt>
                  <dd className="font-medium text-slate-100">
                    {colaborador.cargaHorariaMensal}h/mês
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-700/50 pt-3">
                  <dt className="text-slate-400">Custo Mensal Total</dt>
                  <dd className="font-medium text-cyan-400">
                    {formatCurrency(
                      colaborador.custoHora * colaborador.cargaHorariaMensal
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ColaboradorDetailPage;
