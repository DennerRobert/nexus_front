import { z } from "zod";

export const editarPerfilSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("E-mail inválido"),
});

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
    novaSenha: z
      .string()
      .min(6, "Nova senha deve ter pelo menos 6 caracteres")
      .max(50, "Senha muito longa"),
    confirmarSenha: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })
  .refine((data) => data.senhaAtual !== data.novaSenha, {
    message: "A nova senha deve ser diferente da atual",
    path: ["novaSenha"],
  });

export type EditarPerfilSchemaType = z.infer<typeof editarPerfilSchema>;
export type AlterarSenhaSchemaType = z.infer<typeof alterarSenhaSchema>;
