import { ok } from "@/lib/route-handler";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  // Em produção: valida o JWT do header Authorization
  // No mock: decodifica o token fictício para extrair o ID
  const authorization = req.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");

  if (!token?.startsWith("mock-token-")) {
    return NextResponse.json({ detail: "Não autenticado." }, { status: 401 });
  }

  // Retorna dados mínimos — o store de auth já mantém o usuário em memória
  return ok({ autenticado: true });
};
