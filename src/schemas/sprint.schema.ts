import { z } from "zod";

export const statusSprintSchema = z.enum(["planejamento", "ativa", "concluida", "cancelada"]);

export const sprintSchema = z.object({
  id: z.string().uuid(),
  projetoId: z.string().uuid(),
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  objetivo: z.string().max(500, "Objetivo muito longo").optional(),
  numero: z.number().int().positive(),
  dataInicio: z.date(),
  dataFim: z.date(),
  status: statusSprintSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine((data) => data.dataFim > data.dataInicio, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["dataFim"],
});

export const sprintFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  objetivo: z.string().max(500, "Objetivo muito longo").optional(),
  dataInicio: z.date(),
  dataFim: z.date(),
}).refine((data) => data.dataFim > data.dataInicio, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["dataFim"],
});

export type SprintSchema = z.infer<typeof sprintSchema>;
export type SprintFormSchema = z.infer<typeof sprintFormSchema>;
