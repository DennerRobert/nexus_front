export interface ComentarioTarefa {
  id: string;
  tarefaId: string;
  autorId: string;
  conteudo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComentarioTarefaFormData {
  conteudo: string;
}
