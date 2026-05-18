import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Usuario, LoginFormData } from "@/interfaces/usuario.interface";
import { authService } from "@/services/auth.service";
import { deserialize } from "@/lib/deserialize";

const TOKEN_KEY = "sgpi_token";

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginFormData) => Promise<boolean>;
  logout: () => Promise<void>;
  getUsuarioAtual: () => Usuario | null;
  getUsuarioAtualId: () => string | null;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  atualizarPerfil: (data: { nome: string; email: string }) => void;
  alterarSenha: (senhaAtual: string, novaSenha: string) => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      usuario: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginFormData) => {
        set({ isLoading: true, error: null });
        try {
          const { usuario, token } = await authService.login(data);
          const deserialized = deserialize(usuario);
          // Persiste o token para uso nas requisições subsequentes
          if (typeof window !== "undefined") {
            localStorage.setItem(TOKEN_KEY, token);
          }
          set({ usuario: deserialized, isAuthenticated: true, isLoading: false });
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Email ou senha incorretos.";
          set({ isLoading: false, error: msg });
          return false;
        }
      },

      logout: async () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
        }
        set({ usuario: null, isAuthenticated: false, error: null });
        void authService.logout().catch(() => {});
      },

      getUsuarioAtual: () => get().usuario,

      getUsuarioAtualId: () => get().usuario?.id ?? null,

      setLoading: (loading) => set({ isLoading: loading }),

      clearError: () => set({ error: null }),

      atualizarPerfil: (data) => {
        const { usuario } = get();
        if (!usuario) return;
        set({ usuario: { ...usuario, ...data, updatedAt: new Date() } });
      },

      alterarSenha: (senhaAtual, novaSenha) => {
        const { usuario } = get();
        if (!usuario || usuario.senha !== senhaAtual) return false;
        set({ usuario: { ...usuario, senha: novaSenha, updatedAt: new Date() } });
        return true;
      },
    }),
    {
      name: "sgpi-auth",
      partialize: (state) => ({
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
