import { Suspense } from "react";

import { MY_REVIEWS_TAG, MY_STATS_TAG } from "@/constants/achievements";
import { getMyStats, listMyReviews } from "@/http/activity/activity";

import { StatsContent } from "./_components/stats-content";
import { StatsSkeleton } from "./_components/stats-skeleton";

/**
 * Página de estatísticas do explorador com streaming de Promises via Suspense.
 */
export default function ProfileStatsPage() {
  const promises = {
    statsPromise: getMyStats({ next: { tags: [MY_STATS_TAG] } }),
    reviewsPromise: listMyReviews(
      { PageSize: 100 },
      { next: { tags: [MY_REVIEWS_TAG] } },
    ),
  };

  return (
    <Suspense fallback={<StatsSkeleton />}>
      <StatsContent promises={promises} />
    </Suspense>
  );
}
