// Interface do Comitê de Avaliação
export interface Comite {
  id: string;
  nome: string;
  descricao?: string;
  tenantId: string;
  chefeId: string; // ID do usuário chefe do comitê
  membrosIds: string[]; // IDs dos usuários membros (não inclui o chefe)
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Voto de um membro do comitê
export interface VotoComite {
  id: string;
  demandaId: string;
  comiteId: string;
  membroId: string;
  aprovado: boolean;
  comentario?: string;
  data: Date;
}

// Resultado da votação do comitê
export interface ResultadoVotacao {
  demandaId: string;
  comiteId: string;
  totalMembros: number;
  votosRealizados: number;
  votosAprovacao: number;
  votosRejeicao: number;
  percentualAprovacao: number;
  chefeAprovouDiretamente: boolean;
  aprovado: boolean;
}
