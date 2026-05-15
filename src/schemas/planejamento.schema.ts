import { z } from "zod";

// =====================================================
// ENUMS
// =====================================================

export const statusPlanejamentoSchema = z.enum(["rascunho", "em_revisao", "aprovado"]);

export const prioridadeRequisitoSchema = z.enum(["essencial", "importante", "desejavel"]);

export const tipoRequisitoSchema = z.enum(["funcional", "nao_funcional"]);

export const categoriaRNFSchema = z.enum([
  "performance",
  "seguranca",
  "usabilidade",
  "disponibilidade",
  "escalabilidade",
  "manutencao",
]);

export const severidadeRiscoSchema = z.enum(["baixa", "media", "alta", "critica"]);

// =====================================================
// PLANO DE TRABALHO
// =====================================================

export const faseProjetoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1, "Nome da fase é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  ordem: z.number().int().positive(),
  dataInicio: z.date(),
  dataFim: z.date(),
  horasEstimadas: z.number().positive(),
  responsavelIds: z.array(z.string().uuid()),
  dependencias: z.array(z.string().uuid()),
  status: z.enum(["pendente", "em_andamento", "concluida"]),
});

export const marcoPlanoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string(),
  dataPrevista: z.date(),
  faseId: z.string().uuid(),
  entregaveis: z.array(z.string()),
});

export const marcoPlanoFormSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string(),
  dataPrevista: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date({ error: "Data prevista é obrigatória" })),
  faseId: z.string().min(1, "Fase é obrigatória"),
  entregaveis: z.array(z.string()),
});

// =====================================================
// REQUISITOS
// =====================================================

export const requisitoFuncionalSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  prioridade: prioridadeRequisitoSchema,
  criteriosAceitacao: z.array(z.string()),
  userStoryId: z.string().uuid().optional(),
});

export const requisitoNaoFuncionalSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: categoriaRNFSchema,
  metrica: z.string().optional(),
  prioridade: prioridadeRequisitoSchema,
});

export const userStorySchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  persona: z.string().min(1, "Persona é obrigatória"),
  acao: z.string().min(1, "Ação é obrigatória"),
  beneficio: z.string().min(1, "Benefício é obrigatório"),
  criteriosAceitacao: z.array(z.string()),
  prioridade: prioridadeRequisitoSchema,
  requisitosRelacionados: z.array(z.string().uuid()),
});

export const requisitoFormSchema = z.object({
  tipo: tipoRequisitoSchema,
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  prioridade: prioridadeRequisitoSchema,
  categoria: categoriaRNFSchema.optional(),
  metrica: z.string().optional(),
  criteriosAceitacao: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.tipo === "nao_funcional" && !data.categoria) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Categoria é obrigatória para requisitos não-funcionais",
      path: ["categoria"],
    });
  }
});

export const userStoryFormSchema = z.object({
  persona: z.string().min(1, "Persona é obrigatória"),
  acao: z.string().min(1, "Ação é obrigatória"),
  beneficio: z.string().min(1, "Benefício é obrigatório"),
  prioridade: prioridadeRequisitoSchema,
  criteriosAceitacao: z.array(z.string().min(1)).min(1, "Ao menos um critério de aceitação é obrigatório"),
});

// =====================================================
// ARQUITETURA
// =====================================================

export const riscoTecnicoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  severidade: severidadeRiscoSchema,
  probabilidade: z.enum(["baixa", "media", "alta"]),
  impacto: z.string(),
  mitigacao: z.string(),
});

// =====================================================
// ACTIONS
// =====================================================

export const atualizarStatusSchema = z.object({
  planejamentoId: z.string().uuid(),
  novoStatus: statusPlanejamentoSchema,
  observacao: z.string().optional(),
});

export const aprovarPlanejamentoSchema = z.object({
  planejamentoId: z.string().uuid(),
  aprovadorId: z.string().uuid(),
  observacao: z.string().optional(),
});

// =====================================================
// TYPES INFERIDOS
// =====================================================

export type MarcoPlanoFormInputs = z.infer<typeof marcoPlanoFormSchema>;
export type RequisitoFormInputs = z.infer<typeof requisitoFormSchema>;
export type UserStoryFormInputs = z.infer<typeof userStoryFormSchema>;
export type AtualizarStatusInputs = z.infer<typeof atualizarStatusSchema>;
export type AprovarPlanejamentoInputs = z.infer<typeof aprovarPlanejamentoSchema>;
