# 🌆 Soromaps

> Plataforma interativa para descobrir, avaliar e compartilhar experiências em estabelecimentos locais de Sorocaba — geolocalização + gamificação + rede social.

🌐 [**Aplicação publicada**](https://soromaps-sigma.vercel.app)  
👉 [**Esboço do Projeto (Figma)**](https://www.figma.com/make/QeH6cpMMMLzWpcahXSmB4E/Plataforma-Interativa-Sorocaba?node-id=0-1&p=f&t=4B6XvFunslTZ5fr7-0)  
🎥 [**Vídeo da Apresentação Final**](https://youtu.be/ikABfE7xs0U?si=GWaXctGDIQR5dzzm)

---

## ✨ Features e Módulos Entregues

### 🧭 Área do Explorador
- 🗺️ **Mapa Interativo (`/home`)**: navegação vetorial com MapLibre GL e basemaps CARTO (`voyager` e `dark-matter`), geolocalização do usuário, markers dinâmicos por categoria e alternância de temas.
- 🔍 **Descoberta (`/discover`)**: busca rápida de estabelecimentos, visualização em lista/cards e transição para ficha do local.
- 📍 **Ficha do Local (`/places/[id]`)**: dados cadastrais, avaliações, fotos, notas médias e métricas de engajamento.
- ➕ **Sugestão de Locais (`/places/new`)**: fluxo para cadastro de novos locais pela comunidade com seleção de coordenadas geográficas via mapa interativo.
- 💬 **Feed Social e Histórias (`/feed`)**: relatos de visitas e publicações vinculadas a locais reais com upload de imagens.
- 👥 **Comunidade e Pautas (`/community`, `/pautas/[slug]`)**: criação de histórias comunitárias (`/community/new-story`), debate local e redação editorial assistida por IA (Google Gemini).
- 👤 **Hub de Perfil (`/profile`)**: painel unificado com abas para histórico de visitas, favoritos, catálogo de conquistas desbloqueadas e configurações.

### 🛡️ Painel Administrativo (`/admin/*`)
- 📊 **Dashboard (`/admin/dashboard`)**: indicadores consolidados de novos locais, aprovações, denúncias e engajamento.
- ⚖️ **Moderação (`/admin/moderation`)**: fluxo mestre-detalhe para análise e aprovação de novos locais sugeridos pela comunidade.
- 👥 **Gestão de Usuários (`/admin/users`)**: listagem com avatares, edição de papéis e controle de acesso.
- 🏷️ **Categorias (`/admin/categories`)**: gerenciamento da taxonomia de estabelecimentos.
- 🚩 **Denúncias e Feedbacks (`/admin/reports`)**: triagem agrupada por alvo de denúncias e mensagens de contato.
- ⭐ **Moderação de Avaliações (`/admin/reviews`)**: moderação de reviews e comentários da comunidade.
- 🏆 **Catálogo de Conquistas (`/admin/achievements`)**: gestão de critérios de gamificação.

### 🚀 Infraestrutura, Segurança e Observabilidade
- 🛡️ **Segurança de Borda**: HTTP Security Headers (HSTS, X-Frame-Options, CSP, Permissions-Policy com geolocalização restrita ao domínio).
- 🔒 **Validação de Runtime**: esquema centralizado com Zod (`src/config/env.ts`) para validação estrita de variáveis de ambiente.
- 🤖 **Rotinas Agendadas Seguras**: endpoint `/api/cron/daily-story` com barreira criptográfica via `CRON_SECRET` configurado no Vercel Cron.
- 🩺 **Observabilidade**: endpoint `/api/health` para sondas de liveness e readiness em produção.
- 🌐 **SEO Dinâmico & PWA**: geração dinâmica de `sitemap.xml`, diretivas de crawler em `robots.txt`, manifesto PWA (`manifest.webmanifest`) e barreira `noindex, nofollow` em rotas administrativas.
- 🛑 **Resiliência Visual**: páginas de erro 404 personalizadas (`not-found.tsx`) e Error Boundaries amigáveis (`error.tsx`, `global-error.tsx`) sem vazamento de detalhes estruturais.

---

## 🚩 Principais dores atacadas

1. Dificuldade em descobrir lugares novos e autênticos em Sorocaba
2. Falta de confiança em avaliações impessoais ou não locais
3. Falta de engajamento social em torno da cultura local
4. Baixa visibilidade de estabelecimentos menores e feiras
5. Experiência turística pouco imersiva e desarticulada
6. Falta de reconhecimento para quem contribui ativamente com indicações

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router + Turbopack) + React 19 + TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui (Radix UI) + Lucide Icons + Motion |
| Tabelas | TanStack Table 8 (via hook global `useTableConfig`) |
| Formulários | React Hook Form + Zod (`@hookform/resolvers`) |
| Mapas | MapLibre GL 6 + basemaps CARTO (`voyager` / `dark-matter`) |
| Backend | ASP.NET Core 10 (`net10.0`) + EF Core — repo separado (`soromaps_api`) |
| Banco de Dados | PostgreSQL (Supabase em produção) — 21 tabelas relacionais |
| Inteligência Artificial | Google Gemini API (`gemini-2.0-flash`), execução server-side para redação editorial de pautas |
| Linter & Formatador | Biome 2 |
| Nuvem & Deploy | Vercel (Front-end) + Azure App Service (API) + Supabase (Database) |

---

## 🚀 Como rodar localmente

O projeto é composto por **dois repositórios** que rodam em conjunto, mais uma instância PostgreSQL:

```bash
# 1. Clonar os dois repositórios na mesma pasta pai
git clone https://github.com/stxrdust999/soromaps.git soromaps_web
git clone https://github.com/stxrdust999/soromaps_api.git

# 2. Subir a API (.NET 10) — padrão em http://localhost:5099
cd soromaps_api
dotnet run

# 3. Subir o Front-end Web (Next.js 16) — padrão em http://localhost:3000
cd ../soromaps_web
npm install
npm run dev
```

### Configuração de variáveis de ambiente

Crie um arquivo `.env.local` na raiz do `soromaps_web` baseando-se no `.env.example`:

```bash
# URL base da API backend (dotnet). Em desenvolvimento local: http://localhost:5099
API_URL=http://localhost:5099

# URL base pública da aplicação web (usada para metadados, canonical e sitemaps)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Segredo de autorização para rotinas agendadas (Vercel Cron) - mínimo 16 caracteres
CRON_SECRET=uma-chave-secreta-com-pelo-menos-16-caracteres

# Credenciais do Google Gemini para assistência na redação de pautas (opcional em dev)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

E preencha a connection string do PostgreSQL em `appsettings.Development.json` no repositório da API (`soromaps_api`).

---

## ☁️ Produção

| Camada | Provedor | Deploy |
|---|---|---|
| Front-end | Vercel — [soromaps-sigma.vercel.app](https://soromaps-sigma.vercel.app) | Automático via push na branch principal |
| API | Azure App Service | CI/CD ou manual |
| Banco de Dados | Supabase (PostgreSQL) | Nuvem com connection pooling |

---

## 📖 Documentação

- **[Mapa Geral de Documentação](./docs/README.md)**: Índice completo da documentação do repositório.
- **[Wiki do Projeto](./docs/wiki/00-home.md)**:
  - [01. Visão do Produto](./docs/wiki/01-visao-do-produto.md)
  - [02. Jornada do Explorador](./docs/wiki/02-jornada-do-explorador.md)
  - [03. Moderação e Governança](./docs/wiki/03-moderacao-e-governanca.md)
  - [04. Gamificação e Reputação](./docs/wiki/04-gamificacao-e-reputacao.md)
  - [05. Ecossistema e Arquitetura Geral](./docs/wiki/05-ecossistema-e-arquitetura.md)
- **[ADRs (Architecture Decision Records)](./docs/adr/README.md)**: Histórico de decisões arquiteturais por módulo (`admin/`, `user/` e `infra/`).
- **[Roadmap de Módulos](./docs/todo/README.md)**: Status e roteiro de integração de módulos com a API backend.
- **[Registro Vivo do Projeto (`CLAUDE.md`)](./CLAUDE.md)**: Rationale e convenções técnicas detalhadas do ecossistema.

---

## 👥 Integrantes e Responsáveis

| Integrante | Responsabilidade |
|---|---|
| Arthur | Mobile |
| Gabriel Acciari | Frontend |
| Gabriel Nunes | Nuvem & DevOps |
| Nicolas | Backend |
| Otávio | Banco de Dados |

---

## 📝 Convenções

- Commits: [Conventional Commits](https://www.conventionalcommits.org/)
- Código em inglês, comentários e documentação técnica em português (`pt-BR`)
- Diagramas em Mermaid como fonte de verdade
