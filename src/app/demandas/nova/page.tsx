"use client";

import { useState } from "react";
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
import { AnexoUploader } from "@/components/AnexoUploader";
import { useDemandaStore } from "@/stores/demanda.store";
import { useClienteStore } from "@/stores/cliente.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useAnexoDemandaStore } from "@/stores/anexo-demanda.store";
import { useAuth } from "@/hooks/useAuth";
import { demandaSchema, type DemandaSchemaType } from "@/schemas/demanda.schema";
import type { AnexoDemanda } from "@/interfaces/anexo-demanda.interface";
import {
  ESTAGIO_IDEIA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
  EXISTE_SOLUCAO_MERCADO_LABELS,
} from "@/interfaces/demanda.interface";
import {
  ArrowLeft,
  Send,
  Lightbulb,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// Componente de dica/tooltip
const Dica = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-4">
    <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
    <p className="text-xs text-slate-400">{children}</p>
  </div>
);

const NovaDemandaPage = () => {
  const router = useRouter();
  const { usuarioId } = useAuth();
  const { create, updateStatus } = useDemandaStore();
  const { getAll: getClientes } = useClienteStore();
  const { getAll: getEmpresas } = useEmpresaStore();
  const { getByDemanda } = useAnexoDemandaStore();
  
  const clientes = getClientes();
  const empresas = getEmpresas();
  
  // Estado temporário para anexos (antes da demanda ser criada)
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
      clienteIds: [],
      exibirVitrine: true,
    },
  });

  const clienteIdsSelecionados = watch("clienteIds") || [];
  const existeSolucaoMercado = watch("existeSolucaoMercado");
  const exibirVitrine = watch("exibirVitrine") ?? true;

  const handleToggleCliente = (clienteId: string) => {
    const current = clienteIdsSelecionados;
    const updated = current.includes(clienteId)
      ? current.filter((id) => id !== clienteId)
      : [...current, clienteId];
    setValue("clienteIds", updated);
  };

  const handleFormSubmit = (data: DemandaSchemaType) => {
    try {
      const demanda = create(
        {
          ...data,
          prazoDesejado: new Date(data.prazoDesejado),
          exibirVitrine: data.exibirVitrine ?? true,
        },
        usuarioId || "demo-user-id"
      );
      
      // Enviar para análise automaticamente
      updateStatus(demanda.id, "em_analise");
      
      toast.success("Ideia de inovação submetida com sucesso!", {
        description: "Você será notificado sobre o progresso da avaliação.",
      });
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
            <CardDescription>
              Informe seus dados para contato e acompanhamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dica>
              Preencha com seu nome completo e selecione a unidade de apoio que
              irá acompanhar sua ideia durante o processo de avaliação.
            </Dica>
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
            <CardDescription>
              Dê um título claro e indique o estágio de maturidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dica>
              O título deve ser curto e descritivo. O estágio indica o quanto
              sua ideia já foi desenvolvida ou validada.
            </Dica>
            <Input
              label="Título da Ideia"
              placeholder="Ex: Sistema de automação de relatórios financeiros"
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
            <Dica>
              Seja específico sobre o problema. Quanto mais detalhes, melhor a
              avaliação. Identifique claramente quem são os afetados pelo problema.
            </Dica>
            <Textarea
              label="Qual problema esta ideia pretende resolver?"
              placeholder="Descreva detalhadamente o problema identificado, incluindo contexto, frequência e impacto..."
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
              Pesquise se já existe algo parecido no mercado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dica>
              Uma pesquisa rápida ajuda a entender o cenário competitivo. Se existir
              solução similar, explique o que torna sua ideia única ou melhor.
            </Dica>
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
            {(existeSolucaoMercado === "sim" || existeSolucaoMercado === "parcial") && (
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
            <CardDescription>
              Descreva sua proposta de solução e os benefícios esperados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dica>
              Explique como sua ideia resolve o problema. Liste os benefícios tangíveis
              e os recursos necessários para implementação (pessoas, tecnologia, tempo).
            </Dica>
            <Textarea
              label="Qual é a ideia de solução para esse problema?"
              placeholder="Descreva sua proposta de solução detalhadamente..."
              rows={4}
              error={errors.ideiaSolucao?.message}
              {...register("ideiaSolucao")}
            />
            <Textarea
              label="Quais são os principais benefícios desta implementação?"
              placeholder="Ex: Redução de 30% no tempo de processamento, economia de R$ 50.000/mês..."
              rows={3}
              error={errors.principaisBeneficios?.message}
              {...register("principaisBeneficios")}
            />
            <Textarea
              label="Quais os recursos necessários para desenvolver esta ideia?"
              placeholder="Ex: 2 desenvolvedores full-stack, 1 designer UX, infraestrutura cloud, 3 meses de desenvolvimento..."
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
            <CardDescription>
              Defina a expectativa de tempo para implementação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dica>
              O horizonte indica a perspectiva de tempo: H1 para melhorias incrementais
              (até 1 ano), H2 para inovações adjacentes (1-3 anos), H3 para transformações
              disruptivas (mais de 3 anos).
            </Dica>
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

        {/* Anexos */}
        <Card>
          <CardHeader>
            <CardTitle>Anexos</CardTitle>
            <CardDescription>
              Adicione documentos, imagens ou arquivos que complementem sua ideia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dica>
              Você pode anexar apresentações, protótipos, documentos de referência,
              imagens ou qualquer material que ajude a explicar melhor sua ideia.
              Máximo de 10 arquivos, 10MB cada.
            </Dica>
            <AnexoUploader
              demandaId={tempDemandaId}
              usuarioId={usuarioId || "demo-user-id"}
              anexos={anexosTemp}
              onAnexosChange={setAnexosTemp}
            />
          </CardContent>
        </Card>

        {/* Cliente(s) - Agora opcional */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente(s) Beneficiados (Opcional)</CardTitle>
            <CardDescription>
              Se aplicável, selecione o(s) cliente(s) que serão beneficiados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dica>
              Se sua ideia beneficia clientes específicos, selecione-os abaixo.
              Este campo é opcional - deixe em branco se a ideia for de uso interno
              ou não tiver clientes específicos associados.
            </Dica>
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
          </CardContent>
        </Card>

        {/* Visibilidade na Vitrine */}
        <Card>
          <CardHeader>
            <CardTitle>Visibilidade da Ideia</CardTitle>
            <CardDescription>
              Defina se sua ideia aparecerá na vitrine pública de ideias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dica>
              A vitrine de ideias é um espaço onde colaboradores podem visualizar
              ideias aprovadas e se inspirar. Marque esta opção se deseja que sua
              ideia seja visível para outros após aprovação.
            </Dica>
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
                    ? "Sua ideia será visível na vitrine após aprovação"
                    : "Sua ideia ficará restrita aos avaliadores"}
                </p>
              </div>
            </button>
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
