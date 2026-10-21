/**
 * Dados fictícios de local — o que o modelo de Ponto ainda **não** persiste.
 *
 * A API devolve `nome`/`lat`/`lng`; foto, categoria, amenidades e o resto só
 * existem aqui, para as telas poderem ser desenhadas e revisadas antes de o
 * schema crescer. Spec do modelo real:
 * `docs/propostas/2026-08-03-expansao-modelo-ponto.md`.
 *
 * Sai daqui quando a API passar a devolver esses campos.
 */

export interface MarkerDetailsMock {
  nome: string;
  bairro: string;
  /** Foto de capa — banner, card do feed e popup do mapa. */
  fotoUrl: string;
  /** Galeria da página do local; a capa entra como primeira. */
  fotos: string[];
  /** Chamada de uma linha, para card e popup do mapa. */
  sobre: string;
  /** Texto da seção "Descrição" da página do local — dois ou três períodos. */
  descricao: string;
  categoria: string;
  /** Atributos livres — alimentam os filtros rápidos e a recomendação. */
  tags: string[];
  temWifi: boolean;
  petFriendly: boolean;
  melhorHorario?: string;
  segredoLocal?: string;
  nota: number;
  totalAvaliacoes: number;
  /** Em km, a partir do centro de Sorocaba — sem cálculo real de distância. */
  distancia: number;
}

const photo = (seed: number) => `https://picsum.photos/seed/${seed}/400/300`;

export const markerDetailsMocks: MarkerDetailsMock[] = [
  {
    nome: "Cabocafé",
    bairro: "Santa Rosália",
    fotoUrl: photo(14),
    fotos: [photo(14), photo(71), photo(72), photo(73)],
    sobre:
      "Café pequeno de esquina, torra própria e bolo de fubá saindo do forno às quatro.",
    descricao:
      "Ocupa uma casa antiga de esquina, com sete mesas e um balcão que quase sempre tem alguém conversando com o barista. O café é torrado ali mesmo, em lotes pequenos, e o quadro-negro muda conforme o que chegou do produtor. Tem tomada em quase toda mesa, o que fez o lugar virar escritório informal de meia dúzia de gente do bairro.",
    categoria: "Cafeteria",
    tags: ["wifi", "trabalho", "calmo"],
    temWifi: true,
    petFriendly: true,
    melhorHorario: "Fim de tarde, depois das 16h",
    segredoLocal: "Peça o café da casa com rapadura — não está no cardápio.",
    nota: 4.8,
    totalAvaliacoes: 21,
    distancia: 1.2,
  },
  {
    nome: "Parque das Águas",
    bairro: "Jardim Abaeté",
    fotoUrl: photo(16),
    fotos: [photo(16), photo(74), photo(75), photo(76)],
    sobre:
      "Pista de caminhada em volta do lago, sombra de verdade e pouca gente no meio da semana.",
    descricao:
      "São quase dois quilômetros de pista contornando o lago, com trecho de terra batida para quem corre e calçada para quem só quer andar. A arborização é antiga, então sombra não falta nem no meio do dia. Fim de semana enche por causa da feirinha na entrada principal; no meio da semana o parque é praticamente de quem mora em volta.",
    categoria: "Parque",
    tags: ["ar livre", "família", "corrida"],
    temWifi: false,
    petFriendly: true,
    melhorHorario: "Manhã de terça a quinta",
    segredoLocal:
      "A entrada dos fundos tem estacionamento livre e fica a 2 minutos do lago.",
    nota: 4.6,
    totalAvaliacoes: 87,
    distancia: 3.4,
  },
  {
    nome: "Bar do Zeca",
    bairro: "Centro",
    fotoUrl: photo(23),
    fotos: [photo(23), photo(77), photo(78), photo(79)],
    sobre:
      "Boteco de balcão, chope gelado e o melhor bolinho de bacalhau da região.",
    descricao:
      "Boteco de balcão comprido no sentido literal: a maior parte da clientela bebe em pé mesmo, e as poucas mesas ficam na calçada. O cardápio é curto e não muda há anos — o bolinho de bacalhau é o que trouxe a fama, mas o pastel de carne segura o mesmo nível. A partir das oito de sexta é difícil achar lugar.",
    categoria: "Bar",
    tags: ["petisco", "boteco", "noite"],
    temWifi: false,
    petFriendly: false,
    melhorHorario: "Sexta a partir das 19h",
    segredoLocal: "Mesa dos fundos é a única com tomada — chega cedo.",
    nota: 4.4,
    totalAvaliacoes: 132,
    distancia: 0.8,
  },
  {
    nome: "Sebo da Rua XV",
    bairro: "Centro",
    fotoUrl: photo(31),
    fotos: [photo(31), photo(80), photo(81), photo(82)],
    sobre:
      "Dois andares de livro usado, com uma seção de quadrinhos que ninguém espera.",
    descricao:
      "O térreo é o que se espera de sebo: literatura, didáticos e uma mesa de promoção que vale garimpar. O segundo andar é a surpresa — uma sala inteira de quadrinhos e revistas antigas, organizada por editora. O dono conhece o acervo de cabeça e acha em dois minutos o que o sistema não encontraria.",
    categoria: "Compras",
    tags: ["livros", "achados", "calmo"],
    temWifi: true,
    petFriendly: true,
    segredoLocal:
      "O dono troca livro por livro se você levar algo da lista dele.",
    nota: 4.9,
    totalAvaliacoes: 44,
    distancia: 1.9,
  },
  {
    nome: "Cantina da Vila",
    bairro: "Vila Hortência",
    fotoUrl: photo(42),
    fotos: [photo(42), photo(83), photo(84), photo(85)],
    sobre: "Massa fresca feita na hora, cardápio curto e fila que anda rápido.",
    descricao:
      "Cantina de bairro no formato clássico: cardápio de uma página, massa feita na hora e molho que não muda de receita desde que abriu. O salão é pequeno e costuma formar fila na porta, mas a rotatividade é alta e a espera raramente passa de quinze minutos. Domingo no almoço é outra história.",
    categoria: "Gastronomia",
    tags: ["massa", "família", "almoço"],
    temWifi: true,
    petFriendly: false,
    melhorHorario: "Evita o almoço de domingo",
    nota: 4.7,
    totalAvaliacoes: 256,
    distancia: 2.6,
  },
  {
    nome: "Mirante do Ipanema",
    bairro: "Ipanema das Pedras",
    fotoUrl: photo(57),
    fotos: [photo(57), photo(86), photo(87), photo(88)],
    sobre:
      "Vista aberta da represa, ideal para o fim de tarde e para quem leva câmera.",
    descricao:
      "Ponto alto com vista limpa da represa, sem grade nem construção atrapalhando o enquadramento. Não tem estrutura nenhuma: nem banco, nem banheiro, nem quiosque — quem vai leva o que precisa. Em compensação, é o melhor pôr do sol que se acha sem sair da cidade.",
    categoria: "Lazer",
    tags: ["ar livre", "pôr do sol", "vista"],
    temWifi: false,
    petFriendly: true,
    melhorHorario: "Uma hora antes do pôr do sol",
    segredoLocal:
      "Suba pela trilha da direita: chega no mesmo lugar sem a subida íngreme.",
    nota: 4.5,
    totalAvaliacoes: 63,
    distancia: 5.1,
  },
  {
    nome: "Parque Campolim",
    bairro: "Parque Campolim",
    fotoUrl: photo(11),
    fotos: [photo(11), photo(89), photo(90), photo(91)],
    sobre:
      "Pista larga, playground novo e o gramado que vira piquenique no fim de semana.",
    descricao:
      "O parque mais movimentado da zona sul, com pista de 1,4 km em piso emborrachado e aparelhos de ginástica em três pontos do percurso. O playground foi refeito e é o motivo de metade das famílias irem. Domingo de manhã a pista fica cheia, mas o gramado dos fundos quase sempre tem sombra livre.",
    categoria: "Parque",
    tags: ["ar livre", "família", "corrida"],
    temWifi: false,
    petFriendly: true,
    melhorHorario: "Antes das 9h, antes de encher",
    nota: 4.4,
    totalAvaliacoes: 132,
    distancia: 0.8,
  },
  {
    nome: "Cachorródromo do Éden",
    bairro: "Éden",
    fotoUrl: photo(12),
    fotos: [photo(12), photo(92), photo(93), photo(94)],
    sobre: "Área cercada só para cachorro, com bebedouro e sombra o dia todo.",
    descricao:
      "Espaço cercado com portão duplo, dividido entre cães grandes e pequenos, o que resolve a briga de porte que costuma azedar esse tipo de lugar. Tem bebedouro, saquinho e um bosque em volta que segura o sol. É simples e bem cuidado — a manutenção é feita pelos próprios frequentadores.",
    categoria: "Lazer",
    tags: ["pets", "ar livre", "gratuito"],
    temWifi: false,
    petFriendly: true,
    melhorHorario: "Fim de tarde, quando esfria",
    segredoLocal: "O portão lateral evita a fila do estacionamento principal.",
    nota: 4.9,
    totalAvaliacoes: 44,
    distancia: 1.9,
  },
  {
    nome: "Prainha da Aparecidinha",
    bairro: "Aparecidinha",
    fotoUrl: photo(13),
    fotos: [photo(13), photo(95), photo(96), photo(97)],
    sobre: "Faixa de areia às margens do rio, com quiosque e mesa na sombra.",
    descricao:
      "Trecho de margem transformado em área de lazer, com areia levada e quiosques de concreto. A água não é para banho, mas a vista e a brisa entregam o resto. Feriado enche cedo; dia de semana é praticamente vazio e vira ponto de quem quer ler ou pescar.",
    categoria: "Lazer",
    tags: ["água", "família", "ar livre"],
    temWifi: false,
    petFriendly: true,
    nota: 4.3,
    totalAvaliacoes: 78,
    distancia: 3.2,
  },
  {
    nome: "Largo do Café",
    bairro: "Centro",
    fotoUrl: photo(15),
    fotos: [photo(15), photo(98), photo(99), photo(100)],
    sobre: "Bar de esquina com mesa na calçada e música ao vivo na quinta.",
    descricao:
      "Ocupa o térreo de um casarão do centro, com metade das mesas na calçada e o resto num salão de pé-direito alto. A cozinha é pequena e o cardápio acompanha: cinco petiscos que saem bem. Quinta tem samba de roda a partir das oito, sem couvert.",
    categoria: "Bar",
    tags: ["música", "noite", "ao ar livre"],
    temWifi: true,
    petFriendly: true,
    melhorHorario: "Quinta à noite, no samba",
    nota: 4.6,
    totalAvaliacoes: 91,
    distancia: 0.6,
  },
  {
    nome: "Feira da Manga",
    bairro: "Vila Haro",
    fotoUrl: photo(17),
    fotos: [photo(17), photo(101), photo(102), photo(103)],
    sobre:
      "Feira de rua de sábado, com pastel de feira que sustenta a fama sozinho.",
    descricao:
      "Quatro quarteirões de barraca, das seis ao meio-dia de sábado. A parte de hortifruti é boa e barata, mas o que forma fila é a barraca de pastel do meio da rua. Vá com dinheiro trocado: metade dos feirantes ainda não aceita cartão.",
    categoria: "Gastronomia",
    tags: ["feira", "barato", "manhã"],
    temWifi: false,
    petFriendly: true,
    melhorHorario: "Sábado antes das 9h",
    segredoLocal: "A última barraca da rua vende o resto por metade do preço.",
    nota: 4.7,
    totalAvaliacoes: 164,
    distancia: 2.1,
  },
  {
    nome: "Padaria Estação",
    bairro: "Vila Barcelona",
    fotoUrl: photo(18),
    fotos: [photo(18), photo(104), photo(105), photo(106)],
    sobre: "Pão saindo do forno de hora em hora e café da manhã até as onze.",
    descricao:
      "Padaria de bairro no formato antigo, com balcão comprido e mesas de fórmica. O pão sai de hora em hora e dá para ouvir a campainha do forno do outro lado do salão. O café da manhã servido no balcão custa menos que em qualquer cafeteria da região e vem com pão na chapa de verdade.",
    categoria: "Gastronomia",
    tags: ["café da manhã", "barato", "pão"],
    temWifi: true,
    petFriendly: false,
    melhorHorario: "Entre 7h e 9h",
    nota: 4.5,
    totalAvaliacoes: 203,
    distancia: 1.4,
  },
  {
    nome: "Museu Ferroviário",
    bairro: "Vila Hortência",
    fotoUrl: photo(19),
    fotos: [photo(19), photo(107), photo(108), photo(109)],
    sobre:
      "Locomotivas preservadas na antiga estação, com entrada gratuita o ano todo.",
    descricao:
      "Instalado no prédio original da estação, guarda locomotivas, vagões e o acervo de documentos da ferrovia que fez a cidade crescer. A visita leva uma hora sem pressa e o pátio externo é liberado para foto. Entrada gratuita, fecha às segundas.",
    categoria: "Cultura",
    tags: ["história", "coberto", "gratuito"],
    temWifi: false,
    petFriendly: false,
    melhorHorario: "Terça a sexta, sem escola em visita",
    nota: 4.8,
    totalAvaliacoes: 119,
    distancia: 2.9,
  },
  {
    nome: "Casa da Memória",
    bairro: "Centro",
    fotoUrl: photo(20),
    fotos: [photo(20), photo(110), photo(111), photo(112)],
    sobre:
      "Casarão restaurado com exposição rotativa de artista da região e café nos fundos.",
    descricao:
      "Casarão do século passado restaurado como centro cultural: três salas de exposição que trocam a cada dois meses, sempre com artista da região, e um café no jardim dos fundos. A programação é divulgada só no mural da entrada e na rede social — vale conferir antes de ir.",
    categoria: "Cultura",
    tags: ["exposição", "café", "coberto"],
    temWifi: true,
    petFriendly: false,
    segredoLocal:
      "O café dos fundos abre mesmo quando a exposição está em montagem.",
    nota: 4.6,
    totalAvaliacoes: 57,
    distancia: 1.1,
  },
  {
    nome: "Bosque dos Ipês",
    bairro: "Jardim Vera Cruz",
    fotoUrl: photo(21),
    fotos: [photo(21), photo(113), photo(114), photo(115)],
    sobre: "Mata fechada com trilha curta e florada de ipê que para o bairro.",
    descricao:
      "Área de mata preservada com uma trilha de 800 metros bem marcada e bancos no meio do percurso. Em agosto os ipês floridos viram ponto de foto do bairro inteiro. Não tem estrutura além dos bancos e de uma torneira na entrada.",
    categoria: "Parque",
    tags: ["ar livre", "trilha", "calmo"],
    temWifi: false,
    petFriendly: true,
    melhorHorario: "Agosto, na florada",
    nota: 4.7,
    totalAvaliacoes: 38,
    distancia: 4.3,
  },
  {
    nome: "Café da Esquina Velha",
    bairro: "Além Ponte",
    fotoUrl: photo(22),
    fotos: [photo(22), photo(116), photo(117), photo(118)],
    sobre: "Cafeteria minúscula, seis lugares e um croissant que acaba cedo.",
    descricao:
      "São seis lugares no total, contando o balcão da janela. A padaria é feita na hora e o croissant costuma acabar antes das dez. Não tem mesa para grupo nem intenção de ter — é lugar de café rápido e conversa curta.",
    categoria: "Cafeteria",
    tags: ["café", "pequeno", "manhã"],
    temWifi: true,
    petFriendly: true,
    melhorHorario: "Abre às 7h — o croissant acaba às 10h",
    segredoLocal: "Encomende o croissant na véspera pelo balcão.",
    nota: 4.9,
    totalAvaliacoes: 66,
    distancia: 2.4,
  },
  {
    nome: "Galeria Rio Branco",
    bairro: "Centro",
    fotoUrl: photo(24),
    fotos: [photo(24), photo(119), photo(120), photo(121)],
    sobre:
      "Galeria antiga com lojas de disco, conserto de relógio e uma lanchonete de balcão.",
    descricao:
      "Galeria comercial dos anos setenta que sobreviveu inteira: loja de disco, chaveiro, conserto de relógio e uma lanchonete de balcão no fundo. É o tipo de lugar que se atravessa por acaso e se volta de propósito. Fecha cedo, às seis.",
    categoria: "Compras",
    tags: ["achados", "coberto", "vintage"],
    temWifi: false,
    petFriendly: false,
    melhorHorario: "Fecha às 18h — vá antes das 17h",
    nota: 4.4,
    totalAvaliacoes: 82,
    distancia: 1.0,
  },
];

/**
 * Escolhe um mock a partir do id do marker. Determinístico de propósito: o
 * mesmo ponto mostra sempre os mesmos dados, em vez de trocar a cada render.
 *
 * @param id Id do marker.
 * @returns Detalhes fictícios correspondentes.
 */
export function getMarkerDetailsMock(id: number | string): MarkerDetailsMock {
  const numericId = typeof id === "number" ? id : (parseInt(id, 10) || id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const index = Math.abs(numericId) % markerDetailsMocks.length;
  return markerDetailsMocks[index];
}

/**
 * O mesmo catálogo, com id. O id é o índice justamente para
 * `getMarkerDetailsMock(id)` devolver este item — quem precisa escolher um
 * lugar numa lista (o gerador de pauta, por exemplo) usa daqui.
 */
export const markerCatalogMock = markerDetailsMocks.map((details, index) => ({
  id: index,
  ...details,
}));

/**
 * Quem mais visitou um local. Depende de três coisas que o banco não tem:
 * tabela `Visita`, FK ligando visita a usuário e a pontuação/nível do perfil.
 */
export interface PlaceVisitorMock {
  nome: string;
  nivel: number;
  visitas: number;
  /** Ausente de propósito em alguns: exercita o fallback de inicial do avatar. */
  avatarUrl?: string;
}

const avatar = (seed: string) => `https://picsum.photos/seed/${seed}/80/80`;

const placeLeaderboardMocks: PlaceVisitorMock[][] = [
  [
    { nome: "Maria S.", nivel: 8, visitas: 42, avatarUrl: avatar("maria") },
    { nome: "João P.", nivel: 7, visitas: 38, avatarUrl: avatar("joao") },
    { nome: "Ana Clara", nivel: 5, visitas: 21 },
  ],
  [
    { nome: "Rafael T.", nivel: 9, visitas: 57, avatarUrl: avatar("rafael") },
    { nome: "Bruna L.", nivel: 6, visitas: 33 },
    { nome: "Diego M.", nivel: 4, visitas: 18, avatarUrl: avatar("diego") },
  ],
  [
    { nome: "Camila R.", nivel: 7, visitas: 29, avatarUrl: avatar("camila") },
    { nome: "Otávio F.", nivel: 5, visitas: 24, avatarUrl: avatar("otavio") },
    { nome: "Lúcia N.", nivel: 3, visitas: 11 },
  ],
];

/**
 * Ranking de visitantes de um local, escolhido pelo id como o
 * `getMarkerDetailsMock` — o mesmo lugar mantém o mesmo pódio.
 *
 * @param id Id do marker.
 * @returns Visitantes em ordem decrescente de visitas.
 */
export function getPlaceLeaderboardMock(id: number): PlaceVisitorMock[] {
  const index = Math.abs(id) % placeLeaderboardMocks.length;
  return placeLeaderboardMocks[index];
}

/**
 * Comentário em destaque de um explorador verificado. Depende de `Analise`
 * (o comentário em si) e do selo de verificação, que ainda não existe em
 * lugar nenhum — ver o backlog de produto no `CLAUDE.md`.
 */
export interface PlaceCommentMock {
  nome: string;
  nivel: number;
  avatarUrl?: string;
  comentario: string;
}

const placeCommentMocks: PlaceCommentMock[] = [
  {
    nome: "Maria S.",
    nivel: 8,
    avatarUrl: avatar("maria"),
    comentario:
      "Venho aqui há dois anos e nunca me decepcionou. O atendimento faz toda a diferença.",
  },
  {
    nome: "Rafael T.",
    nivel: 9,
    avatarUrl: avatar("rafael"),
    comentario:
      "Melhor lugar do bairro pra ir sem pressa. Sempre tem mesa livre no meio da semana.",
  },
  {
    nome: "Camila R.",
    nivel: 7,
    comentario:
      "Descobri por acaso e virou parada obrigatória. Vale o desvio, mesmo vindo de longe.",
  },
];

/**
 * Comentário destacado de um local, escolhido pelo id como os outros mocks.
 *
 * @param id Id do marker.
 * @returns Comentário fictício de explorador verificado.
 */
export function getPlaceCommentMock(id: number): PlaceCommentMock {
  const index = Math.abs(id) % placeCommentMocks.length;
  return placeCommentMocks[index];
}
