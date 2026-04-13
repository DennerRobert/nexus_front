import { apiClient } from "@/lib/api-client";
import type { Empresa, EmpresaFormData } from "@/interfaces/empresa.interface";

const BASE = "/empresas";

export const empresaService = {
  getAll: () => apiClient.get<Empresa[]>(BASE),
  getById: (id: string) => apiClient.get<Empresa>(`${BASE}/${id}`),
  create: (data: EmpresaFormData) => apiClient.post<Empresa>(BASE, data),
  update: (id: string, data: Partial<EmpresaFormData>) => apiClient.patch<Empresa>(`${BASE}/${id}`, data),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
