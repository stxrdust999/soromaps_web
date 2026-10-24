import { Suspense } from "react";

import { placeReviewsTag, placeShowTag } from "@/constants/places";
import { getPlaceById } from "@/http/places/places";
import { listReviewsByPlace } from "@/http/reviews/reviews";
import { getSession } from "@/lib/session";
import { PlaceDetailContent } from "./_components/place-detail-content";
import { PlaceDetailSkeleton } from "./_components/place-detail-skeleton";

interface PlaceDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Detalhe de um local integrado à API (`getPlaceById`, `listReviewsByPlace`) via Streaming SSR.
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  const placePromise = getPlaceById(id, {
    next: { tags: [placeShowTag(id)] },
  });
  const reviewsPromise = listReviewsByPlace(id, undefined, {
    next: { tags: [placeReviewsTag(id)] },
  });

  return (
    <Suspense fallback={<PlaceDetailSkeleton />}>
      <PlaceDetailContent
        placeId={id}
        session={session}
        promises={{ placePromise, reviewsPromise }}
      />
    </Suspense>
  );
}
