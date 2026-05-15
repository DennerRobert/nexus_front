import { apiClient } from "@/lib/api-client";
import type { Squad, SquadFormData } from "@/interfaces/squad.interface";

const BASE = "/squads";

export const squadService = {
  getAll: (params?: { projetoId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.projetoId) qs.set("projetoId", params.projetoId);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Squad[]>(`${BASE}${query}`);
  },
  getById: (id: string) => apiClient.get<Squad>(`${BASE}/${id}`),
  create: (data: SquadFormData) => apiClient.post<Squad>(BASE, data),
  update: (id: string, data: Partial<SquadFormData>) =>
    apiClient.patch<Squad>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
