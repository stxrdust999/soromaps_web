# 📊 10. Dashboard Administrativo

> **Status:** 💤 Pendente · **Depende de:** [04-moderacao-de-locais.md](./04-moderacao-de-locais.md), [05-avaliacoes-e-comentarios.md](./05-avaliacoes-e-comentarios.md), [08-denuncias-e-feedback.md](./08-denuncias-e-feedback.md) e API `10-DashboardAdmin.md` · [Índice](./README.md)

Conecta a home administrativa (`/admin/dashboard`) ao agregado `GET /api/admin/stats`.

---

## 🛠️ Tarefas

- [ ] Consumir `GET /api/admin/stats?period=` em `/admin/dashboard`, alimentando os cards de filas de atenção, KPIs, gráficos temporais e distribuição por categoria.
- [ ] Remover `src/mocks/admin-dashboard.ts` (último arquivo de `src/mocks/`).
