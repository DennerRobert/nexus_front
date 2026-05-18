import { apiClient, type Paginated } from "@/lib/api-client";
import type { Alocacao, AlocacaoFormData } from "@/interfaces/alocacao.interface";

const BASE = "/projetos/alocacaos";

export const alocacaoService = {
  getAll: (params?: { squadId?: string; colaboradorId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.squadId) qs.set("squad_id", params.squadId);
    if (params?.colaboradorId) qs.set("colaborador_id", params.colaboradorId);
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Paginated<Alocacao>>(`${BASE}${query}`).then((r) => r.items);
  },
  getById: (id: string) => apiClient.get<Alocacao>(`${BASE}/${id}`),
  create: (data: AlocacaoFormData) => apiClient.post<Alocacao>(BASE, data),
  update: (id: string, data: Partial<AlocacaoFormData>) =>
    apiClient.put<Alocacao>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
