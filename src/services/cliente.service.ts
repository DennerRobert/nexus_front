import { apiClient, type Paginated } from "@/lib/api-client";
import type { Cliente, ClienteFormData } from "@/interfaces/cliente.interface";

const BASE = "/clientes/clientes";

export const clienteService = {
  getAll: (params?: { empresaId?: string; ativo?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.empresaId) qs.set("empresa_id", params.empresaId);
    if (params?.ativo !== undefined) qs.set("is_active", String(params.ativo));
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Paginated<Cliente>>(`${BASE}${query}`).then((r) => r.items);
  },
  getById: (id: string) => apiClient.get<Cliente>(`${BASE}/${id}`),
  create: (data: ClienteFormData) => apiClient.post<Cliente>(BASE, data),
  update: (id: string, data: Partial<ClienteFormData>) =>
    apiClient.put<Cliente>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
