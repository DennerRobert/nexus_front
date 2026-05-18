"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useDemandaStore } from "@/stores/demanda.store";
import { useAuth } from "@/hooks/useAuth";
import { demandaSchema, type DemandaSchemaType } from "@/schemas/demanda.schema";
import { coerceDate } from "@/utils/formatters";
import { ArrowLeft, Send, Info } from "lucide-react";

interface FormEstrategicoProps {
  empresaId: string;
  empresaNome?: string;
  redirectTo?: string;
}

const Dica = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4">
    <Info className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
    <p className="text-xs text-slate-400">{children}</p>
  </div>
);

const ESTAGIO_INICIATIVA_OPTIONS = [
  { value: "conceito", label: "Identificação — oportunidade mapeada, sem detalhamento" },
  { value: "validacao", label: "Diagnóstico — alinhamento estratégico validado" },
  { value: "prototipo", label: "Proposta — plano de iniciativa esboçado" },
  { value: "mvp", label: "Aprovado internamente — aguardando recursos" },
  { value: "escala", label: "Em execução — necessita aceleração ou ajuste" },
];

const HORIZONTE_INICIATIVA_OPTIONS = [
  { value: "h1_curto_prazo", label: "Curto prazo — resultado esperado em até 12 meses" },
  { value: "h2_medio_prazo", label: "Médio prazo — resultado esperado em 1 a 3 anos" },
  { value: "h3_longo_prazo", label: "Longo prazo — iniciativa de transformação (3+ anos)" },
];

const EXISTE_REFERENCIA_OPTIONS = [
  { value: "nao", label: "Não — iniciativa inédita no grupo" },
  { value: "parcial", label: "Parcialmente — existem referências externas adaptáveis" },
  { value: "sim", label: "Sim — benchmark identificado (mercado ou concorrente)" },
];

export const FormEstrategico = ({ empresaId, empresaNome, redirectTo }: FormEstrategicoProps) => {
  const router = useRouter();
  const { usuarioId } = useAuth();
  const { create, updateStatus } = useDemandaStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<DemandaSchemaType>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      empresaUnidadeApoioId: empresaId,
      clienteIds: [],
      exibirVitrine: false,
      existeSolucaoMercado: "nao",
    },
  });

  const existeReferencia = watch("existeSolucaoMercado");

  const handleFormSubmit = async (data: DemandaSchemaType) => {
    const demanda = await create(
      {
        ...data,
        empresaUnidadeApoioId: empresaId,
        clienteIds: data.clienteIds ?? [],
        prazoDesejado: new Date(data.prazoDesejado),
        exibirVitrine: false,
      },
      usuarioId || "demo-user-id",
    );

    if (!demanda) {
      toast.error("Erro ao registrar iniciativa. Tente novamente.");
      return;
    }

    updateStatus(demanda.id, "em_analise");

    // Integração Bitrix: criar card no pipeline (falha silenciosa)
    fetch("/api/demanda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: data.titulo, nomeProponente: data.nomeProponente }),
    }).catch((err) => console.error("[Bitrix] Falha ao criar card:", err));

    toast.success("Iniciativa estratégica registrada!", {
      description: "Encaminhada para análise pelo comitê estratégico.",
    });
    router.push(redirectTo ?? `/demandas/empresa/${empresaId}`);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle>Patrocinador da Iniciativa</CardTitle>
          <CardDescription>Responsável e stakeholders envolvidos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome do Patrocinador"
              placeholder="Diretor, VP ou Gerente responsável"
              error={errors.nomeProponente?.message}
              {...register("nomeProponente")}
            />
            <Input
              label="Stakeholders Envolvidos"
              placeholder="Ex: Diretoria Comercial, TI, Financeiro..."
              error={errors.quemSofreProblema?.message}
              {...register("quemSofreProblema")}
            />
          </div>
          <input type="hidden" {...register("empresaUnidadeApoioId")} value={empresaId} />
        </CardContent>
      </Card>

      {/* Objetivo e Oportunidade */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivo Estratégico e Oportunidade</CardTitle>
          <CardDescription>Qual desafio ou oportunidade esta iniciativa endereça?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dica>
            Conecte a iniciativa a um objetivo estratégico ou OKR. Descreva a oportunidade de mercado ou o desafio competitivo que justifica o investimento.
          </Dica>
          <Input
            label="Nome da Iniciativa"
            placeholder="Ex: Expansão para mercado B2B SaaS, Programa de fidelização digital..."
            error={errors.titulo?.message}
            {...register("titulo")}
          />
          <Textarea
            label="Desafio estratégico / Oportunidade"
            placeholder="Descreva o contexto de negócio, o gap identificado e por que essa iniciativa é prioritária agora..."
            rows={4}
            error={errors.problemaResolver?.message}
            {...register("problemaResolver")}
          />
          <Select
            label="Estágio de maturidade da iniciativa"
            placeholder="Selecione o estágio"
            options={ESTAGIO_INICIATIVA_OPTIONS}
            error={errors.estagioIdeia?.message}
            {...register("estagioIdeia")}
          />
        </CardContent>
      </Card>

      {/* Proposta de Valor e ROI */}
      <Card>
        <CardHeader>
          <CardTitle>Proposta de Valor e ROI Esperado</CardTitle>
          <CardDescription>Impacto no negócio e retorno esperado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dica>
            Inclua OKRs relacionados, estimativa de ROI, ganho de market share ou redução de churn. Quanto mais concreto, mais fácil priorizar.
          </Dica>
          <Textarea
            label="Proposta de iniciativa / OKR relacionado"
            placeholder="Descreva a solução ou programa proposto e como se conecta aos OKRs do período..."
            rows={4}
            error={errors.ideiaSolucao?.message}
            {...register("ideiaSolucao")}
          />
          <Textarea
            label="ROI esperado e impacto no negócio"
            placeholder="Ex: +15% receita recorrente, redução de churn em 20%, NPS acima de 60, payback em 18 meses..."
            rows={3}
            error={errors.principaisBeneficios?.message}
            {...register("principaisBeneficios")}
          />
        </CardContent>
      </Card>

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Referências e Benchmarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Existe referência ou benchmark para esta iniciativa?"
            placeholder="Selecione..."
            options={EXISTE_REFERENCIA_OPTIONS}
            error={errors.existeSolucaoMercado?.message}
            {...register("existeSolucaoMercado")}
          />
          {(existeReferencia === "sim" || existeReferencia === "parcial") && (
            <Textarea
              label="Descreva o benchmark e o diferencial pretendido"
              placeholder="Empresa de referência, modelo adotado, e como iremos superar ou adaptar..."
              rows={3}
              error={errors.descricaoSolucaoExistente?.message}
              {...register("descricaoSolucaoExistente")}
            />
          )}
        </CardContent>
      </Card>

      {/* Recursos e Horizonte */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos e Horizonte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Recursos, capacidades e investimento necessários"
            placeholder="Ex: Budget estimado R$ 500k, equipe de 8 pessoas, parceria com consultor externo, 12 meses..."
            rows={3}
            error={errors.recursosNecessarios?.message}
            {...register("recursosNecessarios")}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Horizonte de resultado"
              placeholder="Selecione o horizonte"
              options={HORIZONTE_INICIATIVA_OPTIONS}
              error={errors.horizonteInovacao?.message}
              {...register("horizonteInovacao")}
            />
            <Input
              label="Prazo desejado para início"
              type="date"
              error={errors.prazoDesejado?.message}
              {...register("prazoDesejado", { setValueAs: coerceDate })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Link href={redirectTo ?? `/demandas/empresa/${empresaId}`}>
          <Button variant="outline" type="button" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
          Registrar Iniciativa
        </Button>
      </div>
    </form>
  );
};
