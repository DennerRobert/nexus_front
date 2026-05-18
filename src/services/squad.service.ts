import { apiClient, type Paginated } from "@/lib/api-client";
import type { Squad, SquadFormData } from "@/interfaces/squad.interface";

const BASE = "/projetos/squads";

export const squadService = {
  getAll: (params?: { projetoId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.projetoId) qs.set("projeto_id", params.projetoId);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Paginated<Squad>>(`${BASE}${query}`).then((r) => r.items);
  },
  getById: (id: string) => apiClient.get<Squad>(`${BASE}/${id}`),
  create: (data: SquadFormData) => apiClient.post<Squad>(BASE, data),
  update: (id: string, data: Partial<SquadFormData>) =>
    apiClient.put<Squad>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
