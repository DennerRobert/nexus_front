import { z } from "zod";

export const statusDemandaEnum = z.enum([
  "rascunho",
  "em_analise",
  "aguardando_aprovacao",
  "aprovada",
  "em_ajustes",
  "rejeitada",
  "convertida",
]);

export const estagioIdeiaEnum = z.enum([
  "conceito",
  "validacao",
  "prototipo",
  "mvp",
  "escala",
]);

export const horizonteInovacaoEnum = z.enum([
  "h1_curto_prazo",
  "h2_medio_prazo",
  "h3_longo_prazo",
]);

export const existeSolucaoMercadoEnum = z.enum([
  "sim",
  "nao",
  "parcial",
]);

export const demandaSchema = z
  .object({
    nomeProponente: z
      .string()
      .min(3, "O nome deve ter pelo menos 3 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres"),

    empresaUnidadeApoioId: z.string().min(1, "Selecione a empresa/unidade de apoio"),

    titulo: z
      .string()
      .min(5, "O título deve ter pelo menos 5 caracteres")
      .max(200, "O título deve ter no máximo 200 caracteres"),

    estagioIdeia: estagioIdeiaEnum,

    problemaResolver: z
      .string()
      .min(10, "Descreva o problema com pelo menos 10 caracteres")
      .max(1000, "A descrição do problema deve ter no máximo 1000 caracteres"),

    existeSolucaoMercado: existeSolucaoMercadoEnum,

    descricaoSolucaoExistente: z
      .string()
      .max(1000, "A descrição deve ter no máximo 1000 caracteres")
      .optional(),

    quemSofreProblema: z
      .string()
      .min(5, "Descreva quem sofre com o problema (mínimo 5 caracteres)")
      .max(500, "A descrição deve ter no máximo 500 caracteres"),

    ideiaSolucao: z
      .string()
      .min(10, "Descreva a ideia de solução com pelo menos 10 caracteres")
      .max(1000, "A descrição deve ter no máximo 1000 caracteres"),

    principaisBeneficios: z
      .string()
      .min(10, "Descreva os benefícios com pelo menos 10 caracteres")
      .max(1000, "A descrição deve ter no máximo 1000 caracteres"),

    recursosNecessarios: z
      .string()
      .min(5, "Descreva os recursos necessários (mínimo 5 caracteres)")
      .max(1000, "A descrição deve ter no máximo 1000 caracteres"),

    horizonteInovacao: horizonteInovacaoEnum,

    // Campo de cliente agora é opcional
    clienteIds: z
      .array(z.string())
      .optional(),

    prazoDesejado: z.date().refine(
      (date) => date > new Date(),
      "O prazo deve ser uma data futura"
    ),

    // Novo campo: exibir na vitrine de ideias
    exibirVitrine: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.existeSolucaoMercado === "sim" && !data.descricaoSolucaoExistente?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Descreva a solução existente no mercado",
      path: ["descricaoSolucaoExistente"],
    }
  );

export type DemandaSchemaType = z.infer<typeof demandaSchema>;
