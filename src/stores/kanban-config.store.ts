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
import { mockKanbanConfigs } from "@/utils/mock-data";

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
}

interface KanbanConfigActions {
  getConfig: (empresaId: string) => KanbanEmpresaConfig;
  updateConfig: (empresaId: string, etapas: EtapaKanbanConfig[]) => void;
  resetConfig: (empresaId: string) => void;
}

type KanbanConfigStore = KanbanConfigState & KanbanConfigActions;

export const useKanbanConfigStore = create<KanbanConfigStore>()(
  persist(
    (set, get) => ({
      configs: mockKanbanConfigs,

      getConfig: (empresaId) =>
        get().configs[empresaId] ?? criarConfigPadrao(empresaId),

      updateConfig: (empresaId, etapas) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [empresaId]: {
              empresaId,
              etapas,
              updatedAt: new Date(),
            },
          },
        }));
      },

      resetConfig: (empresaId) => {
        set((state) => {
          const configPadrao =
            mockKanbanConfigs[empresaId] ?? criarConfigPadrao(empresaId);
          return {
            configs: {
              ...state.configs,
              [empresaId]: configPadrao,
            },
          };
        });
      },
    }),
    {
      name: "sgpi-kanban-config",
      // Garante que os configs mock da sessão atual sempre estejam presentes,
      // mas preserva customizações salvas pelo usuário para os mesmos IDs.
      merge: (persistedState, currentState) => {
        const persisted =
          (persistedState as Partial<KanbanConfigState>)?.configs ?? {};
        return {
          ...currentState,
          configs: {
            ...mockKanbanConfigs,
            ...persisted,
          },
        };
      },
    }
  )
);
