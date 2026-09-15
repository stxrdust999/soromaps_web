> ⚠️ **Duas tabelas.** As telas construídas já exigem cerca de vinte — o desenho
> dessa estrutura vive em `soromaps_api/docs/diagramas/modelo-de-dados/`
> (versionado lá), e a distância até lá está em [09 — Backlog](./09-backlog.md).

# 🐘 03. Banco

PostgreSQL gerenciado no **Supabase**, acessado via EF Core com o provider `Npgsql.EntityFrameworkCore.PostgreSQL`. **Duas tabelas**, ambas mapeadas por Data Annotations nos models de `soromaps_api/Models`.

A connection string vive nas Application Settings do Azure App Service (`ConnectionStrings__DefaultConnection`) e nunca entra no repositório — ver [08 — Deploy](./08-deploy.md).

```mermaid
erDiagram
    tbUsuario {
        int id PK
        string user_name
        string user_email
        string user_password
        timestamp created_at
        timestamp updated_at
    }

    markers {
        int id PK
        string nome
        double lat
        double lng
    }
```

Não há linha ligando as duas: **`markers` não sabe quem criou o ponto**. Sem
essa FK não há como aplicar permissão de edição, atribuir contribuição no
ranking da comunidade nem contar visita — três coisas que as telas já desenham
sobre mock.

---

## 📇 `tbUsuario`

Mapeada por `Models/User.cs`:

```csharp
[Table("tbUsuario")]
public class User
{
    [Column("id")] public int Id { get; set; }
    [Column("user_name")] public string UserName { get; set; }
    [Column("user_email")] public string Email { get; set; }
    [Column("user_password")] public string Password { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("updated_at")] public DateTime UpdatedAt { get; set; }
}
```

| Coluna | Tipo .NET | Observação |
|---|---|---|
| `id` | `int` | PK por convenção do EF Core (propriedade `Id`) |
| `user_name` | `string` | **É o identificador de login** — ver [05 — Autenticação](./05-autenticacao-e-sessao.md) |
| `user_email` | `string` | Obrigatório no cadastro (`createUserSchema`), mas não usado para autenticar |
| `user_password` | `string` | Hash BCrypt, gerado em `UsersController.Create` |
| `created_at` / `updated_at` | `DateTime` | Preenchidos manualmente com `DateTime.UtcNow` no controller |

**Ausentes, e ainda esperados:** papel (`admin` × explorador) e os contadores
de contribuição que alimentam título de explorador e selo de verificado. Sem
papel, `/admin` fica aberto a qualquer sessão válida.

**Ausentes, e agora fora do escopo:** `tipoUsuario`, `CPF`, `CNPJ` (dono de
estabelecimento cancelado em 19/08/2026) e `pontuacao`/`nivel` (gamificação
ficou só com conquista em 12/08/2026 — o "nível" virou título derivado da
contagem). Não são dívida; são escopo cortado.

Também não há constraint de unicidade declarada em `user_name` ou `user_email`. Como o login busca por `user_name`, duplicatas fariam `FirstOrDefault` devolver sempre a primeira linha encontrada.

---

## 📍 `markers`

Mapeada por `Models/Marker.cs`:

```csharp
[Table("markers")]
public class Marker
{
    [Column("id")] public int Id { get; set; }
    [Column("nome")] public string Nome { get; set; }
    [Column("lat")] public double Lat { get; set; }
    [Column("lng")] public double Lng { get; set; }
}
```

| Coluna | Tipo .NET | Observação |
|---|---|---|
| `id` | `int` | PK |
| `nome` | `string` | Preenchido pelo formulário de `/places/new` desde 03/08/2026 |
| `lat` / `lng` | `double` | Resolvem o `Coordenadas` que o modelo lógico esqueceu |

**Ausentes:** descrição, foto, contato, `UsuarioDono` (FK), `CategoriaID` (FK),
`status`, endereço e bairro.

O formulário de `/places/new` **já coleta oito campos e a API recebe três** — o
resto é validado no navegador e descartado. É deliberado: o conceito foi
aprovado em 03/08/2026 e o spec está em
[`docs/propostas/2026-08-03-expansao-modelo-ponto.md`](../propostas/2026-08-03-expansao-modelo-ponto.md).

Consequências que já se veem nas telas: sem `status` a fila de
`/admin/moderation` roda inteira sobre mock; sem `UsuarioDono` qualquer sessão
edita ou apaga qualquer ponto; sem bairro o ranking por bairro de `/community` e
a cobertura de `/profile/stats` não têm de onde sair.

---

## ⚠️ Sem migrations

O projeto **não tem pasta `Migrations/`** nem o pacote `Microsoft.EntityFrameworkCore.Design`. O schema foi criado **manualmente no SQL Editor do Supabase**, e o EF Core só o consome.

Implicações:

- Não existe forma reproduzível de subir o banco do zero — quem clona o repo precisa do DDL por fora.
- Mudança de model não gera diff versionado.
- Ambiente local e Supabase podem divergir sem ninguém perceber: são dois schemas mantidos à mão, sem nada que os compare.
- As tabelas que faltam não têm caminho automático para nascer — cada uma vai ser DDL escrito à mão, duas vezes.

Primeiro passo para resolver:

```bash
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 🔤 Nomenclatura inconsistente

| Tabela | Padrão do nome | Padrão das colunas |
|---|---|---|
| `tbUsuario` | Prefixo `tb` + português singular | `snake_case` em inglês (`user_name`) |
| `markers` | Plural em inglês, sem prefixo | Misto: `nome` (pt), `lat`/`lng` (universal) |

Três convenções diferentes em duas tabelas. Vale padronizar antes de criar as próximas oito — a escolha importa menos que a consistência.

---

## 🧭 Decisões deste domínio

### `lat`/`lng` como colunas `double` separadas
**Decisão:** guardar a coordenada em dois `double` em vez de um tipo geográfico.
**Motivo:** é exatamente o que MapLibre consome (`[lng, lat]`), sem conversão. Alternativa a considerar quando entrar busca por raio: PostGIS com `geography(Point)`, que dá índice espacial e cálculo de distância nativo — hoje seria complexidade sem uso.

### Hash BCrypt na aplicação, não no banco
**Decisão:** `BCrypt.Net.BCrypt.HashPassword` no controller, gravando o hash pronto.
**Motivo:** mantém o banco agnóstico e o custo do algoritmo configurável em código.

---

## ➡️ Próxima página

[04 — Endpoints da API](./04-api-endpoints.md)
