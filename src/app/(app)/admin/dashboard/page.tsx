import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/blocks/page-breadcrumb";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { ADMIN_STATS_TAG } from "@/constants/reports";
import { getAdminDashboardStats } from "@/http/admin-dashboard/admin-dashboard";

import { DashboardSkeleton } from "./_components/dashboard-skeleton";
import { DashboardWorkspace } from "./_components/dashboard-workspace";

/**
 * Hub administrativo integrado com a API através de `getAdminDashboardStats` com Streaming SSR.
 */
export default function AdminDashboardPage() {
  const statsPromise = getAdminDashboardStats(undefined, {
    next: { tags: [ADMIN_STATS_TAG] },
  });

  return (
    <>
      <PageBreadcrumb items={[{ label: "Admin" }, { label: "Dashboard" }]} />

      <main className="flex flex-1 flex-col">
        <PageSection
          title="Dashboard"
          description="Visão geral da gestão da plataforma"
          className="gap-6"
        >
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardWorkspace statsPromise={statsPromise} />
          </Suspense>
        </PageSection>

        <SiteFooter />
      </main>
    </>
  );
}

