export type TipoCampoFormulario =
  | "texto"
  | "textarea"
  | "numero"
  | "data"
  | "selecao"
  | "multipla_escolha";

export const TIPO_CAMPO_LABELS: Record<TipoCampoFormulario, string> = {
  texto: "Texto Curto",
  textarea: "Texto Longo",
  numero: "Número",
  data: "Data",
  selecao: "Seleção Única",
  multipla_escolha: "Múltipla Escolha",
};

export interface CampoFormulario {
  id: string;
  label: string;
  tipo: TipoCampoFormulario;
  obrigatorio: boolean;
  placeholder?: string;
  descricao?: string;
  opcoes?: string[];
  ordem: number;
}

export interface FormularioEmpresa {
  id: string;
  empresaId: string;
  titulo: string;
  descricao?: string;
  campos: CampoFormulario[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormularioEmpresaFormData {
  titulo: string;
  descricao?: string;
  ativo: boolean;
}

export interface CampoFormularioFormData {
  label: string;
  tipo: TipoCampoFormulario;
  obrigatorio: boolean;
  placeholder?: string;
  descricao?: string;
  opcoes?: string[];
}
