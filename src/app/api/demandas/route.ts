import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const empresaId = getParam(searchParams, "empresaId");
  const status = getParam(searchParams, "status");

  const demandas = mockDb.filter("demandas", (item) => {
    const d = item as Record<string, unknown>;
    if (empresaId && d["empresaUnidadeApoioId"] !== empresaId) return false;
    if (status && d["status"] !== status) return false;
    return true;
  });

  return ok(demandas);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const demanda = mockDb.create("demandas", {
    ...body,
    status: "rascunho",
    etapa: "ideia_recebida",
    exibirVitrine: true,
    avaliacoes: [],
    anexosIds: [],
    historicoEtapas: [],
  });
  return created(demanda);
};
