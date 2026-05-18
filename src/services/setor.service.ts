import { apiClient, type Paginated } from "@/lib/api-client";
import type { Setor, SetorFormData } from "@/interfaces/setor.interface";

const BASE = "/empresas/setores";

export const setorService = {
  getAll: (params?: { ativo?: boolean }) => {
    const qs = params?.ativo !== undefined ? `?is_active=${params.ativo}` : "";
    return apiClient.get<Paginated<Setor>>(`${BASE}${qs}`).then((r) => r.items);
  },
  getById: (id: string) => apiClient.get<Setor>(`${BASE}/${id}`),
  create: (data: SetorFormData) => apiClient.post<Setor>(BASE, data),
  update: (id: string, data: Partial<SetorFormData>) =>
    apiClient.put<Setor>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
