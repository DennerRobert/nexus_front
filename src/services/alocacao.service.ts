import { apiClient } from "@/lib/api-client";
import type { Alocacao, AlocacaoFormData } from "@/interfaces/alocacao.interface";

const BASE = "/alocacoes";

export const alocacaoService = {
  getAll: (params?: { squadId?: string; colaboradorId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.squadId) qs.set("squadId", params.squadId);
    if (params?.colaboradorId) qs.set("colaboradorId", params.colaboradorId);
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Alocacao[]>(`${BASE}${query}`);
  },
  getById: (id: string) => apiClient.get<Alocacao>(`${BASE}/${id}`),
  create: (data: AlocacaoFormData) => apiClient.post<Alocacao>(BASE, data),
  update: (id: string, data: Partial<AlocacaoFormData>) =>
    apiClient.patch<Alocacao>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
