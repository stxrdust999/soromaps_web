import { notFound } from "next/navigation";
import { Suspense } from "react";

import { STORIES_LIST_TAG, storyShowTag } from "@/constants/reports";
import { getStoryBySlug, listStories } from "@/http/stories/stories";
import { getSession } from "@/lib/session";
import { StoryArticleContent } from "./_components/story-article-content";
import { StoryArticleSkeleton } from "./_components/story-article-skeleton";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Avalia se a pauta está com status publicado, suportando serialização em string camelCase ou numérica.
 */
function isStoryPublished(status: string | number | undefined): boolean {
  return status === 1 || String(status).toLowerCase() === "published";
}

/**
 * Página de uma pauta editorial integrada com a API via Streaming SSR.
 * Bloqueia o acesso a rascunhos para usuários que não possuem permissão de administrador.
 */
export default async function StoryPage({ params }: StoryPageProps) {
  const [resolvedParams, session] = await Promise.all([params, getSession()]);
  const decodedSlug = decodeURIComponent(resolvedParams.slug).trim();

  const rawRole =
    session?.role ??
    // @ts-expect-error compatibilidade caso o payload venha aninhado como user.role
    session?.user?.role;

  const isAdmin =
    typeof rawRole === "string"
      ? rawRole.trim().toLowerCase() === "admin"
      : rawRole === 1;

  const storyResponse = await getStoryBySlug(decodedSlug, {
    next: { tags: [storyShowTag(decodedSlug)] },
  });

  if (
    storyResponse.status === 200 &&
    !isStoryPublished(storyResponse.data.status) &&
    !isAdmin
  )
    notFound();

  const storyPromise = Promise.resolve(storyResponse);
  const storiesListPromise = listStories(
    { PageSize: 10 },
    { next: { tags: [STORIES_LIST_TAG] } },
  );

  return (
    <Suspense fallback={<StoryArticleSkeleton />}>
      <StoryArticleContent
        slug={decodedSlug}
        isAdmin={isAdmin}
        promises={{ storyPromise, storiesListPromise }}
      />
    </Suspense>
  );
}
