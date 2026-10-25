import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/blocks/page-breadcrumb";
import { CATEGORIES_LIST_TAG } from "@/constants/categories";
import {
  MODERATION_HISTORY_TAG,
  MODERATION_QUEUE_TAG,
} from "@/constants/places";
import { ADMIN_STATS_TAG } from "@/constants/reports";
import { getAdminDashboardStats } from "@/http/admin-dashboard/admin-dashboard";
import { listCategories } from "@/http/categories/categories";
import {
  listModerationHistory,
  listModerationPlaces,
} from "@/http/moderation/moderation";
import { ModerationSkeleton } from "./_components/moderation-skeleton";
import { ModerationWorkspace } from "./_components/moderation-workspace";

/**
 * Fila de moderação integrada à API via Streaming SSR.
 */
export default function AdminModerationPage() {
  const queuePromise = listModerationPlaces(
    { Page: 1, PageSize: 50 },
    { next: { tags: [MODERATION_QUEUE_TAG] } },
  );
  const historyPromise = listModerationHistory(
    { Page: 1, PageSize: 50 },
    { next: { tags: [MODERATION_HISTORY_TAG] } },
  );
  const categoriesPromise = listCategories(
    { includeInactive: false },
    { next: { tags: [CATEGORIES_LIST_TAG] } },
  );
  const statsPromise = getAdminDashboardStats(undefined, {
    next: { tags: [ADMIN_STATS_TAG] },
  });

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <PageBreadcrumb items={[{ label: "Admin" }, { label: "Moderação" }]} />

      <Suspense fallback={<ModerationSkeleton />}>
        <ModerationWorkspace
          promises={{
            queuePromise,
            historyPromise,
            categoriesPromise,
            statsPromise,
          }}
        />
      </Suspense>
    </div>
  );
}
