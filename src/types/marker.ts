import type { CategorySummaryDto } from "@/http/api.schemas";

/**
 * Representa os dados essenciais de um local para renderização de marcadores e prévias no mapa.
 */
export interface MarkerResource {
  id: string | number;
  nome: string;
  lat: number;
  lng: number;
  category?: CategorySummaryDto | null;
  ratingAverage?: number;
  reviewsCount?: number;
  coverPhotoUrl?: string | null;
}
