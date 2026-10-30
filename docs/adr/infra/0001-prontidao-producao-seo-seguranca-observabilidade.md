# Prontidão para produção: validação de ambiente, segurança de borda, SEO dinâmico e observabilidade

> Módulo: infra & seo · Rotas: `/api/health`, `/api/cron/daily-story`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/*` · Data: 2026-10-28

## O que foi implementado

Implementação da infraestrutura de borda, validação estrita de runtime, barreira de segurança em cron jobs, indexação dinâmica por motores de busca e tratamento de resiliência e saúde para o deploy de produção na Vercel.

| Peça | Arquivo |
|---|---|
| Validação de variáveis de ambiente com Zod e resolução de URLs canônicas | `src/config/env.ts`, `.env.example` |
| Bloqueio estrito de cron sem segredo de autorização no host | `src/app/api/cron/daily-story/route.ts` |
| Padronização de clientes de API e LLM com variáveis validadas | `src/lib/client.ts`, `src/lib/gemini.ts`, `src/middleware.ts`, `src/app/api/proxy/[...path]/route.ts` |
| Security Headers HTTP globais, remoção de `console.log` e desativação de `X-Powered-By` | `next.config.ts` |
| Agendamento diário na Vercel para a pauta editorial com IA | `vercel.json` |
| Diretivas dinâmicas de crawler com liberação não-admin e bloqueio de rotas privadas | `src/app/robots.ts` |
| Mapa do site dinâmico tolerante a falhas com rotas estáticas, locais aprovados e pautas | `src/app/sitemap.ts` |
| Manifesto de Progressive Web App (PWA) | `src/app/manifest.ts` |
| Layout raiz em `pt-BR` com `metadataBase`, templates de título, OpenGraph e Twitter Cards | `src/app/layout.tsx` |
| Barreira de indexação `noindex, nofollow` nos painéis administrativos e perfil | `src/app/(app)/admin/layout.tsx`, `src/app/(app)/(explorer)/profile/layout.tsx` |
| Metadados estáticos em rotas públicas/explorador (`/home`, `/discover`, `/feed`, `/community`) | `src/app/(app)/(explorer)/*/page.tsx` |
| Metadados dinâmicos e OpenGraph por entidade com tags de revalidação | `places/[id]/page.tsx`, `pautas/[slug]/page.tsx`, `community/[id]/page.tsx` |
| Página 404 personalizada temática do Soromaps | `src/app/not-found.tsx` |
| Error Boundary de rotas sem vazamento de stack trace ou dados internos | `src/app/error.tsx` |
| Error Boundary raiz de último recurso para falhas catastróficas | `src/app/global-error.tsx` |
| Endpoint leve de liveness e readiness para probes de monitoramento | `src/app/api/health/route.ts` |

---

## Decisões

### 1. Validação centralizada de variáveis com Zod e tolerância em desenvolvimento
Em vez de depender de acessos dispersos a `process.env` (que falham silenciosamente em tempo de execução quando uma chave falta), `src/config/env.ts` unifica o parsing com Zod. Em ambiente local, defaults seguros apontam para `http://localhost:5099` (API) e `http://localhost:3000` (Front-end). Na Vercel, `getAppUrl()` resolve em cascata `NEXT_PUBLIC_APP_URL` -> `VERCEL_PROJECT_PRODUCTION_URL` -> `VERCEL_URL`, prevenindo links canônicos quebrados mesmo em instâncias de preview.

### 2. Eliminação do segredo hardcoded `CRON_SECRET`
A rota `/api/cron/daily-story` possuía o fallback inline `"soromaps-cron-secret-2026"`. Caso a chave não fosse configurada nas variáveis do projeto na nuvem, qualquer agente externo poderia disparar a rota livremente e consumir a cota da API do Gemini. O fallback foi removido: sem `CRON_SECRET` válido no ambiente, `isValidCronRequest` rejeita imediatamente com `401 Unauthorized`.

### 3. Remoção de rewrites legados e injeção de Security Headers em `next.config.ts`
O rewrite de `/api/markers/:path*` foi removido, pois a arquitetura migrou para `/api/proxy/[...path]` e endpoints de `/places`. Foram adicionados Security Headers em `/(.*)`: `HSTS` (2 anos + preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy: geolocation=(self)...` (preservando explicitamente o acesso ao GPS necessário para o MapLibre GL).

### 4. Preparação antecipada do SEO para abertura pública das rotas do explorador
Embora o `middleware.ts` ainda mantenha a exigência de autenticação por enquanto, `robots.ts` e `sitemap.ts` foram configurados autorizando a indexação de `/home`, `/discover`, `/feed`, `/community`, `/places/*` e `/pautas/*`, enquanto rotas administrativas (`/admin/`), proxies de API (`/api/`) e telas pessoais (`/profile/*`, `/places/new`) foram explicitamente desautorizadas (`Disallow`).

### 5. Sitemap dinâmico com isolamento de falhas via `Promise.allSettled`
Para evitar que uma indisponibilidade temporária da API backend derrube o build do front-end na Vercel durante a geração do sitemap, as consultas a `listPlaces` e `listStories` são executadas sob `Promise.allSettled` e encapsuladas em `try/catch`. Caso o backend não responda, o sitemap entrega com sucesso todas as rotas estáticas da aplicação.

### 6. Isolamento de mensagens de erro na camada visual (`FORM-4`)
Os novos boundaries `error.tsx` e `global-error.tsx` registram os detalhes completos do erro no `console.error` (capturados pelos logs da Vercel), mas apresentam apenas mensagens acolhedoras e genéricas em português na interface, impedindo o vazamento de detalhes estruturais, URLs internas ou exceções do banco de dados para os usuários finais.

---

## Pendências conhecidas

- `src/lib/session.ts` ainda lê `process.env.NODE_ENV === "production"` inline para a flag `secure` de cookies; deve ser alinhado com `getEnv()`.
- Futuramente, gerar cartões visuais automáticos dinâmicos para redes sociais (`opengraph-image.tsx` com `@vercel/og`) nas rotas `/places/[id]` e `/pautas/[slug]`.
- Adicionar `apple-touch-icon.png` (180x180) dedicado em `/public` para aprimorar o suporte a PWA no iOS Safari.
