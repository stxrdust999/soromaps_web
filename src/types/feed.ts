import type { AchievementIconKey } from "@/constants/achievements";
import type { FeedReason } from "@/constants/feed";

export const FEED_ANCHOR = "2026-08-17";

/**
 * Data absoluta de um item do feed em formato ISO `yyyy-MM-dd`.
 */
export function feedItemDate(diasAtras: number): string {
  const date = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

export type FeedItemKind =
  | "avaliacao"
  | "movimento"
  | "novo-ponto"
  | "conquista"
  | "marco"
  | "curadoria";

export const FEED_KIND_LABEL: Record<FeedItemKind, string> = {
  avaliacao: "avaliações",
  movimento: "movimento de lugares",
  "novo-ponto": "pontos novos",
  conquista: "conquistas",
  marco: "marcos de lugares",
  curadoria: "pautas da equipe",
};

export interface FeedAuthor {
  id?: string;
  nome: string;
  iniciais: string;
  conquistas: number;
  avatarUrl?: string;
  verificado?: boolean;
}

export type FeedAuthorMock = FeedAuthor;

export interface FeedPlaceView {
  id: string;
  nome: string;
  bairro: string;
  categoria: string;
  fotoUrl: string;
}

export type FeedPlaceMock = FeedPlaceView;

interface FeedItemBase {
  id: string;
  kind: FeedItemKind;
  diasAtras: number;
  hora: string;
  motivo: FeedReason;
  motivoDetalhe?: string;
  relevancia: number;
  bairro?: string;
}

export interface FeedReviewItem extends FeedItemBase {
  kind: "avaliacao";
  reviewId: string;
  autor: FeedAuthor;
  local: FeedPlaceView;
  nota: number;
  corpo: string;
  fotoUrl?: string;
  uteis: number;
  markedUsefulByMe?: boolean;
}

export interface FeedBurstItem extends FeedItemBase {
  kind: "movimento";
  local: FeedPlaceView;
  tipo: "avaliacoes" | "visitas";
  total: number;
  notaMedia?: number;
  participantes: FeedAuthor[];
  janela: string;
}

export interface FeedNewPlaceItem extends FeedItemBase {
  kind: "novo-ponto";
  local: FeedPlaceView;
  autor: FeedAuthor;
  sobre: string;
}

export interface FeedAchievementItem extends FeedItemBase {
  kind: "conquista";
  autor: FeedAuthor;
  conquista: {
    nome: string;
    icon: AchievementIconKey;
    cor: string;
    criterio: string;
  };
  local?: FeedPlaceView;
}

export type FeedConquistaItem = FeedAchievementItem;

export interface FeedMilestoneItem extends FeedItemBase {
  kind: "marco";
  local: FeedPlaceView;
  titulo: string;
  detalhe: string;
}

export interface FeedCurationItem extends FeedItemBase {
  kind: "curadoria";
  slug: string;
  titulo: string;
  chamada: string;
  fotoUrl: string;
  editor: string;
  locais: FeedPlaceView[];
}

export type FeedItemView =
  | FeedReviewItem
  | FeedBurstItem
  | FeedNewPlaceItem
  | FeedAchievementItem
  | FeedMilestoneItem
  | FeedCurationItem;

export type FeedItemMock = FeedItemView;

export interface FeedContributorView {
  id: string;
  nome: string;
  iniciais: string;
  avatarUrl?: string;
  conquistas: number;
  contribuicoes: number;
  bairro: string;
}

export interface FeedTrendingPlaceView {
  id: string;
  nome: string;
  bairro: string;
  novidades: number;
}
