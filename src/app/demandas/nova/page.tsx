"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useDemandaStore } from "@/stores/demanda.store";
import { useClienteStore } from "@/stores/cliente.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { demandaSchema, type DemandaSchemaType } from "@/schemas/demanda.schema";
import {
  ESTAGIO_IDEIA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
  EXISTE_SOLUCAO_MERCADO_LABELS,
} from "@/interfaces/demanda.interface";
import { ArrowLeft, Send, Lightbulb } from "lucide-react";

const NovaDemandaPage = () => {
  const router = useRouter();
  const { create, updateStatus } = useDemandaStore();
  const { getAll: getClientes } = useClienteStore();
  const { getAll: getEmpresas } = useEmpresaStore();
  const clientes = getClientes();
  const empresas = getEmpresas();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DemandaSchemaType>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      clienteIds: [],
    },
  });

  const clienteIdsSelecionados = watch("clienteIds") || [];
  const existeSolucaoMercado = watch("existeSolucaoMercado");

  const handleToggleCliente = (clienteId: string) => {
    const current = clienteIdsSelecionados;
    const updated = current.includes(clienteId)
      ? current.filter((id) => id !== clienteId)
      : [...current, clienteId];
    setValue("clienteIds", updated as [string, ...string[]]);
  };

  const handleFormSubmit = (data: DemandaSchemaType) => {
    try {
      const demanda = create(
        {
          ...data,
          prazoDesejado: new Date(data.prazoDesejado),
        },
        "demo-user-id"
      );
      
      // Enviar para análise automaticamente
      updateStatus(demanda.id, "em_analise");
      
      toast.success("Ideia de inovação submetida com sucesso!");
      router.push(`/demandas/${demanda.id}`);
    } catch {
      toast.error("Erro ao submeter ideia");
    }
  };

  return (
    <Layout
      title="Submissão de Ideias de Inovação"
      subtitle="Cadastre uma nova ideia ou oportunidade de inovação"
      actions={
        <Link href="/demandas">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Identificação do Proponente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Identificação do Proponente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nome do Proponente"
                placeholder="Seu nome completo"
                error={errors.nomeProponente?.message}
                {...register("nomeProponente")}
              />
              <Select
                label="Empresa/Unidade de Apoio"
                placeholder="Selecione a empresa"
                options={empresas.map((e) => ({ value: e.id, label: e.nome }))}
                error={errors.empresaUnidadeApoioId?.message}
                {...register("empresaUnidadeApoioId")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações da Ideia */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Ideia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Título da Ideia"
              placeholder="Dê um título claro e objetivo para sua ideia"
              error={errors.titulo?.message}
              {...register("titulo")}
            />
            <Select
              label="Estágio da Ideia"
              placeholder="Em que estágio está sua ideia?"
              options={Object.entries(ESTAGIO_IDEIA_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              error={errors.estagioIdeia?.message}
              {...register("estagioIdeia")}
            />
          </CardContent>
        </Card>

        {/* Problema e Contexto */}
        <Card>
          <CardHeader>
            <CardTitle>Problema e Contexto</CardTitle>
            <CardDescription>
              Descreva o problema que sua ideia pretende resolver
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Qual problema esta ideia pretende resolver?"
              placeholder="Descreva detalhadamente o problema identificado..."
              rows={4}
              error={errors.problemaResolver?.message}
              {...register("problemaResolver")}
            />
            <Input
              label="Quem sofre com esse problema?"
              placeholder="Ex: Clientes finais, equipe de vendas, departamento financeiro..."
              error={errors.quemSofreProblema?.message}
              {...register("quemSofreProblema")}
            />
          </CardContent>
        </Card>

        {/* Análise de Mercado */}
        <Card>
          <CardHeader>
            <CardTitle>Análise de Mercado</CardTitle>
            <CardDescription>
              Pesquise rapidamente se já existe algo parecido. Se sim, explique o que torna sua ideia única ou melhor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Existe alguma solução no mercado para este problema?"
              placeholder="Selecione..."
              options={Object.entries(EXISTE_SOLUCAO_MERCADO_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              error={errors.existeSolucaoMercado?.message}
              {...register("existeSolucaoMercado")}
            />
            {existeSolucaoMercado === "sim" && (
              <Textarea
                label="Descreva a solução existente"
                placeholder="Explique quem é o fabricante/fornecedor e o que torna sua ideia única ou melhor..."
                rows={3}
                error={errors.descricaoSolucaoExistente?.message}
                {...register("descricaoSolucaoExistente")}
              />
            )}
          </CardContent>
        </Card>

        {/* Solução Proposta */}
        <Card>
          <CardHeader>
            <CardTitle>Solução Proposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Qual é a ideia de solução para esse problema?"
              placeholder="Descreva sua proposta de solução detalhadamente..."
              rows={4}
              error={errors.ideiaSolucao?.message}
              {...register("ideiaSolucao")}
            />
            <Textarea
              label="Quais são os principais benefícios desta implementação?"
              placeholder="Liste os benefícios esperados com a implementação..."
              rows={3}
              error={errors.principaisBeneficios?.message}
              {...register("principaisBeneficios")}
            />
            <Textarea
              label="Quais os recursos necessários para desenvolver esta ideia?"
              placeholder="Ex: 2 desenvolvedores, 1 designer, infraestrutura cloud..."
              rows={3}
              error={errors.recursosNecessarios?.message}
              {...register("recursosNecessarios")}
            />
          </CardContent>
        </Card>

        {/* Horizonte e Prazo */}
        <Card>
          <CardHeader>
            <CardTitle>Horizonte de Inovação e Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Qual o horizonte de inovação desta ideia?"
                placeholder="Selecione o horizonte"
                options={Object.entries(HORIZONTE_INOVACAO_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
                error={errors.horizonteInovacao?.message}
                {...register("horizonteInovacao")}
              />
              <Input
                label="Prazo Desejado para Início"
                type="date"
                error={errors.prazoDesejado?.message}
                {...register("prazoDesejado")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cliente(s) */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente(s) Beneficiados</CardTitle>
            <CardDescription>
              Selecione o(s) cliente(s) que serão beneficiados por esta ideia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {clientes.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => handleToggleCliente(cliente.id)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    clienteIdsSelecionados.includes(cliente.id)
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <p className="font-medium text-slate-100">{cliente.nome}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {cliente.origem.replace("_", " ")}
                  </p>
                </button>
              ))}
            </div>
            {errors.clienteIds && (
              <p className="mt-2 text-sm text-red-400">
                {errors.clienteIds.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Link href="/demandas">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Enviar Ideia
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default NovaDemandaPage;
