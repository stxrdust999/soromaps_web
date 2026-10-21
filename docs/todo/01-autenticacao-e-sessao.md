# 🔐 01. Autenticação, Cookies `httpOnly` e Sessão

> **Status:** ✅ Concluído · **Depende de:** [00-infra-http-e-erros.md](./00-infra-http-e-erros.md) · [Índice](./README.md)

Integra o ciclo completo de autenticação da API (`POST /api/auth/login`, `/refresh`, `/logout`, `/logout-all`) usando cookies `httpOnly` gerenciados pelo servidor do Next.js.

---

## 🛠️ Tarefas

### 1. Gestão de Cookies e Sessão (`src/lib/session.ts`)
- [x] Armazenar `accessToken` e `refreshToken` em cookies `httpOnly`, `secure` (em produção), `sameSite: 'lax'`, `path: '/'`.
- [x] Decodificar as claims públicas do `accessToken` (`sub`, `email`, `role`, `exp`) e persistir os dados básicos do usuário (`id`, `name`, `email`, `role`, `avatarUrl`) para leitura rápida nos Server Components (`getSession()`).

### 2. Middleware com Refresh Transparente e Guarda de Papel (`src/middleware.ts`)
- [x] Atualizar `src/middleware.ts`:
  - Se o `accessToken` estiver expirado mas houver `refreshToken` válido no cookie, chamar `POST /api/auth/refresh`, rotacionar os cookies `httpOnly` na resposta e prosseguir com a navegação sem deslogar o usuário;
  - Se a renovação falhar (`401`), limpar os cookies e redirecionar para `/login`;
  - Bloquear acesso a `/admin/*` quando `role !== 'admin'`, redirecionando para `/home`.

### 3. Server Actions de Autenticação (`src/actions/auth.ts`)
- [x] Atualizar `loginAction`: chamar `POST /api/auth/login`, gravar os cookies da sessão e traduzir erros via `getApiErrorMessage` (nunca exibir `response.text()` cru).
- [x] Atualizar `registerAction`: chamar `POST /api/users` e, em seguida, autenticar em `POST /api/auth/login` (ou redirecionar com sessão iniciada), tratando `409 Conflict` (`user.email_taken`).
- [x] Atualizar `logoutAction`: chamar `POST /api/auth/logout` enviando o `refreshToken` antes de limpar os cookies locais.
- [x] Criar `logoutAllAction`: chamar `POST /api/auth/logout-all` para encerrar todas as sessões ativas do usuário.

### 4. Limpeza
- [x] Remover os Route Handlers legados órfãos em `src/app/api/auth/login/route.ts` e `src/app/api/auth/logout/route.ts`.
