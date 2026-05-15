import { mockDb } from "@/lib/mock-db";
import { ok, notFound, noContent, parseBody } from "@/lib/route-handler";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const demanda = mockDb.getById("demandas", id);
  if (!demanda) return notFound();
  return ok(demanda);
};

export const PATCH = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const body = await parseBody<Record<string, unknown>>(req);
  const updated = mockDb.update("demandas", id, body);
  if (!updated) return notFound();
  return ok(updated);
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const deleted = mockDb.delete("demandas", id);
  if (!deleted) return notFound();
  return noContent();
};
