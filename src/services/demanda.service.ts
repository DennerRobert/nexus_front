import { apiClient } from "@/lib/api-client";
import type { Demanda, DemandaFormData } from "@/interfaces/demanda.interface";
import type { EtapaDemanda } from "@/interfaces/etapa-demanda.interface";

const BASE = "/demandas";

export const demandaService = {
  getAll: (params?: { empresaId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.empresaId) qs.set("empresaId", params.empresaId);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Demanda[]>(`${BASE}${query}`);
  },
  getById: (id: string) => apiClient.get<Demanda>(`${BASE}/${id}`),
  create: (data: Partial<DemandaFormData> & { solicitanteId?: string }) =>
    apiClient.post<Demanda>(BASE, data),
  update: (id: string, data: Partial<DemandaFormData>) =>
    apiClient.patch<Demanda>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
  mudarEtapa: (
    id: string,
    etapa: EtapaDemanda,
    usuarioId: string,
    dados?: { observacao?: string; justificativa?: string },
  ) => apiClient.post<Demanda>(`${BASE}/${id}/etapa`, { etapa, usuarioId, ...dados }),
  toggleVitrine: (id: string) => apiClient.post<Demanda>(`${BASE}/${id}/vitrine`, {}),
};
