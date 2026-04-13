/**
 * Banco de dados em memória para as API Routes de mock.
 * Inicializado a partir do mock-data.ts existente + dados inline para
 * entidades que não estavam nele (tenants, usuarios, setores, notificacoes).
 *
 * Singleton de processo: os dados persistem enquanto o servidor Next.js está rodando.
 * Em produção (Fase 4), todo este arquivo é substituído pelo backend Django.
 */
import { v4 as uuidv4 } from "uuid";
import {
  mockEmpresas,
  mockClientes,
  mockColaboradores,
  mockDemandas,
  mockProjetos,
  mockProdutos,
  mockSquads,
  mockAlocacoes,
  mockKanbanConfigs,
  mockRespostasAvaliacao,
  empresaIds,
} from "@/utils/mock-data";

// ─── Setores ─────────────────────────────────────────────────────────────────
const SETORES_DATA = [
  { id: "setor-001", nome: "Tecnologia da Informação", descricao: "Desenvolvimento e infraestrutura de TI", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-002", nome: "Financeiro", descricao: "Gestão financeira e contabilidade", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-003", nome: "Recursos Humanos", descricao: "Gestão de pessoas e cultura", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-004", nome: "Inovação", descricao: "Pesquisa, desenvolvimento e inovação", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-005", nome: "Marketing", descricao: "Marketing, comunicação e branding", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-006", nome: "Comercial", descricao: "Vendas e relacionamento com clientes", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-007", nome: "Jurídico", descricao: "Assessoria jurídica e compliance", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-008", nome: "Operações", descricao: "Processos operacionais e logística", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-009", nome: "Produto", descricao: "Gestão de produtos digitais", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-010", nome: "Dados & Analytics", descricao: "Business intelligence e ciência de dados", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-011", nome: "Design", descricao: "UX/UI Design e design gráfico", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "setor-012", nome: "Qualidade", descricao: "QA, testes e qualidade de software", ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
];

// ─── Tenants ──────────────────────────────────────────────────────────────────
const TENANT_ID_1 = "tenant-grupo-alpha-001";
const TENANT_ID_2 = "tenant-consorcio-beta-002";
const empresaIdsArr = Object.values(empresaIds);

const TENANTS_DATA = [
  {
    id: TENANT_ID_1,
    nome: "Grupo Alpha",
    slug: "grupo-alpha",
    descricao: "Holding principal com foco em tecnologia e inovação",
    ativo: true,
    empresaIds: empresaIdsArr,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-04-08T00:00:00.000Z",
  },
  {
    id: TENANT_ID_2,
    nome: "Consórcio Beta",
    slug: "consorcio-beta",
    descricao: "Consórcio de empresas parceiras",
    ativo: true,
    empresaIds: empresaIdsArr.slice(0, 2),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-04-08T00:00:00.000Z",
  },
];

// ─── Usuários ─────────────────────────────────────────────────────────────────
const USUARIOS_DATA = [
  { id: "usuario-admin-001", nome: "Administrador do Sistema", email: "admin@nexus.com", senha: "123456", perfil: "administrador", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[0], empresaIds: empresaIdsArr, ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
  { id: "usuario-gestor-002", nome: "Maria Silva", email: "gestor@nexus.com", senha: "123456", perfil: "gestor_inovacao", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[0], empresaIds: empresaIdsArr, ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
  { id: "usuario-analista-003", nome: "João Santos", email: "analista@nexus.com", senha: "123456", perfil: "analista_inovacao", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[1], empresaIds: empresaIdsArr.slice(0, 2), ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
  { id: "usuario-po-004", nome: "Ana Oliveira", email: "po@nexus.com", senha: "123456", perfil: "product_owner", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[0], empresaIds: empresaIdsArr.slice(0, 1), ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
  { id: "usuario-especialista-005", nome: "Carlos Dev", email: "dev@nexus.com", senha: "123456", perfil: "especialista", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[2], empresaIds: empresaIdsArr, ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
  { id: "usuario-assistente-006", nome: "Fernanda Assistente", email: "assistente@nexus.com", senha: "123456", perfil: "assistente_inovacao", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[0], empresaIds: empresaIdsArr, ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
  { id: "usuario-financeiro-007", nome: "Roberto Financeiro", email: "financeiro@nexus.com", senha: "123456", perfil: "financeiro", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[0], empresaIds: empresaIdsArr, ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
  { id: "usuario-rh-008", nome: "Paula RH", email: "rh@nexus.com", senha: "123456", perfil: "rh", tenantId: TENANT_ID_1, empresaId: empresaIdsArr[0], empresaIds: empresaIdsArr, ativo: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-04-08T00:00:00.000Z" },
];

// ─── Notificações ─────────────────────────────────────────────────────────────
const NOTIFICACOES_DATA = [
  { id: "n-01", tipo: "demanda_aprovada", categoria: "demanda", titulo: "Demanda aprovada", mensagem: "Sua demanda \"Modernização do sistema de RH\" foi aprovada pelo comitê.", lida: false, createdAt: "2026-04-08T09:45:00.000Z", link: "/demandas/demanda-gestao-contratos-techcorp-002", entidadeId: "demanda-gestao-contratos-techcorp-002" },
  { id: "n-02", tipo: "tarefa_atribuida", categoria: "tarefa", titulo: "Nova tarefa atribuída", mensagem: "A tarefa \"Implementar autenticação SSO\" foi atribuída a você.", lida: false, createdAt: "2026-04-08T09:15:00.000Z", link: "/projetos", entidadeId: "" },
  { id: "n-03", tipo: "comentario_adicionado", categoria: "tarefa", titulo: "Novo comentário na tarefa", mensagem: "Ana Oliveira comentou: \"Precisamos incluir os endpoints de relatório.\"", lida: false, createdAt: "2026-04-08T08:30:00.000Z", link: "/projetos", entidadeId: "" },
  { id: "n-04", tipo: "marco_proximo", categoria: "projeto", titulo: "Marco se aproximando", mensagem: "O marco \"Entrega do MVP\" do projeto App Clientes Varejo ABC vence em 3 dias.", lida: false, createdAt: "2026-04-08T07:00:00.000Z", link: "/projetos", entidadeId: "" },
  { id: "n-05", tipo: "demanda_em_analise", categoria: "demanda", titulo: "Demanda em análise", mensagem: "Sua demanda \"Portal de Transparência\" entrou em análise técnica.", lida: false, createdAt: "2026-04-08T05:00:00.000Z", link: "/demandas/demanda-portal-transparencia-003", entidadeId: "demanda-portal-transparencia-003" },
  { id: "n-06", tipo: "sprint_iniciada", categoria: "projeto", titulo: "Sprint iniciada", mensagem: "A Sprint atual do projeto App Clientes foi iniciada com 12 tarefas planejadas.", lida: true, createdAt: "2026-04-08T02:00:00.000Z", link: "/projetos", entidadeId: "" },
  { id: "n-07", tipo: "demanda_ajustes", categoria: "demanda", titulo: "Demanda requer ajustes", mensagem: "A demanda \"Sistema de Gestão de Contratos\" precisa de ajustes antes de prosseguir.", lida: true, createdAt: "2026-04-07T20:00:00.000Z", link: "/demandas/demanda-gestao-contratos-techcorp-002", entidadeId: "demanda-gestao-contratos-techcorp-002" },
  { id: "n-08", tipo: "alocacao_criada", categoria: "projeto", titulo: "Alocação registrada", mensagem: "Colaborador foi alocado ao Squad Varejo ABC.", lida: true, createdAt: "2026-04-07T10:00:00.000Z", link: "/projetos", entidadeId: "" },
];

// ─── Conversão de Date → string ISO ──────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeItem = (item: any): any => {
  if (item === null || item === undefined) return item;
  if (item instanceof Date) return item.toISOString();
  if (Array.isArray(item)) return item.map(serializeItem);
  if (typeof item === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item)) {
      result[k] = serializeItem(v);
    }
    return result;
  }
  return item;
};

// ─── Kanban configs como array ────────────────────────────────────────────────
const kanbanConfigsArray = Object.entries(mockKanbanConfigs).map(([, config], idx) => ({
  id: `kanban-config-${idx + 1}`,
  ...serializeItem(config),
}));

// ─── Tipo do store ────────────────────────────────────────────────────────────
export type CollectionName =
  | "empresas"
  | "clientes"
  | "colaboradores"
  | "setores"
  | "demandas"
  | "projetos"
  | "produtos"
  | "squads"
  | "alocacoes"
  | "kanban-configs"
  | "notificacoes"
  | "respostas-avaliacao"
  | "tenants"
  | "usuarios";

type RecordWithId = Record<string, unknown> & { id: string };

const deepClone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

class MockDatabase {
  private readonly store: Record<CollectionName, RecordWithId[]>;

  constructor() {
    this.store = {
      empresas: deepClone(serializeItem(mockEmpresas)) as RecordWithId[],
      clientes: deepClone(serializeItem(mockClientes)) as RecordWithId[],
      colaboradores: deepClone(serializeItem(mockColaboradores)) as RecordWithId[],
      setores: deepClone(SETORES_DATA) as RecordWithId[],
      demandas: deepClone(serializeItem(mockDemandas)) as RecordWithId[],
      projetos: deepClone(serializeItem(mockProjetos)) as RecordWithId[],
      produtos: deepClone(serializeItem(mockProdutos)) as RecordWithId[],
      squads: deepClone(serializeItem(mockSquads)) as RecordWithId[],
      alocacoes: deepClone(serializeItem(mockAlocacoes)) as RecordWithId[],
      "kanban-configs": deepClone(kanbanConfigsArray) as RecordWithId[],
      notificacoes: deepClone(NOTIFICACOES_DATA) as RecordWithId[],
      "respostas-avaliacao": deepClone(serializeItem(mockRespostasAvaliacao)) as RecordWithId[],
      tenants: deepClone(TENANTS_DATA) as RecordWithId[],
      usuarios: deepClone(USUARIOS_DATA) as RecordWithId[],
    };
  }

  getAll<T>(collection: CollectionName): T[] {
    return this.store[collection] as unknown as T[];
  }

  getById<T>(collection: CollectionName, id: string): T | undefined {
    return this.store[collection].find((item) => item.id === id) as unknown as T | undefined;
  }

  filter<T>(
    collection: CollectionName,
    predicate: (item: RecordWithId) => boolean,
  ): T[] {
    return this.store[collection].filter(predicate) as unknown as T[];
  }

  create<T extends Record<string, unknown>>(
    collection: CollectionName,
    data: T,
  ): T & { id: string; createdAt: string; updatedAt: string } {
    const now = new Date().toISOString();
    const item = {
      ...data,
      id: (data.id as string) ?? uuidv4(),
      createdAt: (data.createdAt as string) ?? now,
      updatedAt: now,
    } as T & { id: string; createdAt: string; updatedAt: string };
    this.store[collection].push(item as unknown as RecordWithId);
    return item;
  }

  update<T>(
    collection: CollectionName,
    id: string,
    data: Partial<T>,
  ): T | undefined {
    const items = this.store[collection];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...items[index],
      ...(data as Record<string, unknown>),
      id,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    return updated as unknown as T;
  }

  delete(collection: CollectionName, id: string): boolean {
    const items = this.store[collection];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    return true;
  }
}

// Singleton — compartilhado por todas as API Routes no mesmo processo Next.js
const globalForMockDb = globalThis as unknown as { _mockDb?: MockDatabase };
export const mockDb = globalForMockDb._mockDb ?? new MockDatabase();
if (process.env.NODE_ENV !== "production") globalForMockDb._mockDb = mockDb;
