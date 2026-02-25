import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Comite, VotoComite, ResultadoVotacao } from "@/interfaces/comite.interface";

// Mock de tenants e usuários para referência
const MOCK_TENANT_ID = "tenant-1";
const MOCK_USUARIOS = {
  chefe: "usuario-chefe-comite",
  membro1: "usuario-membro-1",
  membro2: "usuario-membro-2",
  membro3: "usuario-membro-3",
};

// Mock data inicial
const mockComites: Comite[] = [
  {
    id: uuidv4(),
    nome: "Comitê de Inovação",
    descricao: "Comitê responsável pela avaliação de ideias de inovação",
    tenantId: MOCK_TENANT_ID,
    chefeId: MOCK_USUARIOS.chefe,
    membrosIds: [MOCK_USUARIOS.membro1, MOCK_USUARIOS.membro2, MOCK_USUARIOS.membro3],
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface ComiteState {
  comites: Comite[];
  votos: VotoComite[];
}

interface ComiteActions {
  // CRUD
  getAll: () => Comite[];
  getById: (id: string) => Comite | undefined;
  getByTenant: (tenantId: string) => Comite[];
  criar: (data: Omit<Comite, "id" | "createdAt" | "updatedAt">) => Comite;
  atualizar: (id: string, data: Partial<Comite>) => void;
  excluir: (id: string) => void;

  // Funções de verificação
  isChefe: (usuarioId: string, comiteId: string) => boolean;
  isMembro: (usuarioId: string, comiteId: string) => boolean;
  isMembroOuChefe: (usuarioId: string, comiteId: string) => boolean;

  // Votação
  registrarVoto: (voto: Omit<VotoComite, "id" | "data">) => void;
  getVotosDemanda: (demandaId: string, comiteId: string) => VotoComite[];
  getVotoMembro: (demandaId: string, comiteId: string, membroId: string) => VotoComite | undefined;
  calcularResultado: (demandaId: string, comiteId: string) => ResultadoVotacao | null;
  verificarAprovacao: (demandaId: string, comiteId: string) => boolean;
}

export const useComiteStore = create<ComiteState & ComiteActions>()(
  persist(
    (set, get) => ({
      comites: mockComites,
      votos: [],

      // CRUD
      getAll: () => get().comites,

      getById: (id) => get().comites.find((c) => c.id === id),

      getByTenant: (tenantId) =>
        get().comites.filter((c) => c.tenantId === tenantId && c.ativo),

      criar: (data) => {
        const novo: Comite = {
          ...data,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ comites: [...state.comites, novo] }));
        return novo;
      },

      atualizar: (id, data) => {
        set((state) => ({
          comites: state.comites.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
          ),
        }));
      },

      excluir: (id) => {
        set((state) => ({
          comites: state.comites.filter((c) => c.id !== id),
        }));
      },

      // Verificações
      isChefe: (usuarioId, comiteId) => {
        const comite = get().getById(comiteId);
        return comite?.chefeId === usuarioId;
      },

      isMembro: (usuarioId, comiteId) => {
        const comite = get().getById(comiteId);
        return comite?.membrosIds.includes(usuarioId) || false;
      },

      isMembroOuChefe: (usuarioId, comiteId) => {
        return get().isChefe(usuarioId, comiteId) || get().isMembro(usuarioId, comiteId);
      },

      // Votação
      registrarVoto: (votoData) => {
        const votoExistente = get().getVotoMembro(
          votoData.demandaId,
          votoData.comiteId,
          votoData.membroId
        );

        if (votoExistente) {
          // Atualiza voto existente
          set((state) => ({
            votos: state.votos.map((v) =>
              v.id === votoExistente.id
                ? { ...v, ...votoData, data: new Date() }
                : v
            ),
          }));
        } else {
          // Cria novo voto
          const novoVoto: VotoComite = {
            ...votoData,
            id: uuidv4(),
            data: new Date(),
          };
          set((state) => ({ votos: [...state.votos, novoVoto] }));
        }
      },

      getVotosDemanda: (demandaId, comiteId) =>
        get().votos.filter(
          (v) => v.demandaId === demandaId && v.comiteId === comiteId
        ),

      getVotoMembro: (demandaId, comiteId, membroId) =>
        get().votos.find(
          (v) =>
            v.demandaId === demandaId &&
            v.comiteId === comiteId &&
            v.membroId === membroId
        ),

      calcularResultado: (demandaId, comiteId) => {
        const comite = get().getById(comiteId);
        if (!comite) return null;

        const votos = get().getVotosDemanda(demandaId, comiteId);
        const totalMembros = comite.membrosIds.length + 1; // +1 para o chefe
        const votosAprovacao = votos.filter((v) => v.aprovado).length;
        const votosRejeicao = votos.filter((v) => !v.aprovado).length;
        const percentualAprovacao = (votosAprovacao / totalMembros) * 100;

        // Verifica se o chefe aprovou diretamente
        const votoChefe = votos.find((v) => v.membroId === comite.chefeId);
        const chefeAprovouDiretamente = votoChefe?.aprovado || false;

        // Aprovado se: 51% dos membros + chefe OU apenas chefe
        const aprovadoPorMaioria = percentualAprovacao >= 51 && chefeAprovouDiretamente;
        const aprovado = chefeAprovouDiretamente || aprovadoPorMaioria;

        return {
          demandaId,
          comiteId,
          totalMembros,
          votosRealizados: votos.length,
          votosAprovacao,
          votosRejeicao,
          percentualAprovacao,
          chefeAprovouDiretamente,
          aprovado,
        };
      },

      verificarAprovacao: (demandaId, comiteId) => {
        const resultado = get().calcularResultado(demandaId, comiteId);
        return resultado?.aprovado || false;
      },
    }),
    {
      name: "nexus-comite-store",
    }
  )
);
