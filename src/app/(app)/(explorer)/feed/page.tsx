import { Suspense } from "react";

import { MY_STATS_TAG } from "@/constants/achievements";
import { PLACES_LIST_TAG } from "@/constants/places";
import {
  EXPLORERS_LIST_TAG,
  FEED_LIST_TAG,
  FEED_MUTES_TAG,
} from "@/constants/reports";
import { getMyStats } from "@/http/activity/activity";
import { listExplorers } from "@/http/community/community";
import { getFeed, listFeedMutes } from "@/http/feed/feed";
import { listPlaces } from "@/http/places/places";
import { getSession } from "@/lib/session";
import { FeedSkeleton } from "./_components/feed-skeleton";
import { FeedWorkspace } from "./_components/feed-workspace";

/**
 * Página do Feed integrada à API via Streaming SSR.
 */
export default async function FeedPage() {
  const session = await getSession();

  const feedPromise = getFeed(
    { PageSize: 50 },
    { next: { tags: [FEED_LIST_TAG] } },
  );
  const mutesPromise = listFeedMutes({
    next: { tags: [FEED_MUTES_TAG] },
  });
  const explorersPromise = listExplorers(
    { PageSize: 8 },
    { next: { tags: [EXPLORERS_LIST_TAG] } },
  );
  const trendingPlacesPromise = listPlaces(
    { PageSize: 10 },
    { next: { tags: [PLACES_LIST_TAG] } },
  );
  const statsPromise = getMyStats({
    next: { tags: [MY_STATS_TAG] },
  });

  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedWorkspace
        session={session}
        promises={{
          feedPromise,
          mutesPromise,
          explorersPromise,
          trendingPlacesPromise,
          statsPromise,
        }}
      />
    </Suspense>
  );
}
