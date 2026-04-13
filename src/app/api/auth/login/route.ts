import { mockDb } from "@/lib/mock-db";
import { ok, parseBody } from "@/lib/route-handler";
import { NextResponse } from "next/server";

interface LoginBody {
  email: string;
  senha: string;
}

export const POST = async (req: Request) => {
  const { email, senha } = await parseBody<LoginBody>(req);

  const usuario = mockDb
    .getAll<Record<string, unknown>>("usuarios")
    .find(
      (u) =>
        (u["email"] as string)?.toLowerCase() === email?.toLowerCase() &&
        u["senha"] === senha,
    );

  if (!usuario) {
    return NextResponse.json(
      { detail: "Email ou senha incorretos." },
      { status: 401 },
    );
  }

  // Remove a senha antes de retornar
  const { senha: _senha, ...usuarioSemSenha } = usuario;
  void _senha;

  return ok({
    usuario: usuarioSemSenha,
    // Token fictício — será substituído pelo JWT do Django na Fase 4
    token: `mock-token-${usuarioSemSenha["id"]}`,
  });
};
