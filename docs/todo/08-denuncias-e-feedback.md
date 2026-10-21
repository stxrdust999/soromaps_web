# 🚩 08. Denúncias e Feedback

> **Status:** 💤 Pendente · **Depende de:** [05-avaliacoes-e-comentarios.md](./05-avaliacoes-e-comentarios.md) e API `08-DenunciasEFeedback.md` · [Índice](./README.md)

Conecta o envio de denúncias, a fila de triagem em `/admin/reports` e o formulário `/feedback` à API.

---

## 🛠️ Tarefas

- [ ] Adicionar botão/modal de denunciar em `/places/[id]` (para local, avaliação e comentário) chamando `createReportAction` (`POST /api/reports`).
- [ ] Conectar `/admin/reports` a `GET /api/admin/reports`, `POST /api/admin/reports/{targetType}/{targetId}/dismiss` e `POST /api/admin/removals` (via `RemovalDialog`).
- [ ] Conectar `/feedback` a `POST /api/feedback`.
- [ ] Remover `src/mocks/admin-reports.ts`.
