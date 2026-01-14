# SGPI - Sistema de Gestão de Portfólio Integrado

Sistema corporativo para gestão integrada do ciclo de vida de iniciativas, incluindo demandas, projetos, produtos, squads e alocação de recursos humanos.

## Stack Tecnológica

- **Next.js 16** com App Router e Turbopack
- **React 19** & **TypeScript**
- **Tailwind CSS 4** para estilização
- **React Hook Form** + **Zod** para formulários e validação
- **Zustand** para gerenciamento de estado
- **TanStack Table** para tabelas avançadas
- **Recharts** para gráficos
- **Lucide React** para ícones
- **Sonner** para notificações toast

## Funcionalidades Implementadas

### RF01 - Gestão do Ciclo de Vida
- ✅ Cadastro e listagem de demandas
- ✅ Pipeline mockado de análise
- ✅ Fluxo de aprovação da comitiva
- ✅ Conversão de demanda em projeto
- ✅ Gestão de projetos com aprovação
- ✅ Conversão de projeto em produto

### RF03 - Gestão de Recursos Humanos
- ✅ CRUD completo de colaboradores
- ✅ Dashboard de ocupação
- ✅ Indicadores de sub/superalocação
- ✅ Filtros por empresa, senioridade

### RF07 - Squads Transversais
- ✅ Criação de squads
- ✅ Adição de membros com papel e percentual
- ✅ Cálculo automático de custo
- ✅ Workflow de handover

### Dashboard
- ✅ Métricas consolidadas
- ✅ Gráficos de ocupação e status
- ✅ Alertas de subalocação e pendências

### CRUDs Auxiliares
- ✅ Gestão de empresas do grupo
- ✅ Gestão de clientes

## Estrutura de Pastas

```
src/
├── app/                      # Páginas (App Router)
│   ├── colaboradores/        # Módulo RF03
│   ├── demandas/            # Módulo RF01
│   ├── projetos/            # Módulo RF01
│   ├── produtos/            # Módulo RF01
│   ├── squads/              # Módulo RF07
│   ├── empresas/            # CRUD Auxiliar
│   ├── clientes/            # CRUD Auxiliar
│   ├── page.tsx             # Dashboard
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Layout/              # Sidebar, Header
│   ├── DataTable/           # Tabela avançada
│   └── ui/                  # Button, Input, Select, Badge, Card, Modal, etc
├── stores/                  # Zustand stores com dados mockados
├── schemas/                 # Schemas Zod para validação
├── interfaces/              # TypeScript interfaces e types
└── utils/                   # Utilitários (cn, formatters, constants)
```

## Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção
npm start

# Testes
npm test
```

## Dados Mockados

O sistema inclui dados de demonstração:
- 3 empresas do grupo (Alpha, Beta, Gama)
- 18 colaboradores distribuídos
- 5 clientes (externos e internos)
- 3 demandas em diferentes status
- 2 projetos (1 em execução, 1 aguardando aprovação)
- 1 produto em operação
- 2 squads formados com alocações

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa ESLint |
| `npm run test` | Executa testes com Jest |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Relatório de cobertura |

## Navegação

- `/` - Dashboard principal
- `/demandas` - Lista e gestão de demandas
- `/projetos` - Lista e gestão de projetos
- `/produtos` - Lista de produtos em operação
- `/squads` - Gestão de squads transversais
- `/colaboradores` - Gestão de recursos humanos
- `/empresas` - Gestão de empresas do grupo
- `/clientes` - Gestão de clientes

## Licença

Projeto desenvolvido para fins de demonstração.
