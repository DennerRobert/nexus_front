import { z } from "zod";

export const origemClienteEnum = z.enum([
  "externo",
  "interno",
  "investimento_interno",
]);

export const naturezaJuridicaEnum = z.enum([
  "empresa_privada",
  "orgao_municipal",
  "orgao_estadual",
  "orgao_federal",
  "terceiro_setor",
  "internacional",
]);

export const modeloReceitaEnum = z.enum([
  "recorrencia",
  "projeto_fechado",
  "rateio_custo",
  "sem_receita",
]);

export const clienteSchema = z
  .object({
    nome: z
      .string()
      .min(2, "O nome deve ter pelo menos 2 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres"),

    origem: origemClienteEnum,

    naturezaJuridica: naturezaJuridicaEnum.optional(),

    cnpj: z
      .string()
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido")
      .optional()
      .or(z.literal("")),

    email: z.string().email("E-mail inválido").optional().or(z.literal("")),

    telefone: z.string().max(20, "Telefone inválido").optional().or(z.literal("")),

    modeloReceita: modeloReceitaEnum.optional(),

    ativo: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.origem === "externo" && !data.naturezaJuridica) {
        return false;
      }
      return true;
    },
    {
      message: "Cliente externo deve ter natureza jurídica definida",
      path: ["naturezaJuridica"],
    }
  );

export type ClienteSchemaType = z.infer<typeof clienteSchema>;
