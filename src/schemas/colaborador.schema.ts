import { z } from "zod";

export const senioridadeEnum = z.enum([
  "trainee",
  "estagiario",
  "junior",
  "pleno",
  "senior",
  "especialista",
  "lider",
]);

export const areaEspecialidadeEnum = z.enum([
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "dados",
  "ia_ml",
  "qa",
  "ux_ui",
  "seguranca",
  "cloud",
  "arquitetura",
]);

export const tecnologiaEnum = z.enum([
  // Frontend
  "react", "nextjs", "vue", "angular", "svelte", "tailwind",
  "typescript", "javascript", "html_css", "sass", "styled_components",
  "redux", "zustand",
  // Backend
  "nodejs", "python", "java", "csharp", "go", "php", "ruby", "rust", "elixir",
  "express", "nestjs", "fastapi", "django", "spring", "dotnet",
  // Mobile
  "react_native", "flutter", "swift", "kotlin", "ionic", "expo",
  // DevOps
  "docker", "kubernetes", "aws", "azure", "gcp", "terraform",
  "ansible", "jenkins", "github_actions", "gitlab_ci", "argocd",
  // Dados
  "sql", "postgresql", "mysql", "mongodb", "redis", "spark",
  "airflow", "dbt", "snowflake", "databricks", "kafka", "powerbi", "tableau",
  // IA/ML
  "tensorflow", "pytorch", "scikit_learn", "pandas", "numpy",
  "llms", "langchain", "huggingface", "opencv",
  // QA
  "selenium", "cypress", "jest", "playwright", "junit", "pytest", "postman",
  // UX/UI
  "figma", "adobe_xd", "sketch", "photoshop", "illustrator",
  // Segurança
  "owasp", "pentest", "siem", "vault",
  // Outros
  "git", "linux", "agile", "scrum",
]);

// Schema para uma especialidade do colaborador
export const especialidadeColaboradorSchema = z.object({
  area: areaEspecialidadeEnum,
  senioridade: senioridadeEnum,
  tecnologias: z
    .array(tecnologiaEnum)
    .min(1, "Selecione pelo menos uma tecnologia"),
  tecnologiasCustom: z
    .array(z.string().min(1).max(50))
    .optional(),
});

export const colaboradorSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),

  email: z.string().email("E-mail inválido"),

  matricula: z
    .string()
    .min(1, "A matrícula é obrigatória")
    .max(20, "A matrícula deve ter no máximo 20 caracteres"),

  empresaId: z.string().min(1, "Selecione uma empresa"),

  cargo: z
    .string()
    .min(2, "O cargo deve ter pelo menos 2 caracteres")
    .max(50, "O cargo deve ter no máximo 50 caracteres"),

  especialidades: z
    .array(especialidadeColaboradorSchema)
    .min(1, "Adicione pelo menos uma especialidade"),

  custoHora: z
    .number()
    .min(0, "O custo/hora não pode ser negativo")
    .max(10000, "O custo/hora parece muito alto"),

  cargaHorariaMensal: z
    .number()
    .min(20, "A carga horária mínima é 20h/mês")
    .max(220, "A carga horária máxima é 220h/mês"),

  ativo: z.boolean().default(true),

  dataAdmissao: z.coerce.date(),
});

export type EspecialidadeColaboradorSchemaType = z.infer<typeof especialidadeColaboradorSchema>;
export type ColaboradorSchemaType = z.infer<typeof colaboradorSchema>;
