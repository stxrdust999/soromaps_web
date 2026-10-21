import { CatIcon, MapPinIcon, StarIcon, WifiIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageSection } from "@/components/blocks/page-section";
import { PlaceLeaderboard } from "@/components/blocks/place-leaderboard";
import { VerifiedCommentCard } from "@/components/blocks/verified-comment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Carousel from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { placeReviewsTag, placeShowTag } from "@/constants/places";
import { listReviewsByPlace } from "@/http/reviews/reviews";
import { getPlaceById } from "@/http/places/places";
import { getSession } from "@/lib/session";
import {
  getMarkerDetailsMock,
  getPlaceCommentMock,
  getPlaceLeaderboardMock,
} from "@/mocks/markers";
import { MarkerDeleteDialog } from "./_components/marker-delete-dialog";
import { PlaceActivityActions } from "./_components/place-activity-actions";
import { PlaceReviewsSection } from "./_components/place-reviews-section";

interface PlaceDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Detalhe de um local integrado à API (`getPlaceById`, `listReviewsByPlace`) com fallback gracioso.
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  let placeName = "Local";
  let placeCategory = "Local";
  let placeNeighborhood = "Sorocaba";
  let placeDescription = "";
  let placeCoverUrl =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80";
  let placePhotos: string[] = [];
  let rating = 4.8;
  let reviewsCount = 12;
  let hasWifi = true;
  let isPetFriendly = true;
  let reviewsList: any[] = [];

  try {
    const [placeResponse, reviewsResponse] = await Promise.all([
      getPlaceById(id, {
        next: { tags: [placeShowTag(id)] },
      }),
      listReviewsByPlace(id, undefined, {
        next: { tags: [placeReviewsTag(id)] },
      }),
    ]);

    if (placeResponse.status === 200) {
      const data = placeResponse.data;
      placeName = data.name;
      placeCategory = data.category?.name ?? "Local";
      placeNeighborhood = data.neighborhood;
      placeDescription = data.description || data.about;
      placeCoverUrl = data.coverPhotoUrl || placeCoverUrl;
      placePhotos =
        data.photos && data.photos.length > 0
          ? data.photos.map((p) => p.url)
          : [placeCoverUrl];
      rating =
        typeof data.ratingAverage === "string"
          ? parseFloat(data.ratingAverage)
          : data.ratingAverage || 0;
      reviewsCount =
        typeof data.reviewsCount === "string"
          ? parseInt(data.reviewsCount, 10)
          : data.reviewsCount || 0;
      hasWifi = data.hasWifi;
      isPetFriendly = data.isPetFriendly;
    }

    if (reviewsResponse.status === 200 && reviewsResponse.data.items) {
      reviewsList = reviewsResponse.data.items;
    }
  } catch {
    const markerId = Number(id);
    if (!Number.isNaN(markerId)) {
      const details = getMarkerDetailsMock(markerId);
      placeName = details.categoria;
      placeCategory = details.categoria;
      placeNeighborhood = details.bairro;
      placeDescription = details.descricao;
      placeCoverUrl = details.fotoUrl;
      placePhotos = details.fotos;
      rating = details.nota;
      reviewsCount = details.totalAvaliacoes;
      hasWifi = details.temWifi;
      isPetFriendly = details.petFriendly;
    }
  }

  const numericId = Number(id) || 1;
  const leaderboard = getPlaceLeaderboardMock(numericId);
  const comment = getPlaceCommentMock(numericId);

  const placeSubItem = (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Badge variant="default" className="bg-foreground text-background">
        <StarIcon className="size-3 fill-yellow-500 text-yellow-500" />
        {rating.toFixed(1)} · {reviewsCount} avaliações
      </Badge>

      {hasWifi && (
        <Badge variant="default">
          <WifiIcon className="size-3" />
          Tem wifi
        </Badge>
      )}

      {isPetFriendly && (
        <Badge variant="default" className="bg-amber-500">
          <CatIcon className="size-3" />
          Pet friendly
        </Badge>
      )}
    </div>
  );

  return (
    <div>
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-muted sm:h-72 lg:h-80">
        <Image
          src={placeCoverUrl}
          alt={`Foto de ${placeName}`}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <PageSection
        title={placeName}
        description={`${placeNeighborhood} · ${placeCategory}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <PlaceActivityActions placeId={id} />

            <Button asChild variant="outline">
              <Link href="/home">
                <MapPinIcon className="size-4" />
                Ver no mapa
              </Link>
            </Button>

            <MarkerDeleteDialog markerId={id} markerName={placeName} />
          </div>
        }
        subitems={placeSubItem}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-1 flex-col gap-6">
            <div className="rounded-md w-full">
              <div className="flex flex-col gap-2">
                <span className="text-xl font-semibold">Descrição</span>

                <Separator />

                <span className="text-sm">{placeDescription}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-hidden">
              <span className="text-xl font-semibold">Fotos</span>

              <Separator />

              <div className="pt-2 pb-6">
                <Carousel
                  slides={placePhotos.map((src, index) => ({
                    src,
                    title: index === 0 ? placeName : placeNeighborhood,
                  }))}
                />
              </div>
            </div>

            {/* Seção de Avaliações e Comentários da Comunidade */}
            <PlaceReviewsSection
              placeId={id}
              initialReviews={reviewsList}
              currentUserId={session?.id}
            />
          </div>

          <aside className="flex w-full lg:w-80 shrink-0 flex-col gap-4">
            <PlaceLeaderboard
              visitors={leaderboard}
              fullRankingHref={`/places/${id}/leaderboard`}
            />

            <VerifiedCommentCard
              author={comment}
              comment={comment.comentario}
            />
          </aside>
        </div>
      </PageSection>
    </div>
  );
}
