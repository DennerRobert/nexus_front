"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, type Tab } from "@/components/Tabs";
import { EtapaBadge, FluxoEtapas } from "@/components/EtapaBadge";
import { FluxoEtapaModal } from "@/components/FluxoEtapaModal";
import { CriteriosAvaliacaoForm } from "@/components/CriteriosAvaliacaoForm";
import { useDemandaStore } from "@/stores/demanda.store";
import { useClienteStore } from "@/stores/cliente.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useAnexoDemandaStore } from "@/stores/anexo-demanda.store";
import { useAvaliacaoDemandaStore } from "@/stores/avaliacao-demanda.store";
import { useComiteStore } from "@/stores/comite.store";
import { useAuth } from "@/hooks/useAuth";
import { usePermissoes } from "@/hooks/usePermissoes";
import type { StatusDemanda, EstagioIdeia } from "@/interfaces/demanda.interface";
import type { EtapaDemanda } from "@/interfaces/etapa-demanda.interface";
import {
  STATUS_DEMANDA_LABELS,
  ESTAGIO_IDEIA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
  EXISTE_SOLUCAO_MERCADO_LABELS,
} from "@/interfaces/demanda.interface";
import { ETAPA_DEMANDA_LABELS } from "@/interfaces/etapa-demanda.interface";
import { formatarTamanhoArquivo } from "@/interfaces/anexo-demanda.interface";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  FileText,
  ClipboardList,
  History,
  Paperclip,
  File,
  Eye,
  EyeOff,
  GitBranch,
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
  const { usuarioId } = useAuth();
  const { podeExecutarAcao } = usePermissoes();
  
  const { getById, updateStatus, aprovar, rejeitar, solicitarAjustes, converterEmProjeto, mudarEtapa } = useDemandaStore();
  const { getById: getCliente } = useClienteStore();
  const { getById: getColaborador } = useColaboradorStore();
  const { create: criarProjeto } = useProjetoStore();
  const { getAll: getEmpresas, getById: getEmpresa } = useEmpresaStore();
  const { getByDemanda: getAnexos } = useAnexoDemandaStore();
  const { todasPerguntasRespondidas, calcularPontuacaoTotal } = useAvaliacaoDemandaStore();
  const { verificarAprovacao } = useComiteStore();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showFluxoModal, setShowFluxoModal] = useState(false);
  const [motivo, setMotivo] = useState("");

  const demanda = getById(id);
  const empresas = getEmpresas();
  const anexos = getAnexos(id);

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
  const pontuacao = calcularPontuacaoTotal(id);
  const criteriosCompletos = todasPerguntasRespondidas(id);
  const podeAvaliar = podeExecutarAcao("demandas", "aprovar");

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

  const handleMudarEtapa = async (
    novaEtapa: EtapaDemanda,
    dados: { observacao?: string; justificativa?: string }
  ) => {
    const comiteId = demanda.comiteId;
    const resultado = mudarEtapa(
      id,
      novaEtapa,
      usuarioId || "demo-user-id",
      dados,
      true,
      () => comiteId ? verificarAprovacao(id, comiteId) : false
    );
    return resultado;
  };

  const showPipeline = ["em_analise", "aguardando_aprovacao", "aprovada"].includes(demanda.status);
  const canApprove = demanda.status === "aguardando_aprovacao";
  const canCreateProject = demanda.status === "aprovada";

  // Conteúdo da tab Detalhes (memorizado para evitar re-criação)
  const detalhesContent = useMemo(() => (
    <div className="space-y-6">
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
            <div>
              <dt className="text-sm text-slate-400">Exibir na Vitrine</dt>
              <dd className="flex items-center gap-2">
                {demanda.exibirVitrine ? (
                  <>
                    <Eye className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Sim</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Não</span>
                  </>
                )}
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
              variant={demanda.existeSolucaoMercado === "nao" ? "success" : "info"}
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
            <h4 className="text-sm font-medium text-slate-400">Ideia de Solução</h4>
            <p className="mt-1 text-slate-200 whitespace-pre-wrap">
              {demanda.ideiaSolucao}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-400">Principais Benefícios</h4>
            <p className="mt-1 text-slate-300">{demanda.principaisBeneficios}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-400">Recursos Necessários</h4>
            <p className="mt-1 text-slate-300">{demanda.recursosNecessarios}</p>
          </div>
        </CardContent>
      </Card>

      {/* Anexos */}
      {anexos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Anexos ({anexos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anexos.map((anexo) => (
                <div
                  key={anexo.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-200">{anexo.nomeOriginal}</p>
                      <p className="text-xs text-slate-500">
                        {formatarTamanhoArquivo(anexo.tamanho)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  ), [demanda, empresaUnidadeApoio, anexos]);

  // Conteúdo da tab Avaliação (memorizado para evitar re-criação)
  const avaliacaoContent = useMemo(() => (
    <div className="space-y-6">
      {/* Score resumido */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-slate-800/50">
              <p className="text-3xl font-bold text-cyan-400">
                {pontuacao.pontuacaoPonderada.toFixed(2)}
              </p>
              <p className="text-sm text-slate-400 mt-1">Score Ponderado</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-800/50">
              <p className="text-3xl font-bold text-slate-200">
                {pontuacao.pontuacaoBruta.toFixed(2)}/5
              </p>
              <p className="text-sm text-slate-400 mt-1">Score Bruto</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-800/50">
              <p className={`text-3xl font-bold ${
                criteriosCompletos ? "text-green-400" : "text-amber-400"
              }`}>
                {pontuacao.percentualConclusao.toFixed(0)}%
              </p>
              <p className="text-sm text-slate-400 mt-1">Conclusão</p>
            </div>
          </div>
          {!criteriosCompletos && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400">
                ⚠️ Todos os critérios devem ser preenchidos para a demanda sair da etapa "Ideia Recebida".
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de critérios */}
      <CriteriosAvaliacaoForm
        demandaId={id}
        avaliadorId={usuarioId || "demo-user-id"}
        readOnly={!podeAvaliar}
      />
    </div>
  ), [id, usuarioId, podeAvaliar, pontuacao, criteriosCompletos]);

  // Conteúdo da tab Fluxo (memorizado para evitar re-criação)
  const fluxoContent = useMemo(() => (
    <div className="space-y-6">
      {/* Etapa atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Etapa Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <EtapaBadge etapa={demanda.etapa} size="lg" />
              <FluxoEtapas etapaAtual={demanda.etapa} />
            </div>
            {podeAvaliar && (
              <Button
                onClick={() => setShowFluxoModal(true)}
                leftIcon={<ArrowRight className="h-4 w-4" />}
              >
                Mudar Etapa
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de etapas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Etapas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {demanda.historicoEtapas.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              Nenhuma mudança de etapa registrada
            </p>
          ) : (
            <div className="space-y-4">
              {demanda.historicoEtapas
                .slice()
                .reverse()
                .map((historico) => (
                  <div
                    key={historico.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <EtapaBadge etapa={historico.etapaAnterior} size="sm" />
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                        <EtapaBadge etapa={historico.etapaNova} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(historico.data), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                      {historico.observacao && (
                        <p className="mt-2 text-sm text-slate-400">
                          {historico.observacao}
                        </p>
                      )}
                      {historico.justificativa && (
                        <p className="mt-2 text-sm text-amber-400">
                          Justificativa: {historico.justificativa}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  ), [demanda.etapa, demanda.historicoEtapas, podeAvaliar]);

  // Definição das tabs (memorizada)
  const tabs: Tab[] = useMemo(() => [
    {
      id: "detalhes",
      label: "Detalhes",
      icon: <FileText className="h-4 w-4" />,
      content: detalhesContent,
    },
    {
      id: "avaliacao",
      label: "Avaliação",
      icon: <ClipboardList className="h-4 w-4" />,
      badge: criteriosCompletos ? undefined : "!",
      content: avaliacaoContent,
    },
    {
      id: "fluxo",
      label: "Fluxo",
      icon: <GitBranch className="h-4 w-4" />,
      content: fluxoContent,
    },
  ], [detalhesContent, criteriosCompletos, avaliacaoContent, fluxoContent]);

  return (
    <Layout
      title={demanda.titulo}
      subtitle={`Ideia #${id.slice(0, 8)}`}
    >
      {/* Barra de navegação e status */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/demandas">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para Demandas
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <EtapaBadge etapa={demanda.etapa} />
          <Badge variant={statusVariantMap[demanda.status]}>
            {STATUS_DEMANDA_LABELS[demanda.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs tabs={tabs} defaultTab="detalhes" />

          {/* Ações */}
          {showPipeline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Análise do Pipeline (Mockado)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Competências</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mockPipelineResult.competencias.map((comp) => (
                        <Badge key={comp} variant="primary">{comp}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Complexidade</h4>
                    <p className="mt-1 text-lg font-medium text-slate-100">
                      {mockPipelineResult.complexidade}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Prazo Estimado</h4>
                    <p className="mt-1 text-lg font-medium text-slate-100">
                      {mockPipelineResult.prazoEstimado}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">Custo Estimado</h4>
                    <p className="mt-1 text-lg font-medium text-cyan-400">
                      {formatCurrency(mockPipelineResult.custoEstimado)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {demanda.status === "em_analise" && criteriosCompletos && (
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
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleAprovar} leftIcon={<CheckCircle className="h-4 w-4" />}>
                    Aprovar Ideia
                  </Button>
                  <Button variant="outline" onClick={() => setShowAdjustModal(true)} leftIcon={<AlertCircle className="h-4 w-4" />}>
                    Solicitar Ajustes
                  </Button>
                  <Button variant="danger" onClick={() => setShowRejectModal(true)} leftIcon={<XCircle className="h-4 w-4" />}>
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {canCreateProject && (
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">Ideia Aprovada!</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleCriarProjeto} leftIcon={<Zap className="h-4 w-4" />}>
                  Criar Projeto a partir desta Ideia
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Cliente(s)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientes.length === 0 ? (
                <p className="text-slate-500">Nenhum cliente selecionado</p>
              ) : (
                <div className="space-y-2">
                  {clientes.map((cliente) => (
                    <div key={cliente!.id} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                      <p className="font-medium text-slate-100">{cliente!.nome}</p>
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
                  <dd className="font-medium text-slate-100">{formatDate(demanda.prazoDesejado)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Submetida em</dt>
                  <dd className="text-slate-300">{formatDate(demanda.createdAt)}</dd>
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

      {/* Modals */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Rejeitar Ideia">
        <div className="space-y-4">
          <Textarea label="Motivo" placeholder="Descreva o motivo..." rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleRejeitar}>Confirmar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="Solicitar Ajustes">
        <div className="space-y-4">
          <Textarea label="Ajustes" placeholder="Descreva os ajustes..." rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAdjustModal(false)}>Cancelar</Button>
            <Button onClick={handleSolicitarAjustes}>Enviar</Button>
          </div>
        </div>
      </Modal>

      <FluxoEtapaModal
        isOpen={showFluxoModal}
        onClose={() => setShowFluxoModal(false)}
        etapaAtual={demanda.etapa}
        onMudarEtapa={handleMudarEtapa}
        criteriosPreenchidos={criteriosCompletos}
        aprovadoComite={demanda.comiteId ? verificarAprovacao(id, demanda.comiteId) : false}
      />
    </Layout>
  );
};

export default DemandaDetailPage;
