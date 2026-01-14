import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  PlanejamentoProjeto,
  StatusPlanejamento,
  PlanoTrabalho,
  RequisitosSistema,
  ArquiteturaTecnica,
  FaseProjeto,
  MarcoPlano,
  RequisitoFuncional,
  RequisitoNaoFuncional,
  UserStory,
  CasoUso,
  RegraNegocio,
  HistoricoVersao,
  MarcoPlanoFormData,
} from "@/interfaces/planejamento.interface";
import { useProjetoStore } from "./projeto.store";
import { useDemandaStore } from "./demanda.store";
import { useSquadStore } from "./squad.store";
import { useColaboradorStore } from "./colaborador.store";

interface PlanejamentoState {
  planejamentos: PlanejamentoProjeto[];
  historicos: Record<string, HistoricoVersao[]>;
  isLoading: boolean;
}

interface PlanejamentoActions {
  getByProjeto: (projetoId: string) => PlanejamentoProjeto | null;
  gerarPlanejamento: (projetoId: string, geradoPorId: string) => PlanejamentoProjeto | null;
  atualizarStatus: (id: string, novoStatus: StatusPlanejamento, usuarioId: string) => void;
  aprovar: (id: string, aprovadorId: string) => void;
  regenerar: (projetoId: string, usuarioId: string) => PlanejamentoProjeto | null;
  getHistoricoVersoes: (projetoId: string) => HistoricoVersao[];
  adicionarMarco: (planejamentoId: string, marco: MarcoPlanoFormData) => void;
  setLoading: (loading: boolean) => void;
}

type PlanejamentoStore = PlanejamentoState & PlanejamentoActions;

// =====================================================
// FUNÇÕES DE GERAÇÃO MOCK
// =====================================================

const gerarFasesMock = (projetoId: string, dataInicio: Date, duracaoMeses: number): FaseProjeto[] => {
  const fases: FaseProjeto[] = [];
  const duracaoDias = duracaoMeses * 30;
  
  const fasesConfig = [
    { nome: "Discovery", descricao: "Levantamento de requisitos e entendimento do negócio", percentual: 0.1 },
    { nome: "Design", descricao: "Definição de arquitetura e design de interfaces", percentual: 0.15 },
    { nome: "Desenvolvimento", descricao: "Implementação das funcionalidades", percentual: 0.5 },
    { nome: "Testes", descricao: "Testes unitários, integração e aceitação", percentual: 0.15 },
    { nome: "Homologação", descricao: "Validação com o cliente e ajustes finais", percentual: 0.05 },
    { nome: "Deploy", descricao: "Implantação em produção e treinamento", percentual: 0.05 },
  ];

  let dataAtual = new Date(dataInicio);
  
  fasesConfig.forEach((config, index) => {
    const diasFase = Math.ceil(duracaoDias * config.percentual);
    const dataFimFase = new Date(dataAtual);
    dataFimFase.setDate(dataFimFase.getDate() + diasFase);
    
    fases.push({
      id: uuidv4(),
      nome: config.nome,
      descricao: config.descricao,
      ordem: index + 1,
      dataInicio: new Date(dataAtual),
      dataFim: dataFimFase,
      horasEstimadas: diasFase * 6, // 6 horas/dia útil médio
      responsavelIds: [],
      dependencias: index > 0 ? [fases[index - 1].id] : [],
      status: "pendente",
    });
    
    dataAtual = new Date(dataFimFase);
  });

  return fases;
};

const gerarMarcosMock = (fases: FaseProjeto[]): MarcoPlano[] => {
  const marcos: MarcoPlano[] = [];
  
  const marcosConfig: Record<string, { titulo: string; entregaveis: string[] }[]> = {
    "Discovery": [
      { titulo: "Documento de Requisitos", entregaveis: ["Requisitos funcionais", "Requisitos não-funcionais", "Regras de negócio"] },
    ],
    "Design": [
      { titulo: "Arquitetura Definida", entregaveis: ["Diagrama de arquitetura", "Stack tecnológica", "Plano de integrações"] },
      { titulo: "Protótipos de UI", entregaveis: ["Wireframes", "Mockups de alta fidelidade"] },
    ],
    "Desenvolvimento": [
      { titulo: "MVP Funcional", entregaveis: ["Core features implementadas", "API básica funcionando"] },
      { titulo: "Features Completas", entregaveis: ["Todas funcionalidades implementadas", "Integrações concluídas"] },
    ],
    "Testes": [
      { titulo: "Testes Concluídos", entregaveis: ["Relatório de testes", "Bugs corrigidos"] },
    ],
    "Homologação": [
      { titulo: "Aceite do Cliente", entregaveis: ["Termo de aceite assinado", "Ajustes finais realizados"] },
    ],
    "Deploy": [
      { titulo: "Sistema em Produção", entregaveis: ["Deploy realizado", "Documentação entregue", "Equipe treinada"] },
    ],
  };

  fases.forEach((fase) => {
    const marcosConfigurados = marcosConfig[fase.nome] || [];
    marcosConfigurados.forEach((config) => {
      marcos.push({
        id: uuidv4(),
        titulo: config.titulo,
        descricao: `Entrega do marco "${config.titulo}" da fase ${fase.nome}`,
        dataPrevista: fase.dataFim,
        faseId: fase.id,
        entregaveis: config.entregaveis,
      });
    });
  });

  return marcos;
};

const gerarRequisitosFuncionaisMock = (demandaTitulo: string, problema: string, solucao: string): RequisitoFuncional[] => {
  return [
    {
      id: uuidv4(),
      codigo: "RF01",
      titulo: "Autenticação de Usuários",
      descricao: "O sistema deve permitir que usuários se autentiquem de forma segura",
      prioridade: "essencial",
      criteriosAceitacao: [
        "Usuário deve poder fazer login com email e senha",
        "Sistema deve validar credenciais",
        "Sessão deve expirar após inatividade",
      ],
    },
    {
      id: uuidv4(),
      codigo: "RF02",
      titulo: "Dashboard Principal",
      descricao: `Tela inicial com visão geral relacionada a: ${demandaTitulo}`,
      prioridade: "essencial",
      criteriosAceitacao: [
        "Exibir métricas principais",
        "Permitir navegação para módulos",
        "Carregar em menos de 3 segundos",
      ],
    },
    {
      id: uuidv4(),
      codigo: "RF03",
      titulo: "Solução do Problema Principal",
      descricao: `Funcionalidade que resolve: ${problema.substring(0, 100)}...`,
      prioridade: "essencial",
      criteriosAceitacao: [
        "Implementar solução conforme especificado",
        "Validar com usuários afetados",
        "Documentar processo",
      ],
    },
    {
      id: uuidv4(),
      codigo: "RF04",
      titulo: "Gestão de Dados",
      descricao: "CRUD completo para as entidades principais do sistema",
      prioridade: "importante",
      criteriosAceitacao: [
        "Criar, ler, atualizar e excluir registros",
        "Validar dados de entrada",
        "Exibir mensagens de erro apropriadas",
      ],
    },
    {
      id: uuidv4(),
      codigo: "RF05",
      titulo: "Relatórios e Exportação",
      descricao: "Geração de relatórios e exportação de dados",
      prioridade: "desejavel",
      criteriosAceitacao: [
        "Gerar relatórios em PDF",
        "Exportar dados em CSV/Excel",
        "Filtrar dados por período",
      ],
    },
  ];
};

const gerarRequisitosNaoFuncionaisMock = (): RequisitoNaoFuncional[] => {
  return [
    {
      id: uuidv4(),
      codigo: "RNF01",
      titulo: "Performance",
      descricao: "O sistema deve responder rapidamente às requisições",
      categoria: "performance",
      metrica: "Tempo de resposta < 500ms para 95% das requisições",
      prioridade: "essencial",
    },
    {
      id: uuidv4(),
      codigo: "RNF02",
      titulo: "Segurança",
      descricao: "O sistema deve proteger dados sensíveis",
      categoria: "seguranca",
      metrica: "Criptografia AES-256 para dados em repouso",
      prioridade: "essencial",
    },
    {
      id: uuidv4(),
      codigo: "RNF03",
      titulo: "Disponibilidade",
      descricao: "O sistema deve estar disponível para uso",
      categoria: "disponibilidade",
      metrica: "Uptime de 99.5%",
      prioridade: "importante",
    },
    {
      id: uuidv4(),
      codigo: "RNF04",
      titulo: "Usabilidade",
      descricao: "O sistema deve ser fácil de usar",
      categoria: "usabilidade",
      metrica: "Tempo de aprendizado < 2 horas",
      prioridade: "importante",
    },
    {
      id: uuidv4(),
      codigo: "RNF05",
      titulo: "Escalabilidade",
      descricao: "O sistema deve suportar crescimento",
      categoria: "escalabilidade",
      metrica: "Suportar 1000 usuários simultâneos",
      prioridade: "desejavel",
    },
  ];
};

const gerarUserStoriesMock = (problema: string, quemSofre: string): UserStory[] => {
  return [
    {
      id: uuidv4(),
      codigo: "US01",
      persona: quemSofre || "Usuário",
      acao: "acessar o sistema de forma segura",
      beneficio: "ter meus dados protegidos",
      criteriosAceitacao: [
        "Login com email e senha",
        "Recuperação de senha por email",
        "Logout seguro",
      ],
      prioridade: "essencial",
      requisitosRelacionados: [],
    },
    {
      id: uuidv4(),
      codigo: "US02",
      persona: quemSofre || "Usuário",
      acao: "visualizar informações relevantes no dashboard",
      beneficio: "ter uma visão rápida do status",
      criteriosAceitacao: [
        "Métricas principais visíveis",
        "Gráficos interativos",
        "Atualização automática",
      ],
      prioridade: "essencial",
      requisitosRelacionados: [],
    },
    {
      id: uuidv4(),
      codigo: "US03",
      persona: quemSofre || "Usuário",
      acao: `resolver o problema de: ${problema.substring(0, 50)}...`,
      beneficio: "aumentar minha produtividade",
      criteriosAceitacao: [
        "Processo simplificado",
        "Feedback em tempo real",
        "Histórico de ações",
      ],
      prioridade: "essencial",
      requisitosRelacionados: [],
    },
    {
      id: uuidv4(),
      codigo: "US04",
      persona: "Administrador",
      acao: "gerenciar usuários do sistema",
      beneficio: "controlar acesso e permissões",
      criteriosAceitacao: [
        "Criar e editar usuários",
        "Definir permissões",
        "Desativar usuários",
      ],
      prioridade: "importante",
      requisitosRelacionados: [],
    },
  ];
};

const gerarCasosUsoMock = (): CasoUso[] => {
  return [
    {
      id: uuidv4(),
      codigo: "UC01",
      titulo: "Realizar Login",
      atorPrincipal: "Usuário",
      preCondicoes: ["Usuário possui cadastro no sistema"],
      fluxoPrincipal: [
        "Usuário acessa a página de login",
        "Sistema exibe formulário de login",
        "Usuário informa email e senha",
        "Sistema valida credenciais",
        "Sistema redireciona para dashboard",
      ],
      fluxosAlternativos: [
        {
          id: uuidv4(),
          condicao: "Credenciais inválidas",
          passos: ["Sistema exibe mensagem de erro", "Usuário pode tentar novamente"],
        },
      ],
      posCondicoes: ["Usuário está autenticado no sistema"],
    },
    {
      id: uuidv4(),
      codigo: "UC02",
      titulo: "Cadastrar Registro",
      atorPrincipal: "Usuário",
      preCondicoes: ["Usuário está autenticado", "Usuário tem permissão de cadastro"],
      fluxoPrincipal: [
        "Usuário acessa módulo de cadastro",
        "Sistema exibe formulário vazio",
        "Usuário preenche dados obrigatórios",
        "Usuário confirma cadastro",
        "Sistema valida e salva dados",
        "Sistema exibe confirmação",
      ],
      fluxosAlternativos: [
        {
          id: uuidv4(),
          condicao: "Dados inválidos",
          passos: ["Sistema destaca campos com erro", "Usuário corrige dados"],
        },
      ],
      posCondicoes: ["Registro criado no sistema"],
    },
  ];
};

const gerarRegrasNegocioMock = (): RegraNegocio[] => {
  return [
    {
      id: uuidv4(),
      codigo: "RN01",
      titulo: "Validação de Email",
      descricao: "Email deve ser único e ter formato válido",
      modulo: "Autenticação",
    },
    {
      id: uuidv4(),
      codigo: "RN02",
      titulo: "Permissões por Perfil",
      descricao: "Usuários só acessam funcionalidades permitidas pelo seu perfil",
      modulo: "Autorização",
    },
    {
      id: uuidv4(),
      codigo: "RN03",
      titulo: "Auditoria de Ações",
      descricao: "Toda ação crítica deve ser registrada em log",
      modulo: "Segurança",
    },
  ];
};

const gerarArquiteturaMock = (horizonte: string): ArquiteturaTecnica => {
  const isSimples = horizonte === "h1_curto_prazo";
  
  return {
    id: uuidv4(),
    projetoId: "",
    stackSugerida: {
      frontend: [
        { nome: "React", versao: "19.x", categoria: "framework", justificativa: "Framework moderno e amplamente adotado" },
        { nome: "Next.js", versao: "15.x", categoria: "framework", justificativa: "SSR, rotas e otimizações built-in" },
        { nome: "TypeScript", versao: "5.x", categoria: "linguagem", justificativa: "Tipagem estática para maior segurança" },
        { nome: "Tailwind CSS", versao: "4.x", categoria: "biblioteca", justificativa: "Estilização rápida e consistente" },
      ],
      backend: isSimples ? [
        { nome: "Node.js", versao: "22.x", categoria: "linguagem", justificativa: "JavaScript no servidor, equipe unificada" },
        { nome: "Express", versao: "5.x", categoria: "framework", justificativa: "Framework leve e flexível" },
      ] : [
        { nome: "Python", versao: "3.12", categoria: "linguagem", justificativa: "Linguagem versátil com rico ecossistema" },
        { nome: "FastAPI", versao: "0.110", categoria: "framework", justificativa: "Alta performance e documentação automática" },
      ],
      banco: [
        { nome: "PostgreSQL", versao: "16", categoria: "ferramenta", justificativa: "Banco relacional robusto e confiável" },
        { nome: "Redis", versao: "7.x", categoria: "ferramenta", justificativa: "Cache e sessões de alta performance" },
      ],
      infra: [
        { nome: "Docker", versao: "latest", categoria: "infra", justificativa: "Containerização para ambientes consistentes" },
        { nome: "AWS", categoria: "infra", justificativa: "Cloud provider líder com serviços maduros" },
      ],
      outros: [
        { nome: "Git", categoria: "ferramenta", justificativa: "Controle de versão padrão de mercado" },
        { nome: "GitHub Actions", categoria: "ferramenta", justificativa: "CI/CD integrado ao repositório" },
      ],
    },
    componentes: [
      {
        id: uuidv4(),
        nome: "Frontend Web",
        tipo: "frontend",
        descricao: "Aplicação web responsiva para usuários finais",
        responsabilidades: ["Interface de usuário", "Validações client-side", "Comunicação com API"],
        tecnologias: ["React", "Next.js", "TypeScript"],
        dependencias: [],
      },
      {
        id: uuidv4(),
        nome: "API REST",
        tipo: "api",
        descricao: "API para comunicação entre frontend e backend",
        responsabilidades: ["Endpoints REST", "Autenticação", "Validação de dados"],
        tecnologias: isSimples ? ["Node.js", "Express"] : ["Python", "FastAPI"],
        dependencias: [],
      },
      {
        id: uuidv4(),
        nome: "Banco de Dados",
        tipo: "banco",
        descricao: "Armazenamento persistente de dados",
        responsabilidades: ["Persistência", "Integridade referencial", "Backup"],
        tecnologias: ["PostgreSQL"],
        dependencias: [],
      },
    ],
    integracoes: [
      {
        id: uuidv4(),
        nome: "Serviço de Email",
        tipo: "servico_terceiro",
        descricao: "Envio de emails transacionais",
        autenticacao: "API Key",
        observacoes: "Considerar SendGrid ou Amazon SES",
      },
    ],
    riscos: [
      {
        id: uuidv4(),
        titulo: "Complexidade de Integrações",
        descricao: "Integrações com sistemas externos podem apresentar desafios",
        severidade: "media",
        probabilidade: "media",
        impacto: "Atrasos no cronograma",
        mitigacao: "Iniciar integrações cedo, criar mocks para desenvolvimento paralelo",
      },
      {
        id: uuidv4(),
        titulo: "Mudanças de Requisitos",
        descricao: "Requisitos podem mudar durante o desenvolvimento",
        severidade: "media",
        probabilidade: "alta",
        impacto: "Retrabalho e ajustes de escopo",
        mitigacao: "Metodologia ágil com entregas incrementais",
      },
      {
        id: uuidv4(),
        titulo: "Disponibilidade da Equipe",
        descricao: "Membros do squad podem ser realocados",
        severidade: "alta",
        probabilidade: "baixa",
        impacto: "Atrasos significativos",
        mitigacao: "Documentação detalhada e pair programming",
      },
    ],
    premissas: [
      "Equipe com conhecimento nas tecnologias sugeridas",
      "Ambiente de desenvolvimento disponível",
      "Requisitos estáveis após fase de discovery",
      "Cliente disponível para validações",
    ],
    restricoes: [
      "Prazo definido no projeto",
      "Orçamento aprovado",
      "Conformidade com políticas de segurança da empresa",
    ],
  };
};

// =====================================================
// STORE
// =====================================================

export const usePlanejamentoStore = create<PlanejamentoStore>((set, get) => ({
  planejamentos: [],
  historicos: {},
  isLoading: false,

  getByProjeto: (projetoId: string) => {
    return get().planejamentos.find((p) => p.projetoId === projetoId) || null;
  },

  gerarPlanejamento: (projetoId: string, geradoPorId: string) => {
    const projeto = useProjetoStore.getState().getById(projetoId);
    if (!projeto || !projeto.demandaId) {
      return null;
    }

    const demanda = useDemandaStore.getState().getById(projeto.demandaId);
    if (!demanda) {
      return null;
    }

    // Calcular duração em meses
    const dataInicio = projeto.dataInicio || new Date();
    const dataFim = projeto.dataFimPrevista || new Date(dataInicio.getTime() + 180 * 24 * 60 * 60 * 1000);
    const duracaoMeses = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (30 * 24 * 60 * 60 * 1000));

    // Gerar fases e marcos
    const fases = gerarFasesMock(projetoId, dataInicio, duracaoMeses);
    const marcos = gerarMarcosMock(fases);

    // Gerar plano de trabalho
    const planoTrabalho: PlanoTrabalho = {
      id: uuidv4(),
      projetoId,
      fases,
      marcos,
      estimativaTotal: {
        totalHoras: fases.reduce((acc, f) => acc + f.horasEstimadas, 0),
        porEspecialidade: [
          { especialidade: "Backend", horas: Math.round(fases.reduce((acc, f) => acc + f.horasEstimadas, 0) * 0.4) },
          { especialidade: "Frontend", horas: Math.round(fases.reduce((acc, f) => acc + f.horasEstimadas, 0) * 0.35) },
          { especialidade: "QA", horas: Math.round(fases.reduce((acc, f) => acc + f.horasEstimadas, 0) * 0.15) },
          { especialidade: "DevOps", horas: Math.round(fases.reduce((acc, f) => acc + f.horasEstimadas, 0) * 0.1) },
        ],
        porFase: fases.map((f) => ({ faseId: f.id, horas: f.horasEstimadas })),
      },
      cronogramaMacro: {
        dataInicioPrevista: dataInicio,
        dataFimPrevista: dataFim,
        duracaoSemanas: Math.ceil(duracaoMeses * 4),
        fases: fases.map((f) => ({
          faseId: f.id,
          nome: f.nome,
          inicio: f.dataInicio,
          fim: f.dataFim,
          percentualDuracao: Math.round((f.horasEstimadas / fases.reduce((acc, fase) => acc + fase.horasEstimadas, 0)) * 100),
        })),
      },
    };

    // Gerar requisitos
    const requisitos: RequisitosSistema = {
      id: uuidv4(),
      projetoId,
      funcionais: gerarRequisitosFuncionaisMock(demanda.titulo, demanda.problemaResolver, demanda.ideiaSolucao),
      naoFuncionais: gerarRequisitosNaoFuncionaisMock(),
      userStories: gerarUserStoriesMock(demanda.problemaResolver, demanda.quemSofreProblema),
      casosUso: gerarCasosUsoMock(),
      regrasNegocio: gerarRegrasNegocioMock(),
    };

    // Gerar arquitetura
    const arquitetura = gerarArquiteturaMock(demanda.horizonteInovacao);
    arquitetura.projetoId = projetoId;

    // Criar planejamento
    const novoPlanejamento: PlanejamentoProjeto = {
      id: uuidv4(),
      projetoId,
      status: "rascunho",
      versao: 1,
      planoTrabalho,
      requisitos,
      arquitetura,
      geradoEm: new Date(),
      geradoPor: geradoPorId,
    };

    // Registrar histórico
    const historico: HistoricoVersao = {
      versao: 1,
      data: new Date(),
      autor: geradoPorId,
      acao: "criacao",
      descricao: "Planejamento gerado automaticamente",
    };

    set((state) => ({
      planejamentos: [...state.planejamentos, novoPlanejamento],
      historicos: {
        ...state.historicos,
        [projetoId]: [historico],
      },
    }));

    return novoPlanejamento;
  },

  atualizarStatus: (id: string, novoStatus: StatusPlanejamento, usuarioId: string) => {
    set((state) => ({
      planejamentos: state.planejamentos.map((p) => {
        if (p.id === id) {
          const updated = {
            ...p,
            status: novoStatus,
            editadoEm: new Date(),
            editadoPor: usuarioId,
          };
          
          if (novoStatus === "em_revisao") {
            updated.enviadoParaRevisaoEm = new Date();
            updated.enviadoParaRevisaoPor = usuarioId;
          }
          
          return updated;
        }
        return p;
      }),
    }));

    // Adicionar ao histórico
    const planejamento = get().planejamentos.find((p) => p.id === id);
    if (planejamento) {
      const historico: HistoricoVersao = {
        versao: planejamento.versao,
        data: new Date(),
        autor: usuarioId,
        acao: "edicao",
        descricao: `Status alterado para ${novoStatus}`,
      };

      set((state) => ({
        historicos: {
          ...state.historicos,
          [planejamento.projetoId]: [...(state.historicos[planejamento.projetoId] || []), historico],
        },
      }));
    }
  },

  aprovar: (id: string, aprovadorId: string) => {
    set((state) => ({
      planejamentos: state.planejamentos.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "aprovado" as StatusPlanejamento,
              aprovadoEm: new Date(),
              aprovadoPor: aprovadorId,
            }
          : p
      ),
    }));

    // Adicionar ao histórico
    const planejamento = get().planejamentos.find((p) => p.id === id);
    if (planejamento) {
      const historico: HistoricoVersao = {
        versao: planejamento.versao,
        data: new Date(),
        autor: aprovadorId,
        acao: "aprovacao",
        descricao: "Planejamento aprovado",
      };

      set((state) => ({
        historicos: {
          ...state.historicos,
          [planejamento.projetoId]: [...(state.historicos[planejamento.projetoId] || []), historico],
        },
      }));
    }
  },

  regenerar: (projetoId: string, usuarioId: string) => {
    const planejamentoExistente = get().getByProjeto(projetoId);
    
    // Remover planejamento existente
    if (planejamentoExistente) {
      set((state) => ({
        planejamentos: state.planejamentos.filter((p) => p.projetoId !== projetoId),
      }));
    }

    // Gerar novo
    const novoPlanejamento = get().gerarPlanejamento(projetoId, usuarioId);
    
    if (novoPlanejamento && planejamentoExistente) {
      // Atualizar versão
      set((state) => ({
        planejamentos: state.planejamentos.map((p) =>
          p.id === novoPlanejamento.id
            ? { ...p, versao: planejamentoExistente.versao + 1 }
            : p
        ),
      }));

      // Adicionar ao histórico
      const historico: HistoricoVersao = {
        versao: planejamentoExistente.versao + 1,
        data: new Date(),
        autor: usuarioId,
        acao: "regeneracao",
        descricao: "Planejamento regenerado",
      };

      set((state) => ({
        historicos: {
          ...state.historicos,
          [projetoId]: [...(state.historicos[projetoId] || []), historico],
        },
      }));
    }

    return novoPlanejamento;
  },

  getHistoricoVersoes: (projetoId: string) => {
    return get().historicos[projetoId] || [];
  },

  adicionarMarco: (planejamentoId: string, marcoData: MarcoPlanoFormData) => {
    const novoMarco: MarcoPlano = {
      id: uuidv4(),
      ...marcoData,
    };

    set((state) => ({
      planejamentos: state.planejamentos.map((p) =>
        p.id === planejamentoId
          ? {
              ...p,
              planoTrabalho: {
                ...p.planoTrabalho,
                marcos: [...p.planoTrabalho.marcos, novoMarco],
              },
              editadoEm: new Date(),
            }
          : p
      ),
    }));
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
