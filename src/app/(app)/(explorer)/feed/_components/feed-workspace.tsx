"use client";

import { EyeOffIcon, PlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FEED_SORT_LABEL,
  type FeedMuteScope,
  type FeedSort,
} from "@/constants/feed";
import type { getMyStatsResponse } from "@/http/activity/activity";
import type { listExplorersResponse } from "@/http/community/community";
import type {
  getFeedResponse,
  listFeedMutesResponse,
} from "@/http/feed/feed";
import type { listPlacesResponse } from "@/http/places/places";
import { cn } from "@/lib/utils";
import type {
  FeedContributorView,
  FeedItemMock,
  FeedTrendingPlaceView,
} from "@/types/feed";
import type { SessionPayload } from "@/types/session";
import { mapFeedItemDtoToView } from "@/utils/mappers/feed-mapper";

import { FeedAside } from "./feed-aside";
import type { FeedCardHandlers } from "./feed-card-frame";
import { FeedItem } from "./feed-item";
import { FeedSourceChips } from "./feed-source-chips";
import { ALL_REASONS, type FeedMute, useFeed } from "./use-feed";

const SORTS: FeedSort[] = ["relevancia", "recente"];
const FEED_COLUMNS = "mx-auto flex w-full max-w-6xl gap-6";

interface FeedWorkspaceProps {
  session: SessionPayload | null;
  promises: {
    feedPromise: Promise<getFeedResponse>;
    mutesPromise: Promise<listFeedMutesResponse>;
    explorersPromise: Promise<listExplorersResponse>;
    trendingPlacesPromise: Promise<listPlacesResponse>;
    statsPromise: Promise<getMyStatsResponse>;
  };
}

/**
 * Feed do explorador hidratado via Streaming SSR (`use()` + `useMemo()`).
 */
export function FeedWorkspace({ session, promises }: FeedWorkspaceProps) {
  const feedResponse = use(promises.feedPromise);
  const mutesResponse = use(promises.mutesPromise);
  const explorersResponse = use(promises.explorersPromise);
  const trendingPlacesResponse = use(promises.trendingPlacesPromise);
  const statsResponse = use(promises.statsPromise);

  const initialItems = useMemo<FeedItemMock[]>(() => {
    if (feedResponse.status !== 200 || !feedResponse.data.items) return [];

    return feedResponse.data.items
      .map(mapFeedItemDtoToView)
      .filter((item): item is FeedItemMock => item !== null);
  }, [feedResponse]);

  const initialMutes = useMemo<FeedMute[]>(() => {
    if (mutesResponse.status !== 200 || !Array.isArray(mutesResponse.data))
      return [];

    return mutesResponse.data.map((muteRule) => ({
      scope: (
        muteRule.scopeType === 1
          ? "bairro"
          : muteRule.scopeType === 0
            ? "categoria"
            : "tipo"
      ) as FeedMuteScope,
      value: muteRule.scopeValue,
      label: `Menos ${muteRule.scopeValue}`,
      apiId: muteRule.id,
    }));
  }, [mutesResponse]);

  const contributors = useMemo<FeedContributorView[]>(() => {
    if (explorersResponse.status !== 200 || !explorersResponse.data.items)
      return [];

    return explorersResponse.data.items.slice(0, 4).map((explorer) => ({
      id: explorer.id,
      nome: explorer.name,
      iniciais: explorer.name.slice(0, 2).toUpperCase(),
      avatarUrl: explorer.avatarUrl ?? undefined,
      conquistas: Number(explorer.achievementsCount),
      contribuicoes: Number(explorer.contributionScore),
      bairro: explorer.neighborhood ?? "Sorocaba",
    }));
  }, [explorersResponse]);

  const trendingPlaces = useMemo<FeedTrendingPlaceView[]>(() => {
    if (
      trendingPlacesResponse.status !== 200 ||
      !trendingPlacesResponse.data.items
    )
      return [];

    return [...trendingPlacesResponse.data.items]
      .sort(
        (first, second) =>
          Number(second.reviewsCount) - Number(first.reviewsCount),
      )
      .slice(0, 4)
      .map((place) => ({
        id: place.id,
        nome: place.name,
        bairro: place.neighborhood ?? "Sorocaba",
        novidades: Math.max(1, Number(place.reviewsCount)),
      }));
  }, [trendingPlacesResponse]);

  const profileSummary = useMemo(() => {
    const data = statsResponse.status === 200 ? statsResponse.data : null;
    const topCategories = data?.visitsByCategory
      ? data.visitsByCategory
          .slice(0, 2)
          .map((categoryStat) => categoryStat.categoryName)
      : [];

    return {
      bairro: session?.neighborhood ?? "Sorocaba",
      categoriasFavoritas: topCategories,
      lugaresSalvos: Number(data?.totalFavorites ?? 0),
      visitasRegistradas: Number(data?.totalVisits ?? 0),
    };
  }, [statsResponse, session]);

  const feed = useFeed({ initialItems, initialMutes });
  const { mute, unmute, toggleSave, toggleUseful, saved, useful } = feed;

  const onMute = useCallback(
    (rule: FeedMute) => {
      mute(rule);

      toast.success(rule.label.replace("Menos", "Vendo menos"), {
        description: "Preferência salva no seu feed.",
        action: { label: "Desfazer", onClick: () => unmute(rule) },
      });
    },
    [mute, unmute],
  );

  const onSave = useCallback(
    (placeId: string) => {
      const wasSaved = saved.has(placeId);
      toggleSave(placeId);

      toast.success(
        wasSaved ? "Você parou de acompanhar" : "Lugar acompanhado",
        {
          description: wasSaved
            ? "As novidades dele saem do seu feed."
            : "As novidades dele passam a aparecer no seu feed.",
        },
      );
    },
    [saved, toggleSave],
  );

  const handlers: FeedCardHandlers = {
    onMute,
    isSaved: (placeId) => saved.has(placeId),
    onSave,
    isUseful: (reviewId) => useful.has(reviewId),
    onUseful: toggleUseful,
  };

  return (
    <main className="flex flex-1 flex-col">
      {/* feed - section */}
      <PageSection
        title="Feed"
        description="O que aconteceu nos lugares que te interessam — sem seguir ninguém"
        className="gap-6"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              {SORTS.map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant="ghost"
                  onClick={() => feed.setSort(option)}
                  className={cn(
                    "text-muted-foreground",
                    feed.sort === option &&
                      "bg-background text-foreground shadow-xs hover:bg-background",
                  )}
                >
                  {FEED_SORT_LABEL[option]}
                </Button>
              ))}
            </div>

            <Button asChild>
              <Link href="/places/new">
                <PlusIcon />
                Adicionar ponto
              </Link>
            </Button>
          </div>
        }
        subitems={
          <div className="mt-4 flex flex-col gap-3">
            <FeedSourceChips
              active={feed.filter}
              onChange={feed.setFilter}
              counts={feed.countByReason}
              total={Object.values(feed.countByReason).reduce(
                (total, count) => total + count,
                0,
              )}
            />

            {feed.mutes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <EyeOffIcon className="size-3.5" />
                  {feed.silenciados} itens fora do feed:
                </span>

                {feed.mutes.map((rule) => (
                  <Badge
                    key={`${rule.scope}-${rule.value}`}
                    variant="outline"
                    asChild
                  >
                    <button type="button" onClick={() => feed.unmute(rule)}>
                      {rule.label}
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        }
      >
        {/* feed and aside - columns */}
        <div className={FEED_COLUMNS}>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {feed.groups.every((group) => group.items.length === 0) ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-muted-foreground text-sm">
                  Nada nesta fonte agora.
                </p>

                <Button
                  variant="outline"
                  onClick={() => feed.setFilter(ALL_REASONS)}
                >
                  Ver tudo que está acontecendo
                </Button>
              </div>
            ) : (
              feed.groups.map((group) => (
                <section
                  key={group.label ?? "relevancia"}
                  className="flex flex-col gap-4"
                >
                  {group.label && (
                    <h2 className="sticky top-0 z-10 -mx-1 bg-background/85 px-1 py-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide backdrop-blur-sm">
                      {group.label}
                    </h2>
                  )}

                  {group.items.map((item) => (
                    <FeedItem key={item.id} item={item} handlers={handlers} />
                  ))}
                </section>
              ))
            )}

            {feed.hasMore && (
              <Button
                variant="outline"
                onClick={feed.showMore}
                className="self-center"
              >
                Carregar mais
              </Button>
            )}

            {!feed.hasMore && feed.total > 0 && (
              <p className="py-4 text-center text-muted-foreground text-xs">
                Você chegou ao fim das novidades. Explore o mapa para o feed ter
                mais do que te interessa.
              </p>
            )}
          </div>

          <FeedAside
            counts={feed.countByReason}
            active={feed.filter}
            onFilterChange={feed.setFilter}
            profileSummary={profileSummary}
            contributors={contributors}
            trendingPlaces={trendingPlaces}
          />
        </div>
      </PageSection>

      <SiteFooter />
    </main>
  );
}
