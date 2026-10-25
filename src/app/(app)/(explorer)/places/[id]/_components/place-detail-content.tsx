"use client";

import { CatIcon, FlagIcon, MapPinIcon, StarIcon, WifiIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useMemo } from "react";

import { PageSection } from "@/components/blocks/page-section";
import {
  type LeaderboardVisitor,
  PlaceLeaderboard,
} from "@/components/blocks/place-leaderboard";
import { ReportDialog } from "@/components/blocks/report-dialog";
import {
  type VerifiedCommentAuthor,
  VerifiedCommentCard,
} from "@/components/blocks/verified-comment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import type { getPlaceByIdResponse } from "@/http/places/places";
import type { listReviewsByPlaceResponse } from "@/http/reviews/reviews";
import type { SessionPayload } from "@/types/session";
import { MarkerDeleteDialog } from "./marker-delete-dialog";
import { MarkerEditDialog } from "./marker-edit-dialog";
import { PlaceActivityActions } from "./place-activity-actions";
import { PlaceReviewsSection } from "./place-reviews-section";

const DEFAULT_COVER_URL =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80";

interface PlaceDetailContentProps {
  placeId: string;
  session: SessionPayload | null;
  promises: {
    placePromise: Promise<getPlaceByIdResponse>;
    reviewsPromise: Promise<listReviewsByPlaceResponse>;
  };
}

function parseNumeric(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Conteúdo completo do detalhe de um local hidratado via Streaming (`use()` + `useMemo()`).
 */
export function PlaceDetailContent({
  placeId,
  session,
  promises,
}: PlaceDetailContentProps) {
  const placeResponse = use(promises.placePromise);
  const reviewsResponse = use(promises.reviewsPromise);

  const placeView = useMemo(() => {
    if (placeResponse.status !== 200) return null;
    const data = placeResponse.data;
    const coverUrl = data.coverPhotoUrl || DEFAULT_COVER_URL;
    const photos =
      data.photos && data.photos.length > 0
        ? data.photos.map((photo) => photo.url)
        : [coverUrl];

    const leaderboard: LeaderboardVisitor[] = (data.topVisitors ?? []).map(
      (visitor) => ({
        nome: visitor.name,
        nivel: Math.max(1, Math.floor(parseNumeric(visitor.achievementsCount, 0) / 2) + 1),
        visitas: parseNumeric(visitor.visitsCount, 1),
        avatarUrl: visitor.avatarUrl ?? undefined,
      }),
    );

    const featuredReview = data.featuredVerifiedReview;
    const verifiedComment: { author: VerifiedCommentAuthor; comment: string } | null =
      featuredReview
        ? {
            author: {
              nome: featuredReview.author?.name ?? "Explorador Verificado",
              nivel: Math.max(
                1,
                Math.floor(parseNumeric(featuredReview.author?.achievementsCount, 0) / 2) + 1,
              ),
              avatarUrl: featuredReview.author?.avatarUrl ?? undefined,
            },
            comment: featuredReview.content,
          }
        : null;

    return {
      id: data.id,
      name: data.name,
      categoryName: data.category?.name ?? "Local",
      neighborhood: data.neighborhood,
      description: data.description || data.about,
      coverUrl,
      photos,
      latitude: parseNumeric(data.latitude, 0),
      longitude: parseNumeric(data.longitude, 0),
      rating: parseNumeric(data.ratingAverage, 0),
      reviewsCount: parseNumeric(data.reviewsCount, 0),
      hasWifi: data.hasWifi,
      isPetFriendly: data.isPetFriendly,
      authorId: data.author?.id ?? null,
      isFavoritedByMe: Boolean(data.isFavoritedByMe),
      visitedTodayByMe: Boolean(data.visitedTodayByMe),
      leaderboard,
      verifiedComment,
    };
  }, [placeResponse]);

  const reviewsList = useMemo(() => {
    if (reviewsResponse.status === 200 && reviewsResponse.data.items)
      return reviewsResponse.data.items;
    return [];
  }, [reviewsResponse]);

  if (!placeView) {
    return (
      <PageSection
        title="Local não encontrado"
        description="Não foi possível carregar os detalhes deste local."
      >
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          O local solicitado não existe ou foi removido.
        </div>
      </PageSection>
    );
  }

  const canDeletePlace =
    Boolean(session?.id && session.id === placeView.authorId) ||
    session?.role === "admin";

  const placeSubItem = (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Badge variant="default" className="bg-foreground text-background">
        <StarIcon className="size-3 fill-yellow-500 text-yellow-500" />
        {placeView.rating.toFixed(1)} · {placeView.reviewsCount} avaliações
      </Badge>

      {placeView.hasWifi && (
        <Badge variant="default">
          <WifiIcon className="size-3" />
          Tem wifi
        </Badge>
      )}

      {placeView.isPetFriendly && (
        <Badge variant="default" className="bg-amber-500">
          <CatIcon className="size-3" />
          Pet friendly
        </Badge>
      )}
    </div>
  );

  return (
    <div>
      {/* cover - banner */}
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-muted sm:h-72 lg:h-80">
        <Image
          src={placeView.coverUrl}
          alt={`Foto de ${placeView.name}`}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      {/* detail - section */}
      <PageSection
        title={placeView.name}
        description={`${placeView.neighborhood} · ${placeView.categoryName}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <PlaceActivityActions
              placeId={placeId}
              initialFavorite={placeView.isFavoritedByMe}
              initialVisitedToday={placeView.visitedTodayByMe}
            />

            <Button asChild variant="outline" size="sm">
              <Link
                href={`/home?placeId=${placeId}&lat=${placeView.latitude}&lng=${placeView.longitude}`}
              >
                <MapPinIcon className="size-4" />
                Ver no mapa
              </Link>
            </Button>

            <ReportDialog
              targetType="place"
              targetId={placeId}
              targetLabel={placeView.name}
              trigger={
                <Button variant="outline" size="sm">
                  <FlagIcon className="size-4" />
                  Denunciar
                </Button>
              }
            />

            {canDeletePlace && (
              <>
                <MarkerEditDialog
                  marker={{
                    id: placeId,
                    nome: placeView.name,
                    lat: placeView.latitude,
                    lng: placeView.longitude,
                  }}
                />
                <MarkerDeleteDialog
                  markerId={placeId}
                  markerName={placeView.name}
                />
              </>
            )}
          </div>
        }
        subitems={placeSubItem}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-1 flex-col gap-6">
            {/* description - block */}
            <div className="rounded-md w-full">
              <div className="flex flex-col gap-2">
                <span className="text-xl font-semibold">Descrição</span>
                <Separator />
                <span className="text-sm">{placeView.description}</span>
              </div>
            </div>

            {/* photos - carousel */}
            <div className="flex flex-col gap-2">
              <span className="text-xl font-semibold">Fotos</span>
              <Separator />
              <div className="pt-2 pb-12 overflow-visible">
                <Carousel
                  slides={placeView.photos.map((src, index) => ({
                    src,
                    title:
                      index === 0 ? placeView.name : placeView.neighborhood,
                  }))}
                />
              </div>
            </div>

            {/* reviews - section */}
            <PlaceReviewsSection
              placeId={placeId}
              initialReviews={reviewsList}
              currentUserId={session?.id}
            />
          </div>

          {/* sidebar - widgets */}
          <aside className="flex w-full lg:w-80 shrink-0 flex-col gap-4">
            {placeView.leaderboard.length > 0 && (
              <PlaceLeaderboard
                visitors={placeView.leaderboard}
                fullRankingHref="/community"
              />
            )}

            {placeView.verifiedComment && (
              <VerifiedCommentCard
                author={placeView.verifiedComment.author}
                comment={placeView.verifiedComment.comment}
              />
            )}
          </aside>
        </div>
      </PageSection>
    </div>
  );
}
