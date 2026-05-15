import { mockDb } from "@/lib/mock-db";
import { ok, parseBody } from "@/lib/route-handler";
import { v4 as uuidv4 } from "uuid";

interface BulkBody {
  demandaId: string;
  avaliadorId: string;
  respostas: { perguntaId: string; criterioId: string; valor: number }[];
}

export const POST = async (req: Request) => {
  const { demandaId, avaliadorId, respostas } = await parseBody<BulkBody>(req);
  const now = new Date().toISOString();
  let criadas = 0;
  let atualizadas = 0;

  for (const r of respostas) {
    const existente = mockDb
      .getAll<Record<string, unknown>>("respostas-avaliacao")
      .find(
        (rv) =>
          rv["demandaId"] === demandaId &&
          rv["perguntaId"] === r.perguntaId &&
          rv["avaliadorId"] === avaliadorId,
      );

    if (existente) {
      mockDb.update("respostas-avaliacao", existente["id"] as string, {
        valor: r.valor,
        data: now,
      });
      atualizadas++;
    } else {
      mockDb.create("respostas-avaliacao", {
        id: uuidv4(),
        demandaId,
        avaliadorId,
        perguntaId: r.perguntaId,
        criterioId: r.criterioId,
        valor: r.valor,
        data: now,
      });
      criadas++;
    }
  }

  return ok({ criadas, atualizadas });
};
