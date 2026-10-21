# 🔌 TODO do Front-end — Integração com a API (`soromaps_api`)

> **Estratégia:**
> 1. As pendências de expansão da API estão mapeadas em `../soromaps_api/Docs/Todo/Api/`.
> 2. Conforme os módulos da API ficam prontos e expostos em `/openapi/v1.json`, o front-end gera os clientes tipados via **Orval** sobre `fetch` nativo (`src/lib/client.ts`) e substitui gradualmente os arquivos de `src/mocks/*`.

---

## 📋 Roteiro por Módulo

| # | Módulo | Arquivo | Depende na API de | Status |
|---|---|---|---|---|
| 00 | **Infraestrutura HTTP, Orval, Proxy e Erros** | [00-infra-http-e-erros.md](./00-infra-http-e-erros.md) | Baseline OpenAPI + `ProblemDetails` (✅ Pronto) | ✅ |
| 01 | **Autenticação, Cookies `httpOnly` e Sessão** | [01-autenticacao-e-sessao.md](./01-autenticacao-e-sessao.md) | `AuthController` (✅ Pronto) | ✅ |
| 02 | **Usuários, Perfil e Administração de Contas** | [02-usuarios-e-perfil.md](./02-usuarios-e-perfil.md) | `UsersController` + [02-UsuariosAdmin.md](../../../soromaps_api/Docs/Todo/Api/02-UsuariosAdmin.md) | ✅ |
| 03 | **Catálogo de Locais, Categorias e Mapa** | [03-catalogo-locais-e-categorias.md](./03-catalogo-locais-e-categorias.md) | `PlacesController` / `CategoriesController` + [03-CatalogoELocais.md](../../../soromaps_api/Docs/Todo/Api/03-CatalogoELocais.md) | ✅ |
| 04 | **Moderação de Locais** | [04-moderacao-de-locais.md](./04-moderacao-de-locais.md) | [04-ModeracaoDeLocais.md](../../../soromaps_api/Docs/Todo/Api/04-ModeracaoDeLocais.md) | ✅ |
| 05 | **Avaliações, Comentários e Remoções** | [05-avaliacoes-e-comentarios.md](./05-avaliacoes-e-comentarios.md) | `ReviewsController` / `CommentsController` + [05-AvaliacoesEComentarios.md](../../../soromaps_api/Docs/Todo/Api/05-AvaliacoesEComentarios.md) | ✅ |
| 06 | **Visitas, Favoritos, Estatísticas e Verificação** | [06-atividade-do-explorador.md](./06-atividade-do-explorador.md) | [06-AtividadeDoExplorador.md](../../../soromaps_api/Docs/Todo/Api/06-AtividadeDoExplorador.md) | ✅ |
| 07 | **Gamificação e Conquistas** | [07-gamificacao-e-conquistas.md](./07-gamificacao-e-conquistas.md) | `AchievementsController` + [07-Gamificacao.md](../../../soromaps_api/Docs/Todo/Api/07-Gamificacao.md) | ✅ |
| 08 | **Denúncias e Feedback** | [08-denuncias-e-feedback.md](./08-denuncias-e-feedback.md) | [08-DenunciasEFeedback.md](../../../soromaps_api/Docs/Todo/Api/08-DenunciasEFeedback.md) | 💤 |
| 09 | **Comunidade, Feed e Pautas** | [09-comunidade-feed-e-pautas.md](./09-comunidade-feed-e-pautas.md) | [09-ComunidadeFeedEPautas.md](../../../soromaps_api/Docs/Todo/Api/09-ComunidadeFeedEPautas.md) | 💤 |
| 10 | **Dashboard Administrativo** | [10-dashboard-admin.md](./10-dashboard-admin.md) | [10-DashboardAdmin.md](../../../soromaps_api/Docs/Todo/Api/10-DashboardAdmin.md) | 💤 |
