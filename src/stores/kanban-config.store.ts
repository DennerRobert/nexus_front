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
      configs: {},

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
          const { [empresaId]: _removed, ...rest } = state.configs;
          return { configs: rest };
        });
      },
    }),
    { name: "sgpi-kanban-config" }
  )
);
