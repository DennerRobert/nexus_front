// =====================================================
// TIPOS E ENUMS
// =====================================================

export type StatusPlanejamento = "rascunho" | "em_revisao" | "aprovado";

export const STATUS_PLANEJAMENTO_LABELS: Record<StatusPlanejamento, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em Revisão",
  aprovado: "Aprovado",
};

export type PrioridadeRequisito = "essencial" | "importante" | "desejavel";

export const PRIORIDADE_REQUISITO_LABELS: Record<PrioridadeRequisito, string> = {
  essencial: "Essencial",
  importante: "Importante",
  desejavel: "Desejável",
};

export type TipoRequisito = "funcional" | "nao_funcional";

export type CategoriaRNF =
  | "performance"
  | "seguranca"
  | "usabilidade"
  | "disponibilidade"
  | "escalabilidade"
  | "manutencao";

export const CATEGORIA_RNF_LABELS: Record<CategoriaRNF, string> = {
  performance: "Performance",
  seguranca: "Segurança",
  usabilidade: "Usabilidade",
  disponibilidade: "Disponibilidade",
  escalabilidade: "Escalabilidade",
  manutencao: "Manutenção",
};

export type SeveridadeRisco = "baixa" | "media" | "alta" | "critica";

export const SEVERIDADE_RISCO_LABELS: Record<SeveridadeRisco, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

// =====================================================
// PLANO DE TRABALHO
// =====================================================

export interface FaseProjeto {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  dataInicio: Date;
  dataFim: Date;
  horasEstimadas: number;
  responsavelIds: string[]; // IDs dos colaboradores
  dependencias: string[]; // IDs de outras fases
  status: "pendente" | "em_andamento" | "concluida";
}

export interface MarcoPlano {
  id: string;
  titulo: string;
  descricao: string;
  dataPrevista: Date;
  faseId: string;
  entregaveis: string[];
}

export interface EstimativaEsforco {
  totalHoras: number;
  porEspecialidade: {
    especialidade: string;
    horas: number;
  }[];
  porFase: {
    faseId: string;
    horas: number;
  }[];
}

export interface CronogramaMacro {
  dataInicioPrevista: Date;
  dataFimPrevista: Date;
  duracaoSemanas: number;
  fases: {
    faseId: string;
    nome: string;
    inicio: Date;
    fim: Date;
    percentualDuracao: number;
  }[];
}

export interface PlanoTrabalho {
  id: string;
  projetoId: string;
  fases: FaseProjeto[];
  marcos: MarcoPlano[];
  estimativaTotal: EstimativaEsforco;
  cronogramaMacro: CronogramaMacro;
}

// =====================================================
// REQUISITOS DO SISTEMA
// =====================================================

export interface RequisitoFuncional {
  id: string;
  codigo: string; // RF01, RF02, etc.
  titulo: string;
  descricao: string;
  prioridade: PrioridadeRequisito;
  criteriosAceitacao: string[];
  userStoryId?: string;
}

export interface RequisitoNaoFuncional {
  id: string;
  codigo: string; // RNF01, RNF02, etc.
  titulo: string;
  descricao: string;
  categoria: CategoriaRNF;
  metrica?: string; // Ex: "Tempo de resposta < 500ms"
  prioridade: PrioridadeRequisito;
}

export interface UserStory {
  id: string;
  codigo: string; // US01, US02, etc.
  persona: string; // "Como [persona]"
  acao: string; // "quero [ação]"
  beneficio: string; // "para [benefício]"
  criteriosAceitacao: string[];
  prioridade: PrioridadeRequisito;
  requisitosRelacionados: string[]; // IDs dos RFs
}

export interface CasoUso {
  id: string;
  codigo: string; // UC01, UC02, etc.
  titulo: string;
  atorPrincipal: string;
  preCondicoes: string[];
  fluxoPrincipal: string[];
  fluxosAlternativos: {
    id: string;
    condicao: string;
    passos: string[];
  }[];
  posCondicoes: string[];
}

export interface RegraNegocio {
  id: string;
  codigo: string; // RN01, RN02, etc.
  titulo: string;
  descricao: string;
  modulo: string;
}

export interface RequisitosSistema {
  id: string;
  projetoId: string;
  funcionais: RequisitoFuncional[];
  naoFuncionais: RequisitoNaoFuncional[];
  userStories: UserStory[];
  casosUso: CasoUso[];
  regrasNegocio: RegraNegocio[];
}

// =====================================================
// ARQUITETURA TÉCNICA
// =====================================================

export interface TecnologiaStack {
  nome: string;
  versao?: string;
  categoria: "linguagem" | "framework" | "biblioteca" | "ferramenta" | "infra";
  justificativa: string;
}

export interface StackTecnologica {
  frontend: TecnologiaStack[];
  backend: TecnologiaStack[];
  banco: TecnologiaStack[];
  infra: TecnologiaStack[];
  outros: TecnologiaStack[];
}

export interface ComponenteArquitetura {
  id: string;
  nome: string;
  tipo: "frontend" | "backend" | "api" | "banco" | "servico" | "integracao";
  descricao: string;
  responsabilidades: string[];
  tecnologias: string[];
  dependencias: string[]; // IDs de outros componentes
}

export interface Integracao {
  id: string;
  nome: string;
  tipo: "api_externa" | "sistema_legado" | "servico_terceiro" | "webhook";
  descricao: string;
  endpoint?: string;
  autenticacao: string;
  observacoes: string;
}

export interface RiscoTecnico {
  id: string;
  titulo: string;
  descricao: string;
  severidade: SeveridadeRisco;
  probabilidade: "baixa" | "media" | "alta";
  impacto: string;
  mitigacao: string;
}

export interface ArquiteturaTecnica {
  id: string;
  projetoId: string;
  stackSugerida: StackTecnologica;
  componentes: ComponenteArquitetura[];
  integracoes: Integracao[];
  riscos: RiscoTecnico[];
  premissas: string[];
  restricoes: string[];
}

// =====================================================
// PLANEJAMENTO COMPLETO
// =====================================================

export interface PlanejamentoProjeto {
  id: string;
  projetoId: string;
  status: StatusPlanejamento;
  versao: number;
  planoTrabalho: PlanoTrabalho;
  requisitos: RequisitosSistema;
  arquitetura: ArquiteturaTecnica;
  geradoEm: Date;
  geradoPor: string;
  editadoEm?: Date;
  editadoPor?: string;
  enviadoParaRevisaoEm?: Date;
  enviadoParaRevisaoPor?: string;
  aprovadoEm?: Date;
  aprovadoPor?: string;
  observacoes?: string;
}

export interface HistoricoVersao {
  versao: number;
  data: Date;
  autor: string;
  acao: "criacao" | "edicao" | "regeneracao" | "aprovacao";
  descricao: string;
}

// =====================================================
// FORM DATA
// =====================================================

export interface MarcoPlanoFormData {
  titulo: string;
  descricao: string;
  dataPrevista: Date;
  faseId: string;
  entregaveis: string[];
}

export interface RequisitoFormData {
  tipo: TipoRequisito;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeRequisito;
  categoria?: CategoriaRNF;
  metrica?: string;
  criteriosAceitacao?: string[];
}

export interface UserStoryFormData {
  persona: string;
  acao: string;
  beneficio: string;
  prioridade: PrioridadeRequisito;
  criteriosAceitacao: string[];
}
