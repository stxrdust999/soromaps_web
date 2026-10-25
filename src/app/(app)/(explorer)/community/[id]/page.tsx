import { Suspense } from "react";

import { explorerProfileTag } from "@/constants/reports";
import { getCommunityUserProfile } from "@/http/community/community";
import { ExplorerProfileContent } from "./_components/explorer-profile-content";
import { ExplorerProfileSkeleton } from "./_components/explorer-profile-skeleton";

interface ExplorerProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Perfil público de um explorador integrado à API via Streaming SSR.
 */
export default async function ExplorerProfilePage({
  params,
}: ExplorerProfilePageProps) {
  const { id } = await params;

  const profilePromise = getCommunityUserProfile(id, {
    next: { tags: [explorerProfileTag(id)] },
  });

  return (
    <Suspense fallback={<ExplorerProfileSkeleton />}>
      <ExplorerProfileContent
        userId={id}
        promises={{ profilePromise }}
      />
    </Suspense>
  );
}
