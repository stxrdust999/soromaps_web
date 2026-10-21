# ⚙️ 00. Infraestrutura HTTP, Orval, Proxy e Tratamento de Erros

> **Status:** 💤 Pendente · [Índice](./README.md)

Prepara a camada de comunicação do front-end para consumir a API `.NET 10` usando `fetch` nativo (compatível com `next: { tags }` e `updateTag` do Next.js 16), geração automática de contratos via **Orval** e tradução centralizada dos códigos de erro (`ProblemDetails`).

---

## 🛠️ Tarefas

### 1. Cliente HTTP Base (`src/lib/client.ts`)
- [ ] Criar wrapper `http<T>(path: string, options: RequestInit)` sobre `fetch` nativo:
  - Resolve a URL base (`process.env.API_URL` no servidor; `/api/proxy` no cliente);
  - No servidor, lê o `accessToken` do cookie `httpOnly` de sessão e injeta `Authorization: Bearer <accessToken>`;
  - Retorna sempre o envelope discriminado `{ data: T, status: number, headers: Headers }`;
  - Trata respostas `204 No Content` e payloads `application/problem+json`.

### 2. Configuração do Orval (`orval.config.ts`)
- [ ] Configurar o Orval apuntando para `${API_URL}/openapi/v1.json`:
  - `mode: 'tags-split'` gerando clientes por domínio em `src/http/generated/` (ou diretamente nas subpastas de `src/http/`);
  - `client: 'fetch'` usando `src/lib/client.ts` (`http`) como `mutator`.
- [ ] Adicionar script `"generate:api": "orval"` no `package.json`.

### 3. Proxy Server-Side para o Cliente (`src/app/api/proxy/[...path]/route.ts`)
- [ ] Criar Route Handler que repassa chamadas feitas pelo navegador (como o carregamento dinâmico de pins do mapa em `use-markers.ts`) para `process.env.API_URL`, anexando o token do cookie `httpOnly` se presente.
- [ ] Eliminar o uso de `NEXT_PUBLIC_API_URL` no código cliente.

### 4. Mapeamento de Erros da API (`src/constants/api-errors.ts` + `src/helpers/api-error.ts`)
- [ ] Criar tipo `ProblemDetailsResponse` (`type`, `title`, `status`, `detail`, `code`, `errors`).
- [ ] Criar dicionário `API_ERROR_MESSAGES: Record<string, string>` em `src/constants/api-errors.ts` mapeando todos os códigos de `DomainErrors` da API (`auth.invalid_credentials`, `auth.session_expired`, `user.email_taken`, `user.last_admin`, `place.not_found`, etc.) para mensagens claras em português.
- [ ] Criar helper `getApiErrorMessage(errorPayload: unknown, fallbackMessage?: string): string` em `src/helpers/api-error.ts` para uso padronizado nas Server Actions (`src/actions/*`).
