"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useDemandaStore } from "@/stores/demanda.store";
import { useClienteStore } from "@/stores/cliente.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import type { StatusDemanda, EstagioIdeia } from "@/interfaces/demanda.interface";
import {
  STATUS_DEMANDA_LABELS,
  ESTAGIO_IDEIA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
  EXISTE_SOLUCAO_MERCADO_LABELS,
} from "@/interfaces/demanda.interface";
import { formatDate, formatCurrency } from "@/utils/formatters";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Users,
  Building2,
  Calendar,
  Lightbulb,
  ArrowRight,
  Target,
  TrendingUp,
  Package,
} from "lucide-react";

const statusVariantMap: Record<StatusDemanda, BadgeVariant> = {
  rascunho: "secondary",
  em_analise: "info",
  aguardando_aprovacao: "warning",
  aprovada: "success",
  em_ajustes: "warning",
  rejeitada: "danger",
  convertida: "primary",
};

const estagioVariantMap: Record<EstagioIdeia, BadgeVariant> = {
  conceito: "secondary",
  validacao: "info",
  prototipo: "warning",
  mvp: "primary",
  escala: "success",
};

interface DemandaDetailPageProps {
  params: Promise<{ id: string }>;
}

// Pipeline de análise mockado
const mockPipelineResult = {
  competencias: ["Mobile (React Native)", "Backend (Node.js)", "UX/UI Design"],
  complexidade: "Média",
  prazoEstimado: "6 meses",
  custoEstimado: 480000,
  squadSugerido: [
    { nome: "Maria Silva", papel: "Tech Lead", percentual: 100, custoMensal: 28800 },
    { nome: "João Santos", papel: "UX Designer", percentual: 50, custoMensal: 9600 },
    { nome: "Pedro Costa", papel: "Dev Mobile", percentual: 80, custoMensal: 15360 },
    { nome: "Ana Oliveira", papel: "Dev Mobile", percentual: 70, custoMensal: 13440 },
  ],
  empresaDonaSugerida: "Alpha Tecnologia",
  confianca: 85,
};

const DemandaDetailPage = ({ params }: DemandaDetailPageProps) => {
  const { id } = use(params);
  const router = useRouter();
  
  const { getById, updateStatus, aprovar, rejeitar, solicitarAjustes, converterEmProjeto } = useDemandaStore();
  const { getById: getCliente } = useClienteStore();
  const { getById: getColaborador } = useColaboradorStore();
  const { create: criarProjeto } = useProjetoStore();
  const { getAll: getEmpresas, getById: getEmpresa } = useEmpresaStore();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [motivo, setMotivo] = useState("");

  const demanda = getById(id);
  const empresas = getEmpresas();

  if (!demanda) {
    return (
      <Layout title="Demanda não encontrada">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-400">A demanda solicitada não foi encontrada.</p>
          <Link href="/demandas" className="mt-4">
            <Button variant="outline">Voltar para lista</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const solicitante = getColaborador(demanda.solicitanteId);
  const clientes = demanda.clienteIds.map((cId) => getCliente(cId)).filter(Boolean);
  const empresaUnidadeApoio = getEmpresa(demanda.empresaUnidadeApoioId);

  const handleEnviarParaAprovacao = () => {
    updateStatus(id, "aguardando_aprovacao");
    toast.success("Ideia enviada para aprovação da comitiva!");
  };

  const handleAprovar = () => {
    aprovar(id);
    toast.success("Ideia aprovada! Agora você pode criar o projeto.");
  };

  const handleRejeitar = () => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }
    rejeitar(id, motivo);
    setShowRejectModal(false);
    toast.success("Ideia rejeitada");
  };

  const handleSolicitarAjustes = () => {
    if (!motivo.trim()) {
      toast.error("Informe os ajustes necessários");
      return;
    }
    solicitarAjustes(id, motivo);
    setShowAdjustModal(false);
    toast.success("Ajustes solicitados");
  };

  const handleCriarProjeto = () => {
    const empresaDona = empresas[0];
    const projeto = criarProjeto(
      {
        nome: demanda.titulo,
        descricao: demanda.ideiaSolucao,
        empresaDonaId: empresaDona.id,
        clienteIds: demanda.clienteIds,
        orcamento: mockPipelineResult.custoEstimado,
      },
      id
    );
    converterEmProjeto(id, projeto.id);
    toast.success("Projeto criado com sucesso!");
    router.push(`/projetos/${projeto.id}`);
  };

  const showPipeline = ["em_analise", "aguardando_aprovacao", "aprovada"].includes(demanda.status);
  const canApprove = demanda.status === "aguardando_aprovacao";
  const canCreateProject = demanda.status === "aprovada";

  return (
    <Layout
      title={demanda.titulo}
      subtitle={`Ideia #${id.slice(0, 8)}`}
      actions={
        <div className="flex gap-2">
          <Link href="/demandas">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Identificação */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Informações da Ideia
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={estagioVariantMap[demanda.estagioIdeia]}>
                    {ESTAGIO_IDEIA_LABELS[demanda.estagioIdeia]}
                  </Badge>
                  <Badge variant={statusVariantMap[demanda.status]}>
                    {STATUS_DEMANDA_LABELS[demanda.status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-400">Proponente</dt>
                  <dd className="font-medium text-slate-100">{demanda.nomeProponente}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Empresa/Unidade de Apoio</dt>
                  <dd className="font-medium text-slate-100">
                    {empresaUnidadeApoio?.nome || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Horizonte de Inovação</dt>
                  <dd className="font-medium text-slate-100">
                    {HORIZONTE_INOVACAO_LABELS[demanda.horizonteInovacao]}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Problema e Contexto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Problema e Contexto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400">
                  Qual problema esta ideia pretende resolver?
                </h4>
                <p className="mt-1 text-slate-200 whitespace-pre-wrap">
                  {demanda.problemaResolver}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400">
                  Quem sofre com esse problema?
                </h4>
                <p className="mt-1 text-slate-300">{demanda.quemSofreProblema}</p>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Mercado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Análise de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400">
                  Existe solução no mercado?
                </h4>
                <Badge
                  variant={
                    demanda.existeSolucaoMercado === "nao" ? "success" : "info"
                  }
                  className="mt-1"
                >
                  {EXISTE_SOLUCAO_MERCADO_LABELS[demanda.existeSolucaoMercado]}
                </Badge>
              </div>
              {demanda.descricaoSolucaoExistente && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400">
                    Descrição da solução existente
                  </h4>
                  <p className="mt-1 text-slate-300">
                    {demanda.descricaoSolucaoExistente}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Solução Proposta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Solução Proposta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400">
                  Ideia de Solução
                </h4>
                <p className="mt-1 text-slate-200 whitespace-pre-wrap">
                  {demanda.ideiaSolucao}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400">
                  Principais Benefícios
                </h4>
                <p className="mt-1 text-slate-300">{demanda.principaisBeneficios}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400">
                  Recursos Necessários
                </h4>
                <p className="mt-1 text-slate-300">{demanda.recursosNecessarios}</p>
              </div>
            </CardContent>
          </Card>

          {showPipeline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Análise do Pipeline (Mockado)
                </CardTitle>
                <CardDescription>
                  Resultado da análise automática de viabilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">
                      Competências Identificadas
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mockPipelineResult.competencias.map((comp) => (
                        <Badge key={comp} variant="primary">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">
                      Complexidade Estimada
                    </h4>
                    <p className="mt-1 text-lg font-medium text-slate-100">
                      {mockPipelineResult.complexidade}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">
                      Prazo Estimado
                    </h4>
                    <p className="mt-1 text-lg font-medium text-slate-100">
                      {mockPipelineResult.prazoEstimado}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">
                      Custo Total Estimado
                    </h4>
                    <p className="mt-1 text-lg font-medium text-cyan-400">
                      {formatCurrency(mockPipelineResult.custoEstimado)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-slate-400">
                    Squad Sugerido
                  </h4>
                  <div className="space-y-2">
                    {mockPipelineResult.squadSugerido.map((membro, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
                      >
                        <div>
                          <p className="font-medium text-slate-100">{membro.nome}</p>
                          <p className="text-sm text-slate-400">{membro.papel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-300">{membro.percentual}%</p>
                          <p className="text-xs text-slate-500">
                            {formatCurrency(membro.custoMensal)}/mês
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-cyan-500/10 p-4">
                  <div>
                    <p className="text-sm text-slate-400">Empresa Dona Sugerida</p>
                    <p className="text-lg font-medium text-slate-100">
                      {mockPipelineResult.empresaDonaSugerida}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Confiança</p>
                    <p className="text-lg font-medium text-cyan-400">
                      {mockPipelineResult.confianca}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {demanda.status === "em_analise" && (
            <div className="flex justify-end">
              <Button onClick={handleEnviarParaAprovacao} leftIcon={<ArrowRight className="h-4 w-4" />}>
                Enviar para Aprovação da Comitiva
              </Button>
            </div>
          )}

          {canApprove && (
            <Card>
              <CardHeader>
                <CardTitle>Ações da Comitiva</CardTitle>
                <CardDescription>
                  Analise a proposta e tome uma decisão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAprovar}
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                  >
                    Aprovar Ideia
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAdjustModal(true)}
                    leftIcon={<AlertCircle className="h-4 w-4" />}
                  >
                    Solicitar Ajustes
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectModal(true)}
                    leftIcon={<XCircle className="h-4 w-4" />}
                  >
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {canCreateProject && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-400">Ideia Aprovada!</CardTitle>
                <CardDescription>
                  A ideia foi aprovada e está pronta para se tornar um projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCriarProjeto}
                  leftIcon={<Zap className="h-4 w-4" />}
                >
                  Criar Projeto a partir desta Ideia
                </Button>
              </CardContent>
            </Card>
          )}

          {demanda.motivoRejeicao && (
            <Card className="border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400">Motivo da Rejeição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{demanda.motivoRejeicao}</p>
              </CardContent>
            </Card>
          )}

          {demanda.observacoes && demanda.status === "em_ajustes" && (
            <Card className="border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">Ajustes Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{demanda.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Cliente(s) Beneficiados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientes.length === 0 ? (
                <p className="text-slate-500">Nenhum cliente selecionado</p>
              ) : (
                <div className="space-y-2">
                  {clientes.map((cliente) => (
                    <div
                      key={cliente!.id}
                      className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
                    >
                      <p className="font-medium text-slate-100">{cliente!.nome}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {cliente!.origem.replace("_", " ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Prazos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-400">Prazo Desejado</dt>
                  <dd className="font-medium text-slate-100">
                    {formatDate(demanda.prazoDesejado)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Submetida em</dt>
                  <dd className="text-slate-300">{formatDate(demanda.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Última atualização</dt>
                  <dd className="text-slate-300">{formatDate(demanda.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent>
              {solicitante ? (
                <div>
                  <p className="font-medium text-slate-100">{solicitante.nome}</p>
                  <p className="text-sm text-slate-400">{solicitante.cargo}</p>
                </div>
              ) : (
                <p className="text-slate-500">Não identificado</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Rejeitar Ideia"
        description="Informe o motivo da rejeição"
      >
        <div className="space-y-4">
          <Textarea
            label="Motivo"
            placeholder="Descreva o motivo da rejeição..."
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRejeitar}>
              Confirmar Rejeição
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Solicitar Ajustes"
        description="Descreva os ajustes necessários"
      >
        <div className="space-y-4">
          <Textarea
            label="Ajustes Necessários"
            placeholder="Descreva quais ajustes são necessários..."
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAdjustModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSolicitarAjustes}>Enviar Solicitação</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default DemandaDetailPage;
