import { apiClient } from "@/lib/api-client";
import type { Projeto, ProjetoFormData } from "@/interfaces/projeto.interface";

const BASE = "/projetos";

export const projetoService = {
  getAll: (params?: { empresaId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.empresaId) qs.set("empresaId", params.empresaId);
    if (params?.status) qs.set("status", params.status);
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Projeto[]>(`${BASE}${query}`);
  },
  getById: (id: string) => apiClient.get<Projeto>(`${BASE}/${id}`),
  create: (data: ProjetoFormData) => apiClient.post<Projeto>(BASE, data),
  update: (id: string, data: Partial<ProjetoFormData>) =>
    apiClient.patch<Projeto>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
