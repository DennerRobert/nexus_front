export type FormularioTipo = "inovacao" | "operacional" | "estrategico";

export const FORMULARIO_TIPO_LABELS: Record<FormularioTipo, string> = {
  inovacao: "Inovação",
  operacional: "Produtividade Digital",
  estrategico: "Iniciativa Estratégica",
};

export const FORMULARIO_TIPO_DESCRICAO: Record<FormularioTipo, string> = {
  inovacao: "Submissão de ideias, novos produtos, serviços e tecnologias",
  operacional: "Automação, digitalização e ganhos de produtividade em processos",
  estrategico: "Iniciativas alinhadas a OKRs e objetivos de longo prazo",
};

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  descricao?: string;
  ativa: boolean;
  formularioTipo?: FormularioTipo;
  setor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmpresaFormData {
  nome: string;
  cnpj: string;
  descricao?: string;
  ativa: boolean;
  formularioTipo?: FormularioTipo;
  setor?: string;
}
