import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const ativo = getParam(searchParams, "ativo");

  const setores =
    ativo !== undefined
      ? mockDb.filter("setores", (item) => {
          const s = item as Record<string, unknown>;
          return ativo === "true" ? !!s["ativo"] : !s["ativo"];
        })
      : mockDb.getAll("setores");

  return ok(setores);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const setor = mockDb.create("setores", body);
  return created(setor);
};
