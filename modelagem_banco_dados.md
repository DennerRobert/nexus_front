# Modelagem do Banco de Dados — SGPI

> Gerado a partir das interfaces TypeScript em `src/interfaces/`
> Data: 08/04/2026

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Domínio: Tenant & Empresa](#2-domínio-tenant--empresa)
3. [Domínio: Usuários & Colaboradores](#3-domínio-usuários--colaboradores)
4. [Domínio: Clientes](#4-domínio-clientes)
5. [Domínio: Demandas & Inovação](#5-domínio-demandas--inovação)
6. [Domínio: Projetos & Execução](#6-domínio-projetos--execução)
7. [Domínio: Planejamento Técnico](#7-domínio-planejamento-técnico)
8. [Domínio: Produtos](#8-domínio-produtos)
9. [Domínio: Configurações & Formulários](#9-domínio-configurações--formulários)
10. [Domínio: Notificações](#10-domínio-notificações)
11. [Diagrama de Relacionamentos (ERD textual)](#11-diagrama-de-relacionamentos-erd-textual)
12. [Enums Centralizados](#12-enums-centralizados)

---

## 1. Visão Geral

O sistema SGPI (Sistema de Gestão de Projetos e Inovação) é uma plataforma **multi-tenant** voltada para gestão do ciclo completo de inovação: da submissão de demandas até a entrega de produtos. Os principais domínios são:

| Domínio | Descrição |
|---|---|
| Tenant / Empresa | Isolamento multi-tenant e unidades organizacionais |
| Usuários & Colaboradores | Autenticação, perfis, habilidades técnicas e alocações |
| Clientes | Clientes internos e externos vinculados a demandas/projetos |
| Demandas | Fluxo de recebimento, triagem e aprovação de ideias |
| Projetos & Execução | Squads, sprints, tarefas, registro de horas |
| Planejamento | Requisitos, arquitetura técnica e plano de trabalho |
| Produtos | Produtos gerados a partir de projetos concluídos |
| Configurações | Formulários customizáveis e configurações de Kanban |
| Notificações | Alertas e eventos do sistema |

---

## 2. Domínio: Tenant & Empresa

### Tabela: `tenants`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `nome` | VARCHAR(200) | NOT NULL | Nome do tenant |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | Identificador de URL |
| `descricao` | TEXT | NULL | Descrição do tenant |
| `logo_url` | VARCHAR(500) | NULL | URL do logotipo |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Status de ativação |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `empresas`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `tenant_id` | UUID | FK → tenants.id | Tenant proprietário |
| `nome` | VARCHAR(200) | NOT NULL | Nome da empresa/unidade |
| `cnpj` | VARCHAR(18) | UNIQUE, NULL | CNPJ da empresa |
| `descricao` | TEXT | NULL | Descrição |
| `ativa` | BOOLEAN | NOT NULL, DEFAULT true | Status de ativação |
| `formulario_tipo` | VARCHAR(30) | NULL | Enum: `inovacao`, `operacional`, `estrategico` |
| `setor` | VARCHAR(100) | NULL | Setor de atuação |
| `dados_adicionais` | JSONB | NULL | Dados extras chave-valor |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

> **Relacionamento:** `empresas.tenant_id` → `tenants.id` (N:1)

---

### Tabela: `setores`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `nome` | VARCHAR(200) | NOT NULL | Nome do setor |
| `descricao` | TEXT | NULL | Descrição |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Status de ativação |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

> **Nota:** Setores são globais no sistema; o vínculo com empresa se dá via `colaborador_setores`.

---

## 3. Domínio: Usuários & Colaboradores

### Tabela: `usuarios`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `tenant_id` | UUID | FK → tenants.id | Tenant do usuário |
| `empresa_id` | UUID | FK → empresas.id | Empresa principal (home) |
| `colaborador_id` | UUID | FK → colaboradores.id, NULL | Vínculo opcional com colaborador |
| `nome` | VARCHAR(200) | NOT NULL | Nome completo |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | E-mail de acesso |
| `senha_hash` | VARCHAR(255) | NOT NULL | Hash da senha |
| `avatar_url` | VARCHAR(500) | NULL | URL do avatar |
| `perfil` | VARCHAR(50) | NOT NULL | Enum: perfis do sistema |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Status de ativação |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

**Perfis (`perfil`):** `administrador`, `gestor_inovacao`, `analista_inovacao`, `assistente_inovacao`, `product_owner`, `especialista`, `cliente`, `comercial`

---

### Tabela: `usuario_empresas` *(N:N — usuário acessa múltiplas empresas)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `usuario_id` | UUID | FK → usuarios.id | Usuário |
| `empresa_id` | UUID | FK → empresas.id | Empresa acessível |

> PK composta: (`usuario_id`, `empresa_id`)

---

### Tabela: `colaboradores`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `nome` | VARCHAR(200) | NOT NULL | Nome completo |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | E-mail profissional |
| `matricula` | VARCHAR(50) | NOT NULL, UNIQUE | Matrícula |
| `cargo` | VARCHAR(100) | NOT NULL | Cargo atual |
| `custo_hora` | NUMERIC(10,2) | NOT NULL | Custo por hora (R$) |
| `carga_horaria_mensal` | INTEGER | NOT NULL | Horas mensais disponíveis |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Status |
| `data_admissao` | DATE | NOT NULL | Data de admissão |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `colaborador_empresas` *(N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `colaborador_id` | UUID | FK → colaboradores.id | Colaborador |
| `empresa_id` | UUID | FK → empresas.id | Empresa |

> PK composta: (`colaborador_id`, `empresa_id`)

---

### Tabela: `colaborador_setores` *(N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `colaborador_id` | UUID | FK → colaboradores.id | Colaborador |
| `setor_id` | UUID | FK → setores.id | Setor |

> PK composta: (`colaborador_id`, `setor_id`)

---

### Tabela: `colaborador_especialidades`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `colaborador_id` | UUID | FK → colaboradores.id, NOT NULL | Colaborador |
| `area` | VARCHAR(50) | NOT NULL | Área de especialidade (enum) |
| `senioridade` | VARCHAR(30) | NOT NULL | Senioridade (enum) |
| `framework_principal` | VARCHAR(50) | NOT NULL | Framework principal (enum) |

**Áreas:** `frontend`, `backend`, `fullstack`, `mobile`, `devops`, `dados`, `dba`, `ia_ml`, `qa`, `ux_ui`, `seguranca`, `cloud`, `arquitetura`, `game_dev`

**Senioridades:** `trainee`, `estagiario`, `junior`, `pleno`, `senior`, `especialista`, `lider`

---

### Tabela: `colaborador_especialidade_tecnologias` *(N:N — tecnologias por especialidade)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `especialidade_id` | UUID | FK → colaborador_especialidades.id | Especialidade |
| `tecnologia` | VARCHAR(50) | NOT NULL | Tecnologia (enum) |

> PK composta: (`especialidade_id`, `tecnologia`)

---

### Tabela: `colaborador_especialidade_tecnologias_custom`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `especialidade_id` | UUID | FK → colaborador_especialidades.id | Especialidade |
| `tecnologia` | VARCHAR(100) | NOT NULL | Tecnologia customizada (texto livre) |

---

## 4. Domínio: Clientes

### Tabela: `clientes`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `nome` | VARCHAR(200) | NOT NULL | Nome do cliente |
| `origem` | VARCHAR(30) | NOT NULL | Enum: `externo`, `interno`, `investimento_interno` |
| `natureza_juridica` | VARCHAR(40) | NULL | Enum: tipo jurídico |
| `cnpj` | VARCHAR(18) | NULL | CNPJ |
| `email` | VARCHAR(255) | NULL | E-mail de contato |
| `telefone` | VARCHAR(20) | NULL | Telefone |
| `modelo_receita` | VARCHAR(30) | NULL | Enum: `recorrencia`, `projeto_fechado`, `rateio_custo`, `sem_receita` |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

## 5. Domínio: Demandas & Inovação

### Tabela: `demandas`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `solicitante_id` | UUID | FK → usuarios.id | Usuário solicitante |
| `empresa_unidade_apoio_id` | UUID | FK → empresas.id | Empresa/unidade de apoio |
| `comite_id` | UUID | FK → comites.id, NULL | Comitê responsável |
| `projeto_id` | UUID | FK → projetos.id, NULL | Projeto gerado (quando convertida) |
| `squad_sugerido_id` | UUID | FK → squads.id, NULL | Squad sugerido pela IA |
| `nome_proponente` | VARCHAR(200) | NOT NULL | Nome do proponente |
| `titulo` | VARCHAR(300) | NOT NULL | Título da demanda |
| `estagio_ideia` | VARCHAR(30) | NOT NULL | Enum: estágio da ideia |
| `problema_resolver` | TEXT | NOT NULL | Descrição do problema |
| `existe_solucao_mercado` | VARCHAR(10) | NOT NULL | Enum: `sim`, `nao`, `parcial` |
| `descricao_solucao_existente` | TEXT | NULL | Descrição da solução existente |
| `quem_sofre_problema` | TEXT | NOT NULL | Público afetado |
| `ideia_solucao` | TEXT | NOT NULL | Ideia de solução proposta |
| `principais_beneficios` | TEXT | NOT NULL | Benefícios esperados |
| `recursos_necessarios` | TEXT | NOT NULL | Recursos necessários |
| `horizonte_inovacao` | VARCHAR(20) | NOT NULL | Enum: `h1_curto_prazo`, `h2_medio_prazo`, `h3_longo_prazo` |
| `prazo_desejado` | DATE | NOT NULL | Prazo desejado |
| `status` | VARCHAR(30) | NOT NULL | Enum: status da demanda |
| `etapa` | VARCHAR(50) | NOT NULL | Enum: etapa no fluxo |
| `exibir_vitrine` | BOOLEAN | NOT NULL, DEFAULT false | Exibir na vitrine de inovação |
| `observacoes` | TEXT | NULL | Observações gerais |
| `motivo_rejeicao` | TEXT | NULL | Motivo da rejeição |
| `justificativa_arquivamento` | TEXT | NULL | Justificativa de arquivamento |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

**Status:** `rascunho`, `em_analise`, `aguardando_aprovacao`, `aprovada`, `em_ajustes`, `rejeitada`, `convertida`

**Etapas:** `ideia_recebida`, `analise_inicial`, `analise_comite`, `devolucao_proponente`, `readequacao_recebida`, `validacao_problema`, `encaminhado_grupo_trabalho`, `arquivado`, `fora_time_estrategico`, `concluido`

---

### Tabela: `demanda_clientes` *(N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `demanda_id` | UUID | FK → demandas.id | Demanda |
| `cliente_id` | UUID | FK → clientes.id | Cliente vinculado |

> PK composta: (`demanda_id`, `cliente_id`)

---

### Tabela: `anexos_demanda`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `demanda_id` | UUID | FK → demandas.id | Demanda associada |
| `upload_por_id` | UUID | FK → usuarios.id | Usuário que fez upload |
| `nome` | VARCHAR(255) | NOT NULL | Nome do arquivo armazenado |
| `nome_original` | VARCHAR(255) | NOT NULL | Nome original do arquivo |
| `tipo` | VARCHAR(100) | NOT NULL | MIME type |
| `tamanho` | INTEGER | NOT NULL | Tamanho em bytes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de upload |

---

### Tabela: `historico_etapas`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `demanda_id` | UUID | FK → demandas.id | Demanda relacionada |
| `usuario_id` | UUID | FK → usuarios.id | Usuário que fez a transição |
| `etapa_anterior` | VARCHAR(50) | NOT NULL | Etapa de origem |
| `etapa_nova` | VARCHAR(50) | NOT NULL | Etapa de destino |
| `observacao` | TEXT | NULL | Observação da transição |
| `justificativa` | TEXT | NULL | Justificativa |
| `data` | TIMESTAMPTZ | NOT NULL | Data da transição |

---

### Tabela: `comites`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `tenant_id` | UUID | FK → tenants.id | Tenant |
| `chefe_id` | UUID | FK → usuarios.id | Usuário chefe do comitê |
| `nome` | VARCHAR(200) | NOT NULL | Nome do comitê |
| `descricao` | TEXT | NULL | Descrição |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `comite_membros` *(N:N — membros do comitê)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `comite_id` | UUID | FK → comites.id | Comitê |
| `usuario_id` | UUID | FK → usuarios.id | Membro (exceto chefe) |

> PK composta: (`comite_id`, `usuario_id`)

---

### Tabela: `votos_comite`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `demanda_id` | UUID | FK → demandas.id | Demanda votada |
| `comite_id` | UUID | FK → comites.id | Comitê |
| `membro_id` | UUID | FK → usuarios.id | Membro votante |
| `aprovado` | BOOLEAN | NOT NULL | Voto de aprovação |
| `comentario` | TEXT | NULL | Comentário do voto |
| `data` | TIMESTAMPTZ | NOT NULL | Data do voto |

---

### Tabela: `criterios_avaliacao`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `nome` | VARCHAR(200) | NOT NULL | Nome do critério |
| `descricao` | TEXT | NOT NULL | Descrição |
| `peso` | INTEGER | NOT NULL | Peso percentual (10–20) |

---

### Tabela: `perguntas_avaliacao`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `criterio_id` | UUID | FK → criterios_avaliacao.id | Critério pai |
| `texto` | TEXT | NOT NULL | Texto da pergunta |

---

### Tabela: `opcoes_avaliacao`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `pergunta_id` | UUID | FK → perguntas_avaliacao.id | Pergunta pai |
| `valor` | SMALLINT | NOT NULL, CHECK (1–5) | Valor da opção |
| `descricao` | TEXT | NOT NULL | Descrição da opção |

---

### Tabela: `respostas_avaliacao`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `demanda_id` | UUID | FK → demandas.id | Demanda avaliada |
| `pergunta_id` | UUID | FK → perguntas_avaliacao.id | Pergunta respondida |
| `criterio_id` | UUID | FK → criterios_avaliacao.id | Critério (desnormalizado) |
| `avaliador_id` | UUID | FK → usuarios.id | Avaliador |
| `valor` | SMALLINT | NOT NULL, CHECK (1–5) | Nota atribuída |
| `data` | TIMESTAMPTZ | NOT NULL | Data da resposta |

---

## 6. Domínio: Projetos & Execução

### Tabela: `projetos`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `empresa_dona_id` | UUID | FK → empresas.id | Empresa dona |
| `squad_id` | UUID | FK → squads.id, NULL | Squad executante |
| `demanda_id` | UUID | FK → demandas.id, NULL | Demanda de origem |
| `nome` | VARCHAR(300) | NOT NULL | Nome do projeto |
| `descricao` | TEXT | NOT NULL | Descrição |
| `status` | VARCHAR(30) | NOT NULL | Enum: status do projeto |
| `data_inicio` | DATE | NULL | Data de início real |
| `data_fim_prevista` | DATE | NULL | Data de fim prevista |
| `data_fim_real` | DATE | NULL | Data de fim real |
| `orcamento` | NUMERIC(14,2) | NOT NULL | Orçamento aprovado (R$) |
| `custo_atual` | NUMERIC(14,2) | NOT NULL, DEFAULT 0 | Custo acumulado (R$) |
| `observacoes` | TEXT | NULL | Observações |
| `motivo_rejeicao` | TEXT | NULL | Motivo de rejeição |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

**Status:** `aguardando_aprovacao`, `aprovado`, `em_execucao`, `pausado`, `concluido`, `cancelado`

---

### Tabela: `projeto_clientes` *(N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `projeto_id` | UUID | FK → projetos.id | Projeto |
| `cliente_id` | UUID | FK → clientes.id | Cliente vinculado |

> PK composta: (`projeto_id`, `cliente_id`)

---

### Tabela: `squads`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `projeto_id` | UUID | FK → projetos.id | Projeto do squad |
| `nome` | VARCHAR(200) | NOT NULL | Nome do squad |
| `objetivo` | TEXT | NOT NULL | Objetivo |
| `status` | VARCHAR(30) | NOT NULL | Enum: `formando`, `ativo`, `em_handover`, `encerrado` |
| `data_inicio` | DATE | NOT NULL | Data de início |
| `data_fim` | DATE | NULL | Data de encerramento |
| `custo_mensal` | NUMERIC(12,2) | NOT NULL, DEFAULT 0 | Custo mensal calculado (R$) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `alocacoes`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `colaborador_id` | UUID | FK → colaboradores.id | Colaborador alocado |
| `squad_id` | UUID | FK → squads.id | Squad destino |
| `papel` | VARCHAR(40) | NOT NULL | Enum: papel no squad |
| `percentual` | SMALLINT | NOT NULL, CHECK (1–100) | % de alocação |
| `status` | VARCHAR(20) | NOT NULL | Enum: `pendente`, `aprovada`, `ativa`, `encerrada`, `rejeitada` |
| `data_inicio` | DATE | NOT NULL | Início da alocação |
| `data_fim` | DATE | NULL | Fim da alocação |
| `custo_mensal` | NUMERIC(12,2) | NOT NULL | Custo mensal calculado (R$) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

**Papéis:** `tech_lead`, `desenvolvedor`, `desenvolvedor_senior`, `desenvolvedor_pleno`, `desenvolvedor_junior`, `product_owner`, `scrum_master`, `ux_designer`, `qa`, `devops`, `arquiteto`, `analista`

---

### Tabela: `sprints`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `projeto_id` | UUID | FK → projetos.id | Projeto pai |
| `nome` | VARCHAR(200) | NOT NULL | Nome da sprint |
| `objetivo` | TEXT | NULL | Objetivo da sprint |
| `numero` | SMALLINT | NOT NULL | Número sequencial |
| `data_inicio` | DATE | NOT NULL | Data de início |
| `data_fim` | DATE | NOT NULL | Data de término |
| `status` | VARCHAR(20) | NOT NULL | Enum: `planejamento`, `ativa`, `concluida`, `cancelada` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `tarefas`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `projeto_id` | UUID | FK → projetos.id | Projeto pai |
| `sprint_id` | UUID | FK → sprints.id, NULL | Sprint associada |
| `responsavel_id` | UUID | FK → colaboradores.id, NULL | Responsável pela tarefa |
| `titulo` | VARCHAR(300) | NOT NULL | Título da tarefa |
| `descricao` | TEXT | NULL | Descrição detalhada |
| `status` | VARCHAR(20) | NOT NULL | Enum: status da tarefa |
| `prioridade` | VARCHAR(10) | NOT NULL | Enum: `baixa`, `media`, `alta`, `urgente` |
| `estimativa_horas` | NUMERIC(6,2) | NULL | Estimativa em horas |
| `horas_realizadas` | NUMERIC(6,2) | NULL, DEFAULT 0 | Horas realizadas acumuladas |
| `data_limite` | DATE | NULL | Data limite |
| `ordem` | INTEGER | NOT NULL, DEFAULT 0 | Ordem dentro da coluna Kanban |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

**Status:** `backlog`, `a_fazer`, `em_progresso`, `em_revisao`, `concluido`

---

### Tabela: `tarefa_tags`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `tarefa_id` | UUID | FK → tarefas.id | Tarefa |
| `tag` | VARCHAR(50) | NOT NULL | Tag da tarefa |

> PK composta: (`tarefa_id`, `tag`)

---

### Tabela: `comentarios_tarefa`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `tarefa_id` | UUID | FK → tarefas.id | Tarefa comentada |
| `autor_id` | UUID | FK → usuarios.id | Autor do comentário |
| `conteudo` | TEXT | NOT NULL | Conteúdo do comentário |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `registros_horas`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `tarefa_id` | UUID | FK → tarefas.id | Tarefa registrada |
| `colaborador_id` | UUID | FK → colaboradores.id | Colaborador |
| `aprovador_id` | UUID | FK → usuarios.id, NULL | Usuário aprovador |
| `horas` | NUMERIC(5,2) | NOT NULL | Horas registradas |
| `data` | DATE | NOT NULL | Data do trabalho |
| `descricao` | TEXT | NOT NULL | Descrição das atividades |
| `status` | VARCHAR(15) | NOT NULL | Enum: `pendente`, `aprovado`, `rejeitado` |
| `data_aprovacao` | TIMESTAMPTZ | NULL | Data de aprovação/rejeição |
| `motivo_rejeicao` | TEXT | NULL | Motivo da rejeição |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |

---

### Tabela: `marcos_projeto`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `projeto_id` | UUID | FK → projetos.id | Projeto |
| `responsavel_id` | UUID | FK → colaboradores.id, NULL | Responsável |
| `titulo` | VARCHAR(300) | NOT NULL | Título do marco |
| `descricao` | TEXT | NULL | Descrição |
| `data` | DATE | NOT NULL | Data do marco |
| `tipo` | VARCHAR(15) | NOT NULL | Enum: `automatico`, `manual` |
| `icone` | VARCHAR(20) | NOT NULL | Enum: ícone visual |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

## 7. Domínio: Planejamento Técnico

### Tabela: `planejamentos_projeto`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `projeto_id` | UUID | FK → projetos.id, UNIQUE | Projeto (1 planejamento por projeto) |
| `status` | VARCHAR(15) | NOT NULL | Enum: `rascunho`, `em_revisao`, `aprovado` |
| `versao` | SMALLINT | NOT NULL, DEFAULT 1 | Versão do planejamento |
| `gerado_em` | TIMESTAMPTZ | NOT NULL | Data de geração |
| `gerado_por` | VARCHAR(200) | NOT NULL | Quem gerou |
| `editado_em` | TIMESTAMPTZ | NULL | Data da última edição |
| `editado_por` | VARCHAR(200) | NULL | Quem editou |
| `enviado_para_revisao_em` | TIMESTAMPTZ | NULL | Data de envio para revisão |
| `enviado_para_revisao_por` | VARCHAR(200) | NULL | Quem enviou |
| `aprovado_em` | TIMESTAMPTZ | NULL | Data de aprovação |
| `aprovado_por` | VARCHAR(200) | NULL | Quem aprovou |
| `observacoes` | TEXT | NULL | Observações |

---

### Tabela: `fases_projeto`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `planejamento_id` | UUID | FK → planejamentos_projeto.id | Planejamento pai |
| `nome` | VARCHAR(200) | NOT NULL | Nome da fase |
| `descricao` | TEXT | NOT NULL | Descrição |
| `ordem` | SMALLINT | NOT NULL | Ordem de execução |
| `data_inicio` | DATE | NOT NULL | Início previsto |
| `data_fim` | DATE | NOT NULL | Fim previsto |
| `horas_estimadas` | NUMERIC(8,2) | NOT NULL | Horas estimadas |
| `status` | VARCHAR(20) | NOT NULL | Enum: `pendente`, `em_andamento`, `concluida` |

---

### Tabela: `fase_responsaveis` *(N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `fase_id` | UUID | FK → fases_projeto.id | Fase |
| `colaborador_id` | UUID | FK → colaboradores.id | Colaborador responsável |

> PK composta: (`fase_id`, `colaborador_id`)

---

### Tabela: `fase_dependencias` *(auto-relacionamento N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `fase_id` | UUID | FK → fases_projeto.id | Fase dependente |
| `depende_de_fase_id` | UUID | FK → fases_projeto.id | Fase da qual depende |

> PK composta: (`fase_id`, `depende_de_fase_id`)

---

### Tabela: `marcos_plano`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `planejamento_id` | UUID | FK → planejamentos_projeto.id | Planejamento pai |
| `fase_id` | UUID | FK → fases_projeto.id | Fase associada |
| `titulo` | VARCHAR(300) | NOT NULL | Título |
| `descricao` | TEXT | NOT NULL | Descrição |
| `data_prevista` | DATE | NOT NULL | Data prevista |

---

### Tabela: `marcos_plano_entregaveis`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `marco_plano_id` | UUID | FK → marcos_plano.id | Marco do plano |
| `descricao` | TEXT | NOT NULL | Descrição do entregável |

---

### Tabela: `requisitos_sistema`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `planejamento_id` | UUID | FK → planejamentos_projeto.id, UNIQUE | Planejamento (1:1) |

---

### Tabela: `requisitos_funcionais`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `requisito_sistema_id` | UUID | FK → requisitos_sistema.id | Agrupamento pai |
| `codigo` | VARCHAR(10) | NOT NULL | Ex.: RF01, RF02 |
| `titulo` | VARCHAR(300) | NOT NULL | Título |
| `descricao` | TEXT | NOT NULL | Descrição detalhada |
| `prioridade` | VARCHAR(15) | NOT NULL | Enum: `essencial`, `importante`, `desejavel` |
| `user_story_id` | UUID | FK → user_stories.id, NULL | User story vinculada |

---

### Tabela: `rf_criterios_aceitacao`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `requisito_funcional_id` | UUID | FK → requisitos_funcionais.id | RF pai |
| `criterio` | TEXT | NOT NULL | Critério de aceitação |

---

### Tabela: `requisitos_nao_funcionais`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `requisito_sistema_id` | UUID | FK → requisitos_sistema.id | Agrupamento pai |
| `codigo` | VARCHAR(10) | NOT NULL | Ex.: RNF01 |
| `titulo` | VARCHAR(300) | NOT NULL | Título |
| `descricao` | TEXT | NOT NULL | Descrição |
| `categoria` | VARCHAR(20) | NOT NULL | Enum: `performance`, `seguranca`, `usabilidade`, `disponibilidade`, `escalabilidade`, `manutencao` |
| `metrica` | VARCHAR(200) | NULL | Ex.: "Tempo de resposta < 500ms" |
| `prioridade` | VARCHAR(15) | NOT NULL | Enum: prioridade |

---

### Tabela: `user_stories`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `requisito_sistema_id` | UUID | FK → requisitos_sistema.id | Agrupamento pai |
| `codigo` | VARCHAR(10) | NOT NULL | Ex.: US01 |
| `persona` | TEXT | NOT NULL | "Como [persona]" |
| `acao` | TEXT | NOT NULL | "quero [ação]" |
| `beneficio` | TEXT | NOT NULL | "para [benefício]" |
| `prioridade` | VARCHAR(15) | NOT NULL | Enum: prioridade |

---

### Tabela: `us_criterios_aceitacao`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `user_story_id` | UUID | FK → user_stories.id | User story pai |
| `criterio` | TEXT | NOT NULL | Critério de aceitação |

---

### Tabela: `us_requisitos_relacionados` *(N:N — user story → RF)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `user_story_id` | UUID | FK → user_stories.id | User story |
| `requisito_funcional_id` | UUID | FK → requisitos_funcionais.id | RF relacionado |

> PK composta: (`user_story_id`, `requisito_funcional_id`)

---

### Tabela: `casos_uso`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `requisito_sistema_id` | UUID | FK → requisitos_sistema.id | Agrupamento pai |
| `codigo` | VARCHAR(10) | NOT NULL | Ex.: UC01 |
| `titulo` | VARCHAR(300) | NOT NULL | Título |
| `ator_principal` | VARCHAR(200) | NOT NULL | Ator principal |
| `pre_condicoes` | TEXT[] | NOT NULL | Pré-condições (array) |
| `fluxo_principal` | TEXT[] | NOT NULL | Passos do fluxo principal |
| `pos_condicoes` | TEXT[] | NOT NULL | Pós-condições |

---

### Tabela: `caso_uso_fluxos_alternativos`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `caso_uso_id` | UUID | FK → casos_uso.id | Caso de uso pai |
| `condicao` | TEXT | NOT NULL | Condição de ativação do fluxo |

---

### Tabela: `caso_uso_fluxo_passos`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `fluxo_alternativo_id` | UUID | FK → caso_uso_fluxos_alternativos.id | Fluxo pai |
| `passo` | TEXT | NOT NULL | Passo do fluxo alternativo |
| `ordem` | SMALLINT | NOT NULL | Ordem do passo |

---

### Tabela: `regras_negocio`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `requisito_sistema_id` | UUID | FK → requisitos_sistema.id | Agrupamento pai |
| `codigo` | VARCHAR(10) | NOT NULL | Ex.: RN01 |
| `titulo` | VARCHAR(300) | NOT NULL | Título |
| `descricao` | TEXT | NOT NULL | Descrição |
| `modulo` | VARCHAR(100) | NOT NULL | Módulo do sistema |

---

### Tabela: `arquiteturas_tecnicas`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `planejamento_id` | UUID | FK → planejamentos_projeto.id, UNIQUE | Planejamento (1:1) |
| `premissas` | TEXT[] | NOT NULL | Lista de premissas |
| `restricoes` | TEXT[] | NOT NULL | Lista de restrições |

---

### Tabela: `stack_tecnologias` *(stack por camada)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `arquitetura_id` | UUID | FK → arquiteturas_tecnicas.id | Arquitetura pai |
| `nome` | VARCHAR(100) | NOT NULL | Nome da tecnologia |
| `versao` | VARCHAR(50) | NULL | Versão |
| `categoria` | VARCHAR(20) | NOT NULL | Enum: `linguagem`, `framework`, `biblioteca`, `ferramenta`, `infra` |
| `camada` | VARCHAR(15) | NOT NULL | Enum: `frontend`, `backend`, `banco`, `infra`, `outros` |
| `justificativa` | TEXT | NOT NULL | Justificativa de escolha |

---

### Tabela: `componentes_arquitetura`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `arquitetura_id` | UUID | FK → arquiteturas_tecnicas.id | Arquitetura pai |
| `nome` | VARCHAR(200) | NOT NULL | Nome do componente |
| `tipo` | VARCHAR(20) | NOT NULL | Enum: `frontend`, `backend`, `api`, `banco`, `servico`, `integracao` |
| `descricao` | TEXT | NOT NULL | Descrição |
| `responsabilidades` | TEXT[] | NOT NULL | Lista de responsabilidades |
| `tecnologias` | TEXT[] | NOT NULL | Tecnologias utilizadas |

---

### Tabela: `componente_dependencias` *(auto-relacionamento N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `componente_id` | UUID | FK → componentes_arquitetura.id | Componente |
| `depende_de_id` | UUID | FK → componentes_arquitetura.id | Componente do qual depende |

> PK composta: (`componente_id`, `depende_de_id`)

---

### Tabela: `integracoes`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `arquitetura_id` | UUID | FK → arquiteturas_tecnicas.id | Arquitetura pai |
| `nome` | VARCHAR(200) | NOT NULL | Nome da integração |
| `tipo` | VARCHAR(25) | NOT NULL | Enum: `api_externa`, `sistema_legado`, `servico_terceiro`, `webhook` |
| `descricao` | TEXT | NOT NULL | Descrição |
| `endpoint` | VARCHAR(500) | NULL | URL do endpoint |
| `autenticacao` | VARCHAR(100) | NOT NULL | Tipo de autenticação |
| `observacoes` | TEXT | NOT NULL | Observações |

---

### Tabela: `riscos_tecnicos`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `arquitetura_id` | UUID | FK → arquiteturas_tecnicas.id | Arquitetura pai |
| `titulo` | VARCHAR(300) | NOT NULL | Título do risco |
| `descricao` | TEXT | NOT NULL | Descrição |
| `severidade` | VARCHAR(10) | NOT NULL | Enum: `baixa`, `media`, `alta`, `critica` |
| `probabilidade` | VARCHAR(10) | NOT NULL | Enum: `baixa`, `media`, `alta` |
| `impacto` | TEXT | NOT NULL | Descrição do impacto |
| `mitigacao` | TEXT | NOT NULL | Plano de mitigação |

---

### Tabela: `historico_versoes_planejamento`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `planejamento_id` | UUID | FK → planejamentos_projeto.id | Planejamento |
| `versao` | SMALLINT | NOT NULL | Número da versão |
| `autor` | VARCHAR(200) | NOT NULL | Autor da ação |
| `acao` | VARCHAR(15) | NOT NULL | Enum: `criacao`, `edicao`, `regeneracao`, `aprovacao` |
| `descricao` | TEXT | NOT NULL | Descrição da mudança |
| `data` | TIMESTAMPTZ | NOT NULL | Data da ação |

---

## 8. Domínio: Produtos

### Tabela: `produtos`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `empresa_dona_id` | UUID | FK → empresas.id | Empresa dona |
| `projeto_origem_id` | UUID | FK → projetos.id | Projeto de origem |
| `responsavel_operacao_id` | UUID | FK → colaboradores.id, NULL | Responsável pela operação |
| `nome` | VARCHAR(300) | NOT NULL | Nome do produto |
| `descricao` | TEXT | NOT NULL | Descrição |
| `status` | VARCHAR(20) | NOT NULL | Enum: `em_transicao`, `em_operacao`, `descontinuado` |
| `classificacao` | VARCHAR(25) | NOT NULL | Enum: `mercado_externo`, `intercompany`, `interno` |
| `custo_desenvolvimento` | NUMERIC(14,2) | NOT NULL | Custo de desenvolvimento (R$) |
| `custo_operacao_mensal` | NUMERIC(12,2) | NOT NULL | Custo de operação mensal (R$) |
| `data_lancamento` | DATE | NOT NULL | Data de lançamento |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `produto_clientes` *(N:N)*

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `produto_id` | UUID | FK → produtos.id | Produto |
| `cliente_id` | UUID | FK → clientes.id | Cliente |

> PK composta: (`produto_id`, `cliente_id`)

---

## 9. Domínio: Configurações & Formulários

### Tabela: `kanban_empresa_config`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `empresa_id` | UUID | FK → empresas.id, UNIQUE | Empresa (1 config por empresa) |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `kanban_etapa_config`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `kanban_config_id` | UUID | FK → kanban_empresa_config.id | Config pai |
| `etapa` | VARCHAR(50) | NOT NULL | Enum: etapa do fluxo de demandas |
| `titulo` | VARCHAR(200) | NOT NULL | Título customizado |
| `visivel` | BOOLEAN | NOT NULL, DEFAULT true | Se exibido no Kanban |
| `ordem` | SMALLINT | NOT NULL | Ordem de exibição |

---

### Tabela: `formularios_empresa`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `empresa_id` | UUID | FK → empresas.id | Empresa |
| `titulo` | VARCHAR(300) | NOT NULL | Título do formulário |
| `descricao` | TEXT | NULL | Descrição |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT true | Status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Data de atualização |

---

### Tabela: `campos_formulario`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `formulario_id` | UUID | FK → formularios_empresa.id | Formulário pai |
| `label` | VARCHAR(200) | NOT NULL | Label do campo |
| `tipo` | VARCHAR(20) | NOT NULL | Enum: `texto`, `textarea`, `numero`, `data`, `selecao`, `multipla_escolha` |
| `obrigatorio` | BOOLEAN | NOT NULL, DEFAULT false | Se o campo é obrigatório |
| `placeholder` | VARCHAR(200) | NULL | Placeholder |
| `descricao` | TEXT | NULL | Descrição de ajuda |
| `ordem` | SMALLINT | NOT NULL | Ordem de exibição |

---

### Tabela: `campo_formulario_opcoes`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `campo_id` | UUID | FK → campos_formulario.id | Campo pai |
| `opcao` | VARCHAR(200) | NOT NULL | Texto da opção |
| `ordem` | SMALLINT | NOT NULL | Ordem de exibição |

---

## 10. Domínio: Notificações

### Tabela: `notificacoes`

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `usuario_id` | UUID | FK → usuarios.id | Destinatário |
| `tipo` | VARCHAR(40) | NOT NULL | Enum: tipo de notificação |
| `categoria` | VARCHAR(15) | NOT NULL | Enum: `demanda`, `projeto`, `tarefa`, `sistema` |
| `titulo` | VARCHAR(300) | NOT NULL | Título da notificação |
| `mensagem` | TEXT | NOT NULL | Mensagem |
| `lida` | BOOLEAN | NOT NULL, DEFAULT false | Se já lida |
| `link` | VARCHAR(500) | NULL | Link de redirecionamento |
| `entidade_id` | UUID | NULL | ID da entidade relacionada |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Data de criação |

**Tipos:** `demanda_criada`, `demanda_aprovada`, `demanda_rejeitada`, `demanda_em_analise`, `demanda_ajustes`, `comentario_adicionado`, `tarefa_atribuida`, `sprint_iniciada`, `marco_proximo`, `projeto_atualizado`, `alocacao_criada`

---

## 11. Diagrama de Relacionamentos (ERD textual)

```
tenants
  └──< empresas (tenant_id)
         └──< usuario_empresas (empresa_id)
         └──< colaborador_empresas (empresa_id)
         └──< demandas (empresa_unidade_apoio_id)
         └──< projetos (empresa_dona_id)
         └──< produtos (empresa_dona_id)
         └──< kanban_empresa_config (empresa_id) [1:1]
         └──< formularios_empresa (empresa_id)
  └──< comites (tenant_id)

setores
  └──< colaborador_setores (setor_id)

usuarios
  ├──< usuario_empresas (usuario_id)
  ├──< demandas (solicitante_id)
  ├──< historico_etapas (usuario_id)
  ├──< comite_membros (usuario_id)
  ├──< votos_comite (membro_id)
  ├──< respostas_avaliacao (avaliador_id)
  ├──< comentarios_tarefa (autor_id)
  ├──< registros_horas (aprovador_id)
  └──< notificacoes (usuario_id)

colaboradores
  ├──< colaborador_empresas (colaborador_id)
  ├──< colaborador_setores (colaborador_id)
  ├──< colaborador_especialidades (colaborador_id)
  │      └──< colaborador_especialidade_tecnologias (especialidade_id)
  │      └──< colaborador_especialidade_tecnologias_custom (especialidade_id)
  ├──< alocacoes (colaborador_id)
  ├──< registros_horas (colaborador_id)
  ├──< marcos_projeto (responsavel_id)
  ├──< fase_responsaveis (colaborador_id)
  └──< produtos (responsavel_operacao_id)

clientes
  ├──< demanda_clientes (cliente_id)
  ├──< projeto_clientes (cliente_id)
  └──< produto_clientes (cliente_id)

demandas
  ├──< demanda_clientes (demanda_id)
  ├──< anexos_demanda (demanda_id)
  ├──< historico_etapas (demanda_id)
  ├──< votos_comite (demanda_id)
  ├──< respostas_avaliacao (demanda_id)
  └──> projetos (projeto_id) [quando convertida]

comites
  ├──< comite_membros (comite_id)
  └──< votos_comite (comite_id)

criterios_avaliacao
  └──< perguntas_avaliacao (criterio_id)
         └──< opcoes_avaliacao (pergunta_id)
         └──< respostas_avaliacao (pergunta_id)

projetos
  ├──< projeto_clientes (projeto_id)
  ├──< squads (projeto_id)
  │      └──< alocacoes (squad_id)
  ├──< sprints (projeto_id)
  │      └──< tarefas (sprint_id)
  ├──< tarefas (projeto_id)
  │      ├──< tarefa_tags (tarefa_id)
  │      ├──< comentarios_tarefa (tarefa_id)
  │      └──< registros_horas (tarefa_id)
  ├──< marcos_projeto (projeto_id)
  ├──< planejamentos_projeto (projeto_id) [1:1]
  │      ├──< fases_projeto (planejamento_id)
  │      │      ├──< fase_responsaveis (fase_id)
  │      │      └──< fase_dependencias (fase_id ↔ depende_de_fase_id)
  │      ├──< marcos_plano (planejamento_id)
  │      │      └──< marcos_plano_entregaveis (marco_plano_id)
  │      ├──< requisitos_sistema (planejamento_id) [1:1]
  │      │      ├──< requisitos_funcionais (requisito_sistema_id)
  │      │      │      └──< rf_criterios_aceitacao (requisito_funcional_id)
  │      │      ├──< requisitos_nao_funcionais (requisito_sistema_id)
  │      │      ├──< user_stories (requisito_sistema_id)
  │      │      │      ├──< us_criterios_aceitacao (user_story_id)
  │      │      │      └──< us_requisitos_relacionados (user_story_id ↔ requisito_funcional_id)
  │      │      ├──< casos_uso (requisito_sistema_id)
  │      │      │      └──< caso_uso_fluxos_alternativos (caso_uso_id)
  │      │      │             └──< caso_uso_fluxo_passos (fluxo_alternativo_id)
  │      │      └──< regras_negocio (requisito_sistema_id)
  │      ├──< arquiteturas_tecnicas (planejamento_id) [1:1]
  │      │      ├──< stack_tecnologias (arquitetura_id)
  │      │      ├──< componentes_arquitetura (arquitetura_id)
  │      │      │      └──< componente_dependencias (componente_id ↔ depende_de_id)
  │      │      ├──< integracoes (arquitetura_id)
  │      │      └──< riscos_tecnicos (arquitetura_id)
  │      └──< historico_versoes_planejamento (planejamento_id)
  └──< produtos (projeto_origem_id)

formularios_empresa
  └──< campos_formulario (formulario_id)
         └──< campo_formulario_opcoes (campo_id)

kanban_empresa_config
  └──< kanban_etapa_config (kanban_config_id)
```

---

## 12. Enums Centralizados

### Usuários

| Enum | Valores |
|---|---|
| `PerfilUsuario` | `administrador`, `gestor_inovacao`, `analista_inovacao`, `assistente_inovacao`, `product_owner`, `especialista`, `cliente`, `comercial` |

### Colaboradores

| Enum | Valores |
|---|---|
| `Senioridade` | `trainee`, `estagiario`, `junior`, `pleno`, `senior`, `especialista`, `lider` |
| `AreaEspecialidade` | `frontend`, `backend`, `fullstack`, `mobile`, `devops`, `dados`, `dba`, `ia_ml`, `qa`, `ux_ui`, `seguranca`, `cloud`, `arquitetura`, `game_dev` |

### Clientes

| Enum | Valores |
|---|---|
| `OrigemCliente` | `externo`, `interno`, `investimento_interno` |
| `NaturezaJuridica` | `empresa_privada`, `orgao_municipal`, `orgao_estadual`, `orgao_federal`, `terceiro_setor`, `internacional` |
| `ModeloReceita` | `recorrencia`, `projeto_fechado`, `rateio_custo`, `sem_receita` |

### Demandas

| Enum | Valores |
|---|---|
| `StatusDemanda` | `rascunho`, `em_analise`, `aguardando_aprovacao`, `aprovada`, `em_ajustes`, `rejeitada`, `convertida` |
| `EstagioIdeia` | `conceito`, `validacao`, `prototipo`, `mvp`, `escala` |
| `HorizonteInovacao` | `h1_curto_prazo`, `h2_medio_prazo`, `h3_longo_prazo` |
| `ExisteSolucaoMercado` | `sim`, `nao`, `parcial` |
| `EtapaDemanda` | `ideia_recebida`, `analise_inicial`, `analise_comite`, `devolucao_proponente`, `readequacao_recebida`, `validacao_problema`, `encaminhado_grupo_trabalho`, `arquivado`, `fora_time_estrategico`, `concluido` |
| `FormularioTipo` | `inovacao`, `operacional`, `estrategico` |

### Projetos & Execução

| Enum | Valores |
|---|---|
| `StatusProjeto` | `aguardando_aprovacao`, `aprovado`, `em_execucao`, `pausado`, `concluido`, `cancelado` |
| `StatusSquad` | `formando`, `ativo`, `em_handover`, `encerrado` |
| `PapelAlocacao` | `tech_lead`, `desenvolvedor`, `desenvolvedor_senior`, `desenvolvedor_pleno`, `desenvolvedor_junior`, `product_owner`, `scrum_master`, `ux_designer`, `qa`, `devops`, `arquiteto`, `analista` |
| `StatusAlocacao` | `pendente`, `aprovada`, `ativa`, `encerrada`, `rejeitada` |
| `StatusSprint` | `planejamento`, `ativa`, `concluida`, `cancelada` |
| `StatusTarefa` | `backlog`, `a_fazer`, `em_progresso`, `em_revisao`, `concluido` |
| `PrioridadeTarefa` | `baixa`, `media`, `alta`, `urgente` |
| `StatusRegistroHoras` | `pendente`, `aprovado`, `rejeitado` |
| `TipoMarco` | `automatico`, `manual` |

### Planejamento

| Enum | Valores |
|---|---|
| `StatusPlanejamento` | `rascunho`, `em_revisao`, `aprovado` |
| `PrioridadeRequisito` | `essencial`, `importante`, `desejavel` |
| `TipoRequisito` | `funcional`, `nao_funcional` |
| `CategoriaRNF` | `performance`, `seguranca`, `usabilidade`, `disponibilidade`, `escalabilidade`, `manutencao` |
| `SeveridadeRisco` | `baixa`, `media`, `alta`, `critica` |

### Produtos

| Enum | Valores |
|---|---|
| `StatusProduto` | `em_transicao`, `em_operacao`, `descontinuado` |
| `ClassificacaoProduto` | `mercado_externo`, `intercompany`, `interno` |

### Formulários

| Enum | Valores |
|---|---|
| `TipoCampoFormulario` | `texto`, `textarea`, `numero`, `data`, `selecao`, `multipla_escolha` |

### Notificações

| Enum | Valores |
|---|---|
| `NotificacaoTipo` | `demanda_criada`, `demanda_aprovada`, `demanda_rejeitada`, `demanda_em_analise`, `demanda_ajustes`, `comentario_adicionado`, `tarefa_atribuida`, `sprint_iniciada`, `marco_proximo`, `projeto_atualizado`, `alocacao_criada` |
| `NotificacaoCategoria` | `demanda`, `projeto`, `tarefa`, `sistema` |

---

*Gerado automaticamente a partir das interfaces TypeScript do projeto SGPI Frontend.*
