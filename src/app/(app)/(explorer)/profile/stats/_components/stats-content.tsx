"use client";

import { use, useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  getMyStatsResponse,
  listMyReviewsResponse,
} from "@/http/activity/activity";
import type {
  ProfileCategoryCount,
  ProfileCoverage,
  ProfileWeekActivity,
} from "@/types/profile";

import { WeeklyActivityChart } from "../../_components/weekly-activity-chart";

interface StatsContentProps {
  promises: {
    statsPromise: Promise<getMyStatsResponse>;
    reviewsPromise: Promise<listMyReviewsResponse>;
  };
}

/**
 * Painel de estatísticas e cobertura geográfica do explorador autenticado via React.use() + useMemo().
 */
export function StatsContent({ promises }: StatsContentProps) {
  const statsResponse = use(promises.statsPromise);
  const reviewsResponse = use(promises.reviewsPromise);

  const { cobertura, categorias, semanal, totalVisitas } = useMemo(() => {
    const statsData =
      statsResponse.status === 200 ? statsResponse.data : undefined;
    const reviewsItems =
      reviewsResponse.status === 200
        ? (reviewsResponse.data.items ?? [])
        : [];

    const coverage: ProfileCoverage = {
      percentual: Math.round(
        Number(statsData?.neighborhoodCoverage?.coveragePercentage ?? 0),
      ),
      visitados: Number(
        statsData?.neighborhoodCoverage?.visitedNeighborhoodsCount ?? 0,
      ),
      total: Number(
        statsData?.neighborhoodCoverage?.totalActiveNeighborhoodsCount ?? 0,
      ),
    };

    const categories: ProfileCategoryCount[] = (
      statsData?.visitsByCategory ?? []
    ).map((categoryStat) => ({
      categoria: categoryStat.categoryName,
      visitas: Number(categoryStat.count),
    }));

    const reviewsByMonthMap = new Map<string, number>();
    for (const review of reviewsItems) {
      const monthKey = review.createdAt.slice(0, 7);
      reviewsByMonthMap.set(
        monthKey,
        (reviewsByMonthMap.get(monthKey) ?? 0) + 1,
      );
    }

    const weeklyActivity: ProfileWeekActivity[] = (
      statsData?.visitsByMonth ?? []
    ).map((monthStat) => ({
      semana: monthStat.month,
      visitas: Number(monthStat.count),
      avaliacoes: reviewsByMonthMap.get(monthStat.month) ?? 0,
    }));

    return {
      cobertura: coverage,
      categorias: categories,
      semanal: weeklyActivity,
      totalVisitas: Number(statsData?.totalVisits ?? 0),
    };
  }, [statsResponse, reviewsResponse]);

  const maisVisitada = Math.max(1, categorias.at(0)?.visitas ?? 1);

  return (
    <div className="flex flex-col gap-4">
      {/* city coverage - section */}
      <Card>
        <CardHeader>
          <CardTitle>Sorocaba explorada</CardTitle>
          <CardDescription>
            Bairros onde você já registrou pelo menos uma visita, sobre os
            bairros que o mapa conhece hoje
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 border-t pt-6">
          <div className="flex items-end justify-between gap-4">
            <span className="font-semibold text-4xl tabular-nums">
              {cobertura.percentual}%
            </span>

            <span className="text-muted-foreground text-sm tabular-nums">
              {cobertura.visitados} de {cobertura.total} bairros
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${cobertura.percentual}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* top categories - section */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias mais visitadas</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 border-t pt-6">
          {categorias.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma visita registrada por categoria ainda.
            </p>
          ) : (
            categorias.map((categoryCount) => (
              <div
                key={categoryCount.categoria}
                className="flex flex-col gap-1.5"
              >
                <div className="flex justify-between text-sm">
                  <span>{categoryCount.categoria}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {categoryCount.visitas}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground"
                    style={{
                      width: `${Math.round((categoryCount.visitas / maisVisitada) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* activity chart - section */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade no período</CardTitle>
          <CardDescription>
            Suas {totalVisitas} visitas e avaliações distribuídas nos últimos
            meses
          </CardDescription>
        </CardHeader>

        <CardContent className="border-t pt-6">
          <WeeklyActivityChart data={semanal} />
        </CardContent>
      </Card>
    </div>
  );
}
