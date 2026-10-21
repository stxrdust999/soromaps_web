# 👤 02. Usuários, Perfil e Administração de Contas

> **Status:** ✅ Concluído · **Depende de:** [01-autenticacao-e-sessao.md](./01-autenticacao-e-sessao.md) e API `02-UsuariosAdmin.md` · [Índice](./README.md)

Conecta a gestão de contas do próprio usuário (`/profile` e configurações) e a tabela administrativa (`/admin/users`) aos endpoints reais de `/api/users`.

---

## 🛠️ Tarefas

### 1. Tabela Administrativa (`/admin/users`)
- [x] Atualizar `src/http/users/users.ts` e `src/actions/users.ts` para usar o contrato de `UserResponseDto` (`id: string` UUID, `name`, `email`, `role`, `avatarUrl`, `biography`, `neighborhood`, `createdAt`).
- [x] Atualizar colunas (`columns.tsx`) e filtros de `/admin/users` para exibir o papel (`explorer` / `admin`) e o bairro.
- [x] Tornar o campo de senha opcional no modal de edição de usuário (`update/[id]`), enviando `PATCH /api/users/{id}` via `adminUpdateUser`.
- [x] Tratar o erro `user.last_admin` (`409`) ao tentar excluir ou rebaixar o último administrador.

### 2. Perfil do Usuário Logado (`/profile`)
- [x] Consumir `GET /api/users/me` no layout de `/profile` para exibir nome, e-mail, avatar, bio, bairro e data de cadastro reais.
- [x] Conectar a edição de perfil (`PATCH /api/users/me`) e exclusão da própria conta (`DELETE /api/users/me`) com invalidação de cache via `updateTag("users-me")`.
