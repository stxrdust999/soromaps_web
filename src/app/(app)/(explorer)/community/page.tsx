import type { Metadata } from "next";
import { Suspense } from "react";

import {
  EXPLORERS_LIST_TAG,
  FEED_LIST_TAG,
  STORIES_LIST_TAG,
} from "@/constants/reports";
import { getMyVerificationStatus } from "@/http/activity/activity";
import { listExplorers } from "@/http/community/community";
import { getFeed } from "@/http/feed/feed";
import { listStories } from "@/http/stories/stories";
import { getSession } from "@/lib/session";
import { CommunitySkeleton } from "./_components/community-skeleton";
import { CommunityWorkspace } from "./_components/community-workspace";

export const metadata: Metadata = {
  title: "Comunidade de Exploradores",
  description:
    "Conheça quem explora e avalia a cidade, rankings e pautas da redação.",
};

/**
 * Página da Comunidade integrada à API via Streaming SSR.
 */
export default async function CommunityPage() {
  const session = await getSession();

  const explorersPromise = listExplorers(
    { PageSize: 50 },
    { next: { tags: [EXPLORERS_LIST_TAG] } },
  );
  const storiesPromise = listStories(
    { PageSize: 20 },
    { next: { tags: [STORIES_LIST_TAG] } },
  );
  const verificationPromise = getMyVerificationStatus();
  const feedPromise = getFeed(
    { PageSize: 30 },
    { next: { tags: [FEED_LIST_TAG] } },
  );

  return (
    <Suspense fallback={<CommunitySkeleton />}>
      <CommunityWorkspace
        session={session}
        promises={{
          explorersPromise,
          storiesPromise,
          verificationPromise,
          feedPromise,
        }}
      />
    </Suspense>
  );
}
