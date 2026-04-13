import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody, getParam } from "@/lib/route-handler";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const squadId = getParam(searchParams, "squadId");
  const colaboradorId = getParam(searchParams, "colaboradorId");

  const alocacoes = mockDb.filter("alocacoes", (item) => {
    const a = item as Record<string, unknown>;
    if (squadId && a["squadId"] !== squadId) return false;
    if (colaboradorId && a["colaboradorId"] !== colaboradorId) return false;
    return true;
  });

  return ok(alocacoes);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);

  // Calcula custo mensal a partir dos dados do colaborador
  const colaborador = mockDb.getById<Record<string, unknown>>(
    "colaboradores",
    body["colaboradorId"] as string,
  );
  const percentual = (body["percentual"] as number) ?? 100;
  const cargaHorariaMensal = (colaborador?.["cargaHorariaMensal"] as number) ?? 160;
  const custoHora = (colaborador?.["custoHora"] as number) ?? 0;
  const horasMensais = (cargaHorariaMensal * percentual) / 100;
  const custoMensal = custoHora * horasMensais;

  const alocacao = mockDb.create("alocacoes", {
    ...body,
    status: "pendente",
    custoMensal,
  });
  return created(alocacao);
};
