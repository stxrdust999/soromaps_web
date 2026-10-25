import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/blocks/page-breadcrumb";
import { ADMIN_REVIEWS_LIST_TAG } from "@/constants/places";
import { adminListReviews } from "@/http/admin-reviews/admin-reviews";
import { ReviewsSkeleton } from "./_components/reviews-skeleton";
import { ReviewsWorkspace } from "./_components/reviews-workspace";

/**
 * Listagem administrativa de avaliações integrada à API via Streaming SSR.
 */
export default function AdminReviewsPage() {
  const reviewsPromise = adminListReviews(
    { Page: 1, PageSize: 100 },
    { next: { tags: [ADMIN_REVIEWS_LIST_TAG] } },
  );

  return (
    <>
      <PageBreadcrumb items={[{ label: "Admin" }, { label: "Avaliações" }]} />

      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsWorkspace promises={{ reviewsPromise }} />
      </Suspense>
    </>
  );
}
