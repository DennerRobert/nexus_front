import { z } from "zod";

export const statusProjetoEnum = z.enum([
  "aguardando_aprovacao",
  "aprovado",
  "em_execucao",
  "pausado",
  "concluido",
  "cancelado",
]);

export const projetoSchema = z
  .object({
    nome: z
      .string()
      .min(3, "O nome deve ter pelo menos 3 caracteres")
      .max(200, "O nome deve ter no máximo 200 caracteres"),

    descricao: z
      .string()
      .min(10, "A descrição deve ter pelo menos 10 caracteres")
      .max(2000, "A descrição deve ter no máximo 2000 caracteres"),

    empresaDonaId: z.string().min(1, "Selecione a empresa dona"),

    clienteIds: z
      .array(z.string())
      .min(1, "Selecione pelo menos um cliente"),

    dataInicio: z.coerce.date().optional(),

    dataFimPrevista: z.coerce.date().optional(),

    orcamento: z
      .number()
      .min(0, "O orçamento não pode ser negativo")
      .max(100000000, "O orçamento parece muito alto"),
  })
  .refine(
    (data) => {
      if (data.dataInicio && data.dataFimPrevista) {
        return data.dataFimPrevista > data.dataInicio;
      }
      return true;
    },
    {
      message: "A data de fim deve ser posterior à data de início",
      path: ["dataFimPrevista"],
    }
  );

export type ProjetoSchemaType = z.infer<typeof projetoSchema>;
