import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import type { Demanda, DemandaFormData, StatusDemanda } from "@/interfaces/demanda.interface";
import type { EtapaDemanda, HistoricoEtapa } from "@/interfaces/etapa-demanda.interface";
import { TRANSICOES_PERMITIDAS, ETAPA_DEMANDA_LABELS } from "@/interfaces/etapa-demanda.interface";
import { mockDemandas } from "@/utils/mock-data";

// Tipos para mudança de etapa
interface MudarEtapaData {
  observacao?: string;
  justificativa?: string;
}

interface MudarEtapaResult {
  sucesso: boolean;
  erro?: string;
  demanda?: Demanda;
}

interface DemandaState {
  demandas: Demanda[];
  isLoading: boolean;
}

interface DemandaActions {
  // CRUD básico
  getAll: () => Demanda[];
  getById: (id: string) => Demanda | undefined;
  getByStatus: (status: StatusDemanda) => Demanda[];
  getByEtapa: (etapa: EtapaDemanda) => Demanda[];
  getPendentes: () => Demanda[];
  getVitrine: () => Demanda[];
  create: (data: DemandaFormData, solicitanteId: string) => Demanda;
  update: (id: string, data: Partial<DemandaFormData>) => Demanda | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;

  // Status legado (mantido para compatibilidade)
  updateStatus: (id: string, status: StatusDemanda, observacao?: string) => Demanda | undefined;
  aprovar: (id: string) => Demanda | undefined;
  rejeitar: (id: string, motivo: string) => Demanda | undefined;
  solicitarAjustes: (id: string, observacao: string) => Demanda | undefined;
  converterEmProjeto: (id: string, projetoId: string) => Demanda | undefined;

  // Novo sistema de etapas
  mudarEtapa: (
    id: string,
    novaEtapa: EtapaDemanda,
    usuarioId: string,
    dados?: MudarEtapaData,
    validarCriterios?: boolean,
    verificarAprovacaoComite?: () => boolean
  ) => MudarEtapaResult;
  
  podeTransicionar: (etapaAtual: EtapaDemanda, novaEtapa: EtapaDemanda) => boolean;
  getTransicoesPermitidas: (etapaAtual: EtapaDemanda) => EtapaDemanda[];
  
  // Sugestão de Squad
  definirSquadSugerido: (id: string, squadId: string) => void;
  
  // Vitrine
  toggleExibirVitrine: (id: string) => void;
}

type DemandaStore = DemandaState & DemandaActions;

// Adiciona campos novos aos dados mock se não existirem
const demandaComNovosCampos = (d: Partial<Demanda>): Demanda => ({
  ...d,
  etapa: d.etapa || "ideia_recebida",
  exibirVitrine: d.exibirVitrine ?? true,
  avaliacoes: d.avaliacoes || [],
  anexosIds: d.anexosIds || [],
  historicoEtapas: d.historicoEtapas || [],
} as Demanda);

export const useDemandaStore = create<DemandaStore>()(
  persist(
    (set, get) => ({
      demandas: mockDemandas.map(demandaComNovosCampos),
      isLoading: false,

      // CRUD básico
      getAll: () => get().demandas,

      getById: (id: string) => get().demandas.find((d) => d.id === id),

      getByStatus: (status: StatusDemanda) =>
        get().demandas.filter((d) => d.status === status),

      getByEtapa: (etapa: EtapaDemanda) =>
        get().demandas.filter((d) => d.etapa === etapa),

      getPendentes: () =>
        get().demandas.filter(
          (d) => d.status === "aguardando_aprovacao" || d.status === "em_analise"
        ),

      getVitrine: () =>
        get().demandas.filter(
          (d) => d.exibirVitrine && (d.status === "aprovada" || d.status === "convertida")
        ),

      create: (data: DemandaFormData, solicitanteId: string) => {
        const newDemanda: Demanda = {
          ...data,
          id: uuidv4(),
          solicitanteId,
          status: "rascunho",
          etapa: "ideia_recebida",
          exibirVitrine: data.exibirVitrine ?? true,
          avaliacoes: [],
          anexosIds: [],
          historicoEtapas: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          demandas: [...state.demandas, newDemanda],
        }));
        return newDemanda;
      },

      update: (id: string, data: Partial<DemandaFormData>) => {
        let updated: Demanda | undefined;
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              updated = { ...d, ...data, updatedAt: new Date() };
              return updated;
            }
            return d;
          }),
        }));
        return updated;
      },

      remove: (id: string) => {
        const exists = get().demandas.some((d) => d.id === id);
        if (exists) {
          set((state) => ({
            demandas: state.demandas.filter((d) => d.id !== id),
          }));
        }
        return exists;
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Status legado
      updateStatus: (id: string, status: StatusDemanda, observacao?: string) => {
        let updated: Demanda | undefined;
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              updated = {
                ...d,
                status,
                observacoes: observacao || d.observacoes,
                updatedAt: new Date(),
              };
              return updated;
            }
            return d;
          }),
        }));
        return updated;
      },

      aprovar: (id: string) => {
        return get().updateStatus(id, "aprovada");
      },

      rejeitar: (id: string, motivo: string) => {
        let updated: Demanda | undefined;
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              updated = {
                ...d,
                status: "rejeitada",
                motivoRejeicao: motivo,
                updatedAt: new Date(),
              };
              return updated;
            }
            return d;
          }),
        }));
        return updated;
      },

      solicitarAjustes: (id: string, observacao: string) => {
        let updated: Demanda | undefined;
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              updated = {
                ...d,
                status: "em_ajustes",
                observacoes: observacao,
                updatedAt: new Date(),
              };
              return updated;
            }
            return d;
          }),
        }));
        return updated;
      },

      converterEmProjeto: (id: string, projetoId: string) => {
        let updated: Demanda | undefined;
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              updated = {
                ...d,
                status: "convertida",
                etapa: "concluido",
                projetoId,
                updatedAt: new Date(),
              };
              return updated;
            }
            return d;
          }),
        }));
        return updated;
      },

      // Novo sistema de etapas
      podeTransicionar: (etapaAtual: EtapaDemanda, novaEtapa: EtapaDemanda) => {
        const transicoesPermitidas = TRANSICOES_PERMITIDAS[etapaAtual];
        return transicoesPermitidas.includes(novaEtapa);
      },

      getTransicoesPermitidas: (etapaAtual: EtapaDemanda) => {
        return TRANSICOES_PERMITIDAS[etapaAtual] || [];
      },

      mudarEtapa: (
        id,
        novaEtapa,
        usuarioId,
        dados,
        validarCriterios = true,
        verificarAprovacaoComite
      ) => {
        const demanda = get().getById(id);
        if (!demanda) {
          return { sucesso: false, erro: "Demanda não encontrada" };
        }

        const etapaAtual = demanda.etapa;

        // Verificar se a transição é permitida
        if (!get().podeTransicionar(etapaAtual, novaEtapa)) {
          return {
            sucesso: false,
            erro: `Não é possível ir de "${ETAPA_DEMANDA_LABELS[etapaAtual]}" para "${ETAPA_DEMANDA_LABELS[novaEtapa]}"`,
          };
        }

        // Validação especial: sair de "ideia_recebida" requer critérios preenchidos
        if (etapaAtual === "ideia_recebida" && validarCriterios) {
          // Esta validação será feita no componente que chama a função
          // pois depende da store de avaliações
        }

        // Validação especial: ir para "encaminhado_grupo_trabalho" requer aprovação
        if (novaEtapa === "encaminhado_grupo_trabalho" && verificarAprovacaoComite) {
          const aprovado = verificarAprovacaoComite();
          if (!aprovado) {
            return {
              sucesso: false,
              erro: "É necessária a aprovação do comitê para encaminhar ao grupo de trabalho",
            };
          }
        }

        // Validação especial: arquivamento requer justificativa
        if (novaEtapa === "arquivado" && !dados?.justificativa) {
          return {
            sucesso: false,
            erro: "É necessário informar uma justificativa para arquivar a demanda",
          };
        }

        // Criar histórico
        const historicoItem: HistoricoEtapa = {
          id: uuidv4(),
          etapaAnterior: etapaAtual,
          etapaNova: novaEtapa,
          usuarioId,
          data: new Date(),
          observacao: dados?.observacao,
          justificativa: dados?.justificativa,
        };

        // Atualizar demanda
        let updated: Demanda | undefined;
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              updated = {
                ...d,
                etapa: novaEtapa,
                justificativaArquivamento:
                  novaEtapa === "arquivado" ? dados?.justificativa : d.justificativaArquivamento,
                historicoEtapas: [...d.historicoEtapas, historicoItem],
                updatedAt: new Date(),
              };
              return updated;
            }
            return d;
          }),
        }));

        // Notificar mudança (mock)
        toast.success(
          `Demanda movida para "${ETAPA_DEMANDA_LABELS[novaEtapa]}"`,
          {
            description: "O proponente será notificado sobre a mudança de status.",
          }
        );

        return { sucesso: true, demanda: updated };
      },

      // Sugestão de Squad
      definirSquadSugerido: (id: string, squadId: string) => {
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              return { ...d, squadSugeridoId: squadId, updatedAt: new Date() };
            }
            return d;
          }),
        }));
      },

      // Vitrine
      toggleExibirVitrine: (id: string) => {
        set((state) => ({
          demandas: state.demandas.map((d) => {
            if (d.id === id) {
              return { ...d, exibirVitrine: !d.exibirVitrine, updatedAt: new Date() };
            }
            return d;
          }),
        }));
      },
    }),
    {
      name: "nexus-demanda-store",
      version: 2, // Incrementar versão para forçar migração
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as DemandaState;
        
        // Migrar dados antigos para nova estrutura
        if (version < 2) {
          return {
            ...state,
            demandas: (state.demandas || mockDemandas).map(demandaComNovosCampos),
          };
        }
        
        return state;
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<DemandaState>;
        
        // Se não há demandas persistidas ou array vazio, usar mock
        if (!persisted.demandas || persisted.demandas.length === 0) {
          return currentState;
        }
        
        // Garantir que demandas antigas tenham novos campos
        return {
          ...currentState,
          demandas: persisted.demandas.map(demandaComNovosCampos),
        };
      },
    }
  )
);
