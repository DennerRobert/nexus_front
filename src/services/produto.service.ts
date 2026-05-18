import { apiClient, type Paginated } from "@/lib/api-client";
import type { Produto, ProdutoFormData } from "@/interfaces/produto.interface";

const BASE = "/produtos/produtos";

export const produtoService = {
  getAll: (params?: { empresaId?: string }) => {
    const qs = params?.empresaId ? `?empresa_id=${params.empresaId}` : "";
    return apiClient.get<Paginated<Produto>>(`${BASE}${qs}`).then((r) => r.items);
  },
  getById: (id: string) => apiClient.get<Produto>(`${BASE}/${id}`),
  create: (data: ProdutoFormData & Record<string, unknown>) =>
    apiClient.post<Produto>(BASE, data),
  update: (id: string, data: Partial<ProdutoFormData>) =>
    apiClient.put<Produto>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
