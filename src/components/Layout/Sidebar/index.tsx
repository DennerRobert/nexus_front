"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useTenantStore } from "@/stores/tenant.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import { useContextoStore } from "@/stores/contexto.store";
import { useAuthStore } from "@/stores/auth.store";
import { usePermissoes } from "@/hooks/usePermissoes";
import { TODAS_UNIDADES } from "@/interfaces/tenant.interface";
import { PERFIL_USUARIO_LABELS, PERFIL_USUARIO_COLORS } from "@/interfaces/usuario.interface";
import type { Modulo } from "@/config/permissoes.config";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Package,
  Users,
  UserCircle,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Layers,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  modulo: Modulo;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, modulo: "dashboard" },
  { href: "/demandas", label: "Demandas", icon: FileText, modulo: "demandas" },
  { href: "/projetos", label: "Projetos", icon: FolderKanban, modulo: "projetos" },
  { href: "/produtos", label: "Produtos", icon: Package, modulo: "produtos" },
  { href: "/squads", label: "Squads", icon: Users, modulo: "squads" },
  { href: "/colaboradores", label: "Colaboradores", icon: UserCircle, modulo: "colaboradores" },
  { href: "/empresas", label: "Empresas", icon: Building2, modulo: "empresas" },
  { href: "/clientes", label: "Clientes", icon: Briefcase, modulo: "clientes" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Stores
  const { getAll: getTenants, getById: getTenant, getEmpresasByTenant } = useTenantStore();
  const { getById: getEmpresa } = useEmpresaStore();
  const { contexto, setTenant, setUnidade, initialize, isInitialized } = useContextoStore();
  const { usuario, logout } = useAuthStore();
  const { podeAcessarModulo } = usePermissoes();

  // Filtra os itens de navegação com base nas permissões
  const navItemsPermitidos = navItems.filter((item) => podeAcessarModulo(item.modulo));

  const tenants = getTenants();
  const currentTenant = contexto.tenantId ? getTenant(contexto.tenantId) : null;
  const empresasDoTenant = contexto.tenantId ? getEmpresasByTenant(contexto.tenantId) : [];
  const currentUnidade = contexto.unidadeId ? getEmpresa(contexto.unidadeId) : null;

  // Inicializa o contexto com o primeiro tenant disponível
  useEffect(() => {
    if (tenants.length > 0 && !isInitialized) {
      initialize(tenants[0].id);
    }
  }, [tenants, isInitialized, initialize]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setShowContextMenu(false);
    }
  };

  const handleSelectTenant = (tenantId: string) => {
    setTenant(tenantId);
  };

  const handleSelectUnidade = (unidadeId: string | null) => {
    setUnidade(unidadeId);
    setShowContextMenu(false);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-700/50 bg-slate-900 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header com Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-4">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-bold text-slate-100">SGPI</span>
          </Link>
        )}
        <button
          onClick={handleToggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Seletor de Contexto */}
      {!isCollapsed ? (
        <div className="border-b border-slate-700/50 p-3">
          <div className="relative">
            <button
              onClick={() => setShowContextMenu(!showContextMenu)}
              className={cn(
                "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5",
                "bg-slate-800/50 border border-slate-700/50",
                "text-left text-sm transition-all",
                "hover:bg-slate-800 hover:border-slate-600",
                showContextMenu && "bg-slate-800 border-slate-600"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 truncate">
                    {currentTenant?.nome || "Selecione"}
                  </p>
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {currentUnidade?.nome || TODAS_UNIDADES.nome}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 flex-shrink-0 transition-transform",
                  showContextMenu && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown de Contexto */}
            {showContextMenu && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-slate-700 bg-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Seleção de Tenant */}
                <div className="p-2 border-b border-slate-700/50">
                  <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Tenant
                  </p>
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => handleSelectTenant(tenant.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm",
                        "transition-colors",
                        tenant.id === contexto.tenantId
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-slate-300 hover:bg-slate-700/50"
                      )}
                    >
                      <span className="truncate">{tenant.nome}</span>
                      {tenant.id === contexto.tenantId && (
                        <Check className="h-4 w-4 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Seleção de Unidade */}
                <div className="p-2 max-h-64 overflow-y-auto">
                  <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Unidade
                  </p>
                  {/* Opção "Todas as Unidades" */}
                  <button
                    onClick={() => handleSelectUnidade(null)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm",
                      "transition-colors",
                      contexto.unidadeId === null
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-slate-300 hover:bg-slate-700/50"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {TODAS_UNIDADES.nome}
                    </span>
                    {contexto.unidadeId === null && (
                      <Check className="h-4 w-4 flex-shrink-0" />
                    )}
                  </button>
                  {/* Empresas do Tenant */}
                  {empresasDoTenant.map((empresaId) => {
                    const empresa = getEmpresa(empresaId);
                    if (!empresa) return null;
                    return (
                      <button
                        key={empresaId}
                        onClick={() => handleSelectUnidade(empresaId)}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm",
                          "transition-colors",
                          contexto.unidadeId === empresaId
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "text-slate-300 hover:bg-slate-700/50"
                        )}
                      >
                        <span className="truncate">{empresa.nome}</span>
                        {contexto.unidadeId === empresaId && (
                          <Check className="h-4 w-4 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Botão compacto quando colapsado */
        <div className="border-b border-slate-700/50 p-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 text-cyan-400 hover:bg-slate-800 mx-auto"
            title={`${currentTenant?.nome} - ${currentUnidade?.nome || TODAS_UNIDADES.nome}`}
          >
            <Layers className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItemsPermitidos.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Informações do usuário */}
      <div className="border-t border-slate-700/50 p-3">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Card do usuário */}
            {usuario && (
              <div className="rounded-lg bg-slate-800/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {usuario.nome}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {usuario.email}
                    </p>
                    <span
                      className={cn(
                        "inline-block mt-1 px-2 py-0.5 rounded text-xs",
                        PERFIL_USUARIO_COLORS[usuario.perfil],
                        "text-white"
                      )}
                    >
                      {PERFIL_USUARIO_LABELS[usuario.perfil]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Botão de logout compacto */
          usuario && (
            <button
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors mx-auto"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )
        )}
      </div>
    </aside>
  );
};
