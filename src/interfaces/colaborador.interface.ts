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
  | "ia_ml"
  | "qa"
  | "ux_ui"
  | "seguranca"
  | "cloud"
  | "arquitetura";

// Todas as tecnologias disponíveis
export type Tecnologia =
  // Frontend
  | "react"
  | "nextjs"
  | "vue"
  | "angular"
  | "svelte"
  | "tailwind"
  | "typescript"
  | "javascript"
  | "html_css"
  | "sass"
  | "styled_components"
  | "redux"
  | "zustand"
  // Backend
  | "nodejs"
  | "python"
  | "java"
  | "csharp"
  | "go"
  | "php"
  | "ruby"
  | "rust"
  | "elixir"
  | "express"
  | "nestjs"
  | "fastapi"
  | "django"
  | "spring"
  | "dotnet"
  // Mobile
  | "react_native"
  | "flutter"
  | "swift"
  | "kotlin"
  | "ionic"
  | "expo"
  // DevOps
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
  // Dados
  | "sql"
  | "postgresql"
  | "mysql"
  | "mongodb"
  | "redis"
  | "spark"
  | "airflow"
  | "dbt"
  | "snowflake"
  | "databricks"
  | "kafka"
  | "powerbi"
  | "tableau"
  // IA/ML
  | "tensorflow"
  | "pytorch"
  | "scikit_learn"
  | "pandas"
  | "numpy"
  | "llms"
  | "langchain"
  | "huggingface"
  | "opencv"
  // QA
  | "selenium"
  | "cypress"
  | "jest"
  | "playwright"
  | "junit"
  | "pytest"
  | "postman"
  // UX/UI
  | "figma"
  | "adobe_xd"
  | "sketch"
  | "photoshop"
  | "illustrator"
  // Segurança
  | "owasp"
  | "pentest"
  | "siem"
  | "vault"
  // Outros
  | "git"
  | "linux"
  | "agile"
  | "scrum";

// Interface para uma especialidade do colaborador
export interface EspecialidadeColaborador {
  area: AreaEspecialidade;
  senioridade: Senioridade;
  tecnologias: Tecnologia[];
  tecnologiasCustom?: string[]; // Tecnologias adicionadas pelo usuário
}

// Interface principal do Colaborador
export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  empresaId: string;
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
  empresaId: string;
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
  ia_ml: "IA/ML",
  qa: "QA",
  ux_ui: "UX/UI",
  seguranca: "Segurança",
  cloud: "Cloud",
  arquitetura: "Arquitetura",
};

// Labels para Tecnologias
export const TECNOLOGIA_LABELS: Record<Tecnologia, string> = {
  // Frontend
  react: "React",
  nextjs: "Next.js",
  vue: "Vue.js",
  angular: "Angular",
  svelte: "Svelte",
  tailwind: "Tailwind CSS",
  typescript: "TypeScript",
  javascript: "JavaScript",
  html_css: "HTML/CSS",
  sass: "Sass/SCSS",
  styled_components: "Styled Components",
  redux: "Redux",
  zustand: "Zustand",
  // Backend
  nodejs: "Node.js",
  python: "Python",
  java: "Java",
  csharp: "C#",
  go: "Go",
  php: "PHP",
  ruby: "Ruby",
  rust: "Rust",
  elixir: "Elixir",
  express: "Express.js",
  nestjs: "NestJS",
  fastapi: "FastAPI",
  django: "Django",
  spring: "Spring Boot",
  dotnet: ".NET",
  // Mobile
  react_native: "React Native",
  flutter: "Flutter",
  swift: "Swift",
  kotlin: "Kotlin",
  ionic: "Ionic",
  expo: "Expo",
  // DevOps
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
  // Dados
  sql: "SQL",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  mongodb: "MongoDB",
  redis: "Redis",
  spark: "Apache Spark",
  airflow: "Apache Airflow",
  dbt: "dbt",
  snowflake: "Snowflake",
  databricks: "Databricks",
  kafka: "Apache Kafka",
  powerbi: "Power BI",
  tableau: "Tableau",
  // IA/ML
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  scikit_learn: "Scikit-learn",
  pandas: "Pandas",
  numpy: "NumPy",
  llms: "LLMs",
  langchain: "LangChain",
  huggingface: "Hugging Face",
  opencv: "OpenCV",
  // QA
  selenium: "Selenium",
  cypress: "Cypress",
  jest: "Jest",
  playwright: "Playwright",
  junit: "JUnit",
  pytest: "PyTest",
  postman: "Postman",
  // UX/UI
  figma: "Figma",
  adobe_xd: "Adobe XD",
  sketch: "Sketch",
  photoshop: "Photoshop",
  illustrator: "Illustrator",
  // Segurança
  owasp: "OWASP",
  pentest: "Pentest",
  siem: "SIEM",
  vault: "HashiCorp Vault",
  // Outros
  git: "Git",
  linux: "Linux",
  agile: "Agile",
  scrum: "Scrum",
};

// Tecnologias pré-definidas por área de especialidade
export const TECNOLOGIAS_POR_AREA: Record<AreaEspecialidade, Tecnologia[]> = {
  frontend: [
    "react", "nextjs", "vue", "angular", "svelte", "tailwind",
    "typescript", "javascript", "html_css", "sass", "styled_components",
    "redux", "zustand"
  ],
  backend: [
    "nodejs", "python", "java", "csharp", "go", "php", "ruby", "rust", "elixir",
    "express", "nestjs", "fastapi", "django", "spring", "dotnet"
  ],
  fullstack: [
    "react", "nextjs", "vue", "angular", "nodejs", "python",
    "typescript", "javascript", "postgresql", "mongodb"
  ],
  mobile: [
    "react_native", "flutter", "swift", "kotlin", "ionic", "expo",
    "typescript", "javascript"
  ],
  devops: [
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform",
    "ansible", "jenkins", "github_actions", "gitlab_ci", "argocd", "linux"
  ],
  dados: [
    "sql", "postgresql", "mysql", "mongodb", "redis", "spark",
    "airflow", "dbt", "snowflake", "databricks", "kafka",
    "python", "powerbi", "tableau"
  ],
  ia_ml: [
    "python", "tensorflow", "pytorch", "scikit_learn", "pandas",
    "numpy", "llms", "langchain", "huggingface", "opencv"
  ],
  qa: [
    "selenium", "cypress", "jest", "playwright", "junit", "pytest",
    "postman", "typescript", "javascript", "python"
  ],
  ux_ui: [
    "figma", "adobe_xd", "sketch", "photoshop", "illustrator", "html_css"
  ],
  seguranca: [
    "owasp", "pentest", "siem", "vault", "linux", "python"
  ],
  cloud: [
    "aws", "azure", "gcp", "terraform", "kubernetes", "docker"
  ],
  arquitetura: [
    "aws", "azure", "gcp", "kubernetes", "docker", "kafka",
    "postgresql", "mongodb", "redis"
  ],
};
