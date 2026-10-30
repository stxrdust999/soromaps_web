import type { Metadata } from "next";
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
 * Resolves dynamic SEO metadata and OpenGraph properties for a specific place.
 *
 * @param props Route parameter container.
 * @returns Metadata object with place name and description or fallback.
 */
export async function generateMetadata({
  params,
}: PlaceDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await getPlaceById(id, {
      next: { tags: [placeShowTag(id)] },
    });

    if (response.status === 200)
      return {
        title: response.data.name,
        description: response.data.about || "Detalhes do local em Sorocaba",
        openGraph: {
          title: response.data.name,
          description: response.data.about || "Detalhes do local em Sorocaba",
          images: response.data.coverPhotoUrl ? [response.data.coverPhotoUrl] : undefined,
        },
      };

    return {
      title: "Local não encontrado",
    };
  } catch {
    return {
      title: "Local não encontrado",
    };
  }
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
