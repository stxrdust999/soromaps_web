import type {
  FavoriteResponseDto,
  PlaceResponseDto,
  PlaceSummaryDto,
  VisitPlaceSummaryDto,
} from "@/http/api.schemas";
import type { MarkerResource } from "@/types/marker";

const SOROCABA_CENTER_LATITUDE = -23.5015;
const SOROCABA_CENTER_LONGITUDE = -47.4526;

/**
 * Calcula a distância aproximada em quilômetros entre duas coordenadas geográficas pela fórmula de Haversine.
 */
export function calculateDistanceKilometers(
  latitudeA: number,
  longitudeA: number,
  latitudeB = SOROCABA_CENTER_LATITUDE,
  longitudeB = SOROCABA_CENTER_LONGITUDE,
): number {
  const earthRadiusKilometers = 6371;
  const deltaLatitude = ((latitudeB - latitudeA) * Math.PI) / 180;
  const deltaLongitude = ((longitudeB - longitudeA) * Math.PI) / 180;

  const haversineFactor =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos((latitudeA * Math.PI) / 180) *
      Math.cos((latitudeB * Math.PI) / 180) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversineFactor), Math.sqrt(1 - haversineFactor));

  return Math.round(earthRadiusKilometers * angularDistance * 10) / 10;
}

/**
 * Converte um DTO resumido de local da API (`PlaceSummaryDto`) em `MarkerResource` para listagens e mapa.
 */
export function mapPlaceSummaryToMarker(place: PlaceSummaryDto): MarkerResource {
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);

  return {
    id: place.id,
    nome: place.name,
    lat: latitude,
    lng: longitude,
    category: place.category,
    ratingAverage: Number(place.ratingAverage ?? 0),
    reviewsCount: Number(place.reviewsCount ?? 0),
    coverPhotoUrl: place.coverPhotoUrl,
    neighborhood: place.neighborhood,
    about: place.about,
    hasWifi: place.hasWifi,
    isPetFriendly: place.isPetFriendly,
    tags: (place.tags ?? []).map((tag) => ({ id: tag.id, name: tag.name })),
    distanceKm: calculateDistanceKilometers(latitude, longitude),
  };
}

/**
 * Converte um local resumido de visita (`VisitPlaceSummaryDto`) em `MarkerResource` para exibição em linhas do perfil.
 */
export function mapVisitPlaceToMarker(
  place: VisitPlaceSummaryDto,
): MarkerResource {
  return {
    id: place.id,
    nome: place.name,
    lat: SOROCABA_CENTER_LATITUDE,
    lng: SOROCABA_CENTER_LONGITUDE,
    category: place.category,
    ratingAverage: 0,
    reviewsCount: 0,
    coverPhotoUrl: null,
    neighborhood: place.neighborhood,
    about: "",
    hasWifi: false,
    isPetFriendly: false,
    tags: [],
    distanceKm: 0,
  };
}

/**
 * Converte um item de favorito (`FavoriteResponseDto`) em `MarkerResource` para exibição em cards do perfil.
 */
export function mapFavoriteToMarker(
  favorite: FavoriteResponseDto,
): MarkerResource {
  return {
    id: favorite.placeId,
    nome: favorite.placeName,
    lat: SOROCABA_CENTER_LATITUDE,
    lng: SOROCABA_CENTER_LONGITUDE,
    category: favorite.category,
    ratingAverage: Number(favorite.ratingAverage ?? 0),
    reviewsCount: Number(favorite.reviewsCount ?? 0),
    coverPhotoUrl: favorite.coverPhotoUrl,
    neighborhood: favorite.neighborhood,
    about: "",
    hasWifi: false,
    isPetFriendly: false,
    tags: [],
    distanceKm: 0,
    isFavoritedByMe: true,
  };
}

/**
 * Converte um DTO detalhado de local da API (`PlaceResponseDto`) em `MarkerResource`.
 */
export function mapPlaceDetailToMarker(place: PlaceResponseDto): MarkerResource {
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  const galleryPhotos = (place.photos ?? []).map((photo) => photo.url);

  return {
    id: place.id,
    nome: place.name,
    lat: latitude,
    lng: longitude,
    category: place.category,
    ratingAverage: Number(place.ratingAverage ?? 0),
    reviewsCount: Number(place.reviewsCount ?? 0),
    coverPhotoUrl: place.coverPhotoUrl ?? galleryPhotos[0] ?? null,
    photos: galleryPhotos,
    neighborhood: place.neighborhood,
    about: place.about,
    description: place.description,
    hasWifi: place.hasWifi,
    isPetFriendly: place.isPetFriendly,
    bestTime: place.bestTime,
    localSecret: place.localSecret,
    tags: (place.tags ?? []).map((tag) => ({ id: tag.id, name: tag.name })),
    distanceKm: calculateDistanceKilometers(latitude, longitude),
    isFavoritedByMe: Boolean(place.isFavoritedByMe),
    visitedTodayByMe: Boolean(place.visitedTodayByMe),
    topVisitors: (place.topVisitors ?? []).map((visitor) => ({
      userId: visitor.userId,
      nome: visitor.name,
      nivel: Number(visitor.achievementsCount ?? 0),
      visitas: Number(visitor.visitsCount ?? 0),
      avatarUrl: visitor.avatarUrl ?? undefined,
    })),
    featuredVerifiedReview: place.featuredVerifiedReview
      ? {
          userId: place.featuredVerifiedReview.author?.id ?? "",
          nome: place.featuredVerifiedReview.author?.name ?? "Explorador Verificado",
          nivel: Number(place.featuredVerifiedReview.author?.achievementsCount ?? 0),
          avatarUrl: place.featuredVerifiedReview.author?.avatarUrl ?? undefined,
          comentario: place.featuredVerifiedReview.content,
        }
      : null,
  };
}
