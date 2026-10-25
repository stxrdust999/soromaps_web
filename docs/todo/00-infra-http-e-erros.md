# ⚙️ 00. Infraestrutura HTTP, Orval, Proxy e Tratamento de Erros

> **Status:** ✅ Concluído · [Índice](./README.md)

Prepara a camada de comunicação do front-end para consumir a API `.NET 10` usando `fetch` nativo (compatível com `next: { tags }` e `updateTag` do Next.js 16), geração automática de contratos via **Orval** e tradução centralizada dos códigos de erro (`ProblemDetails`).

---

## 🛠️ Tarefas

### 1. Cliente HTTP Base (`src/lib/client.ts`)
- [x] Criar wrapper `http<T>(path: string, options: RequestInit)` sobre `fetch` nativo:
  - Resolve a URL base (`process.env.API_URL` no servidor; `/api/proxy` no cliente);
  - No servidor, lê o `accessToken` do cookie `httpOnly` de sessão e injeta `Authorization: Bearer <accessToken>`;
  - Retorna sempre o envelope discriminado `{ data: T, status: number, headers: Headers }`;
  - Trata respostas `204 No Content` e payloads `application/problem+json`.

### 2. Configuração do Orval (`orval.config.ts`)
- [x] Configurar o Orval apontando para o OpenAPI:
  - `mode: 'tags-split'` gerando clientes por domínio diretamente em `src/http/<tag>/<tag>.ts` e schemas em `src/http/api.schemas.ts`;
  - `client: 'fetch'` usando `src/lib/client.ts` (`http`) como `mutator`.
- [x] Adicionar script `"generate:api": "orval"` no `package.json`.

### 3. Proxy Server-Side para o Cliente (`src/app/api/proxy/[...path]/route.ts`)
- [x] Criar Route Handler que repassa chamadas feitas pelo navegador para `process.env.API_URL`, anexando o token do cookie `httpOnly` se presente.
- [x] Eliminar o uso de `NEXT_PUBLIC_API_URL` no código cliente.

### 4. Mapeamento de Erros da API (`src/constants/api-errors.ts` + `src/helpers/api-error.ts`)
- [x] Criar dicionário `API_ERROR_MESSAGES: Record<string, string>` em `src/constants/api-errors.ts` mapeando todos os códigos de `DomainErrors` da API para mensagens claras em português.
- [x] Criar helper `getApiErrorMessage(errorPayload: unknown, fallbackMessage?: string): string` em `src/helpers/api-error.ts` para uso padronizado nas Server Actions (`src/actions/*`).
