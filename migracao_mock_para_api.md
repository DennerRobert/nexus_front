# Migração Mock → API: Fases 1 e 2

Documentação técnica das fases de infraestrutura implementadas para preparar o frontend para integração com o backend Django, mantendo a aplicação 100% funcional durante o processo.

---

## Contexto

Antes das fases, toda a aplicação consumia dados de um único arquivo `src/utils/mock-data.ts` — um módulo TypeScript com dados gerados em memória no momento da importação. Isso funcionava para o desenvolvimento inicial, mas criava três problemas sérios:

1. **IDs instáveis**: `uuidv4()` é chamado na importação do módulo. Cada reinicialização do servidor gerava IDs diferentes, corrompendo qualquer dado salvo no `localStorage` via Zustand `persist`.
2. **Sem contrato de API**: não havia separação entre "quem busca os dados" e "como os dados são gerados". Integrar o Django exigiria reescrever stores e componentes.
3. **Acoplamento total**: stores, cálculos e dados mock viviam misturados, dificultando testes e manutenção.

---

## Fase 1 — Infraestrutura Base

**Objetivo**: criar os alicerces do sistema de API sem tocar em nenhum componente ou store existente.

### 1.1 · `src/lib/api-client.ts`

Cliente HTTP centralizado, construído sobre o `fetch` nativo do browser.

**Por que é importante:**

- Toda chamada de API da aplicação passa por um único ponto. Isso significa que quando o Django estiver pronto, basta alterar a variável de ambiente `NEXT_PUBLIC_API_URL` e **todos** os serviços apontam para o novo backend sem nenhuma outra mudança.
- Implementa tratamento de erro padronizado: erros HTTP (401, 403, 5xx) exibem toasts automaticamente via `sonner`, liberando os services e stores dessa responsabilidade.
- A classe `ApiError` permite que qualquer parte do código identifique e trate erros de rede de forma tipada.
- O ponto de injeção de JWT (`Authorization: Bearer`) já está preparado, comentado, aguardando a Fase 4.

```
NEXT_PUBLIC_API_URL=/api         → Next.js API Routes (mock)
NEXT_PUBLIC_API_URL=https://...  → Django (produção)
```

---

### 1.2 · `src/lib/mock-db.ts`

Banco de dados em memória, inicializado a partir do `mock-data.ts` existente mais dados inline para entidades sem mock anterior (setores, tenants, usuários, notificações).

**Por que é importante:**

- Resolve o problema de **IDs instáveis**: o `mock-db` é um singleton de processo (`globalThis`). Uma vez criado, seus dados não mudam enquanto o servidor estiver rodando — os IDs ficam estáveis entre requisições.
- Fornece operações de CRUD completas (`getAll`, `getById`, `filter`, `create`, `update`, `delete`) que simulam fielmente um banco relacional.
- A serialização automática de `Date → ISO string` garante que as respostas da API sempre retornam JSON válido, assim como o Django retornará.

---

### 1.3 · `src/lib/deserialize.ts`

Utilitário que converte campos de data de `string ISO → Date` ao receber respostas da API.

**Por que é importante:**

- JSON não tem tipo `Date`. Toda API (Next.js mock ou Django) retorna datas como strings. Sem deserialização, `new Date("2026-04-08T...")` seria chamado em todo componente que exibe datas, espalhando essa lógica pelo código.
- Centraliza essa conversão nas stores, que é o único lugar adequado para isso.
- Torna a mudança para o Django transparente: o formato de resposta (ISO string) é o mesmo nos dois casos.

---

### 1.4 · `src/lib/route-handler.ts`

Helpers de resposta para as API Routes do Next.js.

**Por que é importante:**

- Evita repetição de `NextResponse.json(data, { status: 200 })` em cada arquivo de rota.
- Padroniza os status HTTP (`ok`, `created`, `noContent`, `notFound`, `badRequest`), tornando as rotas mais legíveis e consistentes com o que o Django também retornará.

---

### 1.5 · `src/services/*.ts` (14 services)

Camada de serviço que encapsula as chamadas HTTP por domínio.

**Por que é importante:**

- **Separação de responsabilidades**: stores sabem *o quê* buscar; services sabem *como* buscar. Nenhum componente ou store precisa conhecer URLs ou parâmetros de query.
- **Facilita troca de backend**: quando o Django estiver pronto, apenas o `NEXT_PUBLIC_API_URL` muda. Os services continuam chamando os mesmos paths relativos (`/clientes`, `/demandas`, etc.). Se houver alguma divergência de nomenclatura, o ajuste fica localizado no service, não espalhado por 30 componentes.
- **Testabilidade**: é fácil mockar um service em testes unitários sem precisar mockar toda a infraestrutura HTTP.

---

## Fase 2 — API Routes + Stores Assíncronas

**Objetivo**: criar os endpoints mock que servem os dados, e refatorar as stores para consumir a API em vez de importar dados diretamente.

### 2.1 · API Routes (36 endpoints em `src/app/api/`)

Implementação dos Route Handlers do Next.js para todas as entidades do sistema.

**Por que é importante:**

- Cria uma **API REST real** — com requisições HTTP, status codes corretos, filtros por query params e operações CRUD completas — que simula exatamente o que o Django fornecerá.
- Permite testar o fluxo completo `Store → Service → HTTP → API Route → Mock DB` antes do backend existir, expondo problemas de contrato antecipadamente.
- Endpoints especiais como `/api/demandas/[id]/etapa` e `/api/demandas/[id]/vitrine` modelam operações de domínio (não apenas CRUD), preparando o contrato para o Django.
- O endpoint `/api/auth/login` valida credenciais e retorna um token fictício, permitindo que toda a lógica de autenticação do frontend seja desenvolvida e testada agora.

**Estrutura dos endpoints criados:**

```
/api/auth/login | me | logout
/api/empresas + /[id]
/api/clientes + /[id]
/api/colaboradores + /[id]
/api/setores + /[id]
/api/demandas + /[id] + /[id]/etapa + /[id]/vitrine
/api/projetos + /[id]
/api/squads + /[id]
/api/alocacoes + /[id]
/api/produtos + /[id]
/api/kanban-configs + /[empresaId]
/api/notificacoes + /[id] + /marcar-todas-lidas
/api/tenants + /[id]
/api/avaliacoes-demanda + /bulk
/api/usuarios + /[id]
```

---

### 2.2 · Refatoração das Stores (14 stores)

Todas as stores que importavam dados do `mock-data.ts` foram migradas para o padrão assíncrono.

**Por que é importante:**

#### Estado vazio + `fetchAll()`

Antes, as stores iniciavam com dados mock já carregados. Agora iniciam vazias e o método `fetchAll()` busca os dados da API. Isso reflete como a aplicação se comportará em produção: sem dados até a primeira chamada ao backend.

```ts
// Antes
empresas: mockEmpresas  // dados sempre presentes, IDs instáveis

// Depois
empresas: []            // vazio até fetchAll() ser chamado
fetchAll: async () => { /* chama /api/empresas */ }
```

#### CRUD assíncrono

Todas as operações de criação, atualização e remoção agora retornam `Promise`. Isso é fundamental porque em produção essas operações dependem da confirmação do servidor — não devemos atualizar a UI antes da API confirmar o sucesso.

#### Campo `error: string | null`

Cada store agora armazena o último erro, permitindo que componentes exibam feedback contextual em vez de falhas silenciosas.

#### Resiliência no `persist` (Zustand)

Stores que usavam `persist` (como `demanda.store` e `avaliacao-demanda.store`) tiveram suas versões incrementadas e suas funções `migrate` atualizadas. Isso garante que cache de sessões anteriores — com IDs do mock antigo — seja descartado automaticamente, evitando inconsistências na primeira execução após a migração.

#### Solução para dependência circular (Colaborador × Alocação)

`getOcupacao()` e `getComOcupacao()` precisam das alocações para calcular a ocupação dos colaboradores. Para evitar importação circular entre `colaborador.store` e `alocacao.store`, foi usado `require()` dinâmico com `getState()` do Zustand — padrão que permite que stores se comuniquem sem criar dependências circulares em módulos.

---

## Arquitetura resultante

```
[Componente / Hook]
        │
        ▼
[Store Zustand]         ← estado, cache, erro, loading
        │
        ▼
[Service]               ← contrato da API (paths, params)
        │
        ▼
[api-client.ts]         ← HTTP, headers, erros globais
        │
        ▼ (HTTP)
[API Route Next.js]     ← mock server (ativo hoje)
        │
        ▼
[mock-db.ts]            ← dados em memória
        │
   (Fase 4) ▼
[Backend Django]        ← substitui API Routes + mock-db
```

---

## O que muda na Fase 4 (integração Django)

Com toda essa infraestrutura instalada, a integração com o Django se resume a:

1. Alterar `NEXT_PUBLIC_API_URL` no `.env.local` para a URL do Django.
2. Ajustar nomes de campos se houver diferença (`camelCase` ↔ `snake_case`) — somente nos services.
3. Adaptar paginação se o Django usar `{ results: [], count: N }` — somente no `api-client`.
4. Ativar injeção de JWT no `api-client.ts` (linha já preparada e comentada).
5. Desativar as API Routes do Next.js gradualmente, à medida que o Django assume cada endpoint.

**Nenhum componente, store ou lógica de negócio precisa ser alterado.**
