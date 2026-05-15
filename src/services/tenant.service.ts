import { apiClient } from "@/lib/api-client";
import type { Tenant, TenantFormData } from "@/interfaces/tenant.interface";

const BASE = "/tenants";

export const tenantService = {
  getAll: () => apiClient.get<Tenant[]>(BASE),
  getById: (id: string) => apiClient.get<Tenant>(`${BASE}/${id}`),
  create: (data: TenantFormData) => apiClient.post<Tenant>(BASE, data),
  update: (id: string, data: Partial<TenantFormData>) =>
    apiClient.patch<Tenant>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
