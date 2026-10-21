# 🏆 07. Gamificação e Conquistas

> **Status:** 💤 Pendente · **Depende de:** [06-atividade-do-explorador.md](./06-atividade-do-explorador.md) e API `07-Gamificacao.md` · [Índice](./README.md)

Conecta a galeria de conquistas do explorador (`/profile/achievements`) e o catálogo administrativo (`/admin/achievements`) à API.

---

## 🛠️ Tarefas

- [ ] Conectar `/admin/achievements` a `GET /api/achievements`, `GET /api/achievements/estimate`, `POST /api/achievements`, `PATCH /api/achievements/{id}` e `DELETE /api/achievements/{id}`.
- [ ] Conectar `/profile/achievements` a `GET /api/users/me/achievements`, exibindo medalhas desbloqueadas e progresso `{ current, required }` nas bloqueadas.
- [ ] Substituir qualquer menção remanescente de "Nível N" mockado pelos títulos derivados de `explorerCredential(achievementsCount)`.
- [ ] Remover `src/mocks/admin-achievements.ts`.
