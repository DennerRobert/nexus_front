import { apiClient } from "@/lib/api-client";
import type { Setor, SetorFormData } from "@/interfaces/setor.interface";

const BASE = "/setores";

export const setorService = {
  getAll: (params?: { ativo?: boolean }) => {
    const qs = params?.ativo !== undefined ? `?ativo=${params.ativo}` : "";
    return apiClient.get<Setor[]>(`${BASE}${qs}`);
  },
  getById: (id: string) => apiClient.get<Setor>(`${BASE}/${id}`),
  create: (data: SetorFormData) => apiClient.post<Setor>(BASE, data),
  update: (id: string, data: Partial<SetorFormData>) => apiClient.patch<Setor>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
