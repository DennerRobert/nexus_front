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
  "dba",
  "ia_ml",
  "qa",
  "ux_ui",
  "seguranca",
  "cloud",
  "arquitetura",
  "game_dev",
]);

export const tecnologiaEnum = z.enum([
  // Frontend — Frameworks
  "react", "nextjs", "vue", "nuxtjs", "angular", "svelte", "sveltekit", "tailwind",
  // Frontend — Linguagens
  "typescript", "javascript", "html_css", "sass", "styled_components",
  // Frontend — Estado & Dados
  "redux", "zustand", "pinia", "tanstack_query",
  // Frontend — UI & Componentes
  "radix_ui", "shadcn_ui", "framer_motion",
  // Frontend — Utilitários
  "axios", "date_fns", "dayjs",
  // Backend — Linguagens
  "nodejs", "python", "java", "csharp", "go", "php", "ruby", "rust", "elixir",
  // Backend — Frameworks Web
  "express", "nestjs", "fastapi", "django", "flask", "spring", "dotnet",
  "aspnet_core", "laravel", "gin", "echo", "rails",
  // Backend — Auth
  "passport_js", "nextauth", "jsonwebtoken", "bcrypt",
  // Backend — Comunicação
  "socket_io", "grpc", "apollo",
  // Backend — Utilitários
  "winston", "lodash",
  // Mobile
  "react_native", "flutter", "swift", "swift_ui", "kotlin", "kmp", "ionic", "expo",
  // DevOps — Infraestrutura
  "docker", "kubernetes", "aws", "azure", "gcp", "terraform",
  "ansible", "jenkins", "github_actions", "gitlab_ci", "argocd",
  "prometheus", "grafana",
  // DevOps — Scripts & CLI
  "boto3", "commander_js", "click_py",
  // DevOps — Políticas
  "checkov", "inspec",
  // Dados — Relacionais
  "sql", "postgresql", "mysql", "sql_server", "oracle",
  // Dados — NoSQL
  "mongodb", "redis", "cassandra",
  // Dados — Analytics & Pipelines
  "spark", "airflow", "dbt", "snowflake", "databricks", "kafka", "powerbi", "tableau",
  // ORMs
  "hibernate", "prisma_orm", "entity_framework", "sqlalchemy",
  // DBA — Drivers & Conectores
  "pg_driver", "mysql2", "psycopg2", "mongoose",
  // DBA — Migrações
  "knex", "flyway", "alembic",
  // IA/ML — Frameworks
  "tensorflow", "pytorch", "scikit_learn", "langchain",
  // IA/ML — Matemática
  "pandas", "numpy", "matplotlib", "scipy",
  // IA/ML — Visão & PLN
  "opencv", "nltk", "spacy", "huggingface",
  // IA/ML — Serviços
  "llms",
  // QA — E2E
  "selenium", "cypress", "playwright", "appium",
  // QA — Unitários
  "jest", "junit", "pytest",
  // QA — Suporte
  "faker_js", "msw", "sinon", "chai", "postman",
  // UX/UI
  "figma", "adobe_xd", "sketch", "photoshop", "illustrator",
  // Segurança — Análise
  "owasp", "burpsuite", "sonarqube", "snyk", "pentest", "siem",
  // Segurança — Gestão & Cloud
  "vault", "prisma_cloud",
  // Segurança — Criptografia
  "pycryptodome", "libsodium",
  // Segurança — Scanner
  "scapy", "requests_py",
  // Game Dev
  "unity", "unreal_engine", "godot",
  // Outros
  "git", "linux", "agile", "scrum",
]);

export const especialidadeColaboradorSchema = z.object({
  area: areaEspecialidadeEnum,
  senioridade: senioridadeEnum,
  frameworkPrincipal: tecnologiaEnum,
  tecnologias: z.array(tecnologiaEnum),
  tecnologiasCustom: z.array(z.string().min(1).max(50)).optional(),
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

  empresaIds: z
    .array(z.string().min(1))
    .min(1, "Selecione pelo menos uma empresa"),

  setorIds: z.array(z.string()),

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
