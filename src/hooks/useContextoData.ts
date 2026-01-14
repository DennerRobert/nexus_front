"use client";

import { useMemo } from "react";
import { useContextoStore } from "@/stores/contexto.store";
import { useTenantStore } from "@/stores/tenant.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useDemandaStore } from "@/stores/demanda.store";
import { useProdutoStore } from "@/stores/produto.store";
import { useSquadStore } from "@/stores/squad.store";
import { useClienteStore } from "@/stores/cliente.store";
import { useEmpresaStore } from "@/stores/empresa.store";

/**
 * Hook para obter dados filtrados pelo contexto atual (tenant + unidade)
 */
export const useContextoData = () => {
  const { contexto } = useContextoStore();
  const { getEmpresasByTenant } = useTenantStore();
  const { getAll: getAllEmpresas } = useEmpresaStore();

  // IDs das empresas do tenant atual
  const empresasDoTenant = useMemo(() => {
    if (!contexto.tenantId) return [];
    return getEmpresasByTenant(contexto.tenantId);
  }, [contexto.tenantId, getEmpresasByTenant]);

  // Verifica se está em "Todas as Unidades"
  const isTodasUnidades = contexto.unidadeId === null;

  // IDs das empresas para filtrar (uma específica ou todas do tenant)
  const empresasParaFiltrar = useMemo(() => {
    if (isTodasUnidades) {
      return empresasDoTenant;
    }
    return contexto.unidadeId ? [contexto.unidadeId] : [];
  }, [isTodasUnidades, empresasDoTenant, contexto.unidadeId]);

  // Função genérica para filtrar por empresaId
  const filterByEmpresa = <T extends { empresaId?: string }>(items: T[]): T[] => {
    if (empresasParaFiltrar.length === 0) return items;
    return items.filter(
      (item) => !item.empresaId || empresasParaFiltrar.includes(item.empresaId)
    );
  };

  // Função para filtrar por empresaDonaId (projetos, produtos)
  const filterByEmpresaDona = <T extends { empresaDonaId?: string }>(items: T[]): T[] => {
    if (empresasParaFiltrar.length === 0) return items;
    return items.filter(
      (item) => !item.empresaDonaId || empresasParaFiltrar.includes(item.empresaDonaId)
    );
  };

  // Função para filtrar por empresaUnidadeApoioId (demandas)
  const filterByUnidadeApoio = <T extends { empresaUnidadeApoioId?: string }>(items: T[]): T[] => {
    if (empresasParaFiltrar.length === 0) return items;
    return items.filter(
      (item) => !item.empresaUnidadeApoioId || empresasParaFiltrar.includes(item.empresaUnidadeApoioId)
    );
  };

  return {
    tenantId: contexto.tenantId,
    unidadeId: contexto.unidadeId,
    isTodasUnidades,
    empresasDoTenant,
    empresasParaFiltrar,
    filterByEmpresa,
    filterByEmpresaDona,
    filterByUnidadeApoio,
  };
};

/**
 * Hook para obter colaboradores filtrados pelo contexto
 */
export const useColaboradoresContexto = () => {
  const { filterByEmpresa } = useContextoData();
  const { getComOcupacao, getAll } = useColaboradorStore();

  const colaboradores = useMemo(() => {
    return filterByEmpresa(getAll());
  }, [filterByEmpresa, getAll]);

  const colaboradoresComOcupacao = useMemo(() => {
    return filterByEmpresa(getComOcupacao());
  }, [filterByEmpresa, getComOcupacao]);

  return { colaboradores, colaboradoresComOcupacao };
};

/**
 * Hook para obter projetos filtrados pelo contexto
 */
export const useProjetosContexto = () => {
  const { filterByEmpresaDona } = useContextoData();
  const { getAll } = useProjetoStore();

  const projetos = useMemo(() => {
    return filterByEmpresaDona(getAll());
  }, [filterByEmpresaDona, getAll]);

  return { projetos };
};

/**
 * Hook para obter demandas filtradas pelo contexto
 */
export const useDemandasContexto = () => {
  const { filterByUnidadeApoio } = useContextoData();
  const { getAll } = useDemandaStore();

  const demandas = useMemo(() => {
    return filterByUnidadeApoio(getAll());
  }, [filterByUnidadeApoio, getAll]);

  return { demandas };
};

/**
 * Hook para obter produtos filtrados pelo contexto
 */
export const useProdutosContexto = () => {
  const { filterByEmpresaDona } = useContextoData();
  const { getAll } = useProdutoStore();

  const produtos = useMemo(() => {
    return filterByEmpresaDona(getAll());
  }, [filterByEmpresaDona, getAll]);

  return { produtos };
};

/**
 * Hook para obter squads filtrados pelo contexto (via projetos)
 */
export const useSquadsContexto = () => {
  const { projetos } = useProjetosContexto();
  const { getAll } = useSquadStore();

  const squads = useMemo(() => {
    const projetoIds = projetos.map((p) => p.id);
    const allSquads = getAll();
    // Retorna squads que pertencem aos projetos do contexto
    return allSquads.filter(
      (squad) => !squad.projetoId || projetoIds.includes(squad.projetoId)
    );
  }, [projetos, getAll]);

  return { squads };
};

/**
 * Hook para obter clientes filtrados pelo contexto
 * Clientes não têm empresaId diretamente, então retornamos todos
 */
export const useClientesContexto = () => {
  const { getAll } = useClienteStore();

  const clientes = useMemo(() => {
    return getAll();
  }, [getAll]);

  return { clientes };
};

/**
 * Hook para obter empresas do contexto atual
 */
export const useEmpresasContexto = () => {
  const { empresasParaFiltrar } = useContextoData();
  const { getAll, getById } = useEmpresaStore();

  const empresas = useMemo(() => {
    if (empresasParaFiltrar.length === 0) return getAll();
    return empresasParaFiltrar.map((id) => getById(id)).filter(Boolean);
  }, [empresasParaFiltrar, getAll, getById]);

  return { empresas };
};
