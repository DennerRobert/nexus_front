import { z } from "zod";

export const statusRegistroHorasSchema = z.enum(["pendente", "aprovado", "rejeitado"]);

export const registroHorasSchema = z.object({
  id: z.string().uuid(),
  tarefaId: z.string().uuid(),
  colaboradorId: z.string().uuid(),
  horas: z.number().min(0.25, "Mínimo de 15 minutos").max(24, "Máximo de 24 horas por registro"),
  data: z.date(),
  descricao: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição muito longa"),
  status: statusRegistroHorasSchema,
  aprovadorId: z.string().uuid().optional(),
  dataAprovacao: z.date().optional(),
  motivoRejeicao: z.string().max(500).optional(),
  createdAt: z.date(),
});

export const registroHorasFormSchema = z.object({
  horas: z.number().min(0.25, "Mínimo de 15 minutos").max(24, "Máximo de 24 horas por registro"),
  data: z.date(),
  descricao: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição muito longa"),
});

export type RegistroHorasSchema = z.infer<typeof registroHorasSchema>;
export type RegistroHorasFormSchema = z.infer<typeof registroHorasFormSchema>;
