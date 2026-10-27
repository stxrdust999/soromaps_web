# 🧭 ADR — decisões de implementação por módulo

Registro do **que foi decidido e construído**, não do que falta — isso é
`/docs/todo`. Cada ADR nasce quando um módulo sai do brainstorm e vira código,
mesmo que ainda esteja sobre mock: a decisão de layout, de componente, de
regra de negócio já foi tomada e não deveria se perder quando o `todo/*.md`
correspondente for atualizado.

## Convenção

- Um arquivo por módulo (não por decisão isolada) em `adr/<área>/000N-titulo-curto.md`
- `<área>` espelha `docs/todo/{admin,business,user}/` — cria a subpasta
  quando o primeiro módulo daquela área sair do mock
- Numeração sequencial *dentro de cada subpasta*, começando em `0001`
- Template mínimo:

```markdown
# Título da decisão

> Módulo: <área>/<nome> · Rota: `/rota` · Data: AAAA-MM-DD

## O que foi implementado
(peças/componentes principais e onde vivem)

## Decisões
(o que foi decidido e por quê — inclusive o que o escopo original não previa)

## Pendências conhecidas
(o que ainda é decorativo, fixo ou incompleto nesta tela)
```

## Pipeline

`todo/<área>/<módulo>.md` é **só planejamento**: ideia, por que vale,
dependências, escopo. No momento em que uma decisão de implementação é
tomada — mesmo que a tela ainda rode sobre `src/mocks/*`, esperando a tabela
real nascer — ela sai do TODO e vira ADR. O `.md` de origem no `todo/` fica só
com uma linha de referência cruzada pro ADR; não existe cópia do mesmo
conteúdo nos dois lugares.

## Índice

### `admin/`

| ADR | Módulo |
|---|---|
| [0001](./admin/0001-dashboard-sobre-mock.md) | Dashboard |
| [0002](./admin/0002-categorias-padrao-listagem.md) | Categorias |
| [0003](./admin/0003-moderacao-mestre-detalhe.md) | Moderação de pontos |
| [0004](./admin/0004-conquistas-catalogo-trophy-kit.md) | Conquistas (catálogo) |
| [0005](./admin/0005-denuncias-agrupadas-por-alvo.md) | Denúncias e feedback |
| ~~0006~~ | Comércios — módulo cancelado em 2026-08-19; ADR em `docs/archive/gerenciamento-por-dono/` |
| [0007](./admin/0007-avaliacoes-remocao-unificada.md) | Avaliações |

### `user/`

| ADR | Módulo |
|---|---|
| [0001](./user/0001-explorar-lugares-sobre-mock.md) | Descobrir (era Explorar lugares, até `/places` fundir em `/discover`) |
| [0002](./user/0002-feed-sem-grafo-social.md) | Feed |
| [0003](./user/0003-comunidade-selo-e-pauta-ia.md) | Comunidade e pautas |
| [0004](./user/0004-perfil-hub-com-abas.md) | Perfil (absorveu visitas, favoritos, conquistas e estatísticas) |
| [0005](./user/0005-alinhamento-hidratacao-pautas-geolocalizacao-e-ui.md) | Alinhamento full-stack: métricas, pautas livres, geolocalização real e microinterações |
