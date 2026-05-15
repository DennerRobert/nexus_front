# Integração com o Backend Django — Guia Técnico

Este documento descreve todos os passos necessários para integrar o frontend ao backend Django, aproveitando a infraestrutura já construída nas Fases 1, 2 e 3.

> **Estado atual:** o frontend opera com um servidor mock interno (Next.js API Routes + `mock-db.ts`). A arquitetura foi desenhada para que a troca para o Django seja cirúrgica — sem reescrever stores, componentes ou lógica de negócio.

---

## Visão geral do que muda

```
HOJE
  Store → Service → api-client → /api/* (Next.js mock)

COM DJANGO
  Store → Service → api-client → https://api.sgpi.com.br/* (Django)
```

O único ponto de mudança obrigatório é a variável de ambiente `NEXT_PUBLIC_API_URL`.
Todo o resto é ajuste fino.

---

## 1. Variável de ambiente

Criar o arquivo `.env.local` na raiz do projeto (já não existe):

```env
# Desenvolvimento local com Django rodando na porta 8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Produção
NEXT_PUBLIC_API_URL=https://api.sgpi.com.br/api
```

> O `api-client.ts` já lê essa variável em `process.env.NEXT_PUBLIC_API_URL` com fallback para `/api` (mock).

---

## 2. Autenticação JWT

### 2.1 · Ativar injeção do token no `api-client.ts`

Descomentar as linhas já preparadas em `src/lib/api-client.ts`:

```typescript
// Antes (comentado):
// const token = typeof window !== "undefined" ? localStorage.getItem("sgpi_token") : null;
// if (token) headers["Authorization"] = `Bearer ${token}`;

// Depois (ativo):
const token = typeof window !== "undefined" ? localStorage.getItem("sgpi_token") : null;
if (token) headers["Authorization"] = `Bearer ${token}`;
```

### 2.2 · Salvar e limpar o token no `auth.store.ts`

O `auth.store.ts` atualmente persiste `usuario` e `isAuthenticated` no `localStorage` via Zustand `persist`. Com JWT, é preciso:

- **No `login`**: salvar o token retornado pelo Django em `localStorage.setItem("sgpi_token", response.token)`.
- **No `logout`**: remover o token com `localStorage.removeItem("sgpi_token")`.
- **Na inicialização**: verificar se o token ainda é válido chamando `GET /auth/me` — o `auth.store.ts` já tem o método `me` mapeado no `authService`.

### 2.3 · Tratar expiração de token (401)

O `api-client.ts` já exibe um toast de "Sessão expirada" quando recebe status 401. Além disso, é necessário redirecionar o usuário para `/login` automaticamente. Adicionar no `api-client.ts`, após o toast de 401:

```typescript
if (res.status === 401) {
  toast.error("Sessão expirada", { description: "Faça login novamente." });
  // Limpar sessão e redirecionar
  localStorage.removeItem("sgpi_token");
  window.location.href = "/login";
}
```

---

## 3. Convenção de nomes de campos (camelCase × snake_case)

O Django DRF serializa campos em `snake_case` por padrão (`empresa_dona_id`, `criado_em`). O frontend usa `camelCase` (`empresaDonaId`, `criadoEm`).

### Opção A — Configurar o Django para retornar camelCase (recomendado)

Adicionar `djangorestframework-camel-case` ao backend:

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "djangorestframework_camel_case.render.CamelCaseJSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "djangorestframework_camel_case.parser.CamelCaseJSONParser",
    ],
}
```

Com isso, **nenhum service do frontend precisa ser alterado**.

### Opção B — Converter no frontend (nos services)

Se o Django retornar `snake_case`, criar um utilitário de conversão em `src/lib/case-converter.ts` e aplicar nas respostas dos services. Esta opção é mais trabalhosa e sujeita a erros.

> **Recomendação:** adotar a Opção A para manter o frontend sem alterações.

---

## 4. Formato de datas

O `deserialize.ts` já converte strings ISO para `Date` automaticamente. O Django retorna datas em formato ISO 8601 (`"2026-04-08T14:30:00Z"`), que é exatamente o esperado.

**Nenhuma alteração necessária** — desde que o Django retorne datas em ISO 8601.

---

## 5. Formato de paginação

O Django DRF usa paginação por padrão no formato:

```json
{
  "count": 150,
  "next": "https://api.../clientes?page=2",
  "previous": null,
  "results": [ ... ]
}
```

O frontend atualmente espera arrays simples `[ ... ]`. Há duas formas de resolver:

### Opção A — Desabilitar paginação no Django para recursos sem lista longa

```python
# views.py
class ClienteViewSet(ModelViewSet):
    pagination_class = None  # desabilita paginação
```

### Opção B — Adaptar o `api-client.ts`

Criar um método auxiliar que extrai `results` quando a resposta for paginada:

```typescript
// Em api-client.ts, adaptar handleResponse:
if (typeof data === "object" && data !== null && "results" in data) {
  return (data as { results: T }).results;
}
```

> **Recomendação:** para endpoints de listagem com poucos registros (empresas, setores, etc.), desabilitar paginação. Para entidades com volume alto (colaboradores, demandas), implementar paginação no frontend também.

---

## 6. Tratamento de erros do Django

O Django DRF retorna erros no formato:

```json
{ "detail": "Mensagem de erro." }

// ou para erros de validação de campos:
{ "nome": ["Este campo é obrigatório."], "cnpj": ["CNPJ inválido."] }
```

O `api-client.ts` já lê o campo `detail` para exibir no toast. Para erros de validação de campos, é necessário propagar os erros individuais para os formulários via `react-hook-form`:

```typescript
// Exemplo em um handler de formulário:
const result = await create(data);
if (!result) {
  const apiErr = useEmpresaStore.getState().error;
  // Mapear para setError do react-hook-form se necessário
}
```

---

## 7. Endpoints que precisam de revisão de contrato

Os endpoints abaixo possuem lógica de domínio específica que pode divergir da implementação Django:

| Endpoint | Frontend espera | Observação |
|---|---|---|
| `POST /auth/login` | `{ usuario, token }` | Verificar nome do campo token (`access`, `token`, `access_token`) |
| `POST /demandas/:id/etapa` | `{ etapa, usuarioId, observacao? }` | Confirmar campos aceitos |
| `POST /demandas/:id/vitrine` | Corpo vazio `{}` | Pode mudar para `PATCH` |
| `POST /avaliacoes-demanda/bulk` | Array de respostas | Confirmar se Django aceita bulk create |
| `GET /kanban-configs/:empresaId` | Objeto único | Verificar se retorna objeto ou array |
| `GET /auth/me` | `{ autenticado: boolean }` | Confirmar estrutura de resposta |

---

## 8. Stores que ainda usam mock direto

As seguintes stores ainda importam dados diretamente do `mock-data.ts` e precisarão ser migradas quando o backend implementar esses módulos:

| Store | Módulo | Prioridade |
|---|---|---|
| `tarefa.store.ts` | Gestão de tarefas de projetos | Alta |
| `sprint.store.ts` | Sprints de projetos | Alta |
| `marco-projeto.store.ts` | Marcos e milestones | Alta |
| `acompanhamento.store.ts` | Acompanhamento de projetos | Média |
| `registro-horas.store.ts` | Registro de horas | Média |
| `comentario-tarefa.store.ts` | Comentários em tarefas | Baixa |

O padrão de migração já está estabelecido nas 14 stores refatoradas:
1. Criar `src/services/tarefa.service.ts` com os métodos CRUD.
2. Criar `src/app/api/tarefas/route.ts` (se quiser manter mock intermediário).
3. Refatorar a store para o padrão `fetchAll` + `isLoading` + `error`.

---

## 9. CORS

O Django precisará permitir requisições do domínio do frontend. Configurar `django-cors-headers`:

```python
# settings.py
INSTALLED_APPS = [..., "corsheaders"]

MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", ...]

# Desenvolvimento
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]

# Produção
CORS_ALLOWED_ORIGINS = ["https://sgpi.com.br"]
```

---

## 10. Desativação gradual do mock

A migração pode ser feita **endpoint por endpoint**, sem big bang:

```
Semana 1: auth (login, logout, me)
Semana 2: empresas, setores, tenants
Semana 3: clientes, colaboradores
Semana 4: demandas (incluindo etapas e vitrine)
Semana 5: projetos, squads, alocações
Semana 6: produtos, notificações, kanban-configs
Semana 7: tarefas, sprints, marcos, horas, comentários
```

Para cada endpoint migrado:
1. O Django assume o endpoint real.
2. O arquivo `src/app/api/[recurso]/route.ts` correspondente pode ser deletado.
3. O `mock-db.ts` pode ter a collection removida.
4. Quando todas as API Routes forem removidas, deletar `src/app/api/`, `src/lib/mock-db.ts`, `src/lib/route-handler.ts` e `src/utils/mock-data.ts`.

---

## Checklist de integração

```
[ ] Criar .env.local com NEXT_PUBLIC_API_URL apontando para o Django
[ ] Descomentar injeção de JWT no api-client.ts
[ ] Implementar save/clear do token no auth.store.ts
[ ] Implementar redirect automático no 401
[ ] Confirmar convenção de nomes (camelCase via djangorestframework-camel-case)
[ ] Confirmar formato de paginação e adaptar se necessário
[ ] Revisar contratos dos endpoints com lógica de domínio (tabela seção 7)
[ ] Configurar CORS no Django
[ ] Migrar stores secundárias (seção 8) conforme o backend implementar os módulos
[ ] Remover arquivos mock após cada endpoint ser validado em produção
```

---

## Arquivos que serão removidos ao final da integração

| Arquivo | Motivo |
|---|---|
| `src/utils/mock-data.ts` | Dados substituídos pelo banco Django |
| `src/lib/mock-db.ts` | Banco em memória substituído pelo Django |
| `src/lib/route-handler.ts` | Helpers exclusivos das API Routes mock |
| `src/app/api/**` | Todos os endpoints mock substituídos |

**Nenhum arquivo fora desta lista precisa ser modificado.**
