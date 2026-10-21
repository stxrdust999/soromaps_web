# 🧭 06. Visitas, Favoritos, Estatísticas e Verificação

> **Status:** 💤 Pendente · **Depende de:** [03-catalogo-locais-e-categorias.md](./03-catalogo-locais-e-categorias.md) e API `06-AtividadeDoExplorador.md` · [Índice](./README.md)

Pluga as ações de check-in e favoritar na ficha do local e abastece as abas de `/profile` com dados reais do explorador.

---

## 🛠️ Tarefas

- [ ] Criar `checkInVisitAction` (`POST /api/places/{placeId}/visits`) lendo coordenadas via `navigator.geolocation` no cliente e tratando os códigos `visit.too_far` e `visit.already_checked_in_today`.
- [ ] Criar `toggleFavoriteAction` (`POST/DELETE /api/places/{placeId}/favorite`).
- [ ] Conectar `/profile` (visão geral) a `GET /api/users/me/verification` para renderizar a régua do selo de Explorador Verificado com contadores reais.
- [ ] Conectar `/profile/visits` a `GET /api/users/me/visits`.
- [ ] Conectar `/profile/favorites` a `GET /api/users/me/favorites`.
- [ ] Conectar `/profile/stats` a `GET /api/users/me/stats`.
- [ ] Remover `src/mocks/profile.ts`.
