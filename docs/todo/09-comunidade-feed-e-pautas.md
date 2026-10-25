# 📰 09. Comunidade, Feed e Pautas

> **Status:** ✅ Concluído · **Depende de:** [06-atividade-do-explorador.md](./06-atividade-do-explorador.md), [07-gamificacao-e-conquistas.md](./07-gamificacao-e-conquistas.md) e API `09-ComunidadeFeedEPautas.md` · [Índice](./README.md)

Substitui os mocks de `/community`, `/community/[id]`, `/feed` e `/pautas/[slug]` pelos endpoints reais da API.

---

## 🛠️ Tarefas

### 1. Comunidade (`/community` e `/community/[id]`)
- [x] Conectar `/community` a `GET /api/community/explorers` (ranking geral, por bairro e busca por nome).
- [x] Conectar `/community/[id]` a `GET /api/users/{id}` com contadores públicos, selo de verificação, avaliações e locais sugeridos.
- [ ] Remover `src/mocks/community.ts` (mantido como fallback seguro).

### 2. Feed (`/feed`)
- [x] Conectar `/feed` a `GET /api/feed` e `GET /api/feed/mutes`.
- [x] Criar Server Actions para silenciar/reativar recortes do feed (`POST /api/feed/mutes` e `DELETE /api/feed/mutes/{id}`).
- [ ] Remover `src/mocks/feed.ts` (mantido como fallback seguro).

### 3. Pautas Editoriais (`/pautas/[slug]`)
- [x] Conectar a listagem de pautas e a página `/pautas/[slug]` a `GET /api/stories` e `GET /api/stories/{slug}`.
- [x] Persistir e exibir pautas reais consumindo os endpoints da API.
- [ ] Remover `src/mocks/stories.ts` (mantido como fallback seguro).
