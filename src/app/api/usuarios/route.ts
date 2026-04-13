import { mockDb } from "@/lib/mock-db";
import { ok, created, parseBody } from "@/lib/route-handler";

export const GET = async () => {
  const usuarios = mockDb
    .getAll<Record<string, unknown>>("usuarios")
    .map(({ senha: _senha, ...u }) => {
      void _senha;
      return u;
    });
  return ok(usuarios);
};

export const POST = async (req: Request) => {
  const body = await parseBody<Record<string, unknown>>(req);
  const usuario = mockDb.create("usuarios", body);
  const { senha: _senha, ...usuarioSemSenha } = usuario;
  void _senha;
  return created(usuarioSemSenha);
};
