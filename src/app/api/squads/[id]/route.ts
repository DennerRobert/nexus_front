import { mockDb } from "@/lib/mock-db";
import { ok, notFound, noContent, parseBody } from "@/lib/route-handler";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const squad = mockDb.getById("squads", id);
  if (!squad) return notFound();
  return ok(squad);
};

export const PATCH = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const body = await parseBody<Record<string, unknown>>(req);
  const updated = mockDb.update("squads", id, body);
  if (!updated) return notFound();
  return ok(updated);
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const deleted = mockDb.delete("squads", id);
  if (!deleted) return notFound();
  return noContent();
};
