// Etapas do fluxo de demandas
export type EtapaDemanda =
  | "ideia_recebida"
  | "analise_inicial"
  | "analise_comite"
  | "devolucao_proponente"
  | "readequacao_recebida"
  | "validacao_problema"
  | "encaminhado_grupo_trabalho"
  | "arquivado"
  | "fora_time_estrategico"
  | "concluido";

// Labels das etapas
export const ETAPA_DEMANDA_LABELS: Record<EtapaDemanda, string> = {
  ideia_recebida: "Ideia Recebida",
  analise_inicial: "Análise Inicial",
  analise_comite: "Análise Comitê",
  devolucao_proponente: "Devolução Proponente",
  readequacao_recebida: "Readequação Recebida",
  validacao_problema: "Validação do Problema",
  encaminhado_grupo_trabalho: "Encaminhado Grupo de Trabalho",
  arquivado: "Arquivado",
  fora_time_estrategico: "Fora do Time Estratégico",
  concluido: "Concluído",
};

// Cores das etapas para badges
export const ETAPA_DEMANDA_COLORS: Record<EtapaDemanda, string> = {
  ideia_recebida: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  analise_inicial: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  analise_comite: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  devolucao_proponente: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  readequacao_recebida: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  validacao_problema: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  encaminhado_grupo_trabalho: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  arquivado: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  fora_time_estrategico: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  concluido: "bg-green-500/20 text-green-400 border-green-500/30",
};

// Ordem das etapas para o Kanban
export const ETAPAS_ORDEM: EtapaDemanda[] = [
  "ideia_recebida",
  "analise_inicial",
  "analise_comite",
  "devolucao_proponente",
  "readequacao_recebida",
  "validacao_problema",
  "encaminhado_grupo_trabalho",
  "arquivado",
  "fora_time_estrategico",
  "concluido",
];

// Mapa de transições permitidas
export const TRANSICOES_PERMITIDAS: Record<EtapaDemanda, EtapaDemanda[]> = {
  ideia_recebida: ["analise_inicial"],
  analise_inicial: [
    "analise_comite",
    "devolucao_proponente",
    "validacao_problema",
    "encaminhado_grupo_trabalho",
    "arquivado",
  ],
  analise_comite: [
    "devolucao_proponente",
    "validacao_problema",
    "encaminhado_grupo_trabalho",
    "arquivado",
    "fora_time_estrategico",
  ],
  devolucao_proponente: ["readequacao_recebida"],
  readequacao_recebida: [
    "analise_comite",
    "devolucao_proponente",
    "validacao_problema",
    "encaminhado_grupo_trabalho",
    "arquivado",
  ],
  validacao_problema: [
    "encaminhado_grupo_trabalho",
    "arquivado",
    "fora_time_estrategico",
  ],
  encaminhado_grupo_trabalho: ["concluido"],
  arquivado: ["analise_comite"],
  fora_time_estrategico: ["analise_comite"],
  concluido: [],
};

// Histórico de mudança de etapa
export interface HistoricoEtapa {
  id: string;
  etapaAnterior: EtapaDemanda;
  etapaNova: EtapaDemanda;
  usuarioId: string;
  data: Date;
  observacao?: string;
  justificativa?: string;
}
