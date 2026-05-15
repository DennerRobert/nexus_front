import { apiClient } from "@/lib/api-client";
import type { Usuario, LoginFormData } from "@/interfaces/usuario.interface";

interface LoginResponse {
  usuario: Usuario;
  token: string;
}

export const authService = {
  login: (data: LoginFormData) =>
    apiClient.post<LoginResponse>("/auth/login", data),

  logout: () => apiClient.post<void>("/auth/logout", {}),

  me: () => apiClient.get<{ autenticado: boolean }>("/auth/me"),
};
