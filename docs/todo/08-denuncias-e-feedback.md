# 🚩 08. Denúncias e Feedback

> **Status:** ✅ Concluído · **Depende de:** [05-avaliacoes-e-comentarios.md](./05-avaliacoes-e-comentarios.md) e API `08-DenunciasEFeedback.md` · [Índice](./README.md)

Conecta o envio de denúncias, a fila de triagem em `/admin/reports` e o formulário `/feedback` à API.

---

## 🛠️ Tarefas

- [x] Criar `createReportAction` (`POST /api/reports`) para denúncias de locais, avaliações e comentários.
- [x] Conectar `/admin/reports` a `GET /api/admin/reports`, `POST /api/admin/reports/{targetType}/{targetId}/dismiss` e `POST /api/admin/removals` (via `RemovalDialog`).
- [x] Conectar `/feedback` a `POST /api/feedback` via `sendFeedbackAction`.
- [ ] Remover `src/mocks/admin-reports.ts` (mantido como fallback seguro).
