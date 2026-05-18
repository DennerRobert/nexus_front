import { apiClient, type Paginated } from "@/lib/api-client";
import type { Empresa, EmpresaFormData } from "@/interfaces/empresa.interface";

const BASE = "/empresas/empresas";

// Mapeia resposta snake_case do backend para o formato camelCase do frontend
function mapEmpresa(raw: Record<string, unknown>): Empresa {
  return {
    id: raw.id as string,
    nome: (raw.nome ?? raw.name ?? "") as string,
    cnpj: (raw.cnpj ?? "") as string,
    email: raw.email as string | undefined,
    telefone: raw.telefone as string | undefined,
    descricao: raw.descricao as string | undefined,
    ativa: (raw.is_active ?? raw.ativa ?? true) as boolean,
    formularioTipo: (raw.formulario_tipo ?? raw.formularioTipo) as Empresa["formularioTipo"],
    setor: (raw.segmento ?? raw.setor) as string | undefined,
    dadosAdicionais: (raw.dados_adicionais ?? raw.dadosAdicionais) as Record<string, string> | undefined,
    tenantId: (raw.tenant_id ?? raw.tenantId) as string | undefined,
    createdAt: new Date((raw.created_at ?? raw.createdAt ?? Date.now()) as string | number),
    updatedAt: new Date((raw.updated_at ?? raw.updatedAt ?? Date.now()) as string | number),
  };
}

export const empresaService = {
  getAll: () =>
    apiClient
      .get<Paginated<Record<string, unknown>>>(BASE)
      .then((r) => r.items.map(mapEmpresa)),
  getById: (id: string) =>
    apiClient.get<Record<string, unknown>>(`${BASE}/${id}`).then(mapEmpresa),
  create: (data: EmpresaFormData) =>
    apiClient.post<Record<string, unknown>>(BASE, data).then(mapEmpresa),
  update: (id: string, data: Partial<EmpresaFormData>) =>
    apiClient.put<Record<string, unknown>>(`${BASE}/${id}`, data).then(mapEmpresa),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
