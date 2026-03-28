export type NotificacaoTipo =
  | "demanda_criada"
  | "demanda_aprovada"
  | "demanda_rejeitada"
  | "demanda_em_analise"
  | "demanda_ajustes"
  | "comentario_adicionado"
  | "tarefa_atribuida"
  | "sprint_iniciada"
  | "marco_proximo"
  | "projeto_atualizado"
  | "alocacao_criada";

export type NotificacaoCategoria = "demanda" | "projeto" | "tarefa" | "sistema";

export type NotificacaoFiltro = "todas" | "nao_lidas" | NotificacaoCategoria;

export interface Notificacao {
  id: string;
  tipo: NotificacaoTipo;
  categoria: NotificacaoCategoria;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
  link?: string;
  entidadeId?: string;
}

export const NOTIFICACAO_CATEGORIA_LABELS: Record<NotificacaoCategoria, string> = {
  demanda: "Demandas",
  projeto: "Projetos",
  tarefa: "Tarefas",
  sistema: "Sistema",
};

export const NOTIFICACAO_FILTRO_LABELS: Record<NotificacaoFiltro, string> = {
  todas: "Todas",
  nao_lidas: "Não lidas",
  demanda: "Demandas",
  projeto: "Projetos",
  tarefa: "Tarefas",
  sistema: "Sistema",
};
