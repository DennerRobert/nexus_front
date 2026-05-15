import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  FormularioEmpresa,
  FormularioEmpresaFormData,
  CampoFormulario,
  CampoFormularioFormData,
} from "@/interfaces/formulario-empresa.interface";

interface FormularioEmpresaState {
  formularios: FormularioEmpresa[];
}

interface FormularioEmpresaActions {
  getByEmpresa: (empresaId: string) => FormularioEmpresa | undefined;
  create: (
    empresaId: string,
    data: FormularioEmpresaFormData
  ) => FormularioEmpresa;
  update: (
    id: string,
    data: Partial<FormularioEmpresaFormData>
  ) => FormularioEmpresa | undefined;
  remove: (id: string) => boolean;
  addCampo: (
    formularioId: string,
    data: CampoFormularioFormData
  ) => CampoFormulario | undefined;
  updateCampo: (
    formularioId: string,
    campoId: string,
    data: Partial<CampoFormularioFormData>
  ) => void;
  removeCampo: (formularioId: string, campoId: string) => void;
  reorderCampos: (formularioId: string, campos: CampoFormulario[]) => void;
}

type FormularioEmpresaStore = FormularioEmpresaState & FormularioEmpresaActions;

export const useFormularioEmpresaStore = create<FormularioEmpresaStore>()(
  persist(
    (set, get) => ({
      formularios: [],

      getByEmpresa: (empresaId) =>
        get().formularios.find((f) => f.empresaId === empresaId),

      create: (empresaId, data) => {
        const novo: FormularioEmpresa = {
          id: uuidv4(),
          empresaId,
          campos: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        set((state) => ({ formularios: [...state.formularios, novo] }));
        return novo;
      },

      update: (id, data) => {
        let atualizado: FormularioEmpresa | undefined;
        set((state) => ({
          formularios: state.formularios.map((f) => {
            if (f.id === id) {
              atualizado = { ...f, ...data, updatedAt: new Date() };
              return atualizado;
            }
            return f;
          }),
        }));
        return atualizado;
      },

      remove: (id) => {
        const existe = get().formularios.some((f) => f.id === id);
        if (existe) {
          set((state) => ({
            formularios: state.formularios.filter((f) => f.id !== id),
          }));
        }
        return existe;
      },

      addCampo: (formularioId, data) => {
        const formulario = get().formularios.find((f) => f.id === formularioId);
        if (!formulario) return undefined;

        const novoCampo: CampoFormulario = {
          id: uuidv4(),
          ordem: formulario.campos.length,
          ...data,
        };

        set((state) => ({
          formularios: state.formularios.map((f) =>
            f.id === formularioId
              ? {
                  ...f,
                  campos: [...f.campos, novoCampo],
                  updatedAt: new Date(),
                }
              : f
          ),
        }));

        return novoCampo;
      },

      updateCampo: (formularioId, campoId, data) => {
        set((state) => ({
          formularios: state.formularios.map((f) =>
            f.id === formularioId
              ? {
                  ...f,
                  campos: f.campos.map((c) =>
                    c.id === campoId ? { ...c, ...data } : c
                  ),
                  updatedAt: new Date(),
                }
              : f
          ),
        }));
      },

      removeCampo: (formularioId, campoId) => {
        set((state) => ({
          formularios: state.formularios.map((f) =>
            f.id === formularioId
              ? {
                  ...f,
                  campos: f.campos
                    .filter((c) => c.id !== campoId)
                    .map((c, i) => ({ ...c, ordem: i })),
                  updatedAt: new Date(),
                }
              : f
          ),
        }));
      },

      reorderCampos: (formularioId, campos) => {
        set((state) => ({
          formularios: state.formularios.map((f) =>
            f.id === formularioId
              ? { ...f, campos, updatedAt: new Date() }
              : f
          ),
        }));
      },
    }),
    { name: "sgpi-formularios-empresa" }
  )
);
