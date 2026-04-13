/**
 * Helpers para os Route Handlers do Next.js App Router.
 * Centraliza respostas de erro e o parse do body JSON.
 */
import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json(data, { status });

export const created = <T>(data: T) =>
  NextResponse.json(data, { status: 201 });

export const noContent = () =>
  new NextResponse(null, { status: 204 });

export const notFound = (message = "Recurso não encontrado") =>
  NextResponse.json({ detail: message }, { status: 404 });

export const badRequest = (message = "Dados inválidos") =>
  NextResponse.json({ detail: message }, { status: 400 });

export const conflict = (message = "Conflito: registro já existe") =>
  NextResponse.json({ detail: message }, { status: 409 });

export const internalError = (message = "Erro interno do servidor") =>
  NextResponse.json({ detail: message }, { status: 500 });

export const parseBody = async <T>(req: Request): Promise<T> => {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Body JSON inválido");
  }
};

/** Lê o parâmetro `q` de searchParams como string ou undefined. */
export const getParam = (
  searchParams: URLSearchParams,
  key: string,
): string | undefined => searchParams.get(key) ?? undefined;
