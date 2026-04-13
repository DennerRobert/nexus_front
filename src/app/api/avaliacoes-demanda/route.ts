import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";
import { v4 as uuidv4 } from "uuid";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const demandaId = getParam(searchParams, "demandaId");
  const avaliadorId = getParam(searchParams, "avaliadorId");

  const respostas = mockDb.filter("respostas-avaliacao", (item) => {
    const r = item as Record<string, unknown>;
    if (demandaId && r["demandaId"] !== demandaId) return false;
    if (avaliadorId && r["avaliadorId"] !== avaliadorId) return false;
    return true;
  });

  return ok(respostas);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const resposta = mockDb.create("respostas-avaliacao", {
    ...body,
    id: (body["id"] as string) ?? uuidv4(),
    data: new Date().toISOString(),
  });
  return created(resposta);
};
