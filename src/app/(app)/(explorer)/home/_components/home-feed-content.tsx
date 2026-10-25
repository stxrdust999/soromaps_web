"use client";

import { use, useMemo } from "react";

import type { listPlacesResponse } from "@/http/places/places";
import { mapPlaceSummaryToMarker } from "@/utils/mappers/place-mapper";

import { FeedNearbySection } from "./feed/feed-nearby-section";
import { FeedTrendingSection } from "./feed/feed-trending-section";

interface HomeFeedContentProps {
  promises: {
    placesPromise: Promise<listPlacesResponse>;
  };
}

/**
 * Trilhas de locais próximos e em alta da home resolvidas via React.use() + useMemo().
 */
export function HomeFeedContent({ promises }: HomeFeedContentProps) {
  const placesResponse = use(promises.placesPromise);

  const markers = useMemo(() => {
    const places =
      placesResponse.status === 200 ? (placesResponse.data.items ?? []) : [];
    return places.map(mapPlaceSummaryToMarker);
  }, [placesResponse]);

  return (
    <div className="flex flex-col gap-6 px-8 pb-4">
      <FeedNearbySection markers={markers} />
      <FeedTrendingSection markers={markers} />
    </div>
  );
}
