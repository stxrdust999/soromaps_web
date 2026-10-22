"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createFeedMuteAction, deleteFeedMuteAction } from "@/actions/feed";
import type { FeedMuteScope, FeedReason, FeedSort } from "@/constants/feed";
import { getFeed, listFeedMutes } from "@/http/feed/feed";
import {
  type FeedItemKind,
  type FeedItemMock,
  type FeedPlaceMock,
  feedItemsMock,
} from "@/mocks/feed";

/** Itens na primeira leva, e quantos entram a cada "Carregar mais". */
const PAGE_SIZE = 10;
const PAGE_STEP = 8;

export const ALL_REASONS = "tudo";

export type FeedFilter = FeedReason | typeof ALL_REASONS;

/** Regra de silenciamento vinda do "menos disso" de um card. */
export interface FeedMute {
  scope: FeedMuteScope;
  /** Bairro, categoria ou `FeedItemKind`, conforme o escopo. */
  value: string;
  /** Texto do chip que desfaz a regra. */
  label: string;
  apiId?: string;
}

/**
 * Lugar ao qual o item se refere. `curadoria` devolve `null` de propósito —
 * um roteiro fala de três lugares, então silenciar "esse bairro" a partir dele
 * silenciaria os outros dois junto.
 *
 * @param item Item do feed.
 * @returns O lugar do item, ou `null` quando ele não tem um só.
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

/** Minutos desde a meia-noite — ordena dentro do dia sem construir `Date`. */
function minutesOfDay(hora: string): number {
  const [hours, minutes] = hora.split(":").map(Number);
  return hours * 60 + minutes;
}

function byRecency(a: FeedItemMock, b: FeedItemMock): number {
  if (a.diasAtras !== b.diasAtras) return a.diasAtras - b.diasAtras;
  return minutesOfDay(b.hora) - minutesOfDay(a.hora);
}

/**
 * Faixa temporal do cabeçalho de grupo. Semana e "antes disso" existem porque
 * dia a dia depois do terceiro dia vira uma sequência de cabeçalhos com um
 * item embaixo de cada.
 */
function dayBucket(diasAtras: number): string {
  if (diasAtras === 0) return "Hoje";
  if (diasAtras === 1) return "Ontem";
  if (diasAtras < 7) return "Esta semana";
  return "Antes disso";
}

export interface FeedGroup {
  /** `null` na ordenação por relevância, que não agrupa por dia. */
  label: string | null;
  items: FeedItemMock[];
}

/**
 * Estado do feed.
 *
 * Client porque `Analise`, `Visita` e `GanhaConquista` não existem no banco:
 * filtrar, silenciar, salvar e marcar como útil mexem só no array de
 * `src/mocks/feed.ts`. Quando as entidades existirem, o corte por motivo e o
 * ranking passam a ser cláusula de consulta — o backend devolve os itens já
 * com `motivo` e `relevancia`, porque é ele que sabe o que casou.
 */
export function useFeed() {
  const [filter, setFilter] = useState<FeedFilter>(ALL_REASONS);
  const [sort, setSort] = useState<FeedSort>("relevancia");
  const [mutes, setMutes] = useState<FeedMute[]>([]);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [useful, setUseful] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [itemsList, setItemsList] = useState<FeedItemMock[]>(feedItemsMock);

  useEffect(() => {
    async function fetchApiData() {
      try {
        const [feedRes, mutesRes] = await Promise.allSettled([
          getFeed({ PageSize: 50 }),
          listFeedMutes(),
        ]);

        if (feedRes.status === "fulfilled" && feedRes.value.status === 200 && feedRes.value.data.items.length > 0) {
          const mapped: FeedItemMock[] = feedRes.value.data.items.map((item, idx) => ({
            id: item.id,
            kind: "avaliacao",
            motivo: "cidade",
            diasAtras: Math.max(0, Math.floor((Date.now() - new Date(item.occurredAt).getTime()) / (1000 * 60 * 60 * 24))),
            hora: "12:00",
            relevancia: 80,
            autor: {
              id: 1,
              nome: "Explorador de Sorocaba",
              iniciais: "ES",
              conquistas: 5,
            },
            nota: 5,
            uteis: 0,
            local: {
              id: Number(item.placeId) || idx + 1,
              nome: item.placeName ?? "Sorocaba",
              categoria: item.categoryName ?? "Geral",
              bairro: item.neighborhood ?? "Centro",
              fotoUrl: item.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            },
            corpo: item.description ?? item.title,
          }));
          setItemsList(mapped);
        }

        if (mutesRes.status === "fulfilled" && mutesRes.value.status === 200 && mutesRes.value.data.length > 0) {
          const mappedMutes: FeedMute[] = mutesRes.value.data.map((m) => ({
            scope: (m.scopeType === 1 ? "bairro" : "categoria") as FeedMuteScope,
            value: m.scopeValue,
            label: `Menos ${m.scopeValue}`,
            apiId: m.id,
          }));
          setMutes(mappedMutes);
        }
      } catch {
        // Mantém fallback seguro
      }
    }

    fetchApiData();
  }, []);

  const audible = useMemo(
    () =>
      itemsList.filter(
        (item) => !mutes.some((mute) => matchesMute(item, mute)),
      ),
    [itemsList, mutes],
  );

  /** Quanto cada fonte contribui hoje — alimenta os chips e o "Seu recorte". */
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

    return [...pool].sort((a, b) =>
      sort === "recente" ? byRecency(a, b) : b.relevancia - a.relevancia,
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
    // Se for silenciamento, registra na API
    const scopeType = rule.scope === "bairro" ? 1 : 0;
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
    if (rule.apiId) {
      deleteFeedMuteAction(rule.apiId);
    }

    setMutes((current) =>
      current.filter(
        (item) => !(item.scope === rule.scope && item.value === rule.value),
      ),
    );
  }, []);

  const toggleSave = useCallback((placeId: number) => {
    setSaved((current) => {
      const next = new Set(current);
      if (!next.delete(placeId)) next.add(placeId);
      return next;
    });
  }, []);

  const toggleUseful = useCallback((itemId: string) => {
    setUseful((current) => {
      const next = new Set(current);
      if (!next.delete(itemId)) next.add(itemId);
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
    // O item silenciado sai da lista; o contador é o que impede a regra de
    // virar um filtro invisível que o usuário não lembra ter criado.
    silenciados: feedItemsMock.length - audible.length,
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
