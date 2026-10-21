# 🚦 04. Moderação de Locais

> **Status:** 💤 Pendente · **Depende de:** [03-catalogo-locais-e-categorias.md](./03-catalogo-locais-e-categorias.md) e API `04-ModeracaoDeLocais.md` · [Índice](./README.md)

Conecta a fila mestre-detalhe de `/admin/moderation` aos endpoints de decisão e histórico da API.

---

## 🛠️ Tarefas

- [ ] Consumir `GET /api/admin/moderation/places` na fila de `/admin/moderation` com filtros por status (`pending`, `returned`, `rejected`) e categoria.
- [ ] Criar Server Actions em `src/actions/moderation.ts`:
  - `decidePlaceModerationAction` (`POST /api/admin/moderation/places/{placeId}/decisions`);
  - `batchDecideModerationAction` (`POST /api/admin/moderation/decisions/batch`);
  - `undoModerationDecisionAction` (`POST /api/admin/moderation/places/{placeId}/undo`).
- [ ] Conectar a aba de histórico a `GET /api/admin/moderation/history`.
- [ ] Remover `src/mocks/admin-moderation.ts`.
