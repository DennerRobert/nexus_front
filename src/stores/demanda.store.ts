import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import type { Demanda, DemandaFormData, StatusDemanda } from "@/interfaces/demanda.interface";
import type { EtapaDemanda, HistoricoEtapa } from "@/interfaces/etapa-demanda.interface";
import { TRANSICOES_PERMITIDAS, ETAPA_DEMANDA_LABELS } from "@/interfaces/etapa-demanda.interface";
import { demandaService } from "@/services/demanda.service";
import { deserialize, deserializeList } from "@/lib/deserialize";
import { ApiError } from "@/lib/api-client";

const toError = (err: unknown): string =>
  err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.";

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
  error: string | null;
}

interface DemandaActions {
  getAll: () => Demanda[];
  getById: (id: string) => Demanda | undefined;
  getByStatus: (status: StatusDemanda) => Demanda[];
  getByEtapa: (etapa: EtapaDemanda) => Demanda[];
  getPendentes: () => Demanda[];
  getVitrine: () => Demanda[];
  fetchAll: () => Promise<void>;
  create: (data: DemandaFormData, solicitanteId: string) => Promise<Demanda | undefined>;
  update: (id: string, data: Partial<DemandaFormData>) => Promise<Demanda | undefined>;
  remove: (id: string) => Promise<boolean>;

  // Status legado (compatibilidade)
  updateStatus: (id: string, status: StatusDemanda, observacao?: string) => void;
  aprovar: (id: string) => void;
  rejeitar: (id: string, motivo: string) => void;
  solicitarAjustes: (id: string, observacao: string) => void;
  converterEmProjeto: (id: string, projetoId: string) => void;

  // Sistema de etapas
  mudarEtapa: (
    id: string,
    novaEtapa: EtapaDemanda,
    usuarioId: string,
    dados?: MudarEtapaData,
    validarCriterios?: boolean,
    verificarAprovacaoComite?: () => boolean,
  ) => MudarEtapaResult;
  podeTransicionar: (etapaAtual: EtapaDemanda, novaEtapa: EtapaDemanda) => boolean;
  getTransicoesPermitidas: (etapaAtual: EtapaDemanda) => EtapaDemanda[];
  definirSquadSugerido: (id: string, squadId: string) => void;
  toggleExibirVitrine: (id: string) => void;
}

type DemandaStore = DemandaState & DemandaActions;

const normalizarDemanda = (d: Partial<Demanda>): Demanda => ({
  ...d,
  etapa: d.etapa ?? "ideia_recebida",
  exibirVitrine: d.exibirVitrine ?? true,
  avaliacoes: d.avaliacoes ?? [],
  anexosIds: d.anexosIds ?? [],
  historicoEtapas: d.historicoEtapas ?? [],
} as Demanda);

const DEMANDA_DATE_FIELDS = ["dataInicio", "dataFim", "dataAprovacao"];

export const useDemandaStore = create<DemandaStore>((set, get) => ({
  demandas: [],
  isLoading: false,
  error: null,

  getAll: () => get().demandas,

  getById: (id) => get().demandas.find((d) => d.id === id),

  getByStatus: (status) => get().demandas.filter((d) => d.status === status),

  getByEtapa: (etapa) => get().demandas.filter((d) => d.etapa === etapa),

  getPendentes: () =>
    get().demandas.filter(
      (d) => d.status === "aguardando_aprovacao" || d.status === "em_analise",
    ),

  getVitrine: () =>
    get().demandas.filter(
      (d) => d.exibirVitrine && (d.status === "aprovada" || d.status === "convertida"),
    ),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await demandaService.getAll();
      set({
        demandas: deserializeList(data, DEMANDA_DATE_FIELDS).map(normalizarDemanda),
        isLoading: false,
      });
    } catch (err) {
      set({ error: toError(err), isLoading: false });
    }
  },

  create: async (data, solicitanteId) => {
    try {
      const nova = await demandaService.create({ ...data, solicitanteId });
      const deserialized = normalizarDemanda(
        deserialize(nova, DEMANDA_DATE_FIELDS),
      );
      set((state) => ({ demandas: [...state.demandas, deserialized] }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  update: async (id, data) => {
    try {
      const updated = await demandaService.update(id, data);
      const deserialized = normalizarDemanda(deserialize(updated, DEMANDA_DATE_FIELDS));
      set((state) => ({
        demandas: state.demandas.map((d) => (d.id === id ? deserialized : d)),
      }));
      return deserialized;
    } catch (err) {
      set({ error: toError(err) });
      return undefined;
    }
  },

  remove: async (id) => {
    try {
      await demandaService.remove(id);
      set((state) => ({ demandas: state.demandas.filter((d) => d.id !== id) }));
      return true;
    } catch (err) {
      set({ error: toError(err) });
      return false;
    }
  },

  // ── Status legado (otimista + background API) ───────────────────────────────
  updateStatus: (id, status, observacao) => {
    set((state) => ({
      demandas: state.demandas.map((d) =>
        d.id === id
          ? { ...d, status, observacoes: observacao ?? d.observacoes, updatedAt: new Date() }
          : d,
      ),
    }));
    void demandaService
      .update(id, { status, ...(observacao ? { observacoes: observacao } : {}) } as unknown as Partial<DemandaFormData>)
      .catch(() => set({ error: "Erro ao atualizar status da demanda." }));
  },

  aprovar: (id) => get().updateStatus(id, "aprovada"),

  rejeitar: (id, motivo) => {
    set((state) => ({
      demandas: state.demandas.map((d) =>
        d.id === id
          ? { ...d, status: "rejeitada", motivoRejeicao: motivo, updatedAt: new Date() }
          : d,
      ),
    }));
    void demandaService
      .update(id, { status: "rejeitada", motivoRejeicao: motivo } as unknown as Partial<DemandaFormData>)
      .catch(() => set({ error: "Erro ao rejeitar demanda." }));
  },

  solicitarAjustes: (id, observacao) => {
    set((state) => ({
      demandas: state.demandas.map((d) =>
        d.id === id
          ? { ...d, status: "em_ajustes", observacoes: observacao, updatedAt: new Date() }
          : d,
      ),
    }));
    void demandaService
      .update(id, { status: "em_ajustes", observacoes: observacao } as unknown as Partial<DemandaFormData>)
      .catch(() => set({ error: "Erro ao solicitar ajustes." }));
  },

  converterEmProjeto: (id, projetoId) => {
    set((state) => ({
      demandas: state.demandas.map((d) =>
        d.id === id
          ? { ...d, status: "convertida", etapa: "concluido", projetoId, updatedAt: new Date() }
          : d,
      ),
    }));
    void demandaService
      .update(id, { status: "convertida", projetoId } as unknown as Partial<DemandaFormData>)
      .catch(() => set({ error: "Erro ao converter demanda em projeto." }));
  },

  // ── Sistema de etapas ───────────────────────────────────────────────────────
  podeTransicionar: (etapaAtual, novaEtapa) =>
    TRANSICOES_PERMITIDAS[etapaAtual]?.includes(novaEtapa) ?? false,

  getTransicoesPermitidas: (etapaAtual) => TRANSICOES_PERMITIDAS[etapaAtual] ?? [],

  mudarEtapa: (id, novaEtapa, usuarioId, dados, validarCriterios = true, verificarAprovacaoComite) => {
    const demanda = get().getById(id);
    if (!demanda) return { sucesso: false, erro: "Demanda não encontrada" };

    const etapaAtual = demanda.etapa;

    if (!get().podeTransicionar(etapaAtual, novaEtapa)) {
      return {
        sucesso: false,
        erro: `Não é possível ir de "${ETAPA_DEMANDA_LABELS[etapaAtual]}" para "${ETAPA_DEMANDA_LABELS[novaEtapa]}"`,
      };
    }

    // Validação: arquivamento requer justificativa
    if (novaEtapa === "arquivado" && !dados?.justificativa) {
      return { sucesso: false, erro: "É necessário informar uma justificativa para arquivar a demanda" };
    }

    // Validação: aprovação de comitê
    if (novaEtapa === "encaminhado_grupo_trabalho" && verificarAprovacaoComite) {
      if (!verificarAprovacaoComite()) {
        return {
          sucesso: false,
          erro: "É necessária a aprovação do comitê para encaminhar ao grupo de trabalho",
        };
      }
    }

    void validarCriterios; // validação feita no componente que chama

    const historicoItem: HistoricoEtapa = {
      id: uuidv4(),
      etapaAnterior: etapaAtual,
      etapaNova: novaEtapa,
      usuarioId,
      data: new Date(),
      observacao: dados?.observacao,
      justificativa: dados?.justificativa,
    };

    let updated: Demanda | undefined;
    set((state) => ({
      demandas: state.demandas.map((d) => {
        if (d.id !== id) return d;
        updated = {
          ...d,
          etapa: novaEtapa,
          justificativaArquivamento:
            novaEtapa === "arquivado" ? dados?.justificativa : d.justificativaArquivamento,
          historicoEtapas: [...d.historicoEtapas, historicoItem],
          updatedAt: new Date(),
        };
        return updated;
      }),
    }));

    // Sincroniza com a API em background
    void demandaService
      .mudarEtapa(id, novaEtapa, usuarioId, dados)
      .catch(() => set({ error: "Erro ao sincronizar etapa da demanda." }));

    toast.success(`Demanda movida para "${ETAPA_DEMANDA_LABELS[novaEtapa]}"`, {
      description: "O proponente será notificado sobre a mudança de status.",
    });

    return { sucesso: true, demanda: updated };
  },

  definirSquadSugerido: (id, squadId) => {
    set((state) => ({
      demandas: state.demandas.map((d) =>
        d.id === id ? { ...d, squadSugeridoId: squadId, updatedAt: new Date() } : d,
      ),
    }));
    void demandaService
      .update(id, { squadSugeridoId: squadId } as unknown as Partial<DemandaFormData>)
      .catch(() => set({ error: "Erro ao definir squad sugerido." }));
  },

  toggleExibirVitrine: (id) => {
    const demanda = get().getById(id);
    if (!demanda) return;
    const novoValor = !demanda.exibirVitrine;
    set((state) => ({
      demandas: state.demandas.map((d) =>
        d.id === id ? { ...d, exibirVitrine: novoValor, updatedAt: new Date() } : d,
      ),
    }));
    void demandaService
      .toggleVitrine(id)
      .catch(() => set({ error: "Erro ao atualizar visibilidade na vitrine." }));
  },
}));
