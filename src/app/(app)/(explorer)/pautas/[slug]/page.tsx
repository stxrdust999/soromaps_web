import { Suspense } from "react";

import { STORIES_LIST_TAG, storyShowTag } from "@/constants/reports";
import { getStoryBySlug, listStories } from "@/http/stories/stories";
import { StoryArticleContent } from "./_components/story-article-content";
import { StoryArticleSkeleton } from "./_components/story-article-skeleton";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Página de uma pauta editorial integrada com a API via Streaming SSR.
 */
export default async function StoryPage({ params }: StoryPageProps) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug).trim();

  const storyPromise = getStoryBySlug(decodedSlug, {
    next: { tags: [storyShowTag(decodedSlug)] },
  });
  const storiesListPromise = listStories(
    { PageSize: 10 },
    { next: { tags: [STORIES_LIST_TAG] } },
  );

  return (
    <Suspense fallback={<StoryArticleSkeleton />}>
      <StoryArticleContent
        slug={decodedSlug}
        promises={{ storyPromise, storiesListPromise }}
      />
    </Suspense>
  );
}
