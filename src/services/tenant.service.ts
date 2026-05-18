import { apiClient, type Paginated } from "@/lib/api-client";
import type { Tenant, TenantFormData } from "@/interfaces/tenant.interface";

const BASE = "/tenants/tenants";

// Mapeia resposta snake_case do backend para o formato camelCase do frontend
function mapTenant(raw: Record<string, unknown>): Tenant {
  const status = (raw.status ?? "") as string;
  return {
    id: raw.id as string,
    nome: (raw.name ?? raw.nome ?? "") as string,
    slug: (raw.slug ?? "") as string,
    descricao: raw.descricao as string | undefined,
    logoUrl: (raw.logo_url ?? raw.logoUrl) as string | undefined,
    ativo: status === "active" || status === "trial",
    empresaIds: (raw.empresaIds ?? []) as string[], // populado pelo DataProvider
    createdAt: new Date((raw.created_at ?? raw.createdAt ?? Date.now()) as string),
    updatedAt: new Date((raw.updated_at ?? raw.updatedAt ?? Date.now()) as string),
  };
}

export const tenantService = {
  getAll: () =>
    apiClient
      .get<Paginated<Record<string, unknown>>>(BASE)
      .then((r) => r.items.map(mapTenant)),
  getById: (id: string) =>
    apiClient.get<Record<string, unknown>>(`${BASE}/${id}`).then(mapTenant),
  create: (data: TenantFormData) =>
    apiClient.post<Record<string, unknown>>(BASE, data).then(mapTenant),
  update: (id: string, data: Partial<TenantFormData>) =>
    apiClient.put<Record<string, unknown>>(`${BASE}/${id}`, data).then(mapTenant),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
