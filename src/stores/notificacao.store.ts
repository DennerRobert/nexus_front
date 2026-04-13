import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notificacao, NotificacaoCategoria, NotificacaoFiltro } from "@/interfaces/notificacao.interface";
import { notificacaoService } from "@/services/notificacao.service";

interface NotificacaoState {
  notificacoes: Notificacao[];
  isLoading: boolean;
  error: string | null;

  // Getters
  getAll: () => Notificacao[];
  getNaoLidas: () => Notificacao[];
  getByCategoria: (categoria: NotificacaoCategoria) => Notificacao[];
  getByFiltro: (filtro: NotificacaoFiltro) => Notificacao[];
  countNaoLidas: () => number;

  // Async
  fetchAll: () => Promise<void>;

  // Actions (otimistas + background API)
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  remover: (id: string) => void;
  removerTodas: () => void;
}

export const useNotificacaoStore = create<NotificacaoState>()(
  persist(
    (set, get) => ({
      notificacoes: [],
      isLoading: false,
      error: null,

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

      fetchAll: async () => {
        set({ isLoading: true, error: null });
        try {
          const apiData = await notificacaoService.getAll();
          const { notificacoes: cache } = get();

          // Mescla: aplica o estado "lida" do cache local às notificações da API
          const leitasIds = new Set(cache.filter((n) => n.lida).map((n) => n.id));
          const merged = apiData.map((n) => ({
            ...n,
            lida: leitasIds.has(n.id) ? true : n.lida,
          }));

          set({ notificacoes: merged, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      marcarComoLida: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) =>
            n.id === id ? { ...n, lida: true } : n,
          ),
        }));
        void notificacaoService.marcarComoLida(id).catch(() => {});
      },

      marcarTodasComoLidas: () => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true })),
        }));
        void notificacaoService.marcarTodasComoLidas().catch(() => {});
      },

      remover: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.filter((n) => n.id !== id),
        }));
        void notificacaoService.remove(id).catch(() => {});
      },

      removerTodas: () => set({ notificacoes: [] }),
    }),
    {
      name: "sgpi-notificacoes",
      // Persiste apenas a lista para preservar o status "lida" entre sessões
      partialize: (state) => ({ notificacoes: state.notificacoes }),
    },
  ),
);
