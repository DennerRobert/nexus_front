import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { AnexoDemanda } from "@/interfaces/anexo-demanda.interface";
import {
  TIPOS_ARQUIVO_PERMITIDOS,
  TAMANHO_MAXIMO_ARQUIVO,
  MAX_ARQUIVOS_POR_DEMANDA,
} from "@/interfaces/anexo-demanda.interface";

interface AnexoDemandaState {
  anexos: AnexoDemanda[];
}

interface AnexoDemandaActions {
  // CRUD
  getAll: () => AnexoDemanda[];
  getById: (id: string) => AnexoDemanda | undefined;
  getByDemanda: (demandaId: string) => AnexoDemanda[];
  
  // Upload mockado
  adicionar: (
    demandaId: string,
    arquivo: File,
    uploadPorId: string
  ) => Promise<{ sucesso: boolean; anexo?: AnexoDemanda; erro?: string }>;
  
  // Adicionar múltiplos
  adicionarMultiplos: (
    demandaId: string,
    arquivos: File[],
    uploadPorId: string
  ) => Promise<{ sucesso: boolean; anexos: AnexoDemanda[]; erros: string[] }>;
  
  // Remover
  remover: (id: string) => void;
  removerPorDemanda: (demandaId: string) => void;
  
  // Validações
  validarArquivo: (arquivo: File) => { valido: boolean; erro?: string };
  podeAdicionarMais: (demandaId: string) => boolean;
}

export const useAnexoDemandaStore = create<AnexoDemandaState & AnexoDemandaActions>()(
  persist(
    (set, get) => ({
      anexos: [],

      // CRUD
      getAll: () => get().anexos,

      getById: (id) => get().anexos.find((a) => a.id === id),

      getByDemanda: (demandaId) =>
        get().anexos.filter((a) => a.demandaId === demandaId),

      // Upload mockado
      adicionar: async (demandaId, arquivo, uploadPorId) => {
        // Validar arquivo
        const validacao = get().validarArquivo(arquivo);
        if (!validacao.valido) {
          return { sucesso: false, erro: validacao.erro };
        }

        // Verificar limite de arquivos
        if (!get().podeAdicionarMais(demandaId)) {
          return {
            sucesso: false,
            erro: `Limite de ${MAX_ARQUIVOS_POR_DEMANDA} arquivos por demanda atingido.`,
          };
        }

        // Simular delay de upload
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Criar anexo (mockado - não armazena o arquivo real)
        const novoAnexo: AnexoDemanda = {
          id: uuidv4(),
          demandaId,
          nome: `${uuidv4()}_${arquivo.name}`,
          nomeOriginal: arquivo.name,
          tipo: arquivo.type,
          tamanho: arquivo.size,
          uploadPorId,
          createdAt: new Date(),
        };

        set((state) => ({ anexos: [...state.anexos, novoAnexo] }));

        return { sucesso: true, anexo: novoAnexo };
      },

      // Adicionar múltiplos
      adicionarMultiplos: async (demandaId, arquivos, uploadPorId) => {
        const anexosAdicionados: AnexoDemanda[] = [];
        const erros: string[] = [];

        for (const arquivo of arquivos) {
          const resultado = await get().adicionar(demandaId, arquivo, uploadPorId);
          if (resultado.sucesso && resultado.anexo) {
            anexosAdicionados.push(resultado.anexo);
          } else if (resultado.erro) {
            erros.push(`${arquivo.name}: ${resultado.erro}`);
          }
        }

        return {
          sucesso: erros.length === 0,
          anexos: anexosAdicionados,
          erros,
        };
      },

      // Remover
      remover: (id) => {
        set((state) => ({
          anexos: state.anexos.filter((a) => a.id !== id),
        }));
      },

      removerPorDemanda: (demandaId) => {
        set((state) => ({
          anexos: state.anexos.filter((a) => a.demandaId !== demandaId),
        }));
      },

      // Validações
      validarArquivo: (arquivo) => {
        // Verificar tipo
        if (!TIPOS_ARQUIVO_PERMITIDOS.includes(arquivo.type)) {
          return {
            valido: false,
            erro: `Tipo de arquivo não permitido: ${arquivo.type}`,
          };
        }

        // Verificar tamanho
        if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
          return {
            valido: false,
            erro: `Arquivo muito grande. Máximo: ${TAMANHO_MAXIMO_ARQUIVO / 1024 / 1024}MB`,
          };
        }

        return { valido: true };
      },

      podeAdicionarMais: (demandaId) => {
        const anexosExistentes = get().getByDemanda(demandaId);
        return anexosExistentes.length < MAX_ARQUIVOS_POR_DEMANDA;
      },
    }),
    {
      name: "nexus-anexo-demanda-store",
    }
  )
);
