import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody } from "@/lib/route-handler";

export const GET = async () => {
  const empresas = mockDb.getAll("empresas");
  return ok(empresas);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const empresa = mockDb.create("empresas", body);
  return created(empresa);
};
