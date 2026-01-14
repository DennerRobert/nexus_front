import { z } from "zod";

export const empresaSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),

  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)"),

  descricao: z
    .string()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .optional(),

  ativa: z.boolean().default(true),
});

export type EmpresaSchemaType = z.infer<typeof empresaSchema>;
