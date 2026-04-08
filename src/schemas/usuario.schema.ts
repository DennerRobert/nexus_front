import { z } from "zod";

export const perfilUsuarioSchema = z.enum([
  "administrador",
  "financeiro",
  "rh",
  "gestor_inovacao",
  "analista_inovacao",
  "assistente_inovacao",
  "product_owner",
  "especialista",
  "cliente",
  "comercial",
]);

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  senha: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const usuarioSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6),
  avatarUrl: z.string().url().optional(),
  perfil: perfilUsuarioSchema,
  colaboradorId: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  empresaIds: z.array(z.string().uuid()),
  ativo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
export type UsuarioSchema = z.infer<typeof usuarioSchema>;
