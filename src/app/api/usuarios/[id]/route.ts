import { mockDb } from "@/lib/mock-db";
import { ok, notFound, noContent, parseBody } from "@/lib/route-handler";

interface Params {
  params: Promise<{ id: string }>;
}

export const GET = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const usuario = mockDb.getById<Record<string, unknown>>("usuarios", id);
  if (!usuario) return notFound();
  const { senha: _senha, ...usuarioSemSenha } = usuario;
  void _senha;
  return ok(usuarioSemSenha);
};

export const PATCH = async (req: Request, { params }: Params) => {
  const { id } = await params;
  const body = await parseBody<Record<string, unknown>>(req);
  const updated = mockDb.update<Record<string, unknown>>("usuarios", id, body);
  if (!updated) return notFound();
  const { senha: _senha, ...semSenha } = updated;
  void _senha;
  return ok(semSenha);
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const { id } = await params;
  const deleted = mockDb.delete("usuarios", id);
  if (!deleted) return notFound();
  return noContent();
};
