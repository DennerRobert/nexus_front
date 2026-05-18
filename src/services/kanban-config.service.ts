import { apiClient, type Paginated } from "@/lib/api-client";
import type { KanbanEmpresaConfig, EtapaKanbanConfig } from "@/interfaces/kanban-config.interface";

const BASE = "/configuracoes/kanbanempresaconfigs";

export const kanbanConfigService = {
  getAll: () =>
    apiClient.get<Paginated<KanbanEmpresaConfig>>(BASE).then((r) => r.items),
  getByEmpresa: (empresaId: string) =>
    apiClient.get<KanbanEmpresaConfig>(`${BASE}/${empresaId}`),
  update: (empresaId: string, etapas: EtapaKanbanConfig[]) =>
    apiClient.put<KanbanEmpresaConfig>(`${BASE}/${empresaId}`, { etapas }),
};
