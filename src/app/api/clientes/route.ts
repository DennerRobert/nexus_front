import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const empresaId = getParam(searchParams, "empresaId");
  const ativo = getParam(searchParams, "ativo");

  const clientes = mockDb.filter("clientes", (item) => {
    const c = item as Record<string, unknown>;
    if (empresaId && c["empresaId"] !== empresaId) return false;
    if (ativo === "true" && !c["ativo"]) return false;
    if (ativo === "false" && c["ativo"]) return false;
    return true;
  });

  return ok(clientes);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const cliente = mockDb.create("clientes", body);
  return created(cliente);
};
