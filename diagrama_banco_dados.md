# Diagrama do Banco de Dados — SGPI

> Gerado a partir de `modelagem_banco_dados_consolidada.md`
> Data: 23/04/2026

```mermaid
erDiagram
    %% ─────────────────────────────────────────────
    %% DOMÍNIO: TENANT & EMPRESA
    %% ─────────────────────────────────────────────
    tenants {
        UUID id PK
        VARCHAR nome
        VARCHAR slug
        TEXT descricao
        VARCHAR logo_url
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    empresas {
        UUID id PK
        UUID tenant_id FK
        VARCHAR nome
        VARCHAR cnpj
        VARCHAR email
        VARCHAR telefone
        TEXT descricao
        VARCHAR segmento
        BOOLEAN ativa
        VARCHAR formulario_tipo
        JSONB dados_adicionais
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    setores {
        UUID id PK
        UUID empresa_id FK
        VARCHAR nome
        TEXT descricao
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: USUÁRIOS & COLABORADORES
    %% ─────────────────────────────────────────────
    usuarios {
        UUID id PK
        UUID tenant_id FK
        UUID empresa_id FK
        UUID colaborador_id FK
        VARCHAR nome
        VARCHAR email
        VARCHAR senha_hash
        VARCHAR avatar_url
        VARCHAR perfil
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    usuario_empresas {
        UUID usuario_id FK
        UUID empresa_id FK
    }

    colaboradores {
        UUID id PK
        UUID tenant_id FK
        VARCHAR nome
        VARCHAR email
        VARCHAR matricula
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    vinculos_empregaticio {
        UUID id PK
        UUID colaborador_id FK
        UUID empresa_id FK
        VARCHAR cargo
        NUMERIC custo_hora
        INTEGER carga_horaria_mensal
        DATE data_admissao
        BOOLEAN ativo
    }

    colaborador_setores {
        UUID colaborador_id FK
        UUID setor_id FK
    }

    colaborador_especialidades {
        UUID id PK
        UUID colaborador_id FK
        VARCHAR area
        VARCHAR senioridade
        VARCHAR framework_principal
    }

    colaborador_especialidade_tecnologias {
        UUID id PK
        UUID especialidade_id FK
        VARCHAR tecnologia
        VARCHAR origem
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: CLIENTES
    %% ─────────────────────────────────────────────
    clientes {
        UUID id PK
        UUID tenant_id FK
        VARCHAR nome
        VARCHAR origem
        UUID empresa_id FK
        VARCHAR natureza_juridica
        VARCHAR cnpj
        VARCHAR email
        VARCHAR telefone
        VARCHAR modelo_receita
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: DEMANDAS & INOVAÇÃO
    %% ─────────────────────────────────────────────
    demandas {
        UUID id PK
        UUID tenant_id FK
        UUID solicitante_id FK
        UUID empresa_unidade_apoio_id FK
        UUID comite_id FK
        UUID projeto_id FK
        UUID squad_sugerido_id FK
        VARCHAR nome_proponente
        VARCHAR titulo
        VARCHAR estagio_ideia
        TEXT problema_resolver
        VARCHAR horizonte_inovacao
        DATE prazo_desejado
        VARCHAR status
        VARCHAR etapa
        BOOLEAN exibir_vitrine
        TEXT observacoes
        JSONB dados_customizados
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    demanda_clientes {
        UUID demanda_id FK
        UUID cliente_id FK
    }

    anexos_demanda {
        UUID id PK
        UUID demanda_id FK
        UUID upload_por_id FK
        VARCHAR nome
        VARCHAR nome_original
        VARCHAR tipo
        BIGINT tamanho
        TIMESTAMPTZ created_at
    }

    historico_etapas {
        UUID id PK
        UUID demanda_id FK
        UUID usuario_id FK
        VARCHAR etapa_anterior
        VARCHAR etapa_nova
        TEXT observacao
        TEXT justificativa
        TIMESTAMPTZ data
    }

    comites {
        UUID id PK
        UUID tenant_id FK
        UUID chefe_id FK
        VARCHAR nome
        TEXT descricao
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    comite_membros {
        UUID comite_id FK
        UUID usuario_id FK
    }

    votos_comite {
        UUID id PK
        UUID demanda_id FK
        UUID comite_id FK
        UUID membro_id FK
        BOOLEAN aprovado
        TEXT comentario
        TIMESTAMPTZ data
    }

    criterios_avaliacao {
        UUID id PK
        VARCHAR nome
        TEXT descricao
        INTEGER peso
    }

    perguntas_avaliacao {
        UUID id PK
        UUID criterio_id FK
        TEXT texto
    }

    opcoes_avaliacao {
        UUID id PK
        UUID pergunta_id FK
        SMALLINT valor
        TEXT descricao
    }

    respostas_avaliacao {
        UUID id PK
        UUID demanda_id FK
        UUID pergunta_id FK
        UUID criterio_id FK
        UUID avaliador_id FK
        SMALLINT valor
        TIMESTAMPTZ data
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: PROJETOS & EXECUÇÃO
    %% ─────────────────────────────────────────────
    projetos {
        UUID id PK
        UUID tenant_id FK
        UUID empresa_dona_id FK
        UUID squad_id FK
        UUID demanda_id FK
        VARCHAR nome
        TEXT descricao
        VARCHAR status
        DATE data_inicio
        DATE data_fim_prevista
        DATE data_fim_real
        NUMERIC orcamento
        NUMERIC custo_atual
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    projeto_clientes {
        UUID projeto_id FK
        UUID cliente_id FK
    }

    squads {
        UUID id PK
        UUID projeto_id FK
        VARCHAR nome
        TEXT objetivo
        VARCHAR status
        DATE data_inicio
        DATE data_fim
        NUMERIC custo_mensal
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    alocacoes {
        UUID id PK
        UUID colaborador_id FK
        UUID squad_id FK
        VARCHAR papel
        SMALLINT percentual
        VARCHAR status
        DATE data_inicio
        DATE data_fim
        NUMERIC custo_mensal
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    sprints {
        UUID id PK
        UUID projeto_id FK
        VARCHAR nome
        TEXT objetivo
        SMALLINT numero
        DATE data_inicio
        DATE data_fim
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    tarefas {
        UUID id PK
        UUID tenant_id FK
        UUID projeto_id FK
        UUID sprint_id FK
        UUID responsavel_id FK
        VARCHAR titulo
        TEXT descricao
        VARCHAR status
        VARCHAR prioridade
        NUMERIC estimativa_horas
        NUMERIC horas_realizadas
        DATE data_limite
        JSONB tags
        INTEGER ordem
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    comentarios_tarefa {
        UUID id PK
        UUID tarefa_id FK
        UUID autor_id FK
        TEXT conteudo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    registros_horas {
        UUID id PK
        UUID tarefa_id FK
        UUID colaborador_id FK
        UUID aprovador_id FK
        NUMERIC horas
        DATE data
        TEXT descricao
        VARCHAR status
        TIMESTAMPTZ data_aprovacao
        TEXT motivo_rejeicao
        TIMESTAMPTZ created_at
    }

    marcos_projeto {
        UUID id PK
        UUID projeto_id FK
        UUID responsavel_id FK
        VARCHAR titulo
        TEXT descricao
        DATE data
        DATE data_conclusao
        VARCHAR status
        VARCHAR tipo
        VARCHAR icone
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: PLANEJAMENTO TÉCNICO
    %% ─────────────────────────────────────────────
    planejamentos_projeto {
        UUID id PK
        UUID projeto_id FK
        VARCHAR status
        SMALLINT versao
        TIMESTAMPTZ gerado_em
        UUID gerado_por FK
        TIMESTAMPTZ editado_em
        UUID editado_por FK
        UUID enviado_para_revisao_por FK
        TIMESTAMPTZ aprovado_em
        UUID aprovado_por FK
        TEXT observacoes
    }

    fases_projeto {
        UUID id PK
        UUID planejamento_id FK
        VARCHAR nome
        TEXT descricao
        SMALLINT ordem
        DATE data_inicio
        DATE data_fim
        NUMERIC horas_estimadas
        VARCHAR status
    }

    fase_responsaveis {
        UUID fase_id FK
        UUID colaborador_id FK
    }

    fase_dependencias {
        UUID fase_id FK
        UUID depende_de_fase_id FK
    }

    marcos_plano {
        UUID id PK
        UUID planejamento_id FK
        UUID fase_id FK
        VARCHAR titulo
        TEXT descricao
        DATE data_prevista
    }

    marcos_plano_entregaveis {
        UUID id PK
        UUID marco_plano_id FK
        TEXT descricao
    }

    requisitos_sistema {
        UUID id PK
        UUID planejamento_id FK
    }

    requisitos_funcionais {
        UUID id PK
        UUID requisito_sistema_id FK
        VARCHAR codigo
        VARCHAR titulo
        TEXT descricao
        VARCHAR prioridade
        UUID user_story_id FK
    }

    rf_criterios_aceitacao {
        UUID id PK
        UUID requisito_funcional_id FK
        TEXT criterio
    }

    requisitos_nao_funcionais {
        UUID id PK
        UUID requisito_sistema_id FK
        VARCHAR codigo
        VARCHAR titulo
        TEXT descricao
        VARCHAR categoria
        VARCHAR metrica
        VARCHAR prioridade
    }

    user_stories {
        UUID id PK
        UUID requisito_sistema_id FK
        VARCHAR codigo
        TEXT persona
        TEXT acao
        TEXT beneficio
        VARCHAR prioridade
    }

    us_criterios_aceitacao {
        UUID id PK
        UUID user_story_id FK
        TEXT criterio
    }

    us_requisitos_relacionados {
        UUID user_story_id FK
        UUID requisito_funcional_id FK
    }

    casos_uso {
        UUID id PK
        UUID requisito_sistema_id FK
        VARCHAR codigo
        VARCHAR titulo
        VARCHAR ator_principal
    }

    caso_uso_fluxos_alternativos {
        UUID id PK
        UUID caso_uso_id FK
        TEXT condicao
    }

    caso_uso_fluxo_passos {
        UUID id PK
        UUID fluxo_alternativo_id FK
        TEXT passo
        SMALLINT ordem
    }

    regras_negocio {
        UUID id PK
        UUID requisito_sistema_id FK
        VARCHAR codigo
        VARCHAR titulo
        TEXT descricao
        VARCHAR modulo
    }

    arquiteturas_tecnicas {
        UUID id PK
        UUID planejamento_id FK
        TEXT_ARRAY premissas
        TEXT_ARRAY restricoes
    }

    stack_tecnologias {
        UUID id PK
        UUID arquitetura_id FK
        VARCHAR nome
        VARCHAR versao
        VARCHAR categoria
        VARCHAR camada
        TEXT justificativa
    }

    componentes_arquitetura {
        UUID id PK
        UUID arquitetura_id FK
        VARCHAR nome
        VARCHAR tipo
        TEXT descricao
    }

    componente_dependencias {
        UUID componente_id FK
        UUID depende_de_id FK
    }

    integracoes {
        UUID id PK
        UUID arquitetura_id FK
        VARCHAR nome
        VARCHAR tipo
        TEXT descricao
        VARCHAR endpoint
        VARCHAR autenticacao
    }

    riscos_tecnicos {
        UUID id PK
        UUID arquitetura_id FK
        VARCHAR titulo
        TEXT descricao
        VARCHAR severidade
        VARCHAR probabilidade
        TEXT impacto
        TEXT mitigacao
    }

    historico_versoes_planejamento {
        UUID id PK
        UUID planejamento_id FK
        SMALLINT versao
        UUID autor_id FK
        VARCHAR acao
        TEXT descricao
        TIMESTAMPTZ data
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: PRODUTOS
    %% ─────────────────────────────────────────────
    produtos {
        UUID id PK
        UUID empresa_dona_id FK
        UUID projeto_origem_id FK
        UUID responsavel_operacao_id FK
        VARCHAR nome
        TEXT descricao
        VARCHAR status
        VARCHAR classificacao
        NUMERIC custo_desenvolvimento
        NUMERIC custo_operacao_mensal
        DATE data_lancamento
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    produto_clientes {
        UUID produto_id FK
        UUID cliente_id FK
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: CONFIGURAÇÕES & FORMULÁRIOS
    %% ─────────────────────────────────────────────
    kanban_empresa_config {
        UUID id PK
        UUID empresa_id FK
        TIMESTAMPTZ updated_at
    }

    kanban_etapa_config {
        UUID id PK
        UUID kanban_config_id FK
        VARCHAR etapa
        VARCHAR titulo
        BOOLEAN visivel
        SMALLINT ordem
    }

    formularios_empresa {
        UUID id PK
        UUID empresa_id FK
        VARCHAR titulo
        TEXT descricao
        BOOLEAN ativo
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    campos_formulario {
        UUID id PK
        UUID formulario_id FK
        VARCHAR label
        VARCHAR tipo
        BOOLEAN obrigatorio
        VARCHAR placeholder
        TEXT descricao
        SMALLINT ordem
    }

    campo_formulario_opcoes {
        UUID id PK
        UUID campo_id FK
        VARCHAR opcao
        SMALLINT ordem
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: NOTIFICAÇÕES
    %% ─────────────────────────────────────────────
    notificacoes {
        UUID id PK
        UUID tenant_id FK
        UUID usuario_id FK
        VARCHAR tipo
        VARCHAR categoria
        VARCHAR titulo
        TEXT mensagem
        BOOLEAN lida
        VARCHAR link
        UUID entidade_id
        TIMESTAMPTZ created_at
    }

    %% ─────────────────────────────────────────────
    %% DOMÍNIO: AUDITORIA
    %% ─────────────────────────────────────────────
    logs_auditoria {
        UUID id PK
        UUID tenant_id FK
        UUID usuario_id FK
        VARCHAR entidade_tipo
        UUID entidade_id
        VARCHAR acao
        VARCHAR permissao_verificada
        JSONB dados_anteriores
        JSONB dados_novos
        VARCHAR ip
        TEXT user_agent
        VARCHAR dispositivo
        TIMESTAMPTZ created_at
    }

    %% ═══════════════════════════════════════════════
    %% RELACIONAMENTOS
    %% ═══════════════════════════════════════════════

    %% Tenant → Empresas / Comitês
    tenants ||--o{ empresas : "possui"
    tenants ||--o{ comites : "possui"
    tenants ||--o{ colaboradores : "isola"
    tenants ||--o{ clientes : "isola"
    tenants ||--o{ demandas : "isola"
    tenants ||--o{ projetos : "isola"
    tenants ||--o{ tarefas : "isola"
    tenants ||--o{ notificacoes : "isola"
    tenants ||--o{ logs_auditoria : "isola"

    %% Empresas → downstream
    empresas ||--o{ usuarios : "home"
    empresas ||--o{ usuario_empresas : "acessada por"
    empresas ||--o{ vinculos_empregaticio : "vínculo"
    empresas ||--o{ demandas : "unidade apoio"
    empresas ||--o{ projetos : "dona P&L"
    empresas ||--o{ produtos : "dona"
    empresas ||--|| kanban_empresa_config : "configura kanban"
    empresas ||--o{ formularios_empresa : "formula"
    empresas ||--o{ clientes : "cliente interno"
    empresas ||--o{ setores : "possui"

    %% Setores
    setores ||--o{ colaborador_setores : "agrupa"

    %% Usuários
    usuarios ||--o{ usuario_empresas : "acessa"
    usuarios ||--o| colaboradores : "vinculado a"
    usuarios ||--o{ demandas : "solicita"
    usuarios ||--o{ historico_etapas : "executa"
    usuarios ||--o{ comites : "chefia"
    usuarios ||--o{ comite_membros : "membro"
    usuarios ||--o{ votos_comite : "vota"
    usuarios ||--o{ respostas_avaliacao : "avalia"
    usuarios ||--o{ comentarios_tarefa : "comenta"
    usuarios ||--o{ registros_horas : "aprova"
    usuarios ||--o{ notificacoes : "recebe"
    usuarios ||--o{ planejamentos_projeto : "gera"
    usuarios ||--o{ historico_versoes_planejamento : "autora"
    usuarios ||--o{ logs_auditoria : "gera"

    %% Colaboradores
    colaboradores ||--o{ vinculos_empregaticio : "tem vínculo"
    colaboradores ||--o{ colaborador_setores : "pertence"
    colaboradores ||--o{ colaborador_especialidades : "especialidade"
    colaboradores ||--o{ alocacoes : "alocado"
    colaboradores ||--o{ registros_horas : "registra"
    colaboradores ||--o{ marcos_projeto : "responsável"
    colaboradores ||--o{ fase_responsaveis : "responsável"
    colaboradores ||--o{ tarefas : "responsável"
    colaboradores ||--o{ produtos : "opera"

    %% Especialidades
    colaborador_especialidades ||--o{ colaborador_especialidade_tecnologias : "usa"

    %% Clientes
    clientes ||--o{ demanda_clientes : "em demandas"
    clientes ||--o{ projeto_clientes : "em projetos"
    clientes ||--o{ produto_clientes : "em produtos"

    %% Demandas
    demandas ||--o{ demanda_clientes : "tem"
    demandas ||--o{ anexos_demanda : "tem"
    demandas ||--o{ historico_etapas : "rastreada"
    demandas ||--o{ votos_comite : "votada"
    demandas ||--o{ respostas_avaliacao : "avaliada"
    demandas ||--o| projetos : "converte em"

    %% Comitês
    comites ||--o{ comite_membros : "tem membros"
    comites ||--o{ votos_comite : "emite votos"
    comites ||--o{ demandas : "analisa"

    %% Avaliação
    criterios_avaliacao ||--o{ perguntas_avaliacao : "tem"
    criterios_avaliacao ||--o{ respostas_avaliacao : "denorm."
    perguntas_avaliacao ||--o{ opcoes_avaliacao : "tem opções"
    perguntas_avaliacao ||--o{ respostas_avaliacao : "respondida"

    %% Projetos
    projetos ||--o{ projeto_clientes : "tem"
    projetos ||--o{ squads : "executa"
    projetos ||--o{ sprints : "tem"
    projetos ||--o{ tarefas : "tem"
    projetos ||--o{ marcos_projeto : "tem"
    projetos ||--|| planejamentos_projeto : "tem plano"
    projetos ||--o{ produtos : "origina"

    %% Squads
    squads ||--o{ alocacoes : "aloca"
    squads ||--o{ demandas : "sugerido para"

    %% Sprints & Tarefas
    sprints ||--o{ tarefas : "contém"
    tarefas ||--o{ comentarios_tarefa : "tem"
    tarefas ||--o{ registros_horas : "tem"

    %% Planejamento Técnico
    planejamentos_projeto ||--o{ fases_projeto : "tem fases"
    planejamentos_projeto ||--o{ marcos_plano : "tem marcos"
    planejamentos_projeto ||--|| requisitos_sistema : "tem requisitos"
    planejamentos_projeto ||--|| arquiteturas_tecnicas : "tem arquitetura"
    planejamentos_projeto ||--o{ historico_versoes_planejamento : "versionado"

    fases_projeto ||--o{ fase_responsaveis : "tem responsáveis"
    fases_projeto ||--o{ fase_dependencias : "tem dependências"
    fases_projeto ||--o{ marcos_plano : "associado"

    marcos_plano ||--o{ marcos_plano_entregaveis : "tem entregáveis"

    %% Requisitos
    requisitos_sistema ||--o{ requisitos_funcionais : "RF"
    requisitos_sistema ||--o{ requisitos_nao_funcionais : "RNF"
    requisitos_sistema ||--o{ user_stories : "US"
    requisitos_sistema ||--o{ casos_uso : "UC"
    requisitos_sistema ||--o{ regras_negocio : "RN"

    requisitos_funcionais ||--o{ rf_criterios_aceitacao : "critérios"
    requisitos_funcionais ||--o{ us_requisitos_relacionados : "relacionado"

    user_stories ||--o{ us_criterios_aceitacao : "critérios"
    user_stories ||--o{ us_requisitos_relacionados : "relacionada"
    user_stories ||--o{ requisitos_funcionais : "vincula RF"

    casos_uso ||--o{ caso_uso_fluxos_alternativos : "fluxos alt."
    caso_uso_fluxos_alternativos ||--o{ caso_uso_fluxo_passos : "tem passos"

    %% Arquitetura Técnica
    arquiteturas_tecnicas ||--o{ stack_tecnologias : "stack"
    arquiteturas_tecnicas ||--o{ componentes_arquitetura : "componentes"
    arquiteturas_tecnicas ||--o{ integracoes : "integrações"
    arquiteturas_tecnicas ||--o{ riscos_tecnicos : "riscos"
    componentes_arquitetura ||--o{ componente_dependencias : "depende de"

    %% Produtos
    produtos ||--o{ produto_clientes : "tem"

    %% Configurações & Formulários
    kanban_empresa_config ||--o{ kanban_etapa_config : "etapas"
    formularios_empresa ||--o{ campos_formulario : "campos"
    campos_formulario ||--o{ campo_formulario_opcoes : "opções"
```

---

## Legenda de Relacionamentos

| Símbolo | Significado |
|---|---|
| `\|\|--\|\|` | Um para um (1:1) |
| `\|\|--o{` | Um para muitos (1:N) — zero ou mais |
| `\|\|--o\|` | Um para zero ou um (1:0..1) |

## Resumo por Domínio

| Domínio | Tabelas |
|---|---|
| Tenant & Empresa | `tenants`, `empresas`, `setores` |
| Usuários & Colaboradores | `usuarios`, `usuario_empresas`, `colaboradores`, `vinculos_empregaticio`, `colaborador_setores`, `colaborador_especialidades`, `colaborador_especialidade_tecnologias` |
| Clientes | `clientes` |
| Demandas & Inovação | `demandas`, `demanda_clientes`, `anexos_demanda`, `historico_etapas`, `comites`, `comite_membros`, `votos_comite`, `criterios_avaliacao`, `perguntas_avaliacao`, `opcoes_avaliacao`, `respostas_avaliacao` |
| Projetos & Execução | `projetos`, `projeto_clientes`, `squads`, `alocacoes`, `sprints`, `tarefas`, `comentarios_tarefa`, `registros_horas`, `marcos_projeto` |
| Planejamento Técnico | `planejamentos_projeto`, `fases_projeto`, `fase_responsaveis`, `fase_dependencias`, `marcos_plano`, `marcos_plano_entregaveis`, `requisitos_sistema`, `requisitos_funcionais`, `rf_criterios_aceitacao`, `requisitos_nao_funcionais`, `user_stories`, `us_criterios_aceitacao`, `us_requisitos_relacionados`, `casos_uso`, `caso_uso_fluxos_alternativos`, `caso_uso_fluxo_passos`, `regras_negocio`, `arquiteturas_tecnicas`, `stack_tecnologias`, `componentes_arquitetura`, `componente_dependencias`, `integracoes`, `riscos_tecnicos`, `historico_versoes_planejamento` |
| Produtos | `produtos`, `produto_clientes` |
| Configurações & Formulários | `kanban_empresa_config`, `kanban_etapa_config`, `formularios_empresa`, `campos_formulario`, `campo_formulario_opcoes` |
| Notificações | `notificacoes` |
| Auditoria | `logs_auditoria` |
| **Total** | **55 tabelas** |
