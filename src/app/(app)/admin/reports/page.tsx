import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/blocks/page-breadcrumb";
import { FEEDBACK_LIST_TAG, REPORTS_LIST_TAG } from "@/constants/reports";
import { listAdminFeedback } from "@/http/feedback/feedback";
import { listAdminGroupedReports } from "@/http/reports/reports";

import { ReportsSkeleton } from "./_components/reports-skeleton";
import { ReportsWorkspace } from "./_components/reports-workspace";

/**
 * Caixa de entrada administrativa de denúncias e feedback (`/admin/reports`).
 * Dispara as Promises de denúncias agrupadas e feedback no servidor para streaming via Suspense.
 */
export default function AdminReportsPage() {
  const reportsPromise = listAdminGroupedReports(
    { Page: 1, PageSize: 100 },
    { next: { tags: [REPORTS_LIST_TAG] } },
  );
  const feedbackPromise = listAdminFeedback(
    { Page: 1, PageSize: 100 },
    { next: { tags: [FEEDBACK_LIST_TAG] } },
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <PageBreadcrumb
        items={[{ label: "Admin" }, { label: "Denúncias e Feedback" }]}
      />

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsWorkspace
          reportsPromise={reportsPromise}
          feedbackPromise={feedbackPromise}
        />
      </Suspense>
    </div>
  );
}

