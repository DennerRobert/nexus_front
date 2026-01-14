import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppContexto } from "@/interfaces/tenant.interface";

interface ContextoState {
  contexto: AppContexto;
  isInitialized: boolean;
}

interface ContextoActions {
  setTenant: (tenantId: string) => void;
  setUnidade: (unidadeId: string | null) => void;
  setContexto: (tenantId: string, unidadeId: string | null) => void;
  getTenantId: () => string | null;
  getUnidadeId: () => string | null;
  isTodasUnidades: () => boolean;
  initialize: (tenantId: string) => void;
}

type ContextoStore = ContextoState & ContextoActions;

export const useContextoStore = create<ContextoStore>()(
  persist(
    (set, get) => ({
      contexto: {
        tenantId: null,
        unidadeId: null, // null = "Todas as Unidades"
      },
      isInitialized: false,

      setTenant: (tenantId: string) => {
        set({
          contexto: {
            tenantId,
            unidadeId: null, // Reset para "Todas" ao mudar de tenant
          },
        });
      },

      setUnidade: (unidadeId: string | null) => {
        set((state) => ({
          contexto: {
            ...state.contexto,
            unidadeId,
          },
        }));
      },

      setContexto: (tenantId: string, unidadeId: string | null) => {
        set({
          contexto: {
            tenantId,
            unidadeId,
          },
        });
      },

      getTenantId: () => get().contexto.tenantId,

      getUnidadeId: () => get().contexto.unidadeId,

      isTodasUnidades: () => get().contexto.unidadeId === null,

      initialize: (tenantId: string) => {
        const state = get();
        // Só inicializa se não estiver inicializado ou se não tiver tenant
        if (!state.isInitialized || !state.contexto.tenantId) {
          set({
            contexto: {
              tenantId,
              unidadeId: null,
            },
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: "nexus-contexto",
      partialize: (state) => ({ contexto: state.contexto }),
    }
  )
);

// Hook helper para usar o contexto em filtros
export const useContextoFilter = () => {
  const { contexto, isTodasUnidades } = useContextoStore();

  return {
    tenantId: contexto.tenantId,
    unidadeId: contexto.unidadeId,
    isTodasUnidades: isTodasUnidades(),
    // Helper para filtrar por empresa
    filterByEmpresa: <T extends { empresaId?: string }>(items: T[], empresaIds: string[]): T[] => {
      if (isTodasUnidades()) {
        // Filtra por todas as empresas do tenant
        return items.filter((item) => !item.empresaId || empresaIds.includes(item.empresaId));
      }
      // Filtra pela unidade específica
      return items.filter((item) => item.empresaId === contexto.unidadeId);
    },
  };
};
