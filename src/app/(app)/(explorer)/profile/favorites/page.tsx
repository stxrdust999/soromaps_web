import { Suspense } from "react";

import { MY_FAVORITES_TAG } from "@/constants/achievements";
import { listMyFavorites } from "@/http/activity/activity";

import { FavoritesContent } from "./_components/favorites-content";
import { FavoritesSkeleton } from "./_components/favorites-skeleton";

/**
 * Página de locais favoritados pelo explorador com streaming de Promises via Suspense.
 */
export default function ProfileFavoritesPage() {
  const promises = {
    favoritesPromise: listMyFavorites(
      { PageSize: 50 },
      { next: { tags: [MY_FAVORITES_TAG] } },
    ),
  };

  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <FavoritesContent promises={promises} />
    </Suspense>
  );
}
