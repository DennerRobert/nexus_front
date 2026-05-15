import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody } from "@/lib/route-handler";

export const GET = async () => {
  const tenants = mockDb.getAll("tenants");
  return ok(tenants);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const tenant = mockDb.create("tenants", body);
  return created(tenant);
};
