import { Suspense } from "react";

import { MY_ACHIEVEMENTS_TAG } from "@/constants/achievements";
import { listMyAchievements } from "@/http/achievements/achievements";

import { AchievementsContent } from "./_components/achievements-content";
import { AchievementsSkeleton } from "./_components/achievements-skeleton";

/**
 * Página da galeria de conquistas do explorador com streaming de Promises via Suspense.
 */
export default function ProfileAchievementsPage() {
  const promises = {
    achievementsPromise: listMyAchievements({
      next: { tags: [MY_ACHIEVEMENTS_TAG] },
    }),
  };

  return (
    <Suspense fallback={<AchievementsSkeleton />}>
      <AchievementsContent promises={promises} />
    </Suspense>
  );
}
