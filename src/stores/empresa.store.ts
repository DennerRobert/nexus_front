import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Empresa, EmpresaFormData } from "@/interfaces/empresa.interface";
import { mockEmpresas } from "@/utils/mock-data";

interface EmpresaState {
  empresas: Empresa[];
  isLoading: boolean;
}

interface EmpresaActions {
  getAll: () => Empresa[];
  getById: (id: string) => Empresa | undefined;
  create: (data: EmpresaFormData) => Empresa;
  update: (id: string, data: Partial<EmpresaFormData>) => Empresa | undefined;
  remove: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
}

type EmpresaStore = EmpresaState & EmpresaActions;

export const useEmpresaStore = create<EmpresaStore>((set, get) => ({
  empresas: mockEmpresas,
  isLoading: false,

  getAll: () => get().empresas,

  getById: (id: string) => get().empresas.find((e) => e.id === id),

  create: (data: EmpresaFormData) => {
    const newEmpresa: Empresa = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      empresas: [...state.empresas, newEmpresa],
    }));
    return newEmpresa;
  },

  update: (id: string, data: Partial<EmpresaFormData>) => {
    let updated: Empresa | undefined;
    set((state) => ({
      empresas: state.empresas.map((e) => {
        if (e.id === id) {
          updated = { ...e, ...data, updatedAt: new Date() };
          return updated;
        }
        return e;
      }),
    }));
    return updated;
  },

  remove: (id: string) => {
    const exists = get().empresas.some((e) => e.id === id);
    if (exists) {
      set((state) => ({
        empresas: state.empresas.filter((e) => e.id !== id),
      }));
    }
    return exists;
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
