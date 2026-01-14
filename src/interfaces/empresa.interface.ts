export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  descricao?: string;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmpresaFormData {
  nome: string;
  cnpj: string;
  descricao?: string;
  ativa: boolean;
}
