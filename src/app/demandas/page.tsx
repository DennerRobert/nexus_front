"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { FormInovacao } from "@/components/FormularioDemanda/FormInovacao";
import { FormOperacional } from "@/components/FormularioDemanda/FormOperacional";
import { FormEstrategico } from "@/components/FormularioDemanda/FormEstrategico";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useAuth } from "@/hooks/useAuth";
import { usePermissoes } from "@/hooks/usePermissoes";
import {
  FORMULARIO_TIPO_LABELS,
  type FormularioTipo,
} from "@/interfaces/empresa.interface";
import { cn } from "@/utils/cn";
import {
  Lightbulb,
  Wrench,
  Target,
  ChevronDown,
  Building2,
  LayoutList,
} from "lucide-react";

const FORMULARIO_TIPO_ICON: Record<FormularioTipo, typeof Lightbulb> = {
  inovacao: Lightbulb,
  operacional: Wrench,
  estrategico: Target,
};

const FORMULARIO_TIPO_COLOR: Record<FormularioTipo, string> = {
  inovacao: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
  operacional: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  estrategico: "text-violet-400 bg-violet-500/15 border-violet-500/30",
};

const DemandasPage = () => {
  const { usuario } = useAuth();
  const { getById: getEmpresa, getAll: getEmpresas } = useEmpresaStore();
  const { podeExecutarAcao } = usePermissoes();

  const podeCriar = podeExecutarAcao("demandas", "criar");

  // Empresas que o usuário tem acesso, ordenadas alfabeticamente
  const empresasDoUsuario = useMemo(() => {
    if (!usuario) return [];
    const ids = usuario.empresaIds ?? [];
    return getEmpresas()
      .filter((e) => e.ativa && ids.includes(e.id))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [usuario, getEmpresas]);

  // Empresa selecionada começa com a empresa principal do usuário
  const empresaPrincipalId = usuario?.empresaId ?? empresasDoUsuario[0]?.id ?? "";
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState<string>(empresaPrincipalId);
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const empresaSelecionada = getEmpresa(empresaSelecionadaId) ?? empresasDoUsuario[0];
  const tipo = (empresaSelecionada?.formularioTipo ?? "inovacao") as FormularioTipo;
  const Icon = FORMULARIO_TIPO_ICON[tipo];

  if (!podeCriar) {
    return (
      <Layout title="Demandas" subtitle="Você não tem permissão para criar demandas">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">Acesso restrito</p>
          <p className="mt-1 text-sm text-slate-600">
            Seu perfil não permite criar demandas neste momento.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Nova Demanda"
      subtitle="Preencha o formulário abaixo para registrar uma demanda"
    >
      <div className="space-y-6">
        {/* Barra de navegação */}
        <div className="flex justify-end">
          <Link href="/demandas/lista">
            <Button variant="outline" size="sm" leftIcon={<LayoutList className="h-4 w-4" />}>
              Ver demandas
            </Button>
          </Link>
        </div>

        {/* Seletor de empresa destino */}
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Empresa destino
          </p>
          <button
            type="button"
            onClick={() => setDropdownAberto((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
              "bg-slate-800/60 hover:bg-slate-800",
              FORMULARIO_TIPO_COLOR[tipo]
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
                  FORMULARIO_TIPO_COLOR[tipo]
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {empresaSelecionada?.nome ?? "Selecione uma empresa"}
                </p>
                <p className="text-xs text-slate-400">
                  {empresaSelecionada
                    ? FORMULARIO_TIPO_LABELS[tipo]
                    : "Nenhuma empresa disponível"}
                  {empresaSelecionada?.id === usuario?.empresaId && (
                    <span className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
                      sua empresa
                    </span>
                  )}
                </p>
              </div>
            </div>
            {empresasDoUsuario.length > 1 && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform",
                  dropdownAberto && "rotate-180"
                )}
              />
            )}
          </button>

          {/* Dropdown de seleção */}
          {dropdownAberto && empresasDoUsuario.length > 1 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
              {empresasDoUsuario.map((empresa) => {
                const empTipo = (empresa.formularioTipo ?? "inovacao") as FormularioTipo;
                const EmpIcon = FORMULARIO_TIPO_ICON[empTipo];
                const isSelected = empresa.id === empresaSelecionadaId;
                const isPrincipal = empresa.id === usuario?.empresaId;

                return (
                  <button
                    key={empresa.id}
                    type="button"
                    onClick={() => {
                      setEmpresaSelecionadaId(empresa.id);
                      setDropdownAberto(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-slate-700/60 text-slate-100"
                        : "text-slate-300 hover:bg-slate-700/40"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        FORMULARIO_TIPO_COLOR[empTipo]
                      )}
                    >
                      <EmpIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{empresa.nome}</p>
                      <p className="text-xs text-slate-500">
                        {FORMULARIO_TIPO_LABELS[empTipo]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPrincipal && (
                        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
                          sua empresa
                        </span>
                      )}
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-cyan-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulário da empresa selecionada */}
        {empresaSelecionada && (
          <div key={empresaSelecionadaId}>
            {tipo === "inovacao" && (
              <FormInovacao
                empresaId={empresaSelecionada.id}
                empresaNome={empresaSelecionada.nome}
                redirectTo="/demandas/lista"
              />
            )}
            {tipo === "operacional" && (
              <FormOperacional
                empresaId={empresaSelecionada.id}
                empresaNome={empresaSelecionada.nome}
                redirectTo="/demandas/lista"
              />
            )}
            {tipo === "estrategico" && (
              <FormEstrategico
                empresaId={empresaSelecionada.id}
                empresaNome={empresaSelecionada.nome}
                redirectTo="/demandas/lista"
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DemandasPage;
