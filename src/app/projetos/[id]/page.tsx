"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, type Tab } from "@/components/Tabs";
import { Timeline, AddMarcoButton } from "@/components/Timeline";
import { KanbanBoard } from "@/components/KanbanBoard";
import { SaudeCronograma } from "@/components/SaudeCronograma";
import { Planejamento } from "@/components/Planejamento";
import { TarefaDetailModal } from "@/components/TarefaDetailModal";
import { SprintSelector } from "@/components/SprintSelector";
import { SprintHeader } from "@/components/SprintHeader";
import { SprintModal } from "@/components/SprintModal";
import { useAuth } from "@/hooks/useAuth";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useProjetoStore } from "@/stores/projeto.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useClienteStore } from "@/stores/cliente.store";
import { useSquadStore } from "@/stores/squad.store";
import { useAlocacaoStore } from "@/stores/alocacao.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useProdutoStore } from "@/stores/produto.store";
import { useTarefaStore } from "@/stores/tarefa.store";
import { useMarcoProjetoStore } from "@/stores/marco-projeto.store";
import { useAcompanhamentoStore } from "@/stores/acompanhamento.store";
import { useDemandaStore } from "@/stores/demanda.store";
import { useSprintStore, vincularTarefasAsSprints } from "@/stores/sprint.store";
import { useRegistroHorasStore } from "@/stores/registro-horas.store";
import type { StatusProjeto } from "@/interfaces/projeto.interface";
import type { Sprint } from "@/interfaces/sprint.interface";
import { STATUS_PROJETO_LABELS } from "@/interfaces/projeto.interface";
import { PAPEL_ALOCACAO_LABELS } from "@/interfaces/alocacao.interface";
import { CLASSIFICACAO_PRODUTO_LABELS, type ClassificacaoProduto } from "@/interfaces/produto.interface";
import type { Tarefa, StatusTarefa } from "@/interfaces/tarefa.interface";
import { PRIORIDADE_TAREFA_LABELS } from "@/interfaces/tarefa.interface";
import { ICONE_MARCO_LABELS } from "@/interfaces/marco-projeto.interface";
import type { Demanda } from "@/interfaces/demanda.interface";
import type { Cliente } from "@/interfaces/cliente.interface";
import {
  ESTAGIO_IDEIA_LABELS,
  HORIZONTE_INOVACAO_LABELS,
  EXISTE_SOLUCAO_MERCADO_LABELS,
} from "@/interfaces/demanda.interface";
import { tarefaSchema, type TarefaSchemaType } from "@/schemas/tarefa.schema";
import { marcoProjetoSchema, type MarcoProjetoSchemaType } from "@/schemas/marco-projeto.schema";
import { formatDate, formatCurrency, coerceDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  PlayCircle,
  Package,
  Users,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  Kanban,
  Clock,
  Trophy,
  Lightbulb,
  Target,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

const statusVariantMap: Record<StatusProjeto, BadgeVariant> = {
  aguardando_aprovacao: "warning",
  aprovado: "info",
  em_execucao: "primary",
  pausado: "secondary",
  concluido: "success",
  cancelado: "danger",
};

interface ProjetoDetailPageProps {
  params: Promise<{ id: string }>;
}

const ProjetoDetailPage = ({ params }: ProjetoDetailPageProps) => {
  const { id } = use(params);
  const router = useRouter();

  // Stores
  const { getById, aprovar, rejeitar, iniciarExecucao, concluir } = useProjetoStore();
  const { getById: getEmpresa } = useEmpresaStore();
  const { getById: getCliente } = useClienteStore();
  const { getByProjeto: getSquad } = useSquadStore();
  const { getAtivasBySquad } = useAlocacaoStore();
  const { getById: getColaborador } = useColaboradorStore();
  const { criarDeProjeto } = useProdutoStore();
  const { getByProjeto: getTarefas, create: createTarefa } = useTarefaStore();
  const { getByProjeto: getMarcos, create: createMarco } = useMarcoProjetoStore();
  const { getHorasPorProjeto, getScoresPorProjeto, getSaudeProjeto } = useAcompanhamentoStore();
  const { getById: getDemanda } = useDemandaStore();

  // State para modais
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showTarefaModal, setShowTarefaModal] = useState(false);
  const [showMarcoModal, setShowMarcoModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [classificacao, setClassificacao] = useState<ClassificacaoProduto>("mercado_externo");
  const [nomeProduto, setNomeProduto] = useState("");
  const [statusNovaTarefa, setStatusNovaTarefa] = useState<StatusTarefa>("backlog");

  // Forms
  const tarefaForm = useForm<TarefaSchemaType>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: { prioridade: "media" },
  });

  const marcoForm = useForm<MarcoProjetoSchemaType>({
    resolver: zodResolver(marcoProjetoSchema),
    defaultValues: { icone: "flag" },
  });

  // Dados
  const projeto = getById(id);
  const empresa = projeto ? getEmpresa(projeto.empresaDonaId) : undefined;
  const squad = projeto ? getSquad(projeto.id) : undefined;
  const alocacoes = squad ? getAtivasBySquad(squad.id) : [];
  const tarefas = getTarefas(id);
  const marcos = getMarcos(id);
  const horasProjeto = getHorasPorProjeto(id);
  const scoresProjeto = getScoresPorProjeto(id);
  const saudeProjeto = getSaudeProjeto(id);
  const demanda = projeto?.demandaId ? (getDemanda(projeto.demandaId) ?? null) : null;

  if (!projeto) {
    return (
      <Layout title="Projeto não encontrado">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-400">O projeto solicitado não foi encontrado.</p>
          <Link href="/projetos" className="mt-4">
            <Button variant="outline">Voltar para lista</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const clientes = projeto.clienteIds
    .map((cId) => getCliente(cId))
    .filter((c): c is Cliente => c !== undefined);

  // Handlers
  const handleAprovar = () => {
    aprovar(id);
    toast.success("Projeto aprovado!");
  };

  const handleRejeitar = () => {
    if (!motivo.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }
    rejeitar(id, motivo);
    setShowRejectModal(false);
    toast.success("Projeto rejeitado");
  };

  const handleIniciarExecucao = () => {
    iniciarExecucao(id);
    toast.success("Projeto iniciado!");
  };

  const handleConcluir = () => {
    concluir(id);
    toast.success("Projeto concluído!");
  };

  const handleConverterEmProduto = async () => {
    if (!nomeProduto.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    const produto = await criarDeProjeto(projeto, {
      nome: nomeProduto,
      descricao: projeto.descricao,
      classificacao,
    });
    if (produto) {
      toast.success("Produto criado com sucesso!");
      router.push(`/produtos/${produto.id}`);
    } else {
      toast.error("Erro ao criar produto. Tente novamente.");
    }
  };

  const handleAddTarefa = (status: StatusTarefa) => {
    setStatusNovaTarefa(status);
    tarefaForm.reset({ prioridade: "media" });
    setShowTarefaModal(true);
  };

  const handleSaveTarefa = (data: TarefaSchemaType) => {
    createTarefa(id, data);
    setShowTarefaModal(false);
    tarefaForm.reset();
    toast.success("Tarefa criada com sucesso!");
  };

  const handleSaveMarco = (data: MarcoProjetoSchemaType) => {
    createMarco(id, data);
    setShowMarcoModal(false);
    marcoForm.reset();
    toast.success("Marco adicionado com sucesso!");
  };

  const canApprove = projeto.status === "aguardando_aprovacao";
  const canStart = projeto.status === "aprovado";
  const canFinish = projeto.status === "em_execucao";
  const canConvert = projeto.status === "concluido";

  // Permissões para filtrar abas
  const { getRestricoes, isAdmin } = usePermissoes();
  const restricoes = getRestricoes("projetos");
  const abasPermitidas = restricoes?.apenasAbas || null;

  // Definição de todas as abas
  const todasAbas: Tab[] = [
    {
      id: "detalhes",
      label: "Detalhes",
      icon: <FileText className="h-4 w-4" />,
      content: (
        <TabDetalhes
          projeto={projeto}
          empresa={empresa}
          clientes={clientes}
          squad={squad}
          alocacoes={alocacoes}
          demanda={demanda}
          getColaborador={getColaborador}
          getEmpresa={getEmpresa}
          canApprove={canApprove}
          canStart={canStart}
          canFinish={canFinish}
          canConvert={canConvert}
          onAprovar={handleAprovar}
          onRejeitar={() => setShowRejectModal(true)}
          onIniciar={handleIniciarExecucao}
          onConcluir={handleConcluir}
          onConverter={() => {
            setNomeProduto(projeto.nome);
            setShowConvertModal(true);
          }}
        />
      ),
    },
    {
      id: "acompanhamento",
      label: "Acompanhamento",
      icon: <BarChart3 className="h-4 w-4" />,
      content: (
        <TabAcompanhamento
          marcos={marcos}
          horasProjeto={horasProjeto}
          scoresProjeto={scoresProjeto}
          saudeProjeto={saudeProjeto}
          getColaborador={getColaborador}
          onAddMarco={() => {
            marcoForm.reset({ icone: "flag", data: new Date() });
            setShowMarcoModal(true);
          }}
        />
      ),
    },
    {
      id: "tarefas",
      label: "Tarefas",
      icon: <Kanban className="h-4 w-4" />,
      content: (
        <TabTarefas
          projetoId={id}
          tarefas={tarefas}
          onAddTarefa={handleAddTarefa}
        />
      ),
    },
    {
      id: "planejamento",
      label: "Planejamento",
      icon: <Sparkles className="h-4 w-4" />,
      content: (
        <Planejamento
          projeto={projeto}
          demanda={demanda}
        />
      ),
    },
  ];

  // Filtra as abas com base nas permissões
  const tabs = abasPermitidas
    ? todasAbas.filter((tab) => abasPermitidas.includes(tab.id))
    : todasAbas;

  return (
    <Layout
      title={projeto.nome}
      subtitle={`Projeto #${id.slice(0, 8)}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/projetos">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para Projetos
          </Button>
        </Link>
        <Badge variant={statusVariantMap[projeto.status]}>
          {STATUS_PROJETO_LABELS[projeto.status]}
        </Badge>
      </div>

      <Tabs tabs={tabs} defaultTab="detalhes" />

      {/* Modal Rejeitar */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Rejeitar Projeto"
      >
        <div className="space-y-4">
          <Input
            label="Motivo"
            placeholder="Informe o motivo..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRejeitar}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Converter em Produto */}
      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Converter em Produto"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Produto"
            value={nomeProduto}
            onChange={(e) => setNomeProduto(e.target.value)}
          />
          <Select
            label="Classificação"
            value={classificacao}
            onChange={(e) => setClassificacao(e.target.value as ClassificacaoProduto)}
            options={Object.entries(CLASSIFICACAO_PRODUTO_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConvertModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConverterEmProduto}>Criar Produto</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Nova Tarefa */}
      <Modal
        isOpen={showTarefaModal}
        onClose={() => setShowTarefaModal(false)}
        title="Nova Tarefa"
        size="lg"
      >
        <form onSubmit={tarefaForm.handleSubmit(handleSaveTarefa)} className="space-y-4">
          <Input
            label="Título"
            placeholder="Título da tarefa"
            error={tarefaForm.formState.errors.titulo?.message}
            {...tarefaForm.register("titulo")}
          />
          <Textarea
            label="Descrição"
            placeholder="Descreva a tarefa..."
            error={tarefaForm.formState.errors.descricao?.message}
            {...tarefaForm.register("descricao")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Prioridade"
              options={Object.entries(PRIORIDADE_TAREFA_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              error={tarefaForm.formState.errors.prioridade?.message}
              {...tarefaForm.register("prioridade")}
            />
            <Input
              label="Estimativa (horas)"
              type="number"
              placeholder="8"
              error={tarefaForm.formState.errors.estimativaHoras?.message}
              {...tarefaForm.register("estimativaHoras", { valueAsNumber: true })}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setShowTarefaModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Novo Marco */}
      <Modal
        isOpen={showMarcoModal}
        onClose={() => setShowMarcoModal(false)}
        title="Adicionar Marco"
        size="lg"
      >
        <form onSubmit={marcoForm.handleSubmit(handleSaveMarco)} className="space-y-4">
          <Input
            label="Título"
            placeholder="Ex: Sprint 3 concluída"
            error={marcoForm.formState.errors.titulo?.message}
            {...marcoForm.register("titulo")}
          />
          <Textarea
            label="Descrição"
            placeholder="Detalhes do marco..."
            error={marcoForm.formState.errors.descricao?.message}
            {...marcoForm.register("descricao")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              error={marcoForm.formState.errors.data?.message}
              {...marcoForm.register("data", { setValueAs: coerceDate })}
            />
            <Select
              label="Ícone"
              options={Object.entries(ICONE_MARCO_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              error={marcoForm.formState.errors.icone?.message}
              {...marcoForm.register("icone")}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setShowMarcoModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

// Componente para exibir a demanda de origem
interface DemandaOrigemCardProps {
  demanda: Demanda;
  getEmpresa: (id: string) => { nome: string } | undefined;
  getColaborador: (id: string) => { nome: string } | undefined;
}

const DemandaOrigemCard = ({ demanda, getEmpresa, getColaborador }: DemandaOrigemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const empresaApoio = getEmpresa(demanda.empresaUnidadeApoioId);
  const solicitante = getColaborador(demanda.solicitanteId);

  return (
    <Card className="border-purple-500/30 bg-purple-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Lightbulb className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Demanda de Origem
                <Badge variant="secondary" className="text-xs font-normal">
                  Inovação
                </Badge>
              </CardTitle>
              <CardDescription className="mt-0.5">
                {demanda.titulo}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Resumo sempre visível */}
        <div className="grid gap-3 md:grid-cols-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-slate-400">Proponente:</span>
            <span className="text-slate-200">{demanda.nomeProponente}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-slate-500" />
            <span className="text-slate-400">Unidade:</span>
            <span className="text-slate-200">{empresaApoio?.nome || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-slate-500" />
            <span className="text-slate-400">Horizonte:</span>
            <Badge variant="primary" className="text-xs">
              {HORIZONTE_INOVACAO_LABELS[demanda.horizonteInovacao].split(" - ")[0]}
            </Badge>
          </div>
        </div>

        {/* Detalhes expandidos */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-200">
            {/* Problema e Solução */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-slate-300">Problema a Resolver</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {demanda.problemaResolver}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">Ideia de Solução</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {demanda.ideiaSolucao}
                </p>
              </div>
            </div>

            {/* Quem sofre com o problema */}
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-slate-300">Quem Sofre com o Problema</span>
              </div>
              <p className="text-sm text-slate-400">{demanda.quemSofreProblema}</p>
            </div>

            {/* Benefícios */}
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-slate-300">Principais Benefícios</span>
              </div>
              <p className="text-sm text-slate-400">{demanda.principaisBeneficios}</p>
            </div>

            {/* Recursos Necessários */}
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">Recursos Necessários</span>
              </div>
              <p className="text-sm text-slate-400">{demanda.recursosNecessarios}</p>
            </div>

            {/* Solução no Mercado */}
            {demanda.existeSolucaoMercado !== "nao" && demanda.descricaoSolucaoExistente && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-300">
                    {EXISTE_SOLUCAO_MERCADO_LABELS[demanda.existeSolucaoMercado]}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{demanda.descricaoSolucaoExistente}</p>
              </div>
            )}

            {/* Metadados */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500">
              <span>
                Estágio: <span className="text-slate-400">{ESTAGIO_IDEIA_LABELS[demanda.estagioIdeia]}</span>
              </span>
              <span>
                Prazo desejado: <span className="text-slate-400">{formatDate(demanda.prazoDesejado)}</span>
              </span>
              <span>
                Submetida em: <span className="text-slate-400">{formatDate(demanda.createdAt)}</span>
              </span>
            </div>

            {/* Link para demanda */}
            <div className="pt-2">
              <Link href={`/demandas/${demanda.id}`}>
                <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3 w-3" />}>
                  Ver Demanda Completa
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente da aba Detalhes
interface TabDetalhesProps {
  projeto: ReturnType<typeof useProjetoStore.getState>["getById"] extends (id: string) => infer R ? NonNullable<R> : never;
  empresa: ReturnType<typeof useEmpresaStore.getState>["getById"] extends (id: string) => infer R ? R : never;
  clientes: Array<NonNullable<ReturnType<typeof useClienteStore.getState>["getById"] extends (id: string) => infer R ? R : never>>;
  squad: ReturnType<typeof useSquadStore.getState>["getByProjeto"] extends (id: string) => infer R ? R : never;
  alocacoes: ReturnType<typeof useAlocacaoStore.getState>["getAtivasBySquad"] extends (id: string) => infer R ? R : never;
  demanda: Demanda | null;
  getColaborador: ReturnType<typeof useColaboradorStore.getState>["getById"];
  getEmpresa: ReturnType<typeof useEmpresaStore.getState>["getById"];
  canApprove: boolean;
  canStart: boolean;
  canFinish: boolean;
  canConvert: boolean;
  onAprovar: () => void;
  onRejeitar: () => void;
  onIniciar: () => void;
  onConcluir: () => void;
  onConverter: () => void;
}

const TabDetalhes = ({
  projeto,
  empresa,
  clientes,
  squad,
  alocacoes,
  demanda,
  getColaborador,
  getEmpresa,
  canApprove,
  canStart,
  canFinish,
  canConvert,
  onAprovar,
  onRejeitar,
  onIniciar,
  onConcluir,
  onConverter,
}: TabDetalhesProps) => {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Card da Demanda de Origem */}
        {demanda && (
          <DemandaOrigemCard
            demanda={demanda}
            getEmpresa={getEmpresa}
            getColaborador={getColaborador}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">{projeto.descricao}</p>
          </CardContent>
        </Card>

        {squad && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Squad: {squad.nome}
              </CardTitle>
              <CardDescription>{squad.objetivo}</CardDescription>
            </CardHeader>
            <CardContent>
              {alocacoes.length === 0 ? (
                <p className="text-slate-500">Nenhum membro alocado</p>
              ) : (
                <div className="space-y-2">
                  {alocacoes.map((alocacao) => {
                    const colaborador = getColaborador(alocacao.colaboradorId);
                    return (
                      <div
                        key={alocacao.id}
                        className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
                      >
                        <div>
                          <p className="font-medium text-slate-100">
                            {colaborador?.nome || "Colaborador não encontrado"}
                          </p>
                          <p className="text-sm text-slate-400">
                            {PAPEL_ALOCACAO_LABELS[alocacao.papel]}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-300">{alocacao.percentual}%</p>
                          <p className="text-xs text-slate-500">
                            {formatCurrency(alocacao.custoMensal)}/mês
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {canApprove && (
          <Card>
            <CardHeader>
              <CardTitle>Ações da Comitiva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={onAprovar} leftIcon={<CheckCircle className="h-4 w-4" />}>
                  Aprovar Projeto
                </Button>
                <Button
                  variant="danger"
                  onClick={onRejeitar}
                  leftIcon={<XCircle className="h-4 w-4" />}
                >
                  Rejeitar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {canStart && (
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-400">Projeto Aprovado!</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={onIniciar} leftIcon={<PlayCircle className="h-4 w-4" />}>
                Iniciar Execução
              </Button>
            </CardContent>
          </Card>
        )}

        {canFinish && (
          <Card>
            <CardHeader>
              <CardTitle className="text-cyan-400">Projeto em Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={onConcluir} leftIcon={<CheckCircle className="h-4 w-4" />}>
                Marcar como Concluído
              </Button>
            </CardContent>
          </Card>
        )}

        {canConvert && (
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400">Projeto Concluído!</CardTitle>
              <CardDescription>Converta este projeto em um produto</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onConverter} leftIcon={<Package className="h-4 w-4" />}>
                Converter em Produto
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
              Empresa Dona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-slate-100">{empresa?.nome || "Não definida"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cliente(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientes.map((cliente) => (
              <div key={cliente.id} className="mb-2">
                <p className="font-medium text-slate-100">{cliente.nome}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {cliente.origem.replace("_", " ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-slate-400">Orçamento</dt>
                <dd className="font-medium text-slate-100">
                  {formatCurrency(projeto.orcamento)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Custo Atual</dt>
                <dd className="font-medium text-cyan-400">
                  {formatCurrency(projeto.custoAtual)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">% Consumido</dt>
                <dd className="font-medium text-slate-100">
                  {((projeto.custoAtual / projeto.orcamento) * 100).toFixed(1)}%
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {projeto.dataInicio && (
                <div>
                  <dt className="text-sm text-slate-400">Início</dt>
                  <dd className="font-medium text-slate-100">
                    {formatDate(projeto.dataInicio)}
                  </dd>
                </div>
              )}
              {projeto.dataFimPrevista && (
                <div>
                  <dt className="text-sm text-slate-400">Fim Previsto</dt>
                  <dd className="font-medium text-slate-100">
                    {formatDate(projeto.dataFimPrevista)}
                  </dd>
                </div>
              )}
              {projeto.dataFimReal && (
                <div>
                  <dt className="text-sm text-slate-400">Fim Real</dt>
                  <dd className="font-medium text-green-400">
                    {formatDate(projeto.dataFimReal)}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente da aba Acompanhamento
interface TabAcompanhamentoProps {
  marcos: ReturnType<typeof useMarcoProjetoStore.getState>["getByProjeto"] extends (id: string) => infer R ? R : never;
  horasProjeto: ReturnType<typeof useAcompanhamentoStore.getState>["getHorasPorProjeto"] extends (id: string) => infer R ? R : never;
  scoresProjeto: ReturnType<typeof useAcompanhamentoStore.getState>["getScoresPorProjeto"] extends (id: string) => infer R ? R : never;
  saudeProjeto: ReturnType<typeof useAcompanhamentoStore.getState>["getSaudeProjeto"] extends (id: string) => infer R ? R : never;
  getColaborador: ReturnType<typeof useColaboradorStore.getState>["getById"];
  onAddMarco: () => void;
}

const TabAcompanhamento = ({
  marcos,
  horasProjeto,
  scoresProjeto,
  saudeProjeto,
  getColaborador,
  onAddMarco,
}: TabAcompanhamentoProps) => {
  return (
    <div className="space-y-6">
      {/* Timeline de Marcos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline do Projeto
            </CardTitle>
            <AddMarcoButton onClick={onAddMarco} />
          </div>
        </CardHeader>
        <CardContent>
          <Timeline marcos={marcos} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Horas por Integrante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horas por Integrante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {horasProjeto.horasPorColaborador.map((horas) => {
                const colaborador = getColaborador(horas.colaboradorId);
                const percentual = (horas.horasRegistradas / horas.horasEstimadas) * 100;
                return (
                  <div key={horas.colaboradorId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">
                        {colaborador?.nome || "Colaborador"}
                      </span>
                      <span className="text-sm text-slate-400">
                        {horas.horasRegistradas}h / {horas.horasEstimadas}h
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min(percentual, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-slate-700/50 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">Total</span>
                  <span className="font-medium text-cyan-400">
                    {horasProjeto.totalHorasRegistradas}h / {horasProjeto.totalHorasEstimadas}h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score de Participação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Score de Participação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoresProjeto.scores
                .sort((a, b) => b.score - a.score)
                .map((score, index) => {
                  const colaborador = getColaborador(score.colaboradorId);
                  return (
                    <div
                      key={score.colaboradorId}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : index === 1
                              ? "bg-slate-400/20 text-slate-300"
                              : index === 2
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-slate-700/50 text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {colaborador?.nome || "Colaborador"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {score.tarefasConcluidas} tarefas • {score.horasTrabalhadas}h
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-cyan-400">{score.score}</p>
                        <p className="text-xs text-slate-500">pts</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saúde do Cronograma */}
      <SaudeCronograma saude={saudeProjeto} />
    </div>
  );
};

// Componente da aba Tarefas
interface TabTarefasProps {
  projetoId: string;
  tarefas: Tarefa[];
  onAddTarefa: (status: StatusTarefa) => void;
}

const TabTarefas = ({ projetoId, tarefas, onAddTarefa }: TabTarefasProps) => {
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintParaEditar, setSprintParaEditar] = useState<Sprint | null>(null);

  const { getByProjeto: getSprints } = useSprintStore();
  const sprints = getSprints(projetoId);
  const selectedSprint = sprints.find((s) => s.id === selectedSprintId);

  // Vincula tarefas às sprints na primeira renderização
  useEffect(() => {
    vincularTarefasAsSprints();
  }, []);

  // Filtra tarefas pela sprint selecionada
  const tarefasFiltradas = selectedSprintId === null
    ? tarefas // Todas as tarefas
    : selectedSprintId === "backlog"
    ? tarefas.filter((t) => !t.sprintId) // Apenas backlog
    : tarefas.filter((t) => t.sprintId === selectedSprintId); // Sprint específica

  const handleEditTarefa = (tarefa: Tarefa) => {
    setSelectedTarefa(tarefa);
  };

  const handleTarefaUpdate = (updated: Tarefa) => {
    // O store já atualiza, apenas atualizamos o estado local
    setSelectedTarefa(updated);
  };

  const handleEditSprint = () => {
    if (selectedSprint) {
      setSprintParaEditar(selectedSprint);
      setShowSprintModal(true);
    }
  };

  // ID do usuário atual (via autenticação)
  const { usuarioId } = useAuth();
  const usuarioAtualId = usuarioId || "anonymous";

  return (
    <div className="space-y-4">
      {/* Header com selector de sprint */}
      <div className="flex items-center justify-between">
        <SprintSelector
          sprints={sprints}
          selectedSprintId={selectedSprintId}
          onSelect={setSelectedSprintId}
          onCreateSprint={() => {
            setSprintParaEditar(null);
            setShowSprintModal(true);
          }}
        />

        <div className="text-sm text-slate-400">
          {tarefasFiltradas.length} tarefa{tarefasFiltradas.length !== 1 ? "s" : ""}
          {selectedSprintId && selectedSprintId !== "backlog" && (
            <span> na sprint</span>
          )}
        </div>
      </div>

      {/* Header da sprint selecionada (se houver) */}
      {selectedSprint && selectedSprint.status !== "concluida" && (
        <SprintHeader sprint={selectedSprint} onEdit={handleEditSprint} />
      )}

      {/* Kanban */}
      <KanbanBoard
        projetoId={projetoId}
        tarefas={tarefasFiltradas}
        onAddTarefa={onAddTarefa}
        onEditTarefa={handleEditTarefa}
      />

      {/* Modal de detalhes da tarefa */}
      <TarefaDetailModal
        tarefa={selectedTarefa}
        isOpen={!!selectedTarefa}
        onClose={() => setSelectedTarefa(null)}
        onUpdate={handleTarefaUpdate}
        usuarioAtualId={usuarioAtualId}
      />

      {/* Modal de sprint */}
      <SprintModal
        projetoId={projetoId}
        sprint={sprintParaEditar}
        isOpen={showSprintModal}
        onClose={() => {
          setShowSprintModal(false);
          setSprintParaEditar(null);
        }}
      />
    </div>
  );
};

export default ProjetoDetailPage;
