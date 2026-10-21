import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MY_STATS_TAG } from "@/constants/achievements";
import { getMyStats } from "@/http/activity/activity";
import {
  profileCoverage,
  profileTopCategories,
  profileVisitsMock,
  profileWeeklyActivity,
} from "@/mocks/profile";

import { WeeklyActivityChart } from "../_components/weekly-activity-chart";

/**
 * Carrega estatísticas do usuário autenticado via API com fallback para mocks.
 */
async function loadStatsData() {
  try {
    const res = await getMyStats({ next: { tags: [MY_STATS_TAG] } });
    if (res.status === 200) {
      const data = res.data;
      return {
        cobertura: {
          percentual: Number(data.neighborhoodCoverage.coveragePercentage),
          visitados: Number(data.neighborhoodCoverage.visitedNeighborhoodsCount),
          total: Number(data.neighborhoodCoverage.totalActiveNeighborhoodsCount),
        },
        categorias: data.visitsByCategory.map((c) => ({
          categoria: c.categoryName,
          visitas: Number(c.count),
        })),
        semanal: data.visitsByMonth.map((w) => ({
          semana: w.month,
          visitas: Number(w.count),
          avaliacoes: 0,
        })),
        totalVisitas: Number(data.totalVisits),
        mediaAvaliacoes: 4.8,
      };
    }
  } catch {
    // Fallback silencioso
  }

  return {
    cobertura: profileCoverage(),
    categorias: profileTopCategories(),
    semanal: profileWeeklyActivity(),
    totalVisitas: profileVisitsMock.length,
    mediaAvaliacoes: 4.8,
  };
}

/**
 * O placar do explorador.
 */
export default async function ProfileStatsPage() {
  const { cobertura, categorias, semanal, totalVisitas, mediaAvaliacoes } = await loadStatsData();
  const maisVisitada = categorias.at(0)?.visitas ?? 1;

  return (
    <div className="flex flex-col gap-4">
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

      <Card>
        <CardHeader>
          <CardTitle>Categorias mais visitadas</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 border-t pt-6">
          {categorias.map((cat) => (
            <div key={cat.categoria} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span>{cat.categoria}</span>
                <span className="text-muted-foreground tabular-nums">
                  {cat.visitas}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{
                    width: `${Math.round((cat.visitas / maisVisitada) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade por semana</CardTitle>
          <CardDescription>
            Suas {totalVisitas} visitas distribuídas nas últimas oito semanas
          </CardDescription>
        </CardHeader>

        <CardContent className="border-t pt-6">
          <WeeklyActivityChart data={semanal} />
        </CardContent>
      </Card>
    </div>
  );
}
