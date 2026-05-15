import { mockDb } from "@/lib/mock-db";
import { ok, notFound, badRequest, parseBody } from "@/lib/route-handler";
import { v4 as uuidv4 } from "uuid";

interface Params {
  params: Promise<{ id: string }>;
}

export const POST = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const body = await parseBody<Record<string, unknown>>(req);

  const demanda = mockDb.getById<Record<string, unknown>>("demandas", id);
  if (!demanda) return notFound();

  const novaEtapa = body["etapa"] as string | undefined;
  if (!novaEtapa) return badRequest("Campo 'etapa' é obrigatório");

  const historicoItem = {
    id: uuidv4(),
    etapaAnterior: demanda["etapa"],
    etapaNova: novaEtapa,
    usuarioId: body["usuarioId"] ?? "sistema",
    data: new Date().toISOString(),
    observacao: body["observacao"],
    justificativa: body["justificativa"],
  };

  const historicoAtual = (demanda["historicoEtapas"] as unknown[]) ?? [];

  const updated = mockDb.update("demandas", id, {
    etapa: novaEtapa,
    historicoEtapas: [...historicoAtual, historicoItem],
    ...(novaEtapa === "arquivado" && { justificativaArquivamento: body["justificativa"] }),
  });

  return ok(updated);
};
