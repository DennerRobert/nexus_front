import { mockDb } from "@/lib/mock-db";
import { ok, notFound, parseBody } from "@/lib/route-handler";

interface Params {
  params: Promise<{ empresaId: string }>;
}

export const GET = async (_req: Request, { params }: Params) => {
  const { empresaId } = await params;
  const config = mockDb.filter<Record<string, unknown>>(
    "kanban-configs",
    (item) => (item as Record<string, unknown>)["empresaId"] === empresaId,
  )[0];

  if (!config) return notFound("Configuração de kanban não encontrada");
  return ok(config);
};

export const PUT = async (req: Request, { params }: Params) => {
  const { empresaId } = await params;
  const body = await parseBody<Record<string, unknown>>(req);

  const configs = mockDb.getAll<Record<string, unknown>>("kanban-configs");
  const index = configs.findIndex((c) => c["empresaId"] === empresaId);

  if (index === -1) {
    // Cria nova config se não existir
    const nova = mockDb.create("kanban-configs", {
      empresaId,
      ...body,
    });
    return ok(nova);
  }

  // Atualiza pela empresaId (não pelo id padrão, pois kanban-configs usa empresaId como chave)
  const updated = { ...configs[index], ...body, updatedAt: new Date().toISOString() };
  const allConfigs = mockDb.getAll<Record<string, unknown>>("kanban-configs");
  const idx = allConfigs.findIndex((c) => c["empresaId"] === empresaId);
  if (idx !== -1) {
    // Usa o método de atualização pelo id interno se disponível
    const id = allConfigs[idx]["id"] as string | undefined;
    if (id) {
      mockDb.update("kanban-configs", id, body);
    }
  }

  return ok(updated);
};
