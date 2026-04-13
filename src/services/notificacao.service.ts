import { apiClient } from "@/lib/api-client";
import type { Notificacao } from "@/interfaces/notificacao.interface";

const BASE = "/notificacoes";

export const notificacaoService = {
  getAll: (params?: { lida?: boolean }) => {
    const qs = params?.lida !== undefined ? `?lida=${params.lida}` : "";
    return apiClient.get<Notificacao[]>(`${BASE}${qs}`);
  },
  marcarComoLida: (id: string) =>
    apiClient.patch<Notificacao>(`${BASE}/${id}`, { lida: true }),
  marcarTodasComoLidas: () =>
    apiClient.post<{ marcadas: number }>(`${BASE}/marcar-todas-lidas`, {}),
  remove: (id: string) => apiClient.delete(`${BASE}/${id}`),
};
