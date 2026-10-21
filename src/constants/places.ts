export const PLACES_LIST_TAG = "places:list";
export const placeShowTag = (id: string | number) => `places:${id}`;
export const placeReviewsTag = (id: string | number) => `places:${id}:reviews`;
export const MODERATION_QUEUE_TAG = "moderation:queue";
export const MODERATION_HISTORY_TAG = "moderation:history";
export const ADMIN_REVIEWS_LIST_TAG = "admin:reviews:list";

export interface PlaceCategory {
  label: string;
  /** Gradiente do bloco em "Explorar por tipo" — identidade visual da categoria. */
  gradient: string;
}

export const PLACE_CATEGORIES: PlaceCategory[] = [
  { label: "Parque", gradient: "from-emerald-500 to-teal-600" },
  { label: "Cafeteria", gradient: "from-amber-500 to-orange-600" },
  { label: "Bar", gradient: "from-violet-500 to-purple-600" },
  { label: "Gastronomia", gradient: "from-sky-500 to-blue-600" },
  { label: "Cultura", gradient: "from-pink-500 to-rose-600" },
  { label: "Lazer", gradient: "from-cyan-500 to-sky-600" },
  { label: "Compras", gradient: "from-indigo-500 to-blue-700" },
];

/**
 * Filtro que não é categoria: casa com `petFriendly`, não com `categoria`.
 * Fica junto dos chips porque, para quem busca, "aceita cachorro" e "é um
 * parque" são a mesma pergunta — o que muda é só onde o dado mora.
 */
export const PET_FRIENDLY_FILTER = "Pet friendly";

const PLACE_TAG_COLORS = [
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  "bg-teal-500/15 text-teal-700 dark:text-teal-400",
];

/**
 * Cor de uma tag, escolhida pelo próprio rótulo. Determinístico para "ar
 * livre" ser sempre da mesma cor em toda a aplicação — cor que muda entre
 * telas viraria ruído, não informação.
 *
 * @param tag Rótulo da tag.
 * @returns Classes de fundo e texto.
 */
export function placeTagColor(tag: string): string {
  const hash = [...tag].reduce((total, char) => total + char.charCodeAt(0), 0);
  return PLACE_TAG_COLORS[hash % PLACE_TAG_COLORS.length];
}

export interface PlaceVibe {
  label: string;
  gradient: string;
  /** Casa quando o local tem qualquer uma destas tags. */
  anyTags?: string[];
  /** Casa quando o local aceita pet. */
  petFriendly?: boolean;
  /** Casa quando o local tem wifi. */
  wifi?: boolean;
}

/**
 * Segundo eixo de busca: categoria responde "o que é", vibe responde "pra
 * quê". Um bar e um parque podem servir à mesma noite com a galera.
 *
 * Declarativo em vez de uma coluna `vibe` no local: a intenção é combinação de
 * atributos que já existem, e um lugar cabe em mais de uma. Quando o modelo
 * real chegar, isto vira cláusula de consulta — não campo novo.
 */
export const PLACE_VIBES: PlaceVibe[] = [
  {
    label: "Bom para trabalhar",
    gradient: "from-cyan-500 to-blue-600",
    wifi: true,
  },
  {
    label: "Romântico",
    gradient: "from-pink-500 to-rose-600",
    anyTags: ["pôr do sol", "vista", "música"],
  },
  {
    label: "Com a galera",
    gradient: "from-amber-500 to-orange-600",
    anyTags: ["noite", "boteco", "música", "feira"],
  },
  {
    label: "Só relaxar",
    gradient: "from-emerald-500 to-teal-600",
    anyTags: ["calmo", "trilha", "vista"],
  },
  {
    label: "Com o pet",
    gradient: "from-violet-500 to-purple-600",
    petFriendly: true,
  },
  {
    label: "Fim de tarde",
    gradient: "from-orange-500 to-red-600",
    anyTags: ["pôr do sol", "ar livre", "café"],
  },
];
