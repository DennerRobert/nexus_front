import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  KanbanEmpresaConfig,
  EtapaKanbanConfig,
} from "@/interfaces/kanban-config.interface";
import {
  ETAPAS_ORDEM,
  ETAPA_DEMANDA_LABELS,
} from "@/interfaces/etapa-demanda.interface";
import { kanbanConfigService } from "@/services/kanban-config.service";

const criarConfigPadrao = (empresaId: string): KanbanEmpresaConfig => ({
  empresaId,
  etapas: ETAPAS_ORDEM.map((etapa, ordem) => ({
    etapa,
    titulo: ETAPA_DEMANDA_LABELS[etapa],
    visivel: true,
    ordem,
  })),
  updatedAt: new Date(),
});

interface KanbanConfigState {
  configs: Record<string, KanbanEmpresaConfig>;
  isLoading: boolean;
}

interface KanbanConfigActions {
  getConfig: (empresaId: string) => KanbanEmpresaConfig;
  fetchAll: () => Promise<void>;
  updateConfig: (empresaId: string, etapas: EtapaKanbanConfig[]) => void;
  resetConfig: (empresaId: string) => void;
}

type KanbanConfigStore = KanbanConfigState & KanbanConfigActions;

export const useKanbanConfigStore = create<KanbanConfigStore>()(
  persist(
    (set, get) => ({
      configs: {},
      isLoading: false,

      getConfig: (empresaId) =>
        get().configs[empresaId] ?? criarConfigPadrao(empresaId),

      fetchAll: async () => {
        set({ isLoading: true });
        try {
          const apiConfigs = await kanbanConfigService.getAll();
          const { configs: local } = get();

          // Mescla: usa config local (customizações do usuário) quando disponível,
          // senão usa o que veio da API.
          const merged: Record<string, KanbanEmpresaConfig> = {};
          for (const cfg of apiConfigs) {
            merged[cfg.empresaId] = local[cfg.empresaId] ?? cfg;
          }

          set({ configs: merged, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      updateConfig: (empresaId, etapas) => {
        const updated: KanbanEmpresaConfig = { empresaId, etapas, updatedAt: new Date() };
        set((state) => ({
          configs: { ...state.configs, [empresaId]: updated },
        }));
        void kanbanConfigService
          .update(empresaId, etapas)
          .catch(() => {});
      },

      resetConfig: (empresaId) => {
        const configPadrao = criarConfigPadrao(empresaId);
        set((state) => ({
          configs: { ...state.configs, [empresaId]: configPadrao },
        }));
        void kanbanConfigService
          .update(empresaId, configPadrao.etapas)
          .catch(() => {});
      },
    }),
    {
      name: "sgpi-kanban-config",
      version: 2,
      migrate: () => ({ configs: {}, isLoading: false }),
      // Persiste apenas as customizações do usuário
      partialize: (state) => ({ configs: state.configs }),
    },
  ),
);
