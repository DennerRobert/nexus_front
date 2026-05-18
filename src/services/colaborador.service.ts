import { apiClient, type Paginated } from "@/lib/api-client";
import type { Colaborador, ColaboradorFormData } from "@/interfaces/colaborador.interface";

const BASE = "/colaboradores/colaboradores";

export const colaboradorService = {
  getAll: (params?: { empresaId?: string }) => {
    const qs = params?.empresaId ? `?empresa_id=${params.empresaId}` : "";
    return apiClient.get<Paginated<Colaborador>>(`${BASE}${qs}`).then((r) => r.items);
  },
  getById: (id: string) => apiClient.get<Colaborador>(`${BASE}/${id}`),
  create: (data: ColaboradorFormData) => apiClient.post<Colaborador>(BASE, data),
  update: (id: string, data: Partial<ColaboradorFormData>) =>
    apiClient.put<Colaborador>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
