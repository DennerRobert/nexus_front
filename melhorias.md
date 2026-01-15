# 1. Criação de lógica de autenticação de usuário (Mockado)

shdfusdfuhsdfuhsaduhfsdufsuhd

# 2. Criar lógica de permissões e perfis (Mockado)

## Perfis:
    - Administrador
    - Gestor de inovação
    - Analista de inovação
    - Assistente de inivação
    - PO (Product Owner)
    - Especialistas multidisciplinares
    - Cliente
    - Comercial

## Lógicas do sistema e perfis:
    - Especialista multidisciplinar
	    Poderá ser integrante de N squads
	    Também poderá ser TechLeader em projeto x e 'Especialista multidisciplinar' no projeto Y
    - PO (Product Owner)
	    Poderá ser integrante de N squads


## Mapeamento de perfis e suas permissões

Perfis e permissões - Módulo de demandas:

    - Administrador - Tudo
    - Gestor de inovação - Tudo
    - Analista de inovação - Tudo
    - Assistente de inivação - Tudo
    - PO (Product Owner)
        Submeter demanda
        visualizar a vitrine de ideias
    - Especialistas multidisciplinares
        Submeter demanda
        visualizar a vitrine de ideias
    - Cliente
        Submeter demanda
        visualizar a vitrine de ideias
    - Comercial
        Submeter demanda
        visualizar a vitrine de ideias

Perfis e permissões - Módulo de projetos:

    - Administrador - Tudo
    - Gestor de inovação
        Visualização de todos os projetos e todas as empresas que ele faz parte	
        Do projeto, só poderá ver as informações das abas de 'Detalhes' e 'Acompanhamento'
    - Analista de inovação
        Visualização de todos os projetos e todas as empresas que ele faz parte
        Do projeto, só poderá ver as informações das abas de 'Detalhes' e 'Acompanhamento'
    - Assistente de inivação
        Visualização de todos os projetos e todas as empresas que ele faz parte
        Do projeto, só poderá ver as informações das abas de 'Detalhes' e 'Acompanhamento'
    - PO (Product Owner)

    - Especialistas multidisciplinares

    - Cliente

    - Comercial

Perfis e permissões - Módulo de produto:

    - Administrador - Tudo

Perfis e permissões - Módulo de Squads:

    - Administrador - Tudo

Perfis e permissões - Módulo de colaboradores:

    OBS: será mudado para 'Especialistas multidisciplinares'

    - Administrador - Tudo

Perfis e permissões - Módulo de empresas:

    - Administrador - Tudo

Perfis e permissões - Módulo de clientes:

    - Administrador - Tudo

Perfis e permissões - Dashboard:

    - Administrador - Tudo

# 3. Melhorias no módulo de demandas

## Tela de criação de demanda:
    - Retirar obrigatoriedade de selecionar cliente
    - Adicionar campo de anexo (multiplos arquivos)
    - Adicionar descrições/orientações dos campos do formulário
    - Adicionar checkbox para dizer se a demanda irá ou não aparecer na vitrine de ideias

## Tela de listagem das demandas
    - Adicionar uma segunda opção de visualização de mandas utilizando o kanban com as etapas: Ideia recebida, Analise inicial, Analise comitê, devolução proponente, readequação recebida, validação do problema, encaminhado grupo de trabalho, arquivado, fora do time estrategico e concluido

## Tela de detalhamento / visualizaçaõ de demanda
    - Adicionar seção com formulário para critério de avalição da ideia submetida. 

## Lógica de mudança de status / etapa
    - A demanda só poderá sair do status 'Ideia recebida' quando todos os campos de "critérios" sejam preenchidos.
    - Notificar solicitante após mudanla de status
    - Precisará ter a aprovação de pelo menos 51% dos membros do comitê e aprovação do chefe do comitê ou apenas a aprovação do chefe do comitê para prosseguir para etapa de 'encaminhado grupo de trabalho'
    - A definição de sugestão de Squad pela I.A será feita após a aprovação da etapa de 'validação do problema' ou solicitado manualmente pelo chefe do comitê


## Fluxos entre as etapas

    - Ideia recebida sempre irá para analise inicial

    - Analise inicial:
	    Poderá ir para analise para comitê
	    Poderá ir para devolução proponente
	    Poderá ir para validaçaõ de problema
	    Poderá ir para 'encaminhado grupo de trabalho'
	    Poderá ir para arquivado (precisa de justificativa)

    - Analise do comitê
	    Poderá ir para devolução proponente
	    Poderá ir para validaçaõ de problema
	    Poderá ir para 'encaminhado grupo de trabalho' (Só poderá vim para esse status com a aprovação do chefe do comitê/comitiva)
	    Poderá ir para arquivado (precisa de justificativa)
	    Poderá ir para 'fora do time estrategico'

    - devolução proponente
    	Poderá ir para readequação recebida

    - readequação recebida
	    Poderá ir para analise para comitê
	    Poderá ir para devolução proponente
	    Poderá ir para validaçaõ de problema
	    Poderá ir para 'encaminhado grupo de trabalho'
	    Poderá ir para arquivado (precisa de justificativa)
	
    - validaçaõ de problema
	    Poderá ir para 'encaminhado grupo de trabalho'
	    Poderá ir para arquivado (precisa de justificativa)
	    Poderá ir para 'fora do time estrategico'

    - encaminhado grupo de trabalho (Fluxo de projetos - Criação de projeto)
	    Poderá ir para concluído

    - fora do time estrategico
	    Poderá ir para analise para comitê

    - arquivado
	    Poderá ir para analise para comitê

    - concluido
	    Não poderá mais sair desse status
