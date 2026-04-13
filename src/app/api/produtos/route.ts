import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const empresaId = getParam(searchParams, "empresaId");

  const produtos = empresaId
    ? mockDb.filter("produtos", (item) => {
        const p = item as Record<string, unknown>;
        return p["empresaDonaId"] === empresaId;
      })
    : mockDb.getAll("produtos");

  return ok(produtos);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const produto = mockDb.create("produtos", body);
  return created(produto);
};
