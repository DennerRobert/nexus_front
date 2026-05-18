/**
 * Modo demo: carrega dados mockados e faz login automático,
 * sem depender do nexus-api backend.
 * Ativado via variável de ambiente NEXT_PUBLIC_DEMO_MODE=true.
 */

import type { Usuario } from "@/interfaces/usuario.interface";
import type { Tenant } from "@/interfaces/tenant.interface";
import { empresaIds } from "@/utils/mock-data";

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const empresaIdsArr = Object.values(empresaIds);

const TENANT_ID = "tenant-grupo-alpha-001";

export const DEMO_TENANTS: Tenant[] = [
  {
    id: TENANT_ID,
    nome: "Grupo Alpha",
    slug: "grupo-alpha",
    descricao: "Holding principal com foco em tecnologia e inovação",
    ativo: true,
    empresaIds: empresaIdsArr,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-04-08"),
  },
  {
    id: "tenant-consorcio-beta-002",
    nome: "Consórcio Beta",
    slug: "consorcio-beta",
    descricao: "Consórcio de empresas parceiras",
    ativo: true,
    empresaIds: empresaIdsArr.slice(0, 2),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-04-08"),
  },
];

export const DEMO_USER: Usuario = {
  id: "usuario-admin-001",
  nome: "Administrador Demo",
  email: "admin@nexus.com",
  senha: "demo",
  perfil: "administrador",
  tenantId: TENANT_ID,
  empresaId: empresaIdsArr[0],
  empresaIds: empresaIdsArr,
  ativo: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-04-08"),
};
