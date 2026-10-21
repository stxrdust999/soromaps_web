"use client";

import { useMemo, useState } from "react";

import { PET_FRIENDLY_FILTER, PLACE_VIBES } from "@/constants/places";
import { getMarkerDetailsMock, type MarkerDetailsMock } from "@/mocks/markers";
import type { MarkerResource } from "@/types/marker";

import { ALL_FILTER } from "./category-chips";

const FEATURED_LIMIT = 5;
const NEARBY_LIMIT = 5;
const TRENDING_LIMIT = 3;
const RECENT_LIMIT = 6;
const TOP_RATED_LIMIT = 5;
const HIDDEN_GEMS_LIMIT = 6;

/**
 * Quanto cada quilômetro custa na nota, ao escolher os destaques do topo.
 * 0,15 faz um lugar 4,9 a 5 km perder para um 4,6 na esquina — que é a decisão
 * que uma pessoa toma num sábado à tarde.
 */
const DISTANCE_PENALTY = 0.15;

/** Acima disso o lugar já é conhecido demais para contar como joia escondida. */
const HIDDEN_GEM_MAX_REVIEWS = 70;

/** Abaixo disto não é joia, é lugar pouco avaliado — e possivelmente ruim. */
const HIDDEN_GEM_MIN_RATING = 4.5;

/**
 * Marker com os detalhes já resolvidos.
 *
 * A busca do mock acontece **uma vez por lugar**, não dentro de cada
 * comparador de ordenação: as seis trilhas percorriam a mesma lista chamando
 * `getMarkerDetailsMock` de novo a cada comparação.
 */
export interface DiscoverPlace {
  marker: MarkerResource;
  details: MarkerDetailsMock;
}

function matchesVibe(details: MarkerDetailsMock, vibe: string | null): boolean {
  if (!vibe) return true;

  const definition = PLACE_VIBES.find((item) => item.label === vibe);
  if (!definition) return true;

  if (definition.wifi && !details.temWifi) return false;
  if (definition.petFriendly && !details.petFriendly) return false;

  if (definition.anyTags) {
    return definition.anyTags.some((tag) => details.tags.includes(tag));
  }

  return true;
}

function take(
  places: DiscoverPlace[],
  compare: (a: DiscoverPlace, b: DiscoverPlace) => number,
  limit: number,
): DiscoverPlace[] {
  return [...places].sort(compare).slice(0, limit);
}

/**
 * Estado do Descobrir: um recorte (categoria, vibe e busca) e as trilhas
 * derivadas dele.
 *
 * As trilhas vivem aqui, e não na tela, porque cada uma **é** um critério de
 * ordenação — é este arquivo que precisa ser lido para responder "por que
 * este lugar está em Em alta?", e é ele que muda quando `Visita` e `Analise`
 * substituírem os campos fictícios.
 */
export function useDiscover(markers: MarkerResource[]) {
  const [filter, setFilter] = useState(ALL_FILTER);
  const [vibe, setVibe] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const places = useMemo<DiscoverPlace[]>(
    () =>
      markers.map((marker) => ({
        marker,
        details: getMarkerDetailsMock(marker.id),
      })),
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
        query.length === 0 || marker.nome.toLowerCase().includes(query);

      return matchesFilter && matchesSearch && matchesVibe(details, vibe);
    });
  }, [places, filter, search, vibe]);

  /** Contagem por categoria sobre a lista inteira: é o mapa do acervo, não do recorte. */
  const counts = useMemo(
    () =>
      places.reduce<Record<string, number>>((accumulator, { details }) => {
        accumulator[details.categoria] =
          (accumulator[details.categoria] ?? 0) + 1;
        return accumulator;
      }, {}),
    [places],
  );

  /**
   * O destaque do topo: nota alta descontada da distância. É a única trilha
   * que combina dois critérios, porque é a que responde "e se eu não quiser
   * escolher?" — as outras existem justamente para quem já sabe o que quer.
   */
  const featured = useMemo(
    () =>
      take(
        filtered,
        (a, b) =>
          b.details.nota -
          b.details.distancia * DISTANCE_PENALTY -
          (a.details.nota - a.details.distancia * DISTANCE_PENALTY),
        FEATURED_LIMIT,
      ),
    [filtered],
  );

  const nearby = useMemo(
    () =>
      take(
        filtered,
        (a, b) => a.details.distancia - b.details.distancia,
        NEARBY_LIMIT,
      ),
    [filtered],
  );

  /**
   * Em alta é **movimento**, não nota — ordenar por nota aqui repetiria o
   * pódio de "Nota máxima" logo abaixo, com os mesmos lugares na mesma ordem.
   * Volume de avaliação é o proxy que existe hoje; vira contagem de `Visita`
   * na janela quando a tabela nascer.
   */
  const trending = useMemo(
    () =>
      take(
        filtered,
        (a, b) => b.details.totalAvaliacoes - a.details.totalAvaliacoes,
        TRENDING_LIMIT,
      ),
    [filtered],
  );

  const topRated = useMemo(
    () =>
      take(
        filtered,
        (a, b) => b.details.nota - a.details.nota,
        TOP_RATED_LIMIT,
      ),
    [filtered],
  );

  /**
   * Joia é lugar **bom** que pouca gente conhece. Sem o piso de nota, a trilha
   * premiava o menos avaliado da base — que também é onde mora o lugar ruim.
   */
  const hiddenGems = useMemo(
    () =>
      take(
        filtered.filter(
          ({ details }) =>
            details.totalAvaliacoes <= HIDDEN_GEM_MAX_REVIEWS &&
            details.nota >= HIDDEN_GEM_MIN_RATING,
        ),
        (a, b) => a.details.totalAvaliacoes - b.details.totalAvaliacoes,
        HIDDEN_GEMS_LIMIT,
      ),
    [filtered],
  );

  const recent = useMemo(
    () =>
      take(
        filtered,
        (a, b) => String(b.marker.id).localeCompare(String(a.marker.id)),
        RECENT_LIMIT,
      ),
    [filtered],
  );

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
