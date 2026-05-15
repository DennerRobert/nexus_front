import { apiClient } from "@/lib/api-client";
import type { KanbanEmpresaConfig, EtapaKanbanConfig } from "@/interfaces/kanban-config.interface";

const BASE = "/kanban-configs";

export const kanbanConfigService = {
  getAll: () => apiClient.get<KanbanEmpresaConfig[]>(BASE),
  getByEmpresa: (empresaId: string) =>
    apiClient.get<KanbanEmpresaConfig>(`${BASE}/${empresaId}`),
  update: (empresaId: string, etapas: EtapaKanbanConfig[]) =>
    apiClient.put<KanbanEmpresaConfig>(`${BASE}/${empresaId}`, { etapas }),
};
