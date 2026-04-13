import { mockDb } from "@/lib/mock-db";
import { ok, notFound, noContent, parseBody } from "@/lib/route-handler";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const alocacao = mockDb.getById("alocacoes", id);
  if (!alocacao) return notFound();
  return ok(alocacao);
};

export const PATCH = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const body = await parseBody<Record<string, unknown>>(req);

  // Recalcula custo mensal se percentual foi alterado
  if (body["percentual"] !== undefined) {
    const current = mockDb.getById<Record<string, unknown>>("alocacoes", id);
    const colaboradorId = (body["colaboradorId"] as string) ?? (current?.["colaboradorId"] as string);
    const colaborador = mockDb.getById<Record<string, unknown>>("colaboradores", colaboradorId);
    const percentual = body["percentual"] as number;
    const cargaHorariaMensal = (colaborador?.["cargaHorariaMensal"] as number) ?? 160;
    const custoHora = (colaborador?.["custoHora"] as number) ?? 0;
    const horasMensais = (cargaHorariaMensal * percentual) / 100;
    body["custoMensal"] = custoHora * horasMensais;
  }

  const updated = mockDb.update("alocacoes", id, body);
  if (!updated) return notFound();
  return ok(updated);
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const deleted = mockDb.delete("alocacoes", id);
  if (!deleted) return notFound();
  return noContent();
};
