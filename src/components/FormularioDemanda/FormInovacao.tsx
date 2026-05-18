"use client";

import { useState } from "react";
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
import { AnexoUploader } from "@/components/AnexoUploader";
import { useDemandaStore } from "@/stores/demanda.store";
import { useAnexoDemandaStore } from "@/stores/anexo-demanda.store";
import { useAuth } from "@/hooks/useAuth";
import { demandaSchema, type DemandaSchemaType } from "@/schemas/demanda.schema";
import { coerceDate } from "@/utils/formatters";
import type { AnexoDemanda } from "@/interfaces/anexo-demanda.interface";
import {
  ESTAGIO_IDEIA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
  EXISTE_SOLUCAO_MERCADO_LABELS,
} from "@/interfaces/demanda.interface";
import { ArrowLeft, Send, Info, Eye, EyeOff } from "lucide-react";

interface FormInovacaoProps {
  empresaId: string;
  empresaNome?: string;
  redirectTo?: string;
}

const Dica = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4">
    <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
    <p className="text-xs text-slate-400">{children}</p>
  </div>
);

export const FormInovacao = ({ empresaId, empresaNome, redirectTo }: FormInovacaoProps) => {
  const router = useRouter();
  const { usuarioId } = useAuth();
  const { create, updateStatus } = useDemandaStore();

  const [anexosTemp, setAnexosTemp] = useState<AnexoDemanda[]>([]);
  const [tempDemandaId] = useState(`temp-${Date.now()}`);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<DemandaSchemaType>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      empresaUnidadeApoioId: empresaId,
      clienteIds: [],
      exibirVitrine: true,
    },
  });

  const existeSolucaoMercado = watch("existeSolucaoMercado");
  const exibirVitrine = watch("exibirVitrine") ?? true;

  const handleFormSubmit = async (data: DemandaSchemaType) => {
    const demanda = await create(
      {
        ...data,
        empresaUnidadeApoioId: empresaId,
        clienteIds: data.clienteIds ?? [],
        prazoDesejado: new Date(data.prazoDesejado),
        exibirVitrine: data.exibirVitrine ?? true,
      },
      usuarioId || "demo-user-id",
    );

    if (!demanda) {
      toast.error("Erro ao submeter ideia. Tente novamente.");
      return;
    }

    updateStatus(demanda.id, "em_analise");

    // Integração Bitrix: criar card no pipeline (falha silenciosa)
    fetch("/api/demanda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: data.titulo, nomeProponente: data.nomeProponente }),
    }).catch((err) => console.error("[Bitrix] Falha ao criar card:", err));

    toast.success("Ideia de inovação submetida com sucesso!", {
      description: "Você será notificado sobre o progresso da avaliação.",
    });
    router.push(redirectTo ?? `/demandas/empresa/${empresaId}`);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle>Identificação do Proponente</CardTitle>
          <CardDescription>Seus dados para contato e acompanhamento</CardDescription>
        </CardHeader>
        <CardContent>
          <Dica>
            Preencha com seu nome completo. A empresa de destino já está definida.
          </Dica>
          <Input
            label="Nome do Proponente"
            placeholder="Seu nome completo"
            error={errors.nomeProponente?.message}
            {...register("nomeProponente")}
          />
          <input type="hidden" {...register("empresaUnidadeApoioId")} value={empresaId} />
        </CardContent>
      </Card>

      {/* Informações da Ideia */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Ideia</CardTitle>
          <CardDescription>Título claro e estágio de maturidade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dica>
            O título deve ser curto e descritivo. O estágio indica quanto sua ideia já foi desenvolvida.
          </Dica>
          <Input
            label="Título da Ideia"
            placeholder="Ex: Plataforma de automação de onboarding de clientes"
            error={errors.titulo?.message}
            {...register("titulo")}
          />
          <Select
            label="Estágio da Ideia"
            placeholder="Em que estágio está sua ideia?"
            options={Object.entries(ESTAGIO_IDEIA_LABELS).map(([value, label]) => ({ value, label }))}
            error={errors.estagioIdeia?.message}
            {...register("estagioIdeia")}
          />
        </CardContent>
      </Card>

      {/* Problema e Contexto */}
      <Card>
        <CardHeader>
          <CardTitle>Problema e Contexto</CardTitle>
          <CardDescription>O problema que sua ideia pretende resolver</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dica>
            Seja específico. Quanto mais detalhes sobre o problema, melhor a avaliação pelo comitê.
          </Dica>
          <Textarea
            label="Qual problema esta ideia pretende resolver?"
            placeholder="Descreva o problema com contexto, frequência e impacto..."
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
          <CardDescription>Existe algo parecido no mercado?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Existe solução no mercado para este problema?"
            placeholder="Selecione..."
            options={Object.entries(EXISTE_SOLUCAO_MERCADO_LABELS).map(([value, label]) => ({ value, label }))}
            error={errors.existeSolucaoMercado?.message}
            {...register("existeSolucaoMercado")}
          />
          {(existeSolucaoMercado === "sim" || existeSolucaoMercado === "parcial") && (
            <Textarea
              label="Descreva a solução existente e seu diferencial"
              placeholder="Quem é o fornecedor e o que torna sua ideia única..."
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
          <CardDescription>Como você resolve o problema e os benefícios esperados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Qual é a ideia de solução?"
            placeholder="Descreva sua proposta detalhadamente..."
            rows={4}
            error={errors.ideiaSolucao?.message}
            {...register("ideiaSolucao")}
          />
          <Textarea
            label="Quais são os principais benefícios?"
            placeholder="Ex: Redução de 30% no tempo de processamento, economia de R$ 50k/mês..."
            rows={3}
            error={errors.principaisBeneficios?.message}
            {...register("principaisBeneficios")}
          />
          <Textarea
            label="Quais recursos são necessários?"
            placeholder="Ex: 2 desenvolvedores, 1 designer UX, infraestrutura cloud, 3 meses..."
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
          <Dica>
            H1: melhorias incrementais (até 1 ano) · H2: inovações adjacentes (1–3 anos) · H3: transformações disruptivas (3+ anos)
          </Dica>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Horizonte de inovação"
              placeholder="Selecione o horizonte"
              options={Object.entries(HORIZONTE_INOVACAO_LABELS).map(([value, label]) => ({ value, label }))}
              error={errors.horizonteInovacao?.message}
              {...register("horizonteInovacao")}
            />
            <Input
              label="Prazo Desejado para Início"
              type="date"
              error={errors.prazoDesejado?.message}
              {...register("prazoDesejado", { setValueAs: coerceDate })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Anexos */}
      <Card>
        <CardHeader>
          <CardTitle>Anexos</CardTitle>
          <CardDescription>Documentos, imagens ou arquivos complementares (opcional)</CardDescription>
        </CardHeader>
        <CardContent>
          <AnexoUploader
            demandaId={tempDemandaId}
            usuarioId={usuarioId || "demo-user-id"}
            anexos={anexosTemp}
            onAnexosChange={setAnexosTemp}
          />
        </CardContent>
      </Card>

      {/* Visibilidade */}
      <Card>
        <CardHeader>
          <CardTitle>Visibilidade da Ideia</CardTitle>
          <CardDescription>Exibir na vitrine pública de ideias após aprovação?</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => setValue("exibirVitrine", !exibirVitrine)}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all w-full ${
              exibirVitrine
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-700 hover:border-slate-600"
            }`}
          >
            {exibirVitrine ? (
              <Eye className="h-5 w-5 text-cyan-400" />
            ) : (
              <EyeOff className="h-5 w-5 text-slate-400" />
            )}
            <div className="text-left">
              <p className="font-medium text-slate-100">
                {exibirVitrine ? "Exibir na Vitrine de Ideias" : "Não exibir na Vitrine"}
              </p>
              <p className="text-xs text-slate-500">
                {exibirVitrine
                  ? "Sua ideia será visível após aprovação"
                  : "Sua ideia ficará restrita aos avaliadores"}
              </p>
            </div>
          </button>
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
          Enviar Ideia
        </Button>
      </div>
    </form>
  );
};
