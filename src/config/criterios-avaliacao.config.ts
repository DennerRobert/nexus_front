import type { CriterioAvaliacao } from "@/interfaces/avaliacao-demanda.interface";

// Configuração dos 6 critérios e 11 perguntas de avaliação
export const CRITERIOS_AVALIACAO: CriterioAvaliacao[] = [
  {
    id: "criterio_1",
    nome: "Clareza e Relevância do Problema",
    descricao: "Avalia o quão bem a ideia identifica e aborda um problema real e significativo para um público-alvo específico.",
    peso: 20,
    perguntas: [
      {
        id: "pergunta_1_1",
        criterioId: "criterio_1",
        texto: "Quão claro e bem definido é o problema que a ideia se propõe a resolver?",
        opcoes: [
          { valor: 1, descricao: "O problema não está claro ou é muito genérico." },
          { valor: 2, descricao: "O problema é vagamente definido, com pouca especificidade." },
          { valor: 3, descricao: "O problema é razoavelmente claro, mas poderia ser mais detalhado." },
          { valor: 4, descricao: "O problema é claro e bem definido." },
          { valor: 5, descricao: "O problema é extremamente claro, específico e fácil de entender." },
        ],
      },
      {
        id: "pergunta_1_2",
        criterioId: "criterio_1",
        texto: "Qual a relevância e a intensidade da dor ou necessidade que este problema causa ao público-alvo?",
        opcoes: [
          { valor: 1, descricao: "O problema não parece causar dor significativa ou é facilmente contornável." },
          { valor: 2, descricao: "O problema causa uma dor leve ou é percebido por poucos." },
          { valor: 3, descricao: "O problema é relevante para o público-alvo, mas não é uma prioridade urgente." },
          { valor: 4, descricao: "O problema causa uma dor significativa e é uma prioridade para o público-alvo." },
          { valor: 5, descricao: "O problema é crítico, causa grande frustração ou custo, e é uma dor latente para o público-alvo." },
        ],
      },
    ],
  },
  {
    id: "criterio_2",
    nome: "Originalidade e Diferenciação da Solução",
    descricao: "Avalia o grau de inovação da solução proposta e seu diferencial competitivo em relação a alternativas existentes.",
    peso: 15,
    perguntas: [
      {
        id: "pergunta_2_1",
        criterioId: "criterio_2",
        texto: "Quão original ou inovadora é a solução proposta em relação às soluções existentes no mercado?",
        opcoes: [
          { valor: 1, descricao: "A solução é uma cópia direta de algo existente, sem diferenciais." },
          { valor: 2, descricao: "A solução apresenta pequenas melhorias em relação a algo existente." },
          { valor: 3, descricao: "A solução é uma combinação de elementos existentes, com alguma novidade." },
          { valor: 4, descricao: "A solução apresenta um diferencial claro e inovador em relação à concorrência." },
          { valor: 5, descricao: "A solução é disruptiva, criando um novo mercado ou transformando radicalmente um existente." },
        ],
      },
      {
        id: "pergunta_2_2",
        criterioId: "criterio_2",
        texto: "Qual o potencial da solução para criar uma vantagem competitiva sustentável?",
        opcoes: [
          { valor: 1, descricao: "Nenhum potencial de vantagem competitiva sustentável." },
          { valor: 2, descricao: "Potencial limitado, facilmente replicável pela concorrência." },
          { valor: 3, descricao: "Algum potencial, mas exige esforço contínuo para manter a vantagem." },
          { valor: 4, descricao: "Bom potencial para criar uma vantagem competitiva duradoura." },
          { valor: 5, descricao: "Alto potencial para criar uma barreira de entrada significativa para a concorrência." },
        ],
      },
    ],
  },
  {
    id: "criterio_3",
    nome: "Alinhamento Estratégico",
    descricao: "Verifica se a ideia está alinhada com a visão, missão e objetivos estratégicos da empresa.",
    peso: 20,
    perguntas: [
      {
        id: "pergunta_3_1",
        criterioId: "criterio_3",
        texto: "Em que medida a ideia contribui para os objetivos estratégicos de longo prazo da empresa?",
        opcoes: [
          { valor: 1, descricao: "Não há alinhamento aparente com os objetivos estratégicos." },
          { valor: 2, descricao: "Alinhamento mínimo ou indireto." },
          { valor: 3, descricao: "Alinhamento razoável com alguns objetivos estratégicos." },
          { valor: 4, descricao: "Bom alinhamento com múltiplos objetivos estratégicos." },
          { valor: 5, descricao: "Alinhamento perfeito e direto com os principais pilares estratégicos da empresa." },
        ],
      },
      {
        id: "pergunta_3_2",
        criterioId: "criterio_3",
        texto: "A ideia se encaixa na cultura e nos valores da organização?",
        opcoes: [
          { valor: 1, descricao: "A ideia vai contra a cultura ou valores da empresa." },
          { valor: 2, descricao: "A ideia é neutra em relação à cultura, mas pode gerar resistência." },
          { valor: 3, descricao: "A ideia é compatível com a cultura, mas não a fortalece ativamente." },
          { valor: 4, descricao: "A ideia se encaixa bem na cultura e pode ser facilmente adotada." },
          { valor: 5, descricao: "A ideia fortalece ativamente a cultura de inovação e os valores da empresa." },
        ],
      },
    ],
  },
  {
    id: "criterio_4",
    nome: "Viabilidade Técnica e Operacional",
    descricao: "Avalia a capacidade da empresa de desenvolver e implementar a solução com os recursos e conhecimentos existentes ou acessíveis.",
    peso: 15,
    perguntas: [
      {
        id: "pergunta_4_1",
        criterioId: "criterio_4",
        texto: "A empresa possui (ou pode adquirir facilmente) a tecnologia e o conhecimento técnico necessários para desenvolver esta solução?",
        opcoes: [
          { valor: 1, descricao: "A tecnologia ou conhecimento necessário é inexistente ou muito difícil de adquirir." },
          { valor: 2, descricao: "A tecnologia ou conhecimento é um desafio significativo, exigindo grande investimento." },
          { valor: 3, descricao: "A tecnologia ou conhecimento é acessível, mas requer aprendizado e adaptação." },
          { valor: 4, descricao: "A empresa já possui grande parte da tecnologia e conhecimento necessários." },
          { valor: 5, descricao: "A empresa possui toda a tecnologia e conhecimento necessários, ou a aquisição é trivial." },
        ],
      },
      {
        id: "pergunta_4_2",
        criterioId: "criterio_4",
        texto: "A implementação da ideia é operacionalmente viável dentro da estrutura e processos atuais da empresa?",
        opcoes: [
          { valor: 1, descricao: "A implementação exigiria uma reestruturação operacional completa e complexa." },
          { valor: 2, descricao: "A implementação exigiria mudanças operacionais significativas e desafiadoras." },
          { valor: 3, descricao: "A implementação exigiria algumas adaptações operacionais." },
          { valor: 4, descricao: "A implementação se encaixa bem nos processos operacionais existentes." },
          { valor: 5, descricao: "A implementação é totalmente compatível com a operação atual, ou até a simplifica." },
        ],
      },
    ],
  },
  {
    id: "criterio_5",
    nome: "Potencial de Retorno e Mercado",
    descricao: "Avalia o potencial da ideia para gerar valor financeiro e o tamanho do mercado que ela pode atingir.",
    peso: 20,
    perguntas: [
      {
        id: "pergunta_5_1",
        criterioId: "criterio_5",
        texto: "Qual o potencial de retorno financeiro (receita, economia de custos, lucratividade) desta ideia para a empresa?",
        opcoes: [
          { valor: 1, descricao: "Potencial de retorno financeiro muito baixo ou inexistente." },
          { valor: 2, descricao: "Potencial de retorno financeiro limitado, com payback longo." },
          { valor: 3, descricao: "Potencial de retorno financeiro razoável, com payback aceitável." },
          { valor: 4, descricao: "Bom potencial de retorno financeiro, com payback rápido." },
          { valor: 5, descricao: "Alto potencial de retorno financeiro, com impacto significativo na receita/lucratividade." },
        ],
      },
      {
        id: "pergunta_5_2",
        criterioId: "criterio_5",
        texto: "Qual o tamanho e o potencial de crescimento do mercado ou segmento de clientes que a ideia visa atingir?",
        opcoes: [
          { valor: 1, descricao: "Mercado muito pequeno ou em declínio." },
          { valor: 2, descricao: "Mercado pequeno, com pouco potencial de crescimento." },
          { valor: 3, descricao: "Mercado de tamanho razoável, com crescimento estável." },
          { valor: 4, descricao: "Mercado grande e em crescimento." },
          { valor: 5, descricao: "Mercado vasto e com alto potencial de crescimento exponencial." },
        ],
      },
    ],
  },
  {
    id: "criterio_6",
    nome: "Esforço e Recursos Necessários",
    descricao: "Avalia a estimativa inicial de tempo e recursos (financeiros e humanos) necessários para desenvolver a ideia até a próxima fase.",
    peso: 10,
    perguntas: [
      {
        id: "pergunta_6_1",
        criterioId: "criterio_6",
        texto: "Qual o nível de esforço (tempo e recursos) estimado para levar esta ideia à próxima fase de validação?",
        opcoes: [
          { valor: 1, descricao: "Esforço muito alto, exigindo grande investimento de tempo e recursos." },
          { valor: 2, descricao: "Esforço alto, com desafios significativos de tempo e recursos." },
          { valor: 3, descricao: "Esforço moderado, com recursos e tempo gerenciáveis." },
          { valor: 4, descricao: "Esforço baixo, com recursos e tempo facilmente disponíveis." },
          { valor: 5, descricao: "Esforço muito baixo, podendo ser validado rapidamente com poucos recursos." },
        ],
      },
    ],
  },
];

// Total de perguntas
export const TOTAL_PERGUNTAS = CRITERIOS_AVALIACAO.reduce(
  (acc, criterio) => acc + criterio.perguntas.length,
  0
);

// Helper para obter todas as perguntas em uma lista flat
export const TODAS_PERGUNTAS = CRITERIOS_AVALIACAO.flatMap((c) => c.perguntas);

// Helper para obter critério por ID
export const getCriterioById = (id: string) =>
  CRITERIOS_AVALIACAO.find((c) => c.id === id);

// Helper para obter pergunta por ID
export const getPerguntaById = (id: string) =>
  TODAS_PERGUNTAS.find((p) => p.id === id);
