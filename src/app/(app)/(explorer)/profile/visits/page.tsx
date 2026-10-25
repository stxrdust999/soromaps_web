import { Suspense } from "react";

import { MY_VISITS_TAG } from "@/constants/achievements";
import { listMyVisits } from "@/http/activity/activity";

import { VisitsContent } from "./_components/visits-content";
import { VisitsSkeleton } from "./_components/visits-skeleton";

/**
 * Página da timeline de visitas do perfil do explorador com streaming de Promises via Suspense.
 */
export default function ProfileVisitsPage() {
  const promises = {
    visitsPromise: listMyVisits(
      { PageSize: 50 },
      { next: { tags: [MY_VISITS_TAG] } },
    ),
  };

  return (
    <Suspense fallback={<VisitsSkeleton />}>
      <VisitsContent promises={promises} />
    </Suspense>
  );
}
