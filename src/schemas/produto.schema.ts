import { z } from "zod";

export const statusProdutoEnum = z.enum([
  "em_transicao",
  "em_operacao",
  "descontinuado",
]);

export const classificacaoProdutoEnum = z.enum([
  "mercado_externo",
  "intercompany",
  "interno",
]);

export const produtoSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(200, "O nome deve ter no máximo 200 caracteres"),

  descricao: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(2000, "A descrição deve ter no máximo 2000 caracteres"),

  classificacao: classificacaoProdutoEnum,

  responsavelOperacaoId: z.string().optional(),
});

export type ProdutoSchemaType = z.infer<typeof produtoSchema>;
