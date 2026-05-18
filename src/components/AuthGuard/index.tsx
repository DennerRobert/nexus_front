"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { IS_DEMO, DEMO_USER } from "@/lib/demo-mode";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ["/login"];

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Em modo demo: autentica automaticamente com usuário demo
  useEffect(() => {
    if (IS_DEMO && !isAuthenticated) {
      useAuthStore.setState({
        usuario: DEMO_USER,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (IS_DEMO) return; // demo não precisa de redirect para login

    // Se não está carregando e não está autenticado e não é rota pública
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }

    // Se está autenticado e está na página de login, redireciona para dashboard
    if (isAuthenticated && pathname === "/login") {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se é rota pública, renderiza normalmente
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Se não está autenticado, não renderiza nada (vai redirecionar)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <p className="text-slate-400 text-sm">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Usuário autenticado, renderiza o conteúdo
  return <>{children}</>;
};
