import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const empresaId = getParam(searchParams, "empresaId");

  const colaboradores = empresaId
    ? mockDb.filter("colaboradores", (item) => {
        const c = item as Record<string, unknown>;
        const ids = c["empresaIds"] as string[] | undefined;
        return Array.isArray(ids) && ids.includes(empresaId);
      })
    : mockDb.getAll("colaboradores");

  return ok(colaboradores);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const colaborador = mockDb.create("colaboradores", body);
  return created(colaborador);
};
