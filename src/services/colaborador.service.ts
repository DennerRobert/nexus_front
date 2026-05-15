import { apiClient } from "@/lib/api-client";
import type { Colaborador, ColaboradorFormData } from "@/interfaces/colaborador.interface";

const BASE = "/colaboradores";

export const colaboradorService = {
  getAll: (params?: { empresaId?: string }) => {
    const qs = params?.empresaId ? `?empresaId=${params.empresaId}` : "";
    return apiClient.get<Colaborador[]>(`${BASE}${qs}`);
  },
  getById: (id: string) => apiClient.get<Colaborador>(`${BASE}/${id}`),
  create: (data: ColaboradorFormData) => apiClient.post<Colaborador>(BASE, data),
  update: (id: string, data: Partial<ColaboradorFormData>) => apiClient.patch<Colaborador>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
