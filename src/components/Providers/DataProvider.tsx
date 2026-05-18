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
import { IS_DEMO, DEMO_TENANTS } from "@/lib/demo-mode";

interface DataProviderProps {
  children: ReactNode;
}

/**
 * Carrega todos os dados da aplicação em paralelo assim que o usuário é autenticado.
 * Em DEMO_MODE, injeta mock data diretamente nos stores sem chamar a API externa.
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
    if (IS_DEMO) {
      // Modo demo: injeta mock data diretamente nos stores
      void import("@/utils/mock-data").then((m) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useEmpresaStore.setState({ empresas: m.mockEmpresas as any, isLoading: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useClienteStore.setState({ clientes: m.mockClientes as any, isLoading: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useColaboradorStore.setState({ colaboradores: m.mockColaboradores as any, isLoading: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useAlocacaoStore.setState({ alocacoes: m.mockAlocacoes as any, isLoading: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useDemandaStore.setState({ demandas: m.mockDemandas as any, isLoading: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useProjetoStore.setState({ projetos: m.mockProjetos as any, isLoading: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useSquadStore.setState({ squads: m.mockSquads as any, isLoading: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useProdutoStore.setState({ produtos: m.mockProdutos as any, isLoading: false });
      });

      useTenantStore.setState({ tenants: DEMO_TENANTS, isLoading: false });
      useSetorStore.setState({ setores: [], isLoading: false });
      useNotificacaoStore.setState({ notificacoes: [], isLoading: false });
      useKanbanConfigStore.setState({ configs: {}, isLoading: false });
      return;
    }

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
