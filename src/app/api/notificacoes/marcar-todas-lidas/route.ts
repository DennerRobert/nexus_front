import { mockDb } from "@/lib/mock-db";
import { ok } from "@/lib/route-handler";

export const POST = async () => {
  const notificacoes = mockDb.getAll<Record<string, unknown>>("notificacoes");
  for (const n of notificacoes) {
    const id = n["id"] as string;
    mockDb.update("notificacoes", id, { lida: true });
  }
  return ok({ marcadas: notificacoes.length });
};
