import { apiClient } from "@/lib/api-client";
import type { Cliente, ClienteFormData } from "@/interfaces/cliente.interface";

const BASE = "/clientes";

export const clienteService = {
  getAll: (params?: { empresaId?: string; ativo?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.empresaId) qs.set("empresaId", params.empresaId);
    if (params?.ativo !== undefined) qs.set("ativo", String(params.ativo));
    const query = qs.toString() ? `?${qs}` : "";
    return apiClient.get<Cliente[]>(`${BASE}${query}`);
  },
  getById: (id: string) => apiClient.get<Cliente>(`${BASE}/${id}`),
  create: (data: ClienteFormData) => apiClient.post<Cliente>(BASE, data),
  update: (id: string, data: Partial<ClienteFormData>) => apiClient.patch<Cliente>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
