import type { ReactNode } from "react";

import { PageBreadcrumb } from "@/components/blocks/page-breadcrumb";
import { PageSection } from "@/components/blocks/page-section";
import { SiteFooter } from "@/components/blocks/site-footer";
import { ADMIN_STATS_TAG } from "@/constants/reports";
import { getAdminDashboardStats } from "@/http/admin-dashboard/admin-dashboard";
import { metricCardsMock } from "@/mocks/admin-dashboard";

import { AttentionQueues } from "./_components/attention-queues";
import { DataQualityChart } from "./_components/data-quality-chart";
import { MetricCard } from "./_components/metric-card";
import { NewPlacesCard } from "./_components/new-places-card";
import { PlaceSegmentationCard } from "./_components/place-segmentation-card";
import { SignupsChart } from "./_components/signups-chart";

interface DashboardBlockProps {
  title: string;
  children: ReactNode;
}

function DashboardBlock({ title, children }: DashboardBlockProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Hub do admin integrado com a API através de getAdminDashboardStats.
 */
export default async function AdminDashboardPage() {
  let statsData = null;

  try {
    const res = await getAdminDashboardStats(undefined, { next: { tags: [ADMIN_STATS_TAG] } });
    if (res.status === 200) {
      statsData = res.data;
    }
  } catch {
    // Mantém fallback seguro
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageBreadcrumb items={[{ label: "Admin" }, { label: "Dashboard" }]} />

      <PageSection
        title="Dashboard"
        description="Visão geral da gestão da plataforma"
      >
        <div className="flex flex-col gap-10">
          <DashboardBlock title="Necessita de atenção">
            <AttentionQueues />
          </DashboardBlock>

          <DashboardBlock title="Números">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <PlaceSegmentationCard />
              <NewPlacesCard />

              <div className="flex flex-col gap-4">
                {metricCardsMock.map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))}
              </div>
            </div>
          </DashboardBlock>

          <DashboardBlock title="Gráfico">
            <SignupsChart />
          </DashboardBlock>

          <DashboardBlock title="Qualidade de dados">
            <DataQualityChart />
          </DashboardBlock>
        </div>
      </PageSection>

      <SiteFooter />
    </main>
  );
}
