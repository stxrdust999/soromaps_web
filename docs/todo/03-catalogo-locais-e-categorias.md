# 📍 03. Catálogo de Locais, Categorias e Mapa

> **Status:** 💤 Pendente · **Depende de:** [00-infra-http-e-erros.md](./00-infra-http-e-erros.md) e API `03-CatalogoELocais.md` · [Índice](./README.md)

Substitui `src/mocks/markers.ts` e `src/mocks/admin-categories.ts` pelos endpoints reais de `/api/places`, `/api/categories` e `/api/tags`.

---

## 🛠️ Tarefas

### 1. Categorias (`/admin/categories` e filtros)
- [ ] Conectar `/admin/categories` a `GET /api/categories?includeInactive=true`, `POST /api/categories`, `PATCH /api/categories/{id}`, `PATCH /api/categories/order` e `DELETE /api/categories/{id}?reassignTo=`.
- [ ] Substituir listas estáticas de categorias nos filtros do mapa (`/home`), descoberta (`/discover`) e formulário de criação (`/places/new`) por `GET /api/categories`.
- [ ] Remover `src/mocks/admin-categories.ts`.

### 2. Mapa (`/home`) e Hook `use-markers.ts`
- [ ] Atualizar `src/hooks/use-markers.ts` para buscar `/api/proxy/places?bbox=...` passando o bounding box atual do viewport do `MapLibre`.
- [ ] Adaptar os tipos de `MarkerResource` para `PlaceResponseDto` (`id: string` UUID, `name`, `latitude`, `longitude`, `category`, `ratingAverage`, `reviewsCount`, `coverPhotoUrl`).

### 3. Descoberta (`/discover`), Detalhe (`/places/[id]`) e Criação (`/places/new`)
- [ ] Conectar `/discover` a `GET /api/places` com filtros de categoria, tag, bairro e busca textual.
- [ ] Conectar `/places/new` (`createPlaceAction`) a `POST /api/places` + fluxo de upload de fotos assinadas no Supabase Storage (`POST /api/places/{id}/photos/upload-url` → `PUT` → `POST /api/places/{id}/photos`).
- [ ] Conectar `/places/[id]` a `GET /api/places/{id}`, exibindo botão de editar/excluir apenas para o autor do local ou `admin`.
- [ ] Remover `src/mocks/markers.ts`.
