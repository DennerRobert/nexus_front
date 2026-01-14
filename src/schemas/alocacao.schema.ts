import { z } from "zod";

export const papelAlocacaoEnum = z.enum([
  "tech_lead",
  "desenvolvedor",
  "desenvolvedor_senior",
  "desenvolvedor_pleno",
  "desenvolvedor_junior",
  "product_owner",
  "scrum_master",
  "ux_designer",
  "qa",
  "devops",
  "arquiteto",
  "analista",
]);

export const statusAlocacaoEnum = z.enum([
  "pendente",
  "aprovada",
  "ativa",
  "encerrada",
  "rejeitada",
]);

export const alocacaoSchema = z
  .object({
    colaboradorId: z.string().min(1, "Selecione um colaborador"),

    squadId: z.string().min(1, "Selecione um squad"),

    papel: papelAlocacaoEnum,

    percentual: z
      .number()
      .min(10, "O percentual mínimo é 10%")
      .max(100, "O percentual máximo é 100%"),

    dataInicio: z.coerce.date(),

    dataFim: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.dataFim) {
        return data.dataFim > data.dataInicio;
      }
      return true;
    },
    {
      message: "A data de fim deve ser posterior à data de início",
      path: ["dataFim"],
    }
  );

export type AlocacaoSchemaType = z.infer<typeof alocacaoSchema>;
