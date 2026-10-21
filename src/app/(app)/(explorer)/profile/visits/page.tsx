import Link from "next/link";

import { PlaceRow } from "@/components/blocks/place-row";
import { StarRating } from "@/components/blocks/star-rating";
import { Button } from "@/components/ui/button";
import { MY_VISITS_TAG } from "@/constants/achievements";
import { listMyVisits } from "@/http/activity/activity";
import {
  formatVisitDate,
  profilePlace,
  profileVisitGroups,
  profileVisitSummary,
  visitDaysAgo,
} from "@/mocks/profile";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";

/**
 * Carrega a lista de visitas do explorador com agrupamento cronológico.
 */
async function loadVisitsData() {
  try {
    const res = await listMyVisits({ PageSize: 50 }, { next: { tags: [MY_VISITS_TAG] } });
    if (res.status === 200 && res.data.items.length > 0) {
      const items = res.data.items;
      const meses = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
      ];
      const groupedMap = new Map<string, typeof items>();

      for (const item of items) {
        const d = new Date(item.visitedOn);
        const rotulo = `${meses[d.getMonth()]} de ${d.getFullYear()}`;
        const existing = groupedMap.get(rotulo) ?? [];
        existing.push(item);
        groupedMap.set(rotulo, existing);
      }

      const groups = Array.from(groupedMap.entries()).map(([rotulo, visitas]) => ({
        rotulo,
        visitas: visitas.map((v) => ({
          markerId: v.place.id,
          placeTitle: v.place.name,
          data: v.visitedOn,
          daysAgo: Math.max(
            0,
            Math.floor(
              (Date.now() - new Date(v.visitedOn).getTime()) / (1000 * 60 * 60 * 24),
            ),
          ),
          nota: undefined as number | undefined,
        })),
      }));

      const uniquePlaces = new Set(items.map((v) => v.place.id)).size;
      const resumo = {
        visitas: items.length,
        lugares: uniquePlaces,
        bairros: 0,
        categorias: 0,
      };

      return { groups, resumo };
    }
  } catch {
    // Silencia e recorre ao fallback dos mocks
  }

  const mockGroups = profileVisitGroups().map((g) => ({
    rotulo: g.rotulo,
    visitas: g.visitas.map((v) => ({
      markerId: v.markerId,
      placeTitle: profilePlace(v.markerId).nome,
      data: v.data,
      daysAgo: visitDaysAgo(v),
      nota: v.nota,
    })),
  }));

  return {
    groups: mockGroups,
    resumo: profileVisitSummary(),
  };
}

/**
 * Timeline de visitas, agrupada por mês.
 */
export default async function ProfileVisitsPage() {
  const { groups, resumo } = await loadVisitsData();

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Você ainda não registrou nenhuma visita.
        </p>

        <Button asChild>
          <Link href="/home">Abrir o mapa</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted-foreground text-sm">
        {resumo.visitas} visitas · {resumo.lugares} lugares · {resumo.bairros}{" "}
        bairros · {resumo.categorias} categorias
      </p>

      {groups.map((group) => (
        <section key={group.rotulo} className="flex flex-col gap-3">
          <h2 className="font-semibold text-lg capitalize">{group.rotulo}</h2>

          {group.visitas.map((visita) => (
            <PlaceRow
              key={`${visita.markerId}-${visita.data}`}
              marker={{ id: visita.markerId, nome: visita.placeTitle }}
              trailing={
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground text-xs">
                    {formatVisitDate(visita.data)} ·{" "}
                    {formatWaitingDays(visita.daysAgo)}
                  </span>

                  {visita.nota !== undefined && (
                    <StarRating nota={visita.nota} size={12} />
                  )}
                </div>
              }
            />
          ))}
        </section>
      ))}
    </div>
  );
}
