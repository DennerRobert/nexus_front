"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificacaoItem } from "@/components/Notificacoes/NotificacaoItem";
import { NotificacaoFiltros } from "@/components/Notificacoes/NotificacaoFiltros";
import { useNotificacaoStore } from "@/stores/notificacao.store";
import type { NotificacaoFiltro } from "@/interfaces/notificacao.interface";

const NotificacoesPage = () => {
  const [filtroAtivo, setFiltroAtivo] = useState<NotificacaoFiltro>("todas");

  const {
    getByFiltro,
    getAll,
    getNaoLidas,
    getByCategoria,
    marcarComoLida,
    marcarTodasComoLidas,
    remover,
    removerTodas,
  } = useNotificacaoStore();

  const notificacoesFiltradas = useMemo(
    () => getByFiltro(filtroAtivo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtroAtivo, getAll()]
  );

  const contagemPorFiltro = useMemo(
    () => ({
      todas: getAll().length,
      nao_lidas: getNaoLidas().length,
      demanda: getByCategoria("demanda").length,
      projeto: getByCategoria("projeto").length,
      tarefa: getByCategoria("tarefa").length,
      sistema: getByCategoria("sistema").length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getAll()]
  );

  const temNaoLidas = getNaoLidas().length > 0;

  return (
    <Layout
      title="Notificações"
      subtitle="Acompanhe as atualizações do sistema"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Barra de ações */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <NotificacaoFiltros
            filtroAtivo={filtroAtivo}
            contagemPorFiltro={contagemPorFiltro}
            onFiltroChange={setFiltroAtivo}
          />

          <div className="flex items-center gap-2">
            {temNaoLidas && (
              <Button
                variant="outline"
                size="sm"
                onClick={marcarTodasComoLidas}
                leftIcon={<CheckCheck className="h-4 w-4" />}
                aria-label="Marcar todas as notificações como lidas"
              >
                Marcar todas como lidas
              </Button>
            )}
            {notificacoesFiltradas.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removerTodas}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                aria-label="Remover todas as notificações visíveis"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Lista de notificações */}
        {notificacoesFiltradas.length > 0 ? (
          <div className="space-y-2" role="list" aria-label="Lista de notificações">
            {notificacoesFiltradas.map((notificacao) => (
              <div key={notificacao.id} role="listitem">
                <NotificacaoItem
                  notificacao={notificacao}
                  onMarcarLida={marcarComoLida}
                  onRemover={remover}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30">
            <EmptyState
              icon={Bell}
              title="Nenhuma notificação encontrada"
              description={
                filtroAtivo === "todas"
                  ? "Você está em dia! Nenhuma notificação no momento."
                  : "Nenhuma notificação para o filtro selecionado."
              }
              {...(filtroAtivo !== "todas" && {
                action: {
                  label: "Ver todas",
                  onClick: () => setFiltroAtivo("todas"),
                },
              })}
            />
          </div>
        )}

        {/* Rodapé informativo */}
        {notificacoesFiltradas.length > 0 && (
          <p className="text-center text-xs text-slate-600">
            {notificacoesFiltradas.length}{" "}
            {notificacoesFiltradas.length === 1
              ? "notificação exibida"
              : "notificações exibidas"}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default NotificacoesPage;
