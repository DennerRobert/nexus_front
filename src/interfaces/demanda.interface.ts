import type { EtapaDemanda, HistoricoEtapa } from "./etapa-demanda.interface";
import type { RespostaAvaliacao } from "./avaliacao-demanda.interface";

export type StatusDemanda =
  | "rascunho"
  | "em_analise"
  | "aguardando_aprovacao"
  | "aprovada"
  | "em_ajustes"
  | "rejeitada"
  | "convertida";

export type EstagioIdeia =
  | "conceito"
  | "validacao"
  | "prototipo"
  | "mvp"
  | "escala";

export type HorizonteInovacao =
  | "h1_curto_prazo"
  | "h2_medio_prazo"
  | "h3_longo_prazo";

export type ExisteSolucaoMercado = "sim" | "nao" | "parcial";

export interface Demanda {
  id: string;
  // Campos do formulário de inovação
  nomeProponente: string;
  empresaUnidadeApoioId: string;
  titulo: string;
  estagioIdeia: EstagioIdeia;
  problemaResolver: string;
  existeSolucaoMercado: ExisteSolucaoMercado;
  descricaoSolucaoExistente?: string;
  quemSofreProblema: string;
  ideiaSolucao: string;
  principaisBeneficios: string;
  recursosNecessarios: string;
  horizonteInovacao: HorizonteInovacao;
  anexos?: string[]; // Campo legado - usar anexosIds
  
  // Campos de sistema
  clienteIds: string[];
  prazoDesejado: Date;
  solicitanteId: string;
  status: StatusDemanda;
  observacoes?: string;
  motivoRejeicao?: string;
  projetoId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Novos campos para fluxo de etapas
  etapa: EtapaDemanda;
  exibirVitrine: boolean;
  avaliacoes: RespostaAvaliacao[];
  anexosIds: string[];
  justificativaArquivamento?: string;
  comiteId?: string;
  historicoEtapas: HistoricoEtapa[];
  squadSugeridoId?: string; // Sugestão de squad pela IA
}

export interface DemandaFormData {
  nomeProponente: string;
  empresaUnidadeApoioId: string;
  titulo: string;
  estagioIdeia: EstagioIdeia;
  problemaResolver: string;
  existeSolucaoMercado: ExisteSolucaoMercado;
  descricaoSolucaoExistente?: string;
  quemSofreProblema: string;
  ideiaSolucao: string;
  principaisBeneficios: string;
  recursosNecessarios: string;
  horizonteInovacao: HorizonteInovacao;
  clienteIds: string[];
  prazoDesejado: Date;
  exibirVitrine?: boolean;
}

export const STATUS_DEMANDA_LABELS: Record<StatusDemanda, string> = {
  rascunho: "Rascunho",
  em_analise: "Em Análise",
  aguardando_aprovacao: "Aguardando Aprovação",
  aprovada: "Aprovada",
  em_ajustes: "Em Ajustes",
  rejeitada: "Rejeitada",
  convertida: "Convertida em Projeto",
};

export const STATUS_DEMANDA_COLORS: Record<StatusDemanda, string> = {
  rascunho: "bg-slate-500",
  em_analise: "bg-blue-500",
  aguardando_aprovacao: "bg-yellow-500",
  aprovada: "bg-green-500",
  em_ajustes: "bg-orange-500",
  rejeitada: "bg-red-500",
  convertida: "bg-purple-500",
};

export const ESTAGIO_IDEIA_LABELS: Record<EstagioIdeia, string> = {
  conceito: "Conceito/Ideia inicial",
  validacao: "Em validação",
  prototipo: "Protótipo desenvolvido",
  mvp: "MVP (Produto Mínimo Viável)",
  escala: "Pronto para escala",
};

export const HORIZONTE_INOVACAO_LABELS: Record<HorizonteInovacao, string> = {
  h1_curto_prazo: "H1 - Curto prazo (até 1 ano)",
  h2_medio_prazo: "H2 - Médio prazo (1 a 3 anos)",
  h3_longo_prazo: "H3 - Longo prazo (mais de 3 anos)",
};

export const EXISTE_SOLUCAO_MERCADO_LABELS: Record<ExisteSolucaoMercado, string> = {
  sim: "Sim, existe solução no mercado",
  nao: "Não, é uma solução inédita",
  parcial: "Parcialmente, mas com diferencial",
};
