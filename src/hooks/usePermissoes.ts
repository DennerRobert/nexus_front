"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  PERMISSOES_POR_PERFIL,
  TODOS_MODULOS,
  ROTA_PARA_MODULO,
  type Modulo,
  type AcaoModulo,
  type RestricoesModulo,
  type PermissaoModulo,
} from "@/config/permissoes.config";

interface UsePermissoesReturn {
  // Verifica se pode acessar um módulo
  podeAcessarModulo: (modulo: Modulo) => boolean;
  // Verifica se pode executar uma ação específica em um módulo
  podeExecutarAcao: (modulo: Modulo, acao: AcaoModulo) => boolean;
  // Retorna as restrições de um módulo (se houver)
  getRestricoes: (modulo: Modulo) => RestricoesModulo | null;
  // Lista de módulos que o usuário pode acessar
  modulosPermitidos: Modulo[];
  // Verifica se pode acessar uma rota específica
  podeAcessarRota: (rota: string) => boolean;
  // Verifica se é admin (acesso total)
  isAdmin: boolean;
  // Retorna a configuração de permissão de um módulo
  getPermissaoModulo: (modulo: Modulo) => PermissaoModulo | null;
}

export const usePermissoes = (): UsePermissoesReturn => {
  const { usuario } = useAuthStore();

  const permissoesUsuario = useMemo(() => {
    if (!usuario) return [];
    return PERMISSOES_POR_PERFIL[usuario.perfil] || [];
  }, [usuario]);

  const isAdmin = useMemo(() => {
    return usuario?.perfil === "administrador";
  }, [usuario]);

  // Verifica se tem permissão wildcard (*)
  const temPermissaoTotal = useMemo(() => {
    return permissoesUsuario.some(
      (p) => p.modulo === "*" && p.acoes.includes("todas")
    );
  }, [permissoesUsuario]);

  // Encontra a configuração de permissão para um módulo
  const getPermissaoModulo = (modulo: Modulo): PermissaoModulo | null => {
    if (temPermissaoTotal) {
      return { modulo: "*", acoes: ["todas"] };
    }
    return permissoesUsuario.find((p) => p.modulo === modulo) || null;
  };

  // Verifica se pode acessar um módulo
  const podeAcessarModulo = (modulo: Modulo): boolean => {
    if (!usuario) return false;
    if (temPermissaoTotal) return true;
    return permissoesUsuario.some((p) => p.modulo === modulo);
  };

  // Verifica se pode executar uma ação específica
  const podeExecutarAcao = (modulo: Modulo, acao: AcaoModulo): boolean => {
    if (!usuario) return false;
    if (temPermissaoTotal) return true;

    const permissao = permissoesUsuario.find((p) => p.modulo === modulo);
    if (!permissao) return false;

    return permissao.acoes.includes("todas") || permissao.acoes.includes(acao);
  };

  // Retorna as restrições de um módulo
  const getRestricoes = (modulo: Modulo): RestricoesModulo | null => {
    if (temPermissaoTotal) return null;

    const permissao = permissoesUsuario.find((p) => p.modulo === modulo);
    return permissao?.restricoes || null;
  };

  // Lista de módulos permitidos
  const modulosPermitidos = useMemo((): Modulo[] => {
    if (temPermissaoTotal) return TODOS_MODULOS;
    return permissoesUsuario
      .filter((p) => p.modulo !== "*")
      .map((p) => p.modulo as Modulo);
  }, [permissoesUsuario, temPermissaoTotal]);

  // Verifica se pode acessar uma rota
  const podeAcessarRota = (rota: string): boolean => {
    // Rota de login é sempre acessível
    if (rota === "/login") return true;

    // Encontra o módulo correspondente à rota
    const rotaBase = Object.keys(ROTA_PARA_MODULO).find(
      (r) => rota === r || (r !== "/" && rota.startsWith(r))
    );

    if (!rotaBase) return false;

    const modulo = ROTA_PARA_MODULO[rotaBase];
    return podeAcessarModulo(modulo);
  };

  return {
    podeAcessarModulo,
    podeExecutarAcao,
    getRestricoes,
    modulosPermitidos,
    podeAcessarRota,
    isAdmin,
    getPermissaoModulo,
  };
};
