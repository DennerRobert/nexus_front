import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Setor, SetorFormData } from "@/interfaces/setor.interface";

const now = new Date();

const mockSetores: Setor[] = [
  {
    id: uuidv4(),
    nome: "Tecnologia da Informação",
    descricao: "Desenvolvimento de software, infraestrutura e soluções tecnológicas",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Dados e Analytics",
    descricao: "Engenharia de dados, ciência de dados e inteligência de negócios",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Segurança da Informação",
    descricao: "Segurança cibernética, compliance e proteção de dados",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Produto",
    descricao: "Gestão de produtos digitais, roadmap e discovery",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Design",
    descricao: "UX, UI, design de experiência e pesquisa com usuários",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Infraestrutura e DevOps",
    descricao: "Cloud, containerização, CI/CD e automação de infraestrutura",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Qualidade de Software",
    descricao: "QA, testes automatizados e garantia de qualidade",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Financeiro",
    descricao: "Finanças, contabilidade e controladoria",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Recursos Humanos",
    descricao: "Gestão de pessoas, recrutamento e desenvolvimento organizacional",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Comercial",
    descricao: "Vendas, parcerias e desenvolvimento de negócios",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Marketing",
    descricao: "Marketing digital, conteúdo e estratégias de crescimento",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    nome: "Operações",
    descricao: "Processos operacionais, logística e eficiência organizacional",
    ativo: true,
    createdAt: now,
    updatedAt: now,
  },
];

interface SetorState {
  setores: Setor[];
  isLoading: boolean;
}

interface SetorActions {
  getAll: () => Setor[];
  getById: (id: string) => Setor | undefined;
  getAtivos: () => Setor[];
  create: (data: SetorFormData) => Setor;
  update: (id: string, data: Partial<SetorFormData>) => Setor | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type SetorStore = SetorState & SetorActions;

export const useSetorStore = create<SetorStore>((set, get) => ({
  setores: mockSetores,
  isLoading: false,

  getAll: () => get().setores,

  getById: (id: string) => get().setores.find((s) => s.id === id),

  getAtivos: () => get().setores.filter((s) => s.ativo),

  create: (data: SetorFormData) => {
    const newSetor: Setor = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ setores: [...state.setores, newSetor] }));
    return newSetor;
  },

  update: (id: string, data: Partial<SetorFormData>) => {
    let updated: Setor | undefined;
    set((state) => ({
      setores: state.setores.map((s) => {
        if (s.id === id) {
          updated = { ...s, ...data, updatedAt: new Date() };
          return updated;
        }
        return s;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().setores.some((s) => s.id === id);
    if (exists) {
      set((state) => ({
        setores: state.setores.map((s) =>
          s.id === id ? { ...s, ativo: false, updatedAt: new Date() } : s
        ),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
