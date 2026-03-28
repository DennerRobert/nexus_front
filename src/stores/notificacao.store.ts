import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notificacao, NotificacaoCategoria, NotificacaoFiltro } from "@/interfaces/notificacao.interface";

const MOCK_NOTIFICACOES: Notificacao[] = [
  {
    id: "n-01",
    tipo: "demanda_aprovada",
    categoria: "demanda",
    titulo: "Demanda aprovada",
    mensagem: "Sua demanda \"Modernização do sistema de RH\" foi aprovada pelo comitê.",
    lida: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    link: "/demandas/d-001",
    entidadeId: "d-001",
  },
  {
    id: "n-02",
    tipo: "tarefa_atribuida",
    categoria: "tarefa",
    titulo: "Nova tarefa atribuída",
    mensagem: "A tarefa \"Implementar autenticação SSO\" foi atribuída a você no projeto Portal Corporativo.",
    lida: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    link: "/projetos/p-001",
    entidadeId: "p-001",
  },
  {
    id: "n-03",
    tipo: "comentario_adicionado",
    categoria: "tarefa",
    titulo: "Novo comentário na tarefa",
    mensagem: "Ana Souza comentou em \"Revisar documentação de APIs\": \"Precisamos incluir os endpoints de relatório.\"",
    lida: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    link: "/projetos/p-002",
    entidadeId: "p-002",
  },
  {
    id: "n-04",
    tipo: "marco_proximo",
    categoria: "projeto",
    titulo: "Marco se aproximando",
    mensagem: "O marco \"Entrega do MVP\" do projeto Portal Corporativo vence em 3 dias.",
    lida: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    link: "/projetos/p-001",
    entidadeId: "p-001",
  },
  {
    id: "n-05",
    tipo: "demanda_em_analise",
    categoria: "demanda",
    titulo: "Demanda em análise",
    mensagem: "Sua demanda \"Integração com plataforma de e-learning\" entrou em análise técnica.",
    lida: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    link: "/demandas/d-003",
    entidadeId: "d-003",
  },
  {
    id: "n-06",
    tipo: "sprint_iniciada",
    categoria: "projeto",
    titulo: "Sprint iniciada",
    mensagem: "A Sprint 4 do projeto Migração Cloud foi iniciada com 12 tarefas planejadas.",
    lida: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    link: "/projetos/p-003",
    entidadeId: "p-003",
  },
  {
    id: "n-07",
    tipo: "demanda_ajustes",
    categoria: "demanda",
    titulo: "Demanda requer ajustes",
    mensagem: "A demanda \"Novo módulo de relatórios gerenciais\" precisa de ajustes antes de prosseguir.",
    lida: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    link: "/demandas/d-004",
    entidadeId: "d-004",
  },
  {
    id: "n-08",
    tipo: "alocacao_criada",
    categoria: "projeto",
    titulo: "Alocação registrada",
    mensagem: "Carlos Lima foi alocado ao projeto Portal Corporativo como Desenvolvedor Sênior.",
    lida: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: "/projetos/p-001",
    entidadeId: "p-001",
  },
  {
    id: "n-09",
    tipo: "projeto_atualizado",
    categoria: "projeto",
    titulo: "Projeto atualizado",
    mensagem: "O cronograma do projeto \"Migração Cloud\" foi atualizado. Nova data de entrega: 30/06/2026.",
    lida: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    link: "/projetos/p-003",
    entidadeId: "p-003",
  },
  {
    id: "n-10",
    tipo: "demanda_criada",
    categoria: "demanda",
    titulo: "Nova demanda registrada",
    mensagem: "A demanda \"Automação de processos de compliance\" foi registrada e aguarda triagem.",
    lida: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: "/demandas/d-005",
    entidadeId: "d-005",
  },
  {
    id: "n-11",
    tipo: "demanda_rejeitada",
    categoria: "demanda",
    titulo: "Demanda rejeitada",
    mensagem: "A demanda \"Sistema de gamificação interna\" foi rejeitada. Motivo: fora do escopo estratégico.",
    lida: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    link: "/demandas/d-006",
    entidadeId: "d-006",
  },
  {
    id: "n-12",
    tipo: "comentario_adicionado",
    categoria: "tarefa",
    titulo: "Novo comentário na tarefa",
    mensagem: "Pedro Alves comentou em \"Configurar pipeline CI/CD\": \"Ambiente de staging pronto para testes.\"",
    lida: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    link: "/projetos/p-002",
    entidadeId: "p-002",
  },
];

interface NotificacaoState {
  notificacoes: Notificacao[];

  // Getters
  getAll: () => Notificacao[];
  getNaoLidas: () => Notificacao[];
  getByCategoria: (categoria: NotificacaoCategoria) => Notificacao[];
  getByFiltro: (filtro: NotificacaoFiltro) => Notificacao[];
  countNaoLidas: () => number;

  // Actions
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  remover: (id: string) => void;
  removerTodas: () => void;
}

export const useNotificacaoStore = create<NotificacaoState>()(
  persist(
    (set, get) => ({
      notificacoes: MOCK_NOTIFICACOES,

      getAll: () => get().notificacoes,

      getNaoLidas: () => get().notificacoes.filter((n) => !n.lida),

      getByCategoria: (categoria) =>
        get().notificacoes.filter((n) => n.categoria === categoria),

      getByFiltro: (filtro) => {
        const { notificacoes } = get();
        if (filtro === "todas") return notificacoes;
        if (filtro === "nao_lidas") return notificacoes.filter((n) => !n.lida);
        return notificacoes.filter((n) => n.categoria === filtro);
      },

      countNaoLidas: () => get().notificacoes.filter((n) => !n.lida).length,

      marcarComoLida: (id) =>
        set((state) => ({
          notificacoes: state.notificacoes.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          ),
        })),

      marcarTodasComoLidas: () =>
        set((state) => ({
          notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true })),
        })),

      remover: (id) =>
        set((state) => ({
          notificacoes: state.notificacoes.filter((n) => n.id !== id),
        })),

      removerTodas: () => set({ notificacoes: [] }),
    }),
    { name: "sgpi-notificacoes" }
  )
);
