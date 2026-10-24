"use client";

import { useCallback, useMemo, useState } from "react";

import { toggleFavoritePlaceAction } from "@/actions/activity";
import { createFeedMuteAction, deleteFeedMuteAction } from "@/actions/feed";
import { toggleReviewUsefulVoteAction } from "@/actions/reviews";
import type { FeedMuteScope, FeedReason, FeedSort } from "@/constants/feed";
import type {
  FeedItemKind,
  FeedItemMock,
  FeedPlaceMock,
} from "@/types/feed";

const PAGE_SIZE = 10;
const PAGE_STEP = 8;

export const ALL_REASONS = "tudo";

export type FeedFilter = FeedReason | typeof ALL_REASONS;

export interface FeedMute {
  scope: FeedMuteScope;
  value: string;
  label: string;
  apiId?: string;
}

/**
 * Retorna o local associado a um item do feed quando houver apenas um.
 */
export function feedItemPlace(item: FeedItemMock): FeedPlaceMock | null {
  switch (item.kind) {
    case "avaliacao":
    case "movimento":
    case "novo-ponto":
    case "marco":
      return item.local;
    case "conquista":
      return item.local ?? null;
    default:
      return null;
  }
}

function matchesMute(item: FeedItemMock, mute: FeedMute): boolean {
  if (mute.scope === "tipo") return item.kind === (mute.value as FeedItemKind);

  const local = feedItemPlace(item);
  if (!local) return false;

  return mute.scope === "bairro"
    ? local.bairro === mute.value
    : local.categoria === mute.value;
}

function minutesOfDay(hora: string): number {
  const [hours, minutes] = hora.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function byRecency(first: FeedItemMock, second: FeedItemMock): number {
  if (first.diasAtras !== second.diasAtras)
    return first.diasAtras - second.diasAtras;
  return minutesOfDay(second.hora) - minutesOfDay(first.hora);
}

function dayBucket(diasAtras: number): string {
  if (diasAtras === 0) return "Hoje";
  if (diasAtras === 1) return "Ontem";
  if (diasAtras < 7) return "Esta semana";
  return "Antes disso";
}

export interface FeedGroup {
  label: string | null;
  items: FeedItemMock[];
}

interface UseFeedOptions {
  initialItems: FeedItemMock[];
  initialMutes: FeedMute[];
}

/**
 * Estado interativo do feed hidratado com itens e regras de silenciamento reais da API.
 */
export function useFeed({ initialItems, initialMutes }: UseFeedOptions) {
  const [filter, setFilter] = useState<FeedFilter>(ALL_REASONS);
  const [sort, setSort] = useState<FeedSort>("relevancia");
  const [mutes, setMutes] = useState<FeedMute[]>(initialMutes);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [useful, setUseful] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    for (const item of initialItems) {
      if (item.kind === "avaliacao" && item.markedUsefulByMe) {
        initialSet.add(item.reviewId);
      }
    }
    return initialSet;
  });
  const [visible, setVisible] = useState(PAGE_SIZE);

  const audible = useMemo(
    () =>
      initialItems.filter(
        (item) => !mutes.some((muteRule) => matchesMute(item, muteRule)),
      ),
    [initialItems, mutes],
  );

  const countByReason = useMemo(() => {
    return audible.reduce<Record<string, number>>((total, item) => {
      total[item.motivo] = (total[item.motivo] ?? 0) + 1;
      return total;
    }, {});
  }, [audible]);

  const selected = useMemo(() => {
    const pool =
      filter === ALL_REASONS
        ? audible
        : audible.filter((item) => item.motivo === filter);

    return [...pool].sort((first, second) =>
      sort === "recente"
        ? byRecency(first, second)
        : second.relevancia - first.relevancia,
    );
  }, [audible, filter, sort]);

  const groups = useMemo<FeedGroup[]>(() => {
    const page = selected.slice(0, visible);

    if (sort === "relevancia") return [{ label: null, items: page }];

    const buckets = new Map<string, FeedItemMock[]>();

    for (const item of page) {
      const label = dayBucket(item.diasAtras);
      buckets.set(label, [...(buckets.get(label) ?? []), item]);
    }

    return [...buckets.entries()].map(([label, items]) => ({ label, items }));
  }, [selected, visible, sort]);

  const mute = useCallback((rule: FeedMute) => {
    const scopeType =
      rule.scope === "bairro" ? 1 : rule.scope === "categoria" ? 0 : 2;
    createFeedMuteAction({ scopeType, scopeValue: rule.value });

    setMutes((current) =>
      current.some(
        (item) => item.scope === rule.scope && item.value === rule.value,
      )
        ? current
        : [...current, rule],
    );
  }, []);

  const unmute = useCallback((rule: FeedMute) => {
    if (rule.apiId) deleteFeedMuteAction(rule.apiId);

    setMutes((current) =>
      current.filter(
        (item) => !(item.scope === rule.scope && item.value === rule.value),
      ),
    );
  }, []);

  const toggleSave = useCallback((placeId: string) => {
    setSaved((current) => {
      const isCurrentlySaved = current.has(placeId);
      const next = new Set(current);
      if (isCurrentlySaved) next.delete(placeId);
      else next.add(placeId);

      toggleFavoritePlaceAction(placeId, isCurrentlySaved);
      return next;
    });
  }, []);

  const toggleUseful = useCallback((reviewId: string, placeId: string) => {
    setUseful((current) => {
      const isCurrentlyUseful = current.has(reviewId);
      const next = new Set(current);
      if (isCurrentlyUseful) next.delete(reviewId);
      else next.add(reviewId);

      toggleReviewUsefulVoteAction(reviewId, placeId, isCurrentlyUseful);
      return next;
    });
  }, []);

  const showMore = useCallback(
    () => setVisible((current) => current + PAGE_STEP),
    [],
  );

  return {
    filter,
    setFilter: useCallback((next: FeedFilter) => {
      setFilter(next);
      setVisible(PAGE_SIZE);
    }, []),
    sort,
    setSort,
    groups,
    countByReason,
    total: selected.length,
    silenciados: initialItems.length - audible.length,
    mutes,
    mute,
    unmute,
    saved,
    toggleSave,
    useful,
    toggleUseful,
    hasMore: visible < selected.length,
    showMore,
  };
}
