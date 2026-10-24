import { Suspense } from "react";

import {
  MY_ACHIEVEMENTS_TAG,
  MY_FAVORITES_TAG,
  MY_REVIEWS_TAG,
  MY_VERIFICATION_TAG,
  MY_VISITS_TAG,
} from "@/constants/achievements";
import { listMyAchievements } from "@/http/achievements/achievements";
import {
  getMyVerificationStatus,
  listMyFavorites,
  listMyReviews,
  listMyVisits,
} from "@/http/activity/activity";

import { ProfileOverviewContent } from "./_components/profile-overview-content";
import { ProfileOverviewSkeleton } from "./_components/profile-overview-skeleton";

const PREVIEW_SIZE = 3;

/**
 * Página de visão geral do perfil do explorador com streaming de Promises via Suspense.
 */
export default function ProfilePage() {
  const promises = {
    verificationPromise: getMyVerificationStatus({
      next: { tags: [MY_VERIFICATION_TAG] },
    }),
    achievementsPromise: listMyAchievements({
      next: { tags: [MY_ACHIEVEMENTS_TAG] },
    }),
    visitsPromise: listMyVisits(
      { PageSize: PREVIEW_SIZE },
      { next: { tags: [MY_VISITS_TAG] } },
    ),
    favoritesPromise: listMyFavorites(
      { PageSize: PREVIEW_SIZE },
      { next: { tags: [MY_FAVORITES_TAG] } },
    ),
    reviewsPromise: listMyReviews(
      { PageSize: 4 },
      { next: { tags: [MY_REVIEWS_TAG] } },
    ),
  };

  return (
    <Suspense fallback={<ProfileOverviewSkeleton />}>
      <ProfileOverviewContent promises={promises} />
    </Suspense>
  );
}
