export const ACHIEVEMENTS_LIST_TAG = "achievements:list";
export const achievementShowTag = (id: string) => `achievements:${id}`;
export const MY_ACHIEVEMENTS_TAG = "users:me:achievements";
export const MY_VISITS_TAG = "users:me:visits";
export const MY_FAVORITES_TAG = "users:me:favorites";
export const MY_STATS_TAG = "users:me:stats";
export const MY_VERIFICATION_TAG = "users:me:verification";

import {
  Activity,
  Award,
  Beer,
  Bike,
  BookOpen,
  Camera,
  Coffee,
  Compass,
  Crown,
  Flame,
  Footprints,
  Heart,
  Landmark,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  Medal,
  MessageSquare,
  MoonStar,
  Mountain,
  PenLine,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Ticket,
  Trees,
  Trophy,
  Users,
  Utensils,
  Webhook,
  Wine,
} from "lucide-react";

/**
 * Subconjunto do lucide liberado para badge de conquista.
 *
 * Mapa explícito em vez de resolver o ícone pelo nome em runtime — mesma
 * razão de `CATEGORY_ICONS`: tree-shaking, e o banco não guarda nome de ícone
 * que some num bump da lucide.
 */
export const ACHIEVEMENT_ICONS = {
  award: Award,
  trophy: Trophy,
  medal: Medal,
  star: Star,
  sparkles: Sparkles,
  crown: Crown,
  flame: Flame,
  footprints: Footprints,
  compass: Compass,
  map: MapIcon,
  "map-pin": MapPin,
  mountain: Mountain,
  landmark: Landmark,
  trees: Trees,
  coffee: Coffee,
  beer: Beer,
  wine: Wine,
  utensils: Utensils,
  "shopping-bag": ShoppingBag,
  "book-open": BookOpen,
  camera: Camera,
  bike: Bike,
  sun: Sun,
  "moon-star": MoonStar,
  users: Users,
  heart: Heart,
  "pen-line": PenLine,
  "message-square": MessageSquare,
  ticket: Ticket,
} satisfies Record<string, LucideIcon>;

export type AchievementIconKey = keyof typeof ACHIEVEMENT_ICONS;

/** Tupla não-vazia: é o que faz `z.enum` inferir a união literal. */
export const ACHIEVEMENT_ICON_KEYS = Object.keys(ACHIEVEMENT_ICONS) as [
  AchievementIconKey,
  ...AchievementIconKey[],
];

/** Paleta pré-aprovada dos badges — os mesmos doze matizes das categorias. */
export const ACHIEVEMENT_COLORS = [
  "#1447e6",
  "#0891b2",
  "#0f766e",
  "#16a34a",
  "#4d7c0f",
  "#eab308",
  "#ea580c",
  "#78350f",
  "#db2777",
  "#7c3aed",
  "#8b5cf6",
  "#475569",
];

/** Como o motor de concessão descobre que a conquista foi cumprida. */
export type AchievementTrigger = "metric" | "api" | "streak";

export const TRIGGER_LABEL: Record<
  AchievementTrigger,
  { label: string; icon: LucideIcon }
> = {
  metric: { label: "Métrica", icon: Activity },
  api: { label: "API", icon: Webhook },
  streak: { label: "Sequência", icon: Flame },
};

/** Alvo que estreita o critério. `null` é "sem alvo". */
export type AchievementTargetKind = "categoria" | "bairro";

export const TARGET_LABEL: Record<AchievementTargetKind, string> = {
  categoria: "da categoria",
  bairro: "do bairro",
};

/**
 * Catálogo de eventos que um critério pode contar.
 *
 * `verbo` e `substantivo` existem para montar a frase legível
 * (`formatCriterion`) — é o que prova que criar conquista é preencher três
 * campos, não escrever código. `alvos` limita o que faz sentido: seguir
 * usuário não tem categoria nem bairro.
 */
export interface AchievementEventDefinition {
  label: string;
  verbo: string;
  substantivo: string;
  /** Forma singular do substantivo, para quantidade 1. */
  substantivoSingular: string;
  trigger: AchievementTrigger;
  alvos: AchievementTargetKind[];
}

export const ACHIEVEMENT_EVENTS = {
  visitar: {
    label: "Visitar",
    verbo: "Visitar",
    substantivo: "lugares",
    substantivoSingular: "lugar",
    trigger: "metric",
    alvos: ["categoria", "bairro"],
  },
  avaliar: {
    label: "Avaliar",
    verbo: "Escrever",
    substantivo: "avaliações",
    substantivoSingular: "avaliação",
    trigger: "metric",
    alvos: ["categoria", "bairro"],
  },
  seguir: {
    label: "Seguir usuários",
    verbo: "Seguir",
    substantivo: "usuários",
    substantivoSingular: "usuário",
    trigger: "metric",
    alvos: [],
  },
  criar: {
    label: "Criar pontos",
    verbo: "Criar",
    substantivo: "pontos aprovados",
    substantivoSingular: "ponto aprovado",
    trigger: "api",
    alvos: ["categoria", "bairro"],
  },
  favoritar: {
    label: "Favoritar",
    verbo: "Favoritar",
    substantivo: "lugares",
    substantivoSingular: "lugar",
    trigger: "metric",
    alvos: ["categoria", "bairro"],
  },
  sequencia: {
    label: "Visitar em sequência",
    verbo: "Visitar em",
    substantivo: "dias seguidos",
    substantivoSingular: "dia",
    trigger: "streak",
    alvos: [],
  },
} satisfies Record<string, AchievementEventDefinition>;

export type AchievementEventKey = keyof typeof ACHIEVEMENT_EVENTS;

export const ACHIEVEMENT_EVENT_KEYS = Object.keys(ACHIEVEMENT_EVENTS) as [
  AchievementEventKey,
  ...AchievementEventKey[],
];
