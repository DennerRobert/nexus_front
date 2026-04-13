import { mockDb } from "@/lib/mock-db";
import { ok, notFound } from "@/lib/route-handler";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const demanda = mockDb.getById<Record<string, unknown>>("demandas", id);
  if (!demanda) return notFound();

  const updated = mockDb.update("demandas", id, {
    exibirVitrine: !demanda["exibirVitrine"],
  });

  return ok(updated);
};
