import type { Metadata } from "next";
import { Suspense } from "react";

import { explorerProfileTag } from "@/constants/reports";
import { getCommunityUserProfile } from "@/http/community/community";
import { ExplorerProfileContent } from "./_components/explorer-profile-content";
import { ExplorerProfileSkeleton } from "./_components/explorer-profile-skeleton";

interface ExplorerProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Resolves dynamic SEO metadata for the public explorer profile view.
 *
 * @param props Route parameter container.
 * @returns Metadata object with user name and biography or fallback title.
 */
export async function generateMetadata({
  params,
}: ExplorerProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await getCommunityUserProfile(id, {
      next: { tags: [explorerProfileTag(id)] },
    });

    if (response.status === 200)
      return {
        title: `${response.data.name} — Explorador`,
        description: response.data.biography || "Perfil de explorador no SoroMaps",
      };

    return {
      title: "Perfil de Explorador",
    };
  } catch {
    return {
      title: "Perfil de Explorador",
    };
  }
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
