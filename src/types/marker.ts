import type { CategorySummaryDto } from "@/http/api.schemas";

/**
 * Representa um visitante frequente listado no ranking de um local.
 */
export interface PlaceVisitorEntry {
  userId: string;
  nome: string;
  nivel: number;
  visitas: number;
  avatarUrl?: string;
}

/**
 * Representa o comentário em destaque de um explorador verificado sobre um local.
 */
export interface PlaceVerifiedComment {
  userId: string;
  nome: string;
  nivel: number;
  avatarUrl?: string;
  comentario: string;
}

/**
 * Representa os dados completos ou resumidos de um local para renderização no mapa, cards e listagens.
 */
export interface MarkerResource {
  id: string;
  nome: string;
  lat: number;
  lng: number;
  category?: CategorySummaryDto | null;
  ratingAverage?: number;
  reviewsCount?: number;
  coverPhotoUrl?: string | null;
  photos?: string[];
  neighborhood?: string | null;
  about?: string | null;
  description?: string | null;
  hasWifi?: boolean;
  isPetFriendly?: boolean;
  bestTime?: string | null;
  localSecret?: string | null;
  tags?: Array<{ id: string; name: string }>;
  distanceKm?: number;
  isFavoritedByMe?: boolean;
  visitedTodayByMe?: boolean;
  topVisitors?: PlaceVisitorEntry[];
  featuredVerifiedReview?: PlaceVerifiedComment | null;
}
