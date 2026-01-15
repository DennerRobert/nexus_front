import { z } from "zod";

export const comentarioTarefaSchema = z.object({
  id: z.string().uuid(),
  tarefaId: z.string().uuid(),
  autorId: z.string().uuid(),
  conteudo: z.string().min(1, "Comentário é obrigatório").max(2000, "Comentário muito longo"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const comentarioTarefaFormSchema = z.object({
  conteudo: z.string().min(1, "Comentário é obrigatório").max(2000, "Comentário muito longo"),
});

export type ComentarioTarefaSchema = z.infer<typeof comentarioTarefaSchema>;
export type ComentarioTarefaFormSchema = z.infer<typeof comentarioTarefaFormSchema>;
