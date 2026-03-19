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
import { ArrowLeft, Send, Info } from "lucide-react";

interface FormOperacionalProps {
  empresaId: string;
  empresaNome?: string;
  redirectTo?: string;
}

const Dica = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4">
    <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
    <p className="text-xs text-slate-400">{children}</p>
  </div>
);

const IMPACTO_OPTIONS = [
  { value: "critico", label: "Crítico — bloqueia operação ou gera retrabalho significativo" },
  { value: "alto", label: "Alto — impacta produtividade diariamente" },
  { value: "medio", label: "Médio — causa lentidão ou ineficiência periódica" },
  { value: "baixo", label: "Baixo — melhoria nice-to-have" },
];


export const FormOperacional = ({ empresaId, empresaNome, redirectTo }: FormOperacionalProps) => {
  const router = useRouter();
  const { usuarioId } = useAuth();
  const { create, updateStatus } = useDemandaStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemandaSchemaType>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      empresaUnidadeApoioId: empresaId,
      clienteIds: [],
      exibirVitrine: false,
      existeSolucaoMercado: "nao",
      horizonteInovacao: "h1_curto_prazo",
    },
  });

  const handleFormSubmit = (data: DemandaSchemaType) => {
    try {
      const demanda = create(
        {
          ...data,
          empresaUnidadeApoioId: empresaId,
          prazoDesejado: new Date(data.prazoDesejado),
          exibirVitrine: false,
        },
        usuarioId || "demo-user-id"
      );
      updateStatus(demanda.id, "em_analise");
      toast.success("Demanda de produtividade registrada!", {
        description: "Sua demanda foi encaminhada para análise.",
      });
      router.push(redirectTo ?? `/demandas/empresa/${empresaId}`);
    } catch {
      toast.error("Erro ao registrar demanda");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle>Identificação do Solicitante</CardTitle>
          <CardDescription>Dados para contato e acompanhamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome do Solicitante"
              placeholder="Seu nome completo"
              error={errors.nomeProponente?.message}
              {...register("nomeProponente")}
            />
            <Input
              label="Área / Departamento"
              placeholder="Ex: Operações, Financeiro, RH..."
              error={errors.quemSofreProblema?.message}
              {...register("quemSofreProblema")}
            />
          </div>
          <input type="hidden" {...register("empresaUnidadeApoioId")} value={empresaId} />
        </CardContent>
      </Card>

      {/* Processo e Problema */}
      <Card>
        <CardHeader>
          <CardTitle>Processo e Gargalo</CardTitle>
          <CardDescription>Descreva o processo afetado e o problema a resolver</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dica>
            Seja objetivo: qual processo, qual etapa, qual o impacto diário? Inclua volume, frequência e custo estimado se possível.
          </Dica>
          <Input
            label="Nome do Processo / Iniciativa"
            placeholder="Ex: Conciliação bancária manual, Aprovação de férias por e-mail..."
            error={errors.titulo?.message}
            {...register("titulo")}
          />
          <Textarea
            label="Descrição do gargalo ou problema"
            placeholder="Descreva o processo atual, onde está a ineficiência, tempo gasto, erros gerados..."
            rows={4}
            error={errors.problemaResolver?.message}
            {...register("problemaResolver")}
          />
          <Select
            label="Nível de impacto na operação"
            placeholder="Selecione o impacto"
            options={IMPACTO_OPTIONS}
            error={errors.estagioIdeia?.message}
            {...register("estagioIdeia")}
            key="impacto"
          />
        </CardContent>
      </Card>

      {/* Solução e KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Solução Proposta e Indicadores</CardTitle>
          <CardDescription>Como digitalizar ou automatizar e quais métricas de sucesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dica>
            Descreva a solução tecnológica ou automação desejada. Liste os KPIs que serão melhorados (ex: tempo de ciclo, taxa de erro, horas economizadas).
          </Dica>
          <Textarea
            label="Solução tecnológica / automação proposta"
            placeholder="Ex: Robô RPA para extração de dados, integração via API, workflow digital no sistema X..."
            rows={4}
            error={errors.ideiaSolucao?.message}
            {...register("ideiaSolucao")}
          />
          <Textarea
            label="KPIs e metas de melhoria esperados"
            placeholder="Ex: Reduzir tempo da tarefa de 2h para 10min, eliminar 100% do retrabalho, economizar 40h/mês..."
            rows={3}
            error={errors.principaisBeneficios?.message}
            {...register("principaisBeneficios")}
          />
        </CardContent>
      </Card>

      {/* Recursos e Prazo */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos e Urgência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Recursos e sistemas envolvidos"
            placeholder="Ex: Sistema ERP SAP, planilhas Excel, e-mail corporativo, equipe de 5 pessoas afetadas..."
            rows={3}
            error={errors.recursosNecessarios?.message}
            {...register("recursosNecessarios")}
          />
          <Input
            label="Prazo desejado para entrega"
            type="date"
            error={errors.prazoDesejado?.message}
            {...register("prazoDesejado")}
          />
        </CardContent>
      </Card>

      {/* Campos ocultos obrigatórios pelo schema */}
      <input type="hidden" {...register("existeSolucaoMercado")} value="nao" />
      <input type="hidden" {...register("horizonteInovacao")} value="h1_curto_prazo" />

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Link href={redirectTo ?? `/demandas/empresa/${empresaId}`}>
          <Button variant="outline" type="button" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Cancelar
          </Button>
        </Link>
        <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
          Registrar Demanda
        </Button>
      </div>
    </form>
  );
};
