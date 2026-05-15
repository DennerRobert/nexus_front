import { z } from "zod";

export const empresaSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),

  cnpj: z
    .string()
    .regex(
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)"
    ),

  email: z.string().email("E-mail inválido").optional().or(z.literal("")),

  telefone: z.string().max(20, "Telefone inválido").optional().or(z.literal("")),

  descricao: z
    .string()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .optional(),

  ativa: z.boolean(),

  formularioTipo: z
    .enum(["inovacao", "operacional", "estrategico"])
    .optional(),

  setor: z
    .string()
    .max(100, "O setor deve ter no máximo 100 caracteres")
    .optional(),

  dadosAdicionais: z.record(z.string(), z.string()).optional(),
});

export type EmpresaSchemaType = z.infer<typeof empresaSchema>;
