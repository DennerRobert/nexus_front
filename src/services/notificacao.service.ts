import { apiClient, type Paginated } from "@/lib/api-client";
import type { Notificacao } from "@/interfaces/notificacao.interface";

const BASE = "/notificacoes/notificacaos";

export const notificacaoService = {
  getAll: (params?: { lida?: boolean }) => {
    const qs = params?.lida !== undefined ? `?lida=${params.lida}` : "";
    return apiClient.get<Paginated<Notificacao>>(`${BASE}${qs}`).then((r) => r.items);
  },
  marcarComoLida: (id: string) =>
    apiClient.put<Notificacao>(`${BASE}/${id}`, { lida: true }),
  marcarTodasComoLidas: () =>
    apiClient.post<{ marcadas: number }>(`${BASE}/marcar-todas-lidas`, {}),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
