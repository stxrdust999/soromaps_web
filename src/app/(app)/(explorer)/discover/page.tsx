import { Suspense } from "react";

import { PLACES_LIST_TAG } from "@/constants/places";
import { listPlaces } from "@/http/places/places";

import { DiscoverExplorer } from "./_components/discover-explorer";
import { DiscoverSkeleton } from "./_components/discover-skeleton";

/**
 * Página Descobrir com carregamento em streaming de locais aprovados via Suspense.
 */
export default function DiscoverPage() {
  const promises = {
    placesPromise: listPlaces(
      { PageSize: 100 },
      { next: { tags: [PLACES_LIST_TAG] } },
    ),
  };

  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <DiscoverExplorer promises={promises} />
    </Suspense>
  );
}
