import { apiClient, type Paginated } from "@/lib/api-client";
import type { Demanda, DemandaFormData } from "@/interfaces/demanda.interface";
import type { EtapaDemanda } from "@/interfaces/etapa-demanda.interface";

const BASE = "/demandas/demandas";

// ─── Mapeamento de enums frontend → backend ────────────────────────────────

const ESTAGIO_IDEIA_MAP: Record<string, string> = {
  conceito: "IDEIA",
  validacao: "IDEIA",
  prototipo: "CONCEITO",
  mvp: "MVP",
  escala: "PRODUTO",
  // operacional (impacto) — não tem equivalente direto, envia null
  critico: "IDEIA",
  alto: "IDEIA",
  medio: "IDEIA",
  baixo: "IDEIA",
};

const HORIZONTE_MAP: Record<string, string> = {
  h1_curto_prazo: "H1",
  h2_medio_prazo: "H2",
  h3_longo_prazo: "H3",
};

// ─── Payload frontend → backend (snake_case) ──────────────────────────────

function toBackend(data: Partial<DemandaFormData> & { solicitanteId?: string }): Record<string, unknown> {
  return {
    solicitante_id: data.solicitanteId,
    empresa_unidade_apoio_id: data.empresaUnidadeApoioId,
    nome_proponente: data.nomeProponente,
    titulo: data.titulo,
    estagio_ideia: data.estagioIdeia ? (ESTAGIO_IDEIA_MAP[data.estagioIdeia] ?? null) : null,
    horizonte_inovacao: data.horizonteInovacao ? (HORIZONTE_MAP[data.horizonteInovacao] ?? null) : null,
    problema_resolver: data.problemaResolver,
    prazo_desejado: data.prazoDesejado instanceof Date
      ? data.prazoDesejado.toISOString().split("T")[0]
      : data.prazoDesejado,
    exibir_vitrine: data.exibirVitrine ?? false,
    clientes: data.clienteIds ?? [],
    // Campos sem equivalente direto vão para dados_customizados
    dados_customizados: {
      ...(data.existeSolucaoMercado && { existe_solucao_mercado: data.existeSolucaoMercado }),
      ...(data.descricaoSolucaoExistente && { descricao_solucao_existente: data.descricaoSolucaoExistente }),
      ...(data.quemSofreProblema && { quem_sofre_problema: data.quemSofreProblema }),
      ...(data.ideiaSolucao && { ideia_solucao: data.ideiaSolucao }),
      ...(data.principaisBeneficios && { principais_beneficios: data.principaisBeneficios }),
      ...(data.recursosNecessarios && { recursos_necessarios: data.recursosNecessarios }),
    },
  };
}

// ─── Resposta backend → frontend (camelCase) ──────────────────────────────

const ESTAGIO_BACK_MAP: Record<string, string> = {
  IDEIA: "conceito",
  CONCEITO: "validacao",
  MVP: "mvp",
  PRODUTO: "escala",
};

const HORIZONTE_BACK_MAP: Record<string, string> = {
  H1: "h1_curto_prazo",
  H2: "h2_medio_prazo",
  H3: "h3_longo_prazo",
};

const STATUS_BACK_MAP: Record<string, string> = {
  ATIVA: "em_analise",
  PAUSADA: "em_ajustes",
  ARQUIVADA: "rejeitada",
  CONVERTIDA: "convertida",
  CANCELADA: "rejeitada",
};

const ETAPA_BACK_MAP: Record<string, string> = {
  IDEIA_RECEBIDA: "ideia_recebida",
  ANALISE_INICIAL: "analise_inicial",
  ANALISE_COMITE: "analise_comite",
  ENCAMINHADO_GT: "encaminhado_grupo_trabalho",
  APROVADA: "aprovado",
  DEVOLUCAO_PROPONENTE: "devolucao_proponente",
  ARQUIVADA: "arquivado",
};

function fromBackend(raw: Record<string, unknown>): Demanda {
  const dados = (raw.dados_customizados ?? {}) as Record<string, unknown>;
  return {
    id: raw.id as string,
    nomeProponente: (raw.nome_proponente ?? "") as string,
    empresaUnidadeApoioId: (raw.empresa_unidade_apoio_id ?? "") as string,
    titulo: (raw.titulo ?? "") as string,
    estagioIdeia: (ESTAGIO_BACK_MAP[raw.estagio_ideia as string] ?? "conceito") as Demanda["estagioIdeia"],
    problemaResolver: (raw.problema_resolver ?? dados.problema_resolver ?? "") as string,
    existeSolucaoMercado: (dados.existe_solucao_mercado ?? "nao") as Demanda["existeSolucaoMercado"],
    descricaoSolucaoExistente: dados.descricao_solucao_existente as string | undefined,
    quemSofreProblema: (dados.quem_sofre_problema ?? "") as string,
    ideiaSolucao: (dados.ideia_solucao ?? "") as string,
    principaisBeneficios: (dados.principais_beneficios ?? "") as string,
    recursosNecessarios: (dados.recursos_necessarios ?? "") as string,
    horizonteInovacao: (HORIZONTE_BACK_MAP[raw.horizonte_inovacao as string] ?? "h1_curto_prazo") as Demanda["horizonteInovacao"],
    clienteIds: Array.isArray(raw.clientes) ? (raw.clientes as string[]) : [],
    prazoDesejado: new Date((raw.prazo_desejado ?? Date.now()) as string),
    solicitanteId: (raw.solicitante_id ?? "") as string,
    status: (STATUS_BACK_MAP[raw.status as string] ?? "em_analise") as Demanda["status"],
    observacoes: raw.observacoes as string | undefined,
    exibirVitrine: (raw.exibir_vitrine ?? false) as boolean,
    etapa: (ETAPA_BACK_MAP[raw.etapa as string] ?? "ideia_recebida") as EtapaDemanda,
    avaliacoes: [],
    anexosIds: [],
    historicoEtapas: [],
    createdAt: new Date((raw.created_at ?? Date.now()) as string),
    updatedAt: new Date((raw.updated_at ?? Date.now()) as string),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────

export const demandaService = {
  getAll: (params?: { empresaId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.empresaId) qs.set("empresa_id", params.empresaId);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient
      .get<Paginated<Record<string, unknown>>>(`${BASE}${query}`)
      .then((r) => r.items.map(fromBackend));
  },

  getById: (id: string) =>
    apiClient.get<Record<string, unknown>>(`${BASE}/${id}`).then(fromBackend),

  create: (data: Partial<DemandaFormData> & { solicitanteId?: string }) =>
    apiClient.post<Record<string, unknown>>(BASE, toBackend(data)).then(fromBackend),

  update: (id: string, data: Partial<DemandaFormData>) =>
    apiClient.put<Record<string, unknown>>(`${BASE}/${id}`, toBackend(data)).then(fromBackend),

  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),

  mudarEtapa: (
    id: string,
    etapa: EtapaDemanda,
    usuarioId: string,
    dados?: { observacao?: string; justificativa?: string },
  ) =>
    apiClient
      .post<Record<string, unknown>>(`${BASE}/${id}/etapa`, {
        etapa,
        usuario_id: usuarioId,
        ...dados,
      })
      .then(fromBackend),

  toggleVitrine: (id: string) =>
    apiClient.post<Record<string, unknown>>(`${BASE}/${id}/vitrine`, {}).then(fromBackend),
};
