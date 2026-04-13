import { apiClient } from "@/lib/api-client";
import type { RespostaAvaliacao } from "@/interfaces/avaliacao-demanda.interface";

const BASE = "/avaliacoes-demanda";

export const avaliacaoDemandaService = {
  getByDemanda: (demandaId: string) =>
    apiClient.get<RespostaAvaliacao[]>(`${BASE}?demandaId=${demandaId}`),

  avaliar: (data: Omit<RespostaAvaliacao, "id" | "data">) =>
    apiClient.post<RespostaAvaliacao>(BASE, data),

  avaliarMultiplas: (
    demandaId: string,
    avaliadorId: string,
    respostas: { perguntaId: string; criterioId: string; valor: number }[],
  ) =>
    apiClient.post<{ criadas: number; atualizadas: number }>(`${BASE}/bulk`, {
      demandaId,
      avaliadorId,
      respostas,
    }),
};
