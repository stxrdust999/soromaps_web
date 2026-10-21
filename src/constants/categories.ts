import {
  BedDouble,
  Beer,
  Bike,
  BookOpen,
  Camera,
  Church,
  Coffee,
  Croissant,
  Dumbbell,
  FerrisWheel,
  Fish,
  Flower2,
  Gamepad2,
  IceCream,
  Landmark,
  type LucideIcon,
  MapPin,
  MoonStar,
  Music,
  Palette,
  Pizza,
  ShoppingBag,
  ShoppingCart,
  Sun,
  Tent,
  Theater,
  Trees,
  Utensils,
  Waves,
  Wine,
} from "lucide-react";

/**
 * Subconjunto do lucide liberado para categoria.
 *
 * Mapa explícito em vez de resolver o ícone pelo nome em runtime: é o que
 * mantém o bundle tree-shakeable e o que impede o banco de guardar um nome de
 * ícone que não existe mais depois de um bump da lucide.
 */
export const CATEGORY_ICONS = {
  utensils: Utensils,
  pizza: Pizza,
  croissant: Croissant,
  fish: Fish,
  "ice-cream": IceCream,
  coffee: Coffee,
  beer: Beer,
  wine: Wine,
  trees: Trees,
  flower: Flower2,
  waves: Waves,
  tent: Tent,
  sun: Sun,
  "moon-star": MoonStar,
  landmark: Landmark,
  church: Church,
  theater: Theater,
  music: Music,
  palette: Palette,
  "book-open": BookOpen,
  camera: Camera,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  "ferris-wheel": FerrisWheel,
  "gamepad-2": Gamepad2,
  dumbbell: Dumbbell,
  bike: Bike,
  "bed-double": BedDouble,
  "map-pin": MapPin,
} satisfies Record<string, LucideIcon>;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

/**
 * Tupla não-vazia de propósito: é o que faz `z.enum` inferir a união literal
 * em `validations/categories.ts` em vez de `string`.
 */
export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS) as [
  CategoryIconKey,
  ...CategoryIconKey[],
];

/**
 * Categorias que descrevem um negócio com dono.
 *
 * Existe para `/admin/businesses`: parque, mirante e trilha são espaço
 * público, e pedido de posse sobre eles é bandeira vermelha, não fluxo normal.
 */
export const COMMERCIAL_CATEGORIES = [
  "Gastronomia",
  "Bar",
  "Cafeteria",
  "Compras",
  "Cultura",
];

/**
 * Paleta pré-aprovada. São doze matizes bem separados em vez de uma escala do
 * tema: no mapa a cor é o que identifica a categoria, então ela precisa de
 * contraste entre pares, não harmonia com a interface.
 */
export const CATEGORY_COLORS = [
  "#ea580c",
  "#16a34a",
  "#7c3aed",
  "#78350f",
  "#db2777",
  "#0891b2",
  "#eab308",
  "#4d7c0f",
  "#475569",
  "#8b5cf6",
  "#0f766e",
  "#1447e6",
];

export const CATEGORIES_LIST_TAG = "categories:list";
export const categoryShowTag = (id: string) => `categories:${id}`;

