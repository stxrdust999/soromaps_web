"use client";

import { useMemo, useState } from "react";

import { PET_FRIENDLY_FILTER, PLACE_VIBES } from "@/constants/places";
import type { MarkerResource } from "@/types/marker";

import { ALL_FILTER } from "./category-chips";

const FEATURED_LIMIT = 5;
const NEARBY_LIMIT = 5;
const TRENDING_LIMIT = 3;
const RECENT_LIMIT = 6;
const TOP_RATED_LIMIT = 5;
const HIDDEN_GEMS_LIMIT = 6;

const DISTANCE_PENALTY = 0.15;
const HIDDEN_GEM_MAX_REVIEWS = 70;
const HIDDEN_GEM_MIN_RATING = 4.5;

const DEFAULT_COVER_PHOTO =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";

/**
 * Dados normalizados de um local para ordenação e filtragem nas trilhas de descoberta.
 */
export interface DiscoverPlaceDetails {
  nome: string;
  bairro: string;
  fotoUrl: string;
  sobre: string;
  categoria: string;
  tags: string[];
  temWifi: boolean;
  petFriendly: boolean;
  nota: number;
  totalAvaliacoes: number;
  distancia: number;
}

export interface DiscoverPlace {
  marker: MarkerResource;
  details: DiscoverPlaceDetails;
}

function matchesVibe(
  details: DiscoverPlaceDetails,
  vibe: string | null,
): boolean {
  if (!vibe)
    return true;

  const definition = PLACE_VIBES.find((item) => item.label === vibe);
  if (!definition)
    return true;

  if (definition.wifi && !details.temWifi)
    return false;
  if (definition.petFriendly && !details.petFriendly)
    return false;

  if (definition.anyTags)
    return definition.anyTags.some((tag) =>
      details.tags.some((placeTag) => placeTag.toLowerCase() === tag.toLowerCase()),
    );

  return true;
}

function take(
  places: DiscoverPlace[],
  compare: (first: DiscoverPlace, second: DiscoverPlace) => number,
  limit: number,
): DiscoverPlace[] {
  return [...places].sort(compare).slice(0, limit);
}

/**
 * Gerencia filtros de categoria, vibe e busca textual sobre a lista real de locais aprovados.
 */
export function useDiscover(markers: MarkerResource[]) {
  const [filter, setFilter] = useState(ALL_FILTER);
  const [vibe, setVibe] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const places = useMemo<DiscoverPlace[]>(
    () =>
      markers.map((marker) => {
        const details: DiscoverPlaceDetails = {
          nome: marker.nome,
          categoria: marker.category?.name ?? "Local",
          bairro: marker.neighborhood ?? "Sorocaba",
          nota: Number((marker.ratingAverage ?? 0).toFixed(1)),
          totalAvaliacoes: marker.reviewsCount ?? 0,
          fotoUrl: marker.coverPhotoUrl || DEFAULT_COVER_PHOTO,
          sobre: marker.about ?? "",
          temWifi: Boolean(marker.hasWifi),
          petFriendly: Boolean(marker.isPetFriendly),
          tags: (marker.tags ?? []).map((tag) => tag.name),
          distancia: marker.distanceKm ?? 1.5,
        };
        return { marker, details };
      }),
    [markers],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return places.filter(({ marker, details }) => {
      const matchesFilter =
        filter === ALL_FILTER ||
        (filter === PET_FRIENDLY_FILTER
          ? details.petFriendly
          : details.categoria === filter);

      const matchesSearch =
        query.length === 0 ||
        marker.nome.toLowerCase().includes(query) ||
        details.bairro.toLowerCase().includes(query);

      return matchesFilter && matchesSearch && matchesVibe(details, vibe);
    });
  }, [places, filter, search, vibe]);

  const counts = useMemo(
    () =>
      places.reduce<Record<string, number>>((accumulator, { details }) => {
        accumulator[details.categoria] =
          (accumulator[details.categoria] ?? 0) + 1;
        return accumulator;
      }, {}),
    [places],
  );

  const featured = useMemo(
    () =>
      take(
        filtered,
        (first, second) =>
          second.details.nota -
          second.details.distancia * DISTANCE_PENALTY -
          (first.details.nota - first.details.distancia * DISTANCE_PENALTY),
        FEATURED_LIMIT,
      ),
    [filtered],
  );

  const nearby = useMemo(
    () =>
      take(
        filtered,
        (first, second) => first.details.distancia - second.details.distancia,
        NEARBY_LIMIT,
      ),
    [filtered],
  );

  const trending = useMemo(
    () =>
      take(
        filtered,
        (first, second) =>
          second.details.totalAvaliacoes - first.details.totalAvaliacoes,
        TRENDING_LIMIT,
      ),
    [filtered],
  );

  const topRated = useMemo(
    () =>
      take(
        filtered,
        (first, second) => second.details.nota - first.details.nota,
        TOP_RATED_LIMIT,
      ),
    [filtered],
  );

  const hiddenGems = useMemo(
    () =>
      take(
        filtered.filter(
          ({ details }) =>
            details.totalAvaliacoes <= HIDDEN_GEM_MAX_REVIEWS &&
            details.nota >= HIDDEN_GEM_MIN_RATING,
        ),
        (first, second) =>
          first.details.totalAvaliacoes - second.details.totalAvaliacoes,
        HIDDEN_GEMS_LIMIT,
      ),
    [filtered],
  );

  const recent = useMemo(() => filtered.slice(0, RECENT_LIMIT), [filtered]);

  return {
    filter,
    setFilter,
    vibe,
    setVibe,
    search,
    setSearch,
    counts,
    hasResults: filtered.length > 0,
    rails: { featured, nearby, trending, topRated, hiddenGems, recent },
  };
}
