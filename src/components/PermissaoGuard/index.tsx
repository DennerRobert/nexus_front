"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useAuthStore } from "@/stores/auth.store";
import type { Modulo, AcaoModulo } from "@/config/permissoes.config";
import { MODULO_LABELS } from "@/config/permissoes.config";
import { cn } from "@/utils/cn";
import { ShieldX, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PermissaoGuardProps {
  children: ReactNode;
  // Módulo que requer permissão
  modulo?: Modulo;
  // Ação específica que requer permissão
  acao?: AcaoModulo;
  // Se true, esconde o elemento ao invés de mostrar mensagem
  esconder?: boolean;
  // Componente alternativo a ser exibido quando não tem permissão
  fallback?: ReactNode;
  // Se é uma página inteira (mostra layout de acesso negado)
  isPagina?: boolean;
}

// Componente de acesso negado para páginas
const AcessoNegadoPage = ({ modulo }: { modulo?: Modulo }) => {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
            <ShieldX className="h-12 w-12 text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Acesso Restrito
        </h1>
        <p className="text-slate-400 mb-6">
          Você não tem permissão para acessar
          {modulo ? ` o módulo de ${MODULO_LABELS[modulo]}` : " este conteúdo"}.
          Entre em contato com o administrador caso precise de acesso.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={() => router.push("/")}>
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente de acesso negado inline (para elementos menores)
const AcessoNegadoInline = () => {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-500">
      <Lock className="h-4 w-4" />
      <span className="text-sm">Sem permissão</span>
    </div>
  );
};

export const PermissaoGuard = ({
  children,
  modulo,
  acao,
  esconder = false,
  fallback,
  isPagina = false,
}: PermissaoGuardProps) => {
  const { isAuthenticated } = useAuthStore();
  const { podeAcessarModulo, podeExecutarAcao } = usePermissoes();

  // Se não está autenticado, não mostra nada (AuthGuard cuida do redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Verifica permissão
  let temPermissao = true;

  if (modulo) {
    temPermissao = podeAcessarModulo(modulo);

    // Se passou na verificação de módulo, verifica ação específica
    if (temPermissao && acao) {
      temPermissao = podeExecutarAcao(modulo, acao);
    }
  }

  // Se tem permissão, renderiza o conteúdo
  if (temPermissao) {
    return <>{children}</>;
  }

  // Se não tem permissão e deve esconder
  if (esconder) {
    return null;
  }

  // Se tem fallback customizado
  if (fallback) {
    return <>{fallback}</>;
  }

  // Se é uma página inteira
  if (isPagina) {
    return <AcessoNegadoPage modulo={modulo} />;
  }

  // Fallback padrão inline
  return <AcessoNegadoInline />;
};

// Componente auxiliar para botões/ações condicionais
interface BotaoPermissaoProps {
  children: ReactNode;
  modulo: Modulo;
  acao: AcaoModulo;
  esconder?: boolean;
}

export const BotaoPermissao = ({
  children,
  modulo,
  acao,
  esconder = true,
}: BotaoPermissaoProps) => {
  return (
    <PermissaoGuard modulo={modulo} acao={acao} esconder={esconder}>
      {children}
    </PermissaoGuard>
  );
};
