// Tipos de Senioridade
export type Senioridade = "trainee" | "estagiario" | "junior" | "pleno" | "senior" | "especialista" | "lider";

// Tipos de Área de Especialidade
export type AreaEspecialidade =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "devops"
  | "dados"
  | "dba"
  | "ia_ml"
  | "qa"
  | "ux_ui"
  | "seguranca"
  | "cloud"
  | "arquitetura"
  | "game_dev";

// Todas as tecnologias disponíveis
export type Tecnologia =
  // Frontend — Frameworks
  | "react"
  | "nextjs"
  | "vue"
  | "nuxtjs"
  | "angular"
  | "svelte"
  | "sveltekit"
  | "tailwind"
  // Frontend — Linguagens & Markup
  | "typescript"
  | "javascript"
  | "html_css"
  | "sass"
  | "styled_components"
  // Frontend — Estado & Dados
  | "redux"
  | "zustand"
  | "pinia"
  | "tanstack_query"
  // Frontend — UI & Componentes
  | "radix_ui"
  | "shadcn_ui"
  | "framer_motion"
  // Frontend — Utilitários
  | "axios"
  | "date_fns"
  | "dayjs"
  // Backend — Linguagens
  | "nodejs"
  | "python"
  | "java"
  | "csharp"
  | "go"
  | "php"
  | "ruby"
  | "rust"
  | "elixir"
  // Backend — Frameworks Web
  | "express"
  | "nestjs"
  | "fastapi"
  | "django"
  | "flask"
  | "spring"
  | "dotnet"
  | "aspnet_core"
  | "laravel"
  | "gin"
  | "echo"
  | "rails"
  // Backend — Auth & Segurança
  | "passport_js"
  | "nextauth"
  | "jsonwebtoken"
  | "bcrypt"
  // Backend — Comunicação
  | "socket_io"
  | "grpc"
  | "apollo"
  // Backend — Utilitários
  | "winston"
  | "lodash"
  // Mobile
  | "react_native"
  | "flutter"
  | "swift"
  | "swift_ui"
  | "kotlin"
  | "kmp"
  | "ionic"
  | "expo"
  // DevOps & Cloud — Infraestrutura
  | "docker"
  | "kubernetes"
  | "aws"
  | "azure"
  | "gcp"
  | "terraform"
  | "ansible"
  | "jenkins"
  | "github_actions"
  | "gitlab_ci"
  | "argocd"
  | "prometheus"
  | "grafana"
  // DevOps — Scripts & CLI
  | "boto3"
  | "commander_js"
  | "click_py"
  // DevOps — Políticas & Compliance
  | "checkov"
  | "inspec"
  // Dados & DBA — Bancos Relacionais
  | "sql"
  | "postgresql"
  | "mysql"
  | "sql_server"
  | "oracle"
  // Dados & DBA — NoSQL
  | "mongodb"
  | "redis"
  | "cassandra"
  // Dados — Analytics & Pipelines
  | "spark"
  | "airflow"
  | "dbt"
  | "snowflake"
  | "databricks"
  | "kafka"
  | "powerbi"
  | "tableau"
  // ORMs / Frameworks de Acesso a Dados
  | "hibernate"
  | "prisma_orm"
  | "entity_framework"
  | "sqlalchemy"
  // DBA — Drivers & Conectores
  | "pg_driver"
  | "mysql2"
  | "psycopg2"
  | "mongoose"
  // DBA — Migrações
  | "knex"
  | "flyway"
  | "alembic"
  // IA/ML — Frameworks Core
  | "tensorflow"
  | "pytorch"
  | "scikit_learn"
  | "langchain"
  // IA/ML — Matemática & Processamento
  | "pandas"
  | "numpy"
  | "matplotlib"
  | "scipy"
  // IA/ML — Visão Computacional
  | "opencv"
  // IA/ML — PLN (Processamento de Linguagem Natural)
  | "nltk"
  | "spacy"
  | "huggingface"
  // IA/ML — Serviços & Modelos
  | "llms"
  // QA — Frameworks de Teste E2E
  | "selenium"
  | "cypress"
  | "playwright"
  | "appium"
  // QA — Testes Unitários
  | "jest"
  | "junit"
  | "pytest"
  // QA — Suporte a Testes
  | "faker_js"
  | "msw"
  | "sinon"
  | "chai"
  | "postman"
  // UX/UI
  | "figma"
  | "adobe_xd"
  | "sketch"
  | "photoshop"
  | "illustrator"
  // Segurança — Análise & Testes
  | "owasp"
  | "burpsuite"
  | "sonarqube"
  | "snyk"
  | "pentest"
  | "siem"
  // Segurança — Gestão de Segredos
  | "vault"
  | "prisma_cloud"
  // Segurança — Criptografia
  | "pycryptodome"
  | "libsodium"
  // Segurança — Scanner & Exploração
  | "scapy"
  | "requests_py"
  // Game Dev
  | "unity"
  | "unreal_engine"
  | "godot"
  // Outros
  | "git"
  | "linux"
  | "agile"
  | "scrum";

// Interface para uma especialidade do colaborador
export interface EspecialidadeColaborador {
  area: AreaEspecialidade;
  senioridade: Senioridade;
  frameworkPrincipal: Tecnologia;
  tecnologias: Tecnologia[];
  tecnologiasCustom?: string[];
}

// Interface principal do Colaborador
export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  empresaIds: string[];
  setorIds: string[];
  cargo: string;
  especialidades: EspecialidadeColaborador[];
  custoHora: number;
  cargaHorariaMensal: number;
  ativo: boolean;
  dataAdmissao: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColaboradorFormData {
  nome: string;
  email: string;
  matricula: string;
  empresaIds: string[];
  setorIds: string[];
  cargo: string;
  especialidades: EspecialidadeColaborador[];
  custoHora: number;
  cargaHorariaMensal: number;
  ativo: boolean;
  dataAdmissao: Date;
}

export interface ColaboradorComOcupacao extends Colaborador {
  ocupacaoAtual: number;
  disponibilidade: number;
  alocacoes: number;
}

// Labels para Senioridade
export const SENIORIDADE_LABELS: Record<Senioridade, string> = {
  trainee: "Trainee",
  estagiario: "Estagiário",
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  especialista: "Especialista",
  lider: "Líder",
};

// Abreviações de Senioridade para exibição compacta
export const SENIORIDADE_ABREV: Record<Senioridade, string> = {
  trainee: "Tr",
  estagiario: "Est",
  junior: "Jr",
  pleno: "Pl",
  senior: "Sr",
  especialista: "Esp",
  lider: "Lid",
};

// Labels para Área de Especialidade
export const AREA_ESPECIALIDADE_LABELS: Record<AreaEspecialidade, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  mobile: "Mobile",
  devops: "DevOps",
  dados: "Dados",
  dba: "DBA",
  ia_ml: "IA/ML",
  qa: "QA",
  ux_ui: "UX/UI",
  seguranca: "Segurança",
  cloud: "Cloud",
  arquitetura: "Arquitetura",
  game_dev: "Game Dev",
};

// Labels para Tecnologias
export const TECNOLOGIA_LABELS: Record<Tecnologia, string> = {
  // Frontend — Frameworks
  react: "React",
  nextjs: "Next.js",
  vue: "Vue.js",
  nuxtjs: "Nuxt.js",
  angular: "Angular",
  svelte: "Svelte",
  sveltekit: "SvelteKit",
  tailwind: "Tailwind CSS",
  // Frontend — Linguagens & Markup
  typescript: "TypeScript",
  javascript: "JavaScript",
  html_css: "HTML/CSS",
  sass: "Sass/SCSS",
  styled_components: "Styled Components",
  // Frontend — Estado & Dados
  redux: "Redux",
  zustand: "Zustand",
  pinia: "Pinia",
  tanstack_query: "TanStack Query",
  // Frontend — UI & Componentes
  radix_ui: "Radix UI",
  shadcn_ui: "shadcn/ui",
  framer_motion: "Framer Motion",
  // Frontend — Utilitários
  axios: "Axios",
  date_fns: "date-fns",
  dayjs: "Day.js",
  // Backend — Linguagens
  nodejs: "Node.js",
  python: "Python",
  java: "Java",
  csharp: "C#",
  go: "Go",
  php: "PHP",
  ruby: "Ruby",
  rust: "Rust",
  elixir: "Elixir",
  // Backend — Frameworks Web
  express: "Express.js",
  nestjs: "NestJS",
  fastapi: "FastAPI",
  django: "Django",
  flask: "Flask",
  spring: "Spring Boot",
  dotnet: ".NET",
  aspnet_core: "ASP.NET Core",
  laravel: "Laravel",
  gin: "Gin",
  echo: "Echo",
  rails: "Ruby on Rails",
  // Backend — Auth & Segurança
  passport_js: "Passport.js",
  nextauth: "NextAuth.js",
  jsonwebtoken: "JWT (jsonwebtoken)",
  bcrypt: "BCrypt",
  // Backend — Comunicação
  socket_io: "Socket.io",
  grpc: "gRPC",
  apollo: "Apollo GraphQL",
  // Backend — Utilitários
  winston: "Winston",
  lodash: "Lodash",
  // Mobile
  react_native: "React Native",
  flutter: "Flutter",
  swift: "Swift",
  swift_ui: "SwiftUI",
  kotlin: "Kotlin",
  kmp: "Kotlin Multiplatform",
  ionic: "Ionic",
  expo: "Expo",
  // DevOps — Infraestrutura
  docker: "Docker",
  kubernetes: "Kubernetes",
  aws: "AWS",
  azure: "Azure",
  gcp: "Google Cloud",
  terraform: "Terraform",
  ansible: "Ansible",
  jenkins: "Jenkins",
  github_actions: "GitHub Actions",
  gitlab_ci: "GitLab CI",
  argocd: "ArgoCD",
  prometheus: "Prometheus",
  grafana: "Grafana",
  // DevOps — Scripts & CLI
  boto3: "Boto3 (AWS SDK Python)",
  commander_js: "Commander.js",
  click_py: "Click (Python)",
  // DevOps — Políticas & Compliance
  checkov: "Checkov",
  inspec: "InSpec",
  // Dados — Bancos Relacionais
  sql: "SQL",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sql_server: "SQL Server",
  oracle: "Oracle DB",
  // Dados — NoSQL
  mongodb: "MongoDB",
  redis: "Redis",
  cassandra: "Cassandra",
  // Dados — Analytics & Pipelines
  spark: "Apache Spark",
  airflow: "Apache Airflow",
  dbt: "dbt",
  snowflake: "Snowflake",
  databricks: "Databricks",
  kafka: "Apache Kafka",
  powerbi: "Power BI",
  tableau: "Tableau",
  // ORMs
  hibernate: "Hibernate",
  prisma_orm: "Prisma ORM",
  entity_framework: "Entity Framework",
  sqlalchemy: "SQLAlchemy",
  // DBA — Drivers & Conectores
  pg_driver: "pg (PostgreSQL Node)",
  mysql2: "mysql2",
  psycopg2: "psycopg2 (Python)",
  mongoose: "Mongoose",
  // DBA — Migrações
  knex: "Knex.js",
  flyway: "Flyway",
  alembic: "Alembic (Python)",
  // IA/ML — Frameworks Core
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  scikit_learn: "Scikit-learn",
  langchain: "LangChain",
  // IA/ML — Matemática & Processamento
  pandas: "Pandas",
  numpy: "NumPy",
  matplotlib: "Matplotlib",
  scipy: "SciPy",
  // IA/ML — Visão Computacional
  opencv: "OpenCV",
  // IA/ML — PLN
  nltk: "NLTK",
  spacy: "spaCy",
  huggingface: "Hugging Face Transformers",
  // IA/ML — Serviços & Modelos
  llms: "LLMs",
  // QA — E2E
  selenium: "Selenium",
  cypress: "Cypress",
  playwright: "Playwright",
  appium: "Appium",
  // QA — Unitários
  jest: "Jest",
  junit: "JUnit",
  pytest: "PyTest",
  // QA — Suporte
  faker_js: "Faker.js",
  msw: "MSW (Mock Service Worker)",
  sinon: "Sinon.js",
  chai: "Chai",
  postman: "Postman",
  // UX/UI
  figma: "Figma",
  adobe_xd: "Adobe XD",
  sketch: "Sketch",
  photoshop: "Photoshop",
  illustrator: "Illustrator",
  // Segurança — Análise & Testes
  owasp: "OWASP ZAP",
  burpsuite: "Burp Suite",
  sonarqube: "SonarQube",
  snyk: "Snyk",
  pentest: "Pentest",
  siem: "SIEM",
  // Segurança — Gestão de Segredos & Cloud
  vault: "HashiCorp Vault",
  prisma_cloud: "Prisma Cloud",
  // Segurança — Criptografia
  pycryptodome: "PyCryptodome",
  libsodium: "Libsodium",
  // Segurança — Scanner & Exploração
  scapy: "Scapy",
  requests_py: "Requests (Python)",
  // Game Dev
  unity: "Unity",
  unreal_engine: "Unreal Engine",
  godot: "Godot",
  // Outros
  git: "Git",
  linux: "Linux",
  agile: "Agile",
  scrum: "Scrum",
};

// Frameworks principais por área (usado para seleção do "Framework Principal")
export const FRAMEWORKS_POR_AREA: Record<AreaEspecialidade, Tecnologia[]> = {
  frontend: ["react", "nextjs", "vue", "nuxtjs", "angular", "svelte", "sveltekit", "tailwind", "tanstack_query"],
  backend: ["express", "nestjs", "fastapi", "django", "flask", "spring", "dotnet", "aspnet_core", "laravel", "gin", "echo", "rails", "socket_io", "apollo", "grpc"],
  fullstack: ["react", "nextjs", "vue", "nuxtjs", "angular", "express", "nestjs", "fastapi", "django", "flask", "apollo"],
  mobile: ["react_native", "flutter", "swift_ui", "kmp", "expo", "ionic"],
  devops: ["docker", "kubernetes", "terraform", "ansible", "jenkins", "github_actions", "gitlab_ci", "argocd", "prometheus", "grafana"],
  dados: ["spark", "airflow", "dbt", "snowflake", "databricks", "kafka", "powerbi", "tableau"],
  dba: ["postgresql", "mysql", "sql_server", "oracle", "mongodb", "redis", "cassandra", "hibernate", "prisma_orm", "entity_framework", "sqlalchemy"],
  ia_ml: ["pytorch", "tensorflow", "scikit_learn", "langchain", "huggingface", "opencv"],
  qa: ["cypress", "playwright", "selenium", "jest", "junit", "pytest", "appium"],
  ux_ui: ["figma", "adobe_xd", "sketch"],
  seguranca: ["owasp", "burpsuite", "sonarqube", "snyk", "vault", "prisma_cloud", "checkov"],
  cloud: ["aws", "azure", "gcp", "terraform", "kubernetes"],
  arquitetura: ["aws", "azure", "gcp", "kubernetes", "kafka", "apollo", "grpc"],
  game_dev: ["unity", "unreal_engine", "godot"],
};

// Todas as tecnologias disponíveis por área (linguagens + frameworks + libs + ferramentas)
export const TECNOLOGIAS_POR_AREA: Record<AreaEspecialidade, Tecnologia[]> = {
  frontend: [
    // Frameworks
    "react", "nextjs", "vue", "nuxtjs", "angular", "svelte", "sveltekit", "tailwind",
    // Linguagens
    "typescript", "javascript", "html_css", "sass", "styled_components",
    // Estado & Dados
    "redux", "zustand", "pinia", "tanstack_query",
    // UI & Componentes
    "radix_ui", "shadcn_ui", "framer_motion",
    // Utilitários
    "axios", "date_fns", "dayjs",
  ],
  backend: [
    // Linguagens
    "nodejs", "python", "java", "csharp", "go", "php", "ruby", "rust", "elixir",
    // Frameworks Web
    "express", "nestjs", "fastapi", "django", "flask", "spring", "dotnet",
    "aspnet_core", "laravel", "gin", "echo", "rails",
    // Auth & Segurança
    "passport_js", "nextauth", "jsonwebtoken", "bcrypt",
    // Comunicação
    "socket_io", "grpc", "apollo",
    // Utilitários
    "winston", "lodash", "axios",
  ],
  fullstack: [
    "react", "nextjs", "vue", "nuxtjs", "angular",
    "nodejs", "python", "typescript", "javascript",
    "express", "nestjs", "fastapi", "django", "flask",
    "tanstack_query", "apollo", "socket_io",
    "postgresql", "mongodb", "redis", "docker",
    "axios", "jsonwebtoken",
  ],
  mobile: [
    "react_native", "flutter", "swift", "swift_ui", "kotlin", "kmp", "ionic", "expo",
    "typescript", "javascript", "axios",
  ],
  devops: [
    // Infraestrutura
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform",
    "ansible", "jenkins", "github_actions", "gitlab_ci", "argocd",
    "prometheus", "grafana", "linux",
    // Scripts & CLI
    "boto3", "commander_js", "click_py",
    // Políticas & Compliance
    "checkov", "inspec",
  ],
  dados: [
    "python", "sql", "postgresql", "mysql", "mongodb", "redis",
    "spark", "airflow", "dbt", "snowflake", "databricks", "kafka",
    "powerbi", "tableau", "pandas", "numpy", "matplotlib", "scipy",
  ],
  dba: [
    // Bancos
    "postgresql", "mysql", "sql_server", "oracle", "mongodb", "redis", "cassandra", "sql",
    // ORMs
    "hibernate", "prisma_orm", "entity_framework", "sqlalchemy",
    // Drivers & Conectores
    "pg_driver", "mysql2", "psycopg2", "mongoose",
    // Migrações
    "knex", "flyway", "alembic",
    // Linguagens
    "python", "java", "csharp", "nodejs",
  ],
  ia_ml: [
    // Frameworks Core
    "python", "pytorch", "tensorflow", "scikit_learn", "langchain",
    // Matemática & Processamento
    "pandas", "numpy", "matplotlib", "scipy",
    // Visão Computacional
    "opencv",
    // PLN
    "nltk", "spacy", "huggingface",
    // Serviços
    "llms", "axios",
  ],
  qa: [
    // E2E & Mobile
    "selenium", "cypress", "playwright", "appium",
    // Unitários
    "jest", "junit", "pytest",
    // Suporte
    "faker_js", "msw", "sinon", "chai", "postman",
    // Linguagens
    "typescript", "javascript", "python",
  ],
  ux_ui: [
    "figma", "adobe_xd", "sketch", "photoshop", "illustrator", "html_css", "framer_motion",
  ],
  seguranca: [
    // Análise & Testes
    "owasp", "burpsuite", "sonarqube", "snyk", "pentest", "siem",
    // Gestão de Segredos & Cloud
    "vault", "prisma_cloud",
    // Criptografia
    "pycryptodome", "libsodium",
    // Scanner & Exploração
    "scapy", "requests_py",
    // Políticas IaC
    "checkov", "inspec",
    // Utilitários
    "linux", "python",
  ],
  cloud: [
    "aws", "azure", "gcp", "terraform", "kubernetes", "docker",
    "ansible", "prometheus", "grafana", "boto3",
  ],
  arquitetura: [
    "aws", "azure", "gcp", "kubernetes", "docker", "kafka",
    "postgresql", "mongodb", "redis", "terraform",
    "apollo", "grpc", "socket_io",
  ],
  game_dev: [
    "unity", "unreal_engine", "godot",
    "csharp", "go",
  ],
};
