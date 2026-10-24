"use client";

import type { ReactNode } from "react";
import { use, useMemo } from "react";

import type { getAdminDashboardStatsResponse } from "@/http/admin-dashboard/admin-dashboard";
import type {
  AttentionQueueItem,
  DataQualityPointItem,
  MetricCardItem,
  NewPlacesSummary,
  PlaceSegmentItem,
  WeeklySignupItem,
} from "@/types/dashboard";

import { AttentionQueues } from "./attention-queues";
import { DataQualityChart } from "./data-quality-chart";
import { MetricCard } from "./metric-card";
import { NewPlacesCard } from "./new-places-card";
import { PlaceSegmentationCard } from "./place-segmentation-card";
import { SignupsChart } from "./signups-chart";

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

interface DashboardWorkspaceProps {
  statsPromise: Promise<getAdminDashboardStatsResponse>;
}

/**
 * Workspace do dashboard administrativo (`/admin/dashboard`).
 * Desempacota `statsPromise` via `React.use()` e memoiza as séries e indicadores com `useMemo()`.
 */
export function DashboardWorkspace({ statsPromise }: DashboardWorkspaceProps) {
  const statsResponse = use(statsPromise);
  const stats = statsResponse.status === 200 ? statsResponse.data : null;

  const queues = useMemo<AttentionQueueItem[]>(() => {
    const pendingPlacesCount = Number(stats?.queues.pendingPlacesCount ?? 0);
    const oldestPendingHours = Number(
      stats?.oldestPendingPlaces[0]?.hoursPending ?? 0,
    );
    const openReportsCount = Number(stats?.queues.openReportsTargetsCount ?? 0);
    const flaggedReviewsCount = Number(stats?.queues.flaggedReviewsCount ?? 0);

    return [
      {
        label: "Moderação de pontos",
        href: "/admin/moderation",
        pendentes: pendingPlacesCount,
        aguardandoHaDias: Math.max(0, Math.round(oldestPendingHours / 24)),
      },
      {
        label: "Denúncias e Feedback",
        href: "/admin/reports",
        pendentes: openReportsCount,
        aguardandoHaDias: openReportsCount > 0 ? 1 : 0,
      },
      {
        label: "Avaliações sinalizadas",
        href: "/admin/reviews",
        pendentes: flaggedReviewsCount,
        aguardandoHaDias: flaggedReviewsCount > 0 ? 1 : 0,
      },
    ];
  }, [stats]);

  const placeSegments = useMemo<PlaceSegmentItem[]>(() => {
    const rawCategories = stats?.categoriesDistribution ?? [];
    if (rawCategories.length === 0)
      return [
        {
          categoria: "Sem locais",
          key: "vazio",
          total: 0,
          color: "var(--chart-1)",
        },
      ];

    return rawCategories.map((category, index) => ({
      categoria: category.categoryName,
      key: category.categoryName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-"),
      total: Number(category.placesCount ?? 0),
      color: category.color || `var(--chart-${(index % 5) + 1})`,
    }));
  }, [stats]);

  const newPlacesSummary = useMemo<NewPlacesSummary>(() => {
    const dailySeries = stats?.dailySeries ?? [];
    const last7Days = dailySeries.slice(-7);
    const newPlacesThisWeek = last7Days.reduce(
      (sum, day) => sum + Number(day.newPlaces ?? 0),
      0,
    );
    const moderationDecisionsThisWeek = last7Days.reduce(
      (sum, day) => sum + Number(day.moderationDecisions ?? 0),
      0,
    );
    const pendingPlacesCount = Number(stats?.queues.pendingPlacesCount ?? 0);

    const total = Math.max(
      newPlacesThisWeek,
      moderationDecisionsThisWeek + pendingPlacesCount,
    );
    const approvedEstimate = Math.max(total - pendingPlacesCount, 0);

    return {
      total,
      metaAtingida: Math.min(100, Math.round((total / 200) * 100)),
      variacaoSemanal: Math.round(
        Number(stats?.kpis.activePlaces.percentageChange ?? 0),
      ),
      stages: [
        { label: "Aprovados", key: "aprovados", total: approvedEstimate },
        { label: "Pendentes", key: "pendentes", total: pendingPlacesCount },
      ],
    };
  }, [stats]);

  const metricCards = useMemo<MetricCardItem[]>(() => {
    return [
      {
        label: "Novos usuários no período",
        hint: "Contas de exploradores criadas no período ativo do dashboard.",
        valor: Number(stats?.kpis.newUsers.current ?? 0),
        variacaoSemanal: Math.round(
          Number(stats?.kpis.newUsers.percentageChange ?? 0),
        ),
      },
      {
        label: "Avaliações publicadas",
        hint: "Avaliações escritas pela comunidade nos pontos aprovados.",
        valor: Number(stats?.kpis.newReviews.current ?? 0),
        variacaoSemanal: Math.round(
          Number(stats?.kpis.newReviews.percentageChange ?? 0),
        ),
      },
    ];
  }, [stats]);

  const signupsSeries = useMemo<WeeklySignupItem[]>(() => {
    const dailySeries = stats?.dailySeries ?? [];
    return dailySeries.map((item) => ({
      semana: new Date(`${item.date}T00:00:00Z`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }),
      usuarios: Number(item.newUsers ?? 0),
      pontos: Number(item.newPlaces ?? 0),
    }));
  }, [stats]);

  const dataQualitySeries = useMemo<DataQualityPointItem[]>(() => {
    const dailySeries = stats?.dailySeries ?? [];
    return dailySeries.map((item) => ({
      data: item.date,
      completos: Number(item.newPlaces ?? 0) + Number(item.newReviews ?? 0),
      incompletos: Math.max(
        0,
        Number(item.newPlaces ?? 0) - Number(item.moderationDecisions ?? 0),
      ),
    }));
  }, [stats]);

  return (
    <div className="flex flex-col gap-10">
      {/* attention-queues - section */}
      <DashboardBlock title="Necessita de atenção">
        <AttentionQueues queues={queues} />
      </DashboardBlock>

      {/* metrics - section */}
      <DashboardBlock title="Números">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PlaceSegmentationCard segments={placeSegments} />
          <NewPlacesCard summary={newPlacesSummary} />

          <div className="flex flex-col gap-4">
            {metricCards.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </DashboardBlock>

      {/* signups-chart - section */}
      <DashboardBlock title="Gráfico">
        <SignupsChart data={signupsSeries} />
      </DashboardBlock>

      {/* data-quality-chart - section */}
      <DashboardBlock title="Qualidade de dados">
        <DataQualityChart series={dataQualitySeries} />
      </DashboardBlock>
    </div>
  );
}
