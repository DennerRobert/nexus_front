import { z } from "zod";

export const iconeMarcoEnum = z.enum([
  "inbox",
  "check_circle",
  "play_circle",
  "users",
  "flag",
  "package",
  "star",
  "alert_triangle",
  "message_circle",
  "calendar",
]);

export const marcoProjetoSchema = z.object({
  titulo: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(200, "O título deve ter no máximo 200 caracteres"),

  descricao: z
    .string()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres")
    .optional(),

  data: z.coerce.date(),

  responsavelId: z.string().uuid().optional(),

  icone: iconeMarcoEnum.default("flag"),
});

export type MarcoProjetoSchemaType = z.infer<typeof marcoProjetoSchema>;
