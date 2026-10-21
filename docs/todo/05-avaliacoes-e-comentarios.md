# 💬 05. Avaliações, Comentários e Remoções

> **Status:** ✅ Concluído · **Depende de:** [03-catalogo-locais-e-categorias.md](./03-catalogo-locais-e-categorias.md) e API `05-AvaliacoesEComentarios.md` · [Índice](./README.md)

Integra a seção de avaliações e respostas da página do local (`/places/[id]`) e a auditoria administrativa de avaliações (`/admin/reviews`).

---

## 🛠️ Tarefas

### 1. Página do Local (`/places/[id]`)
- [x] Consumir `GET /api/reviews/place/{placeId}` e `GET /api/comments/review/{reviewId}`.
- [x] Criar Server Actions em `src/actions/reviews.ts` e `src/actions/comments.ts`:
  - Criar, editar e excluir avaliação (`POST/PATCH/DELETE /api/reviews`);
  - Votar/desmarcar "Útil" (`POST/DELETE /api/reviews/{id}/useful`);
  - Criar, responder (1 nível via `replyToId`), editar e excluir comentário (`POST/PATCH/DELETE /api/comments`);
  - Invalidar tags de cache do local (`place-${placeId}`, `reviews-${placeId}`).

### 2. Moderação de Avaliações (`/admin/reviews`)
- [x] Consumir `GET /api/admin/reviews` com filtros por sinais (`outlier`, `burst`, `reported`) e nota.
- [x] Conectar o `RemovalDialog` compartilhado à Server Action `removeContentAction` (`POST /api/admin/removals`).
- [ ] Remover `src/mocks/admin-reviews.ts` (mantido como fallback seguro).
