import { z } from "zod";

export const setorSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  descricao: z.string().max(300, "A descrição deve ter no máximo 300 caracteres").optional(),
  ativo: z.boolean().default(true),
});

export type SetorSchemaType = z.infer<typeof setorSchema>;
