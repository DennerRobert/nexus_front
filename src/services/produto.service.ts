import { apiClient } from "@/lib/api-client";
import type { Produto, ProdutoFormData } from "@/interfaces/produto.interface";

const BASE = "/produtos";

export const produtoService = {
  getAll: (params?: { empresaId?: string }) => {
    const qs = params?.empresaId ? `?empresaId=${params.empresaId}` : "";
    return apiClient.get<Produto[]>(`${BASE}${qs}`);
  },
  getById: (id: string) => apiClient.get<Produto>(`${BASE}/${id}`),
  create: (data: ProdutoFormData & Record<string, unknown>) =>
    apiClient.post<Produto>(BASE, data),
  update: (id: string, data: Partial<ProdutoFormData>) =>
    apiClient.patch<Produto>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
