"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useClienteStore } from "@/stores/cliente.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useAlocacaoStore } from "@/stores/alocacao.store";
import { useDemandaStore } from "@/stores/demanda.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useSquadStore } from "@/stores/squad.store";
import { useProdutoStore } from "@/stores/produto.store";
import { useSetorStore } from "@/stores/setor.store";
import { useTenantStore } from "@/stores/tenant.store";
import { useNotificacaoStore } from "@/stores/notificacao.store";
import { useKanbanConfigStore } from "@/stores/kanban-config.store";

interface DataProviderProps {
  children: ReactNode;
}

/**
 * Carrega todos os dados da aplicação em paralelo assim que o usuário é autenticado.
 * Substitui a estratégia antiga de importar mock-data diretamente nas stores.
 *
 * Em produção (Fase 4): as mesmas chamadas apontarão para o backend Django,
 * bastando atualizar NEXT_PUBLIC_API_URL.
 */
export const DataProvider = ({ children }: DataProviderProps) => {
  const fetchEmpresas = useEmpresaStore((s) => s.fetchAll);
  const fetchClientes = useClienteStore((s) => s.fetchAll);
  const fetchColaboradores = useColaboradorStore((s) => s.fetchAll);
  const fetchAlocacoes = useAlocacaoStore((s) => s.fetchAll);
  const fetchDemandas = useDemandaStore((s) => s.fetchAll);
  const fetchProjetos = useProjetoStore((s) => s.fetchAll);
  const fetchSquads = useSquadStore((s) => s.fetchAll);
  const fetchProdutos = useProdutoStore((s) => s.fetchAll);
  const fetchSetores = useSetorStore((s) => s.fetchAll);
  const fetchTenants = useTenantStore((s) => s.fetchAll);
  const fetchNotificacoes = useNotificacaoStore((s) => s.fetchAll);
  const fetchKanbanConfigs = useKanbanConfigStore((s) => s.fetchAll);

  useEffect(() => {
    void Promise.all([
      fetchEmpresas(),
      fetchClientes(),
      fetchColaboradores(),
      fetchAlocacoes(),
      fetchDemandas(),
      fetchProjetos(),
      fetchSquads(),
      fetchProdutos(),
      fetchSetores(),
      fetchTenants(),
      fetchNotificacoes(),
      fetchKanbanConfigs(),
    ]);
  // As funções de fetch são estáveis (criadas uma vez pelo Zustand), sem risco de loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
