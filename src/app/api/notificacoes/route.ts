import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const lida = getParam(searchParams, "lida");

  const notificacoes =
    lida !== undefined
      ? mockDb.filter("notificacoes", (item) => {
          const n = item as Record<string, unknown>;
          return lida === "true" ? !!n["lida"] : !n["lida"];
        })
      : mockDb.getAll("notificacoes");

  return ok(notificacoes);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const notificacao = mockDb.create("notificacoes", {
    ...body,
    lida: false,
    createdAt: new Date().toISOString(),
  });
  return created(notificacao);
};
