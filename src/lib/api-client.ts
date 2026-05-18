/**
 * Cliente HTTP centralizado para todas as chamadas de API.
 * Em mock: aponta para /api (Next.js Route Handlers).
 * Em produção: NEXT_PUBLIC_API_URL aponta para o backend (nexus-api).
 */
import { toast } from "sonner";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** Shape da resposta paginada do nexus-api */
export interface Paginated<T> {
  items: T[];
  total: number;
  current_page: number;
  per_page: number;
}

const TOKEN_KEY = "sgpi_token";

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Dados inválidos. Verifique os campos e tente novamente.",
  401: "Sessão expirada. Faça login novamente.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "Recurso não encontrado.",
  409: "Conflito: este registro já existe.",
  422: "Dados não processáveis. Verifique os campos.",
  429: "Muitas requisições. Aguarde um momento e tente novamente.",
  500: "Erro interno do servidor. Tente novamente mais tarde.",
  502: "Serviço indisponível. Tente novamente em breve.",
  503: "Serviço em manutenção. Tente novamente em breve.",
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  signal?: AbortSignal;
  /** Silencia o toast automático de erro */
  silentError?: boolean;
}

async function handleResponse<T>(res: Response, silentError = false): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  let errorData: unknown;
  try {
    errorData = await res.json();
  } catch {
    errorData = undefined;
  }

  const message =
    (errorData as { detail?: string })?.detail ??
    HTTP_ERROR_MESSAGES[res.status] ??
    "Erro inesperado. Tente novamente.";

  if (!silentError) {
    if (res.status === 401) {
      toast.error("Sessão expirada", {
        description: "Faça login novamente para continuar.",
      });
    } else if (res.status >= 500) {
      toast.error("Erro no servidor", { description: message });
    }
  }

  throw new ApiError(res.status, message, errorData);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getTenantId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sgpi-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { usuario?: { tenantId?: string } } };
    return parsed?.state?.usuario?.tenantId ?? null;
  } catch {
    return null;
  }
}

function buildHeaders(withBody = false): HeadersInit {
  const headers: HeadersInit = {};
  if (withBody) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const tenantId = getTenantId();
  if (tenantId) headers["X-Tenant-ID"] = tenantId;

  return headers;
}

export const apiClient = {
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: buildHeaders(),
      signal: options?.signal,
    });
    return handleResponse<T>(res, options?.silentError);
  },

  async post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(true),
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    return handleResponse<T>(res, options?.silentError);
  },

  async patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: buildHeaders(true),
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    return handleResponse<T>(res, options?.silentError);
  },

  async put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(true),
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    return handleResponse<T>(res, options?.silentError);
  },

  async delete(path: string, options?: RequestOptions): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: buildHeaders(),
      signal: options?.signal,
    });
    return handleResponse(res, options?.silentError);
  },
};
