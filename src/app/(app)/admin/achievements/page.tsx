import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/blocks/page-breadcrumb";
import { ACHIEVEMENTS_LIST_TAG } from "@/constants/achievements";
import { CATEGORIES_LIST_TAG } from "@/constants/categories";
import { PLACES_LIST_TAG } from "@/constants/places";
import { listAchievements } from "@/http/achievements/achievements";
import { listCategories } from "@/http/categories/categories";
import { listPlaces } from "@/http/places/places";

import { AchievementsAdminSkeleton } from "./_components/achievements-skeleton";
import { AchievementsWorkspace } from "./_components/achievements-workspace";

/**
 * Página administrativa do catálogo e calibragem de conquistas (`/admin/achievements`).
 * Dispara as Promises de conquistas, categorias e locais no servidor para streaming via Suspense.
 */
export default function AdminAchievementsPage() {
  const achievementsPromise = listAchievements(
    { PageSize: 100 },
    { next: { tags: [ACHIEVEMENTS_LIST_TAG] } },
  );
  const categoriesPromise = listCategories(
    { PageSize: 100 },
    { next: { tags: [CATEGORIES_LIST_TAG] } },
  );
  const placesPromise = listPlaces(
    { PageSize: 100 },
    { next: { tags: [PLACES_LIST_TAG] } },
  );

  return (
    <>
      <PageBreadcrumb items={[{ label: "Admin" }, { label: "Conquistas" }]} />

      <Suspense fallback={<AchievementsAdminSkeleton />}>
        <AchievementsWorkspace
          achievementsPromise={achievementsPromise}
          categoriesPromise={categoriesPromise}
          placesPromise={placesPromise}
        />
      </Suspense>
    </>
  );
}

