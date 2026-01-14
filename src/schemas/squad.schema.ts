import { z } from "zod";

export const statusSquadEnum = z.enum([
  "formando",
  "ativo",
  "em_handover",
  "encerrado",
]);

export const squadSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),

  objetivo: z
    .string()
    .min(10, "O objetivo deve ter pelo menos 10 caracteres")
    .max(500, "O objetivo deve ter no máximo 500 caracteres"),

  projetoId: z.string().min(1, "Selecione um projeto"),
});

export type SquadSchemaType = z.infer<typeof squadSchema>;
