"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { use, useMemo } from "react";

import { PlaceCard } from "@/components/blocks/place-card";
import { PlaceRow } from "@/components/blocks/place-row";
import { StarRating } from "@/components/blocks/star-rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveAchievementIcon } from "@/constants/achievements";
import type { listMyAchievementsResponse } from "@/http/achievements/achievements";
import type {
  getMyVerificationStatusResponse,
  listMyFavoritesResponse,
  listMyReviewsResponse,
  listMyVisitsResponse,
} from "@/http/activity/activity";
import type { ProfileAchievement } from "@/types/profile";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";
import {
  mapFavoriteToMarker,
  mapVisitPlaceToMarker,
} from "@/utils/mappers/place-mapper";

import { AchievementProgressCard } from "./achievement-progress-card";
import { VerificationChecklist } from "./verification-checklist";

interface ProfileOverviewContentProps {
  promises: {
    verificationPromise: Promise<getMyVerificationStatusResponse>;
    achievementsPromise: Promise<listMyAchievementsResponse>;
    visitsPromise: Promise<listMyVisitsResponse>;
    favoritesPromise: Promise<listMyFavoritesResponse>;
    reviewsPromise: Promise<listMyReviewsResponse>;
  };
}

/**
 * Conteúdo principal da aba de visão geral do perfil do explorador resolvido via React.use() + useMemo().
 */
export function ProfileOverviewContent({
  promises,
}: ProfileOverviewContentProps) {
  const verificationResponse = use(promises.verificationPromise);
  const achievementsResponse = use(promises.achievementsPromise);
  const visitsResponse = use(promises.visitsPromise);
  const favoritesResponse = use(promises.favoritesPromise);
  const reviewsResponse = use(promises.reviewsPromise);

  const overviewData = useMemo(() => {
    const verification =
      verificationResponse.status === 200
        ? verificationResponse.data
        : undefined;
    const achievements =
      achievementsResponse.status === 200
        ? (achievementsResponse.data ?? [])
        : [];
    const visits =
      visitsResponse.status === 200 ? (visitsResponse.data.items ?? []) : [];
    const favorites =
      favoritesResponse.status === 200
        ? (favoritesResponse.data.items ?? [])
        : [];
    const reviews =
      reviewsResponse.status === 200 ? (reviewsResponse.data.items ?? []) : [];

    const stats = {
      visitas: Number(verification?.visitsCount ?? visits.length),
      avaliacoes: Number(verification?.publishedReviewsCount ?? reviews.length),
      avaliacoesRemovidas: Number(verification?.removedReviewsCount ?? 0),
      mesesNaPlataforma: Math.floor(
        Number(verification?.accountAgeDays ?? 0) / 30,
      ),
    };

    const nextAchievement: ProfileAchievement | null =
      achievements
        .filter((achievement) => !achievement.isUnlocked)
        .map((achievement) => {
          const currentProgress = Number(achievement.currentProgress ?? 0);
          const requiredQuantity = Math.max(
            1,
            Number(achievement.requiredQuantity ?? 1),
          );
          const progressPercentage = Math.min(
            100,
            Math.round((currentProgress / requiredQuantity) * 100),
          );

          return {
            nome: achievement.name,
            descricao: achievement.description,
            criterio: achievement.description,
            atual: currentProgress,
            meta: requiredQuantity,
            badge: {
              id: achievement.id,
              name: achievement.name,
              trigger: "metric" as const,
              icon: resolveAchievementIcon(achievement.icon),
              color: achievement.color,
              progress: progressPercentage,
              rarity: 10,
              achievedAt: null,
            },
          };
        })
        .sort(
          (first, second) =>
            (second.badge.progress ?? 0) - (first.badge.progress ?? 0),
        )[0] ?? null;

    const recentVisits = visits.slice(0, 3).map((visit) => {
      const marker = mapVisitPlaceToMarker(visit.place);
      const daysAgo = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(visit.visitedOn).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
      return {
        key: `${visit.id}-${visit.visitedOn}`,
        marker,
        daysAgo,
      };
    });

    const favoriteMarkers = favorites
      .slice(0, 3)
      .map((favorite) => mapFavoriteToMarker(favorite));

    const recentReviews = reviews.slice(0, 4).map((review) => {
      const daysAgo = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(review.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      return {
        id: review.id,
        placeId: review.placeId,
        placeName: review.placeName ?? "Local avaliado",
        placeCategory: review.placeCategory ?? "Sorocaba",
        rating: Number(review.rating),
        content: review.content,
        usefulVotesCount: Number(review.usefulVotesCount ?? 0),
        daysAgo,
      };
    });

    return {
      stats,
      nextAchievement,
      recentVisits,
      favoriteMarkers,
      recentReviews,
    };
  }, [
    verificationResponse,
    achievementsResponse,
    visitsResponse,
    favoritesResponse,
    reviewsResponse,
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* verification and next achievement - section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <VerificationChecklist stats={overviewData.stats} />

        <div className="flex flex-col gap-3">
          <SectionHeader
            titulo="Próxima conquista"
            href="/profile/achievements"
          />

          {overviewData.nextAchievement ? (
            <AchievementProgressCard item={overviewData.nextAchievement} />
          ) : (
            <EmptyState texto="Você desbloqueou tudo que o catálogo oferece hoje." />
          )}
        </div>
      </div>

      {/* recent visits - section */}
      <section className="flex flex-col gap-3">
        <SectionHeader titulo="Últimas visitas" href="/profile/visits" />

        {overviewData.recentVisits.length === 0 ? (
          <EmptyState texto="Você ainda não registrou nenhuma visita." />
        ) : (
          overviewData.recentVisits.map((visit) => (
            <PlaceRow
              key={visit.key}
              marker={visit.marker}
              trailing={
                <span className="text-muted-foreground text-xs">
                  {formatWaitingDays(visit.daysAgo)}
                </span>
              }
            />
          ))
        )}
      </section>

      {/* saved places - section */}
      <section className="flex flex-col gap-3">
        <SectionHeader titulo="Lugares salvos" href="/profile/favorites" />

        {overviewData.favoriteMarkers.length === 0 ? (
          <EmptyState texto="Nenhum lugar salvo nos favoritos ainda." />
        ) : (
          <div className="flex flex-wrap gap-3">
            {overviewData.favoriteMarkers.map((marker) => (
              <PlaceCard key={marker.id} size="sm" marker={marker} />
            ))}
          </div>
        )}
      </section>

      {/* my reviews - section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg">Minhas avaliações</h2>

        {overviewData.recentReviews.length === 0 ? (
          <EmptyState texto="Você ainda não escreveu nenhuma avaliação." />
        ) : (
          overviewData.recentReviews.map((review) => (
            <Card key={review.id} size="sm">
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/places/${review.placeId}`}
                    className="font-semibold text-sm hover:underline"
                  >
                    {review.placeName}
                  </Link>

                  <span className="text-muted-foreground text-xs">
                    {review.placeCategory} ·{" "}
                    {formatWaitingDays(review.daysAgo)}
                  </span>
                </div>

                <StarRating nota={review.rating} showValue />

                <p className="text-pretty text-sm leading-relaxed">
                  {review.content}
                </p>

                <span className="text-muted-foreground text-xs">
                  {review.usefulVotesCount} pessoas acharam útil
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function SectionHeader({ titulo, href }: { titulo: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-semibold text-lg">{titulo}</h2>

      <Button asChild variant="ghost" size="sm">
        <Link href={href}>
          Ver tudo
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyState({ texto }: { texto: string }) {
  return (
    <p className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-sm">
      {texto}
    </p>
  );
}
