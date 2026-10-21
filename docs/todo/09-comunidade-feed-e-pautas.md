# 📰 09. Comunidade, Feed e Pautas

> **Status:** 💤 Pendente · **Depende de:** [06-atividade-do-explorador.md](./06-atividade-do-explorador.md), [07-gamificacao-e-conquistas.md](./07-gamificacao-e-conquistas.md) e API `09-ComunidadeFeedEPautas.md` · [Índice](./README.md)

Substitui os mocks de `/community`, `/community/[id]`, `/feed` e `/pautas/[slug]` pelos endpoints reais da API.

---

## 🛠️ Tarefas

### 1. Comunidade (`/community` e `/community/[id]`)
- [ ] Conectar `/community` a `GET /api/community/explorers` (ranking geral, por bairro e busca por nome).
- [ ] Conectar `/community/[id]` a `GET /api/users/{id}` com contadores públicos, selo de verificação, avaliações e locais sugeridos.
- [ ] Remover `src/mocks/community.ts`.

### 2. Feed (`/feed`)
- [ ] Conectar `/feed` a `GET /api/feed` e `GET /api/feed/mutes`.
- [ ] Criar Server Actions para silenciar/reativar recortes do feed (`POST /api/feed/mutes` e `DELETE /api/feed/mutes/{id}`).
- [ ] Remover `src/mocks/feed.ts`.

### 3. Pautas Editoriais (`/pautas/[slug]`)
- [ ] Conectar a listagem de pautas e a página `/pautas/[slug]` a `GET /api/stories` e `GET /api/stories/{slug}`.
- [ ] Persistir os rascunhos gerados pelo Gemini (`src/actions/stories.ts`) via `POST /api/stories` e publicar via `POST /api/stories/{id}/publish`.
- [ ] Remover `src/mocks/stories.ts`.
