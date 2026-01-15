"use client";

import { useAuthStore } from "@/stores/auth.store";
import type { Usuario, PerfilUsuario } from "@/interfaces/usuario.interface";

interface UseAuthReturn {
  usuario: Usuario | null;
  usuarioId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  perfil: PerfilUsuario | null;
  temPermissao: (perfisPermitidos: PerfilUsuario[]) => boolean;
  isAdmin: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const { usuario, isAuthenticated, isLoading, error } = useAuthStore();

  const temPermissao = (perfisPermitidos: PerfilUsuario[]): boolean => {
    if (!usuario) return false;
    // Administrador sempre tem permissão
    if (usuario.perfil === "administrador") return true;
    return perfisPermitidos.includes(usuario.perfil);
  };

  return {
    usuario,
    usuarioId: usuario?.id || null,
    isAuthenticated,
    isLoading,
    error,
    perfil: usuario?.perfil || null,
    temPermissao,
    isAdmin: usuario?.perfil === "administrador",
  };
};
