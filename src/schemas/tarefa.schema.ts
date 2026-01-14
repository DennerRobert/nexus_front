import { z } from "zod";

export const statusTarefaEnum = z.enum([
  "backlog",
  "a_fazer",
  "em_progresso",
  "em_revisao",
  "concluido",
]);

export const prioridadeTarefaEnum = z.enum([
  "baixa",
  "media",
  "alta",
  "urgente",
]);

export const tarefaSchema = z.object({
  titulo: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(200, "O título deve ter no máximo 200 caracteres"),

  descricao: z
    .string()
    .max(2000, "A descrição deve ter no máximo 2000 caracteres")
    .optional(),

  responsavelId: z.string().uuid().optional(),

  prioridade: prioridadeTarefaEnum.default("media"),

  estimativaHoras: z
    .number()
    .min(0, "A estimativa não pode ser negativa")
    .max(1000, "A estimativa parece muito alta")
    .optional(),

  dataLimite: z.coerce.date().optional(),

  tags: z.array(z.string().max(50)).optional(),
});

export type TarefaSchemaType = z.infer<typeof tarefaSchema>;
