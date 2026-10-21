# 🧭 02. Jornada do Explorador

> [← Voltar ao Índice da Wiki](./00-home.md)

A experiência principal do Soromaps é organizada em torno de sete áreas que respondem a perguntas complementares do dia a dia de quem explora Sorocaba.

---

## 1. Mapa e Gaveta Inicial (`/home`)

- **Pergunta que responde:** *"O que existe perto de mim ou neste canto da cidade agora?"*
- **Como funciona:** O mapa ocupa a tela inteira em segundo plano enquanto uma gaveta deslizante (drawer) traz destaques rápidos. Conforme o usuário navega e aproxima o zoom em Sorocaba, os pins coloridos por categoria aparecem e mostram um resumo rápido no clique, levando para a ficha completa do local.

## 2. Descobrir (`/discover`)

- **Pergunta que responde:** *"Que lugar vale a pena conhecer hoje?"*
- **Como funciona:** Vitrine organizada em trilhas temáticas (melhores avaliados, novidades da semana, lugares com Wi-Fi para trabalhar, espaços pet-friendly, recorte por bairro e por categoria), acompanhada de busca textual e filtros combináveis.

## 3. Ficha do Local (`/places/[id]`) e Sugestão (`/places/new`)

- **Ficha do Local (`/places/[id]`):** Reúne fotos, categoria, bairro, atributos práticos (Wi-Fi, pet-friendly, melhor horário, segredo local), nota média, ações de **Check-in (Visita)** e **Salvar nos Favoritos**, além da lista de avaliações da comunidade (com votos de *"Útil"* e comentários).
- **Sugerir Novo Local (`/places/new`):** Fluxo em duas etapas sobre o mapa:
  1. Posicionar o pino no endereço exato em Sorocaba;
  2. Preencher os detalhes, categoria e dicas locais.
  - Todo ponto sugerido nasce com status **Pendente** até passar pela revisão da curadoria.

## 4. Feed por Vínculo com Lugar (`/feed`)

- **Pergunta que responde:** *"O que está acontecendo nos lugares e bairros que me interessam?"*
- **Como funciona:** Cada card do feed explica explicitamente **por que** está aparecendo para o usuário através de 5 motivos:
  - `Perto`: atividade no bairro declarado pelo usuário;
  - `Salvo`: novidades em um lugar que o usuário favoritou;
  - `Categoria`: lugares do tipo que o usuário mais costuma visitar;
  - `Cidade`: rajadas de movimento em Sorocaba (ex.: *"4 pessoas avaliaram este local hoje"*);
  - `Curadoria`: novas pautas publicadas pela equipe.
- O usuário pode clicar em **"Ver menos disso"** por bairro, categoria ou tipo de card, mantendo controle visível sobre seus filtros no topo da página.

## 5. Comunidade (`/community`) e Pautas (`/pautas/[slug]`)

- **Comunidade (`/community` e `/community/[id]`):** Mostra os exploradores mais ativos da cidade (geral e por bairro) e o perfil público de cada membro — suas avaliações, pontos sugeridos aprovados, conquistas e se possui o selo de **Explorador Verificado**.
- **Pautas Editoriais (`/pautas/[slug]`):** Roteiros e listas temáticas ancoradas em pontos reais do mapa (ex.: *"Onde tomar café da manhã no Campolim"*). Podem ser rascunhadas com auxílio de IA (Gemini) a partir dos dados factuais do catálogo, mas **só vão ao ar após revisão e publicação humana**, sempre identificando a origem do texto.

## 6. Meu Perfil (`/profile`)

Centraliza toda a jornada pessoal do explorador em cinco abas compartilhando o mesmo cabeçalho:
1. **Visão Geral:** Resumo da conta, próximas conquistas próximas de desbloquear e checklist transparente do selo de Explorador Verificado;
2. **Visitas (`/profile/visits`):** Linha do tempo dos locais onde o usuário fez check-in;
3. **Favoritos (`/profile/favorites`):** Coleção de lugares salvos para ir depois;
4. **Conquistas (`/profile/achievements`):** Galeria de medalhas desbloqueadas e barra de progresso das bloqueadas;
5. **Estatísticas (`/profile/stats`):** Ritmo de exploração por mês, categorias favoritas e cobertura de bairros de Sorocaba.
