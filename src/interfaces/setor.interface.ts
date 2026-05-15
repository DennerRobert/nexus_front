export interface Setor {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetorFormData {
  nome: string;
  descricao?: string;
  ativo: boolean;
}
