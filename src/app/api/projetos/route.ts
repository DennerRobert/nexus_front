import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const empresaId = getParam(searchParams, "empresaId");
  const status = getParam(searchParams, "status");

  const projetos = mockDb.filter("projetos", (item) => {
    const p = item as Record<string, unknown>;
    if (empresaId && p["empresaDonaId"] !== empresaId) return false;
    if (status && p["status"] !== status) return false;
    return true;
  });

  return ok(projetos);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const projeto = mockDb.create("projetos", {
    ...body,
    status: "aguardando_aprovacao",
    custoAtual: 0,
  });
  return created(projeto);
};
