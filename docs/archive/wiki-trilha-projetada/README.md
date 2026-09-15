# 📐 Wiki — trilha projetada (TCC), arquivada em 20/08/2026

> Nada aqui é fonte de verdade. É o que o TCC **especificou no papel**, antes
> de existir código.

Até 20/08/2026 a wiki tinha **duas trilhas paralelas** — "projetado" e "atual" —
mais uma página-ponte comparando as duas. As seis páginas desta pasta eram a
trilha projetada.

## Por que saiu da wiki

O produto divergiu do desenho original em quase todos os eixos, e as decisões
que produziram cada divergência já estão registradas em
[`/CLAUDE.md`](../../../CLAUDE.md) e em [`docs/adr/`](../../adr/README.md) —
com data e motivo. Manter a especificação antiga viva na wiki, em paralelo,
fazia a documentação afirmar duas coisas incompatíveis sobre o mesmo sistema e
obrigava quem chegava a descobrir sozinho qual das duas valia.

Três divergências que a trilha projetada não acompanha, como exemplo:

| A trilha projetada diz | O produto decidiu |
|---|---|
| RF-13 — seguir usuários, feed de grafo social | `Segue` fora do escopo; o feed é por vínculo com lugar (17/08) |
| Persona Augusto — dono de estabelecimento gerencia o próprio ponto | Grupo `business/` cancelado inteiro (19/08) |
| Gamificação com `pontuacao` e `nivel` | Só conquista; "nível" é título derivado de `COUNT(conquistas)` (12/08) |

## Conteúdo

| Arquivo | O que era |
|---|---|
| [01 — Visão geral](./01-visao-geral.md) | Dores, modelo de negócio, personas Augusto e Sara |
| [02 — Requisitos](./02-requisitos.md) | RF-01 a RF-13 e rastreabilidade para casos de uso |
| [03 — Casos de uso](./03-casos-de-uso.md) | Atores e relações `include`/`extend` do diagrama do TCC |
| [04 — Arquitetura projetada](./04-arquitetura-projetada.md) | Node/Express/SQL Server/Mapbox/AWS e o fluxo MVC |
| [05 — Modelagem projetada](./05-modelagem-projetada.md) | Diagrama de classes, DER e modelo lógico de 10 tabelas |
| [06 — Protótipo](./06-prototipo.md) | Lovable, Figma e os vídeos de apresentação |

O **texto** destas páginas é o original, sem uma linha reescrita — é o que as
torna registro. Só os **links relativos** foram religados para o lugar novo de
cada destino, porque link quebrado não preserva história nenhuma.

## O que ocupou o lugar de cada uma

| Assunto | Onde vive hoje |
|---|---|
| Visão de produto | [`wiki/01-visao-geral.md`](../../wiki/01-visao-geral.md) — o produto de hoje, não o do papel |
| Requisitos e casos de uso | `docs/diagramas/` — leitura do código atual (pasta local, fora do controle de versão) |
| Modelo de dados de destino | `soromaps_api/docs/diagramas/modelo-de-dados/` — as 20 tabelas que as telas de hoje exigem |
| Arquitetura e stack | [`wiki/02-arquitetura.md`](../../wiki/02-arquitetura.md) |
| Por que cada tela é assim | [`docs/adr/`](../../adr/README.md) |
