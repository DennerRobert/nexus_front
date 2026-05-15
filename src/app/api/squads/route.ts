import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const projetoId = getParam(searchParams, "projetoId");
  const status = getParam(searchParams, "status");

  const squads = mockDb.filter("squads", (item) => {
    const s = item as Record<string, unknown>;
    if (projetoId && s["projetoId"] !== projetoId) return false;
    if (status && s["status"] !== status) return false;
    return true;
  });

  return ok(squads);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const squad = mockDb.create("squads", {
    ...body,
    status: "formando",
    custoMensal: 0,
  });
  return created(squad);
};
