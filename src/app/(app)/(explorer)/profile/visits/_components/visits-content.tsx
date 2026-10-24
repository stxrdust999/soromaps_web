"use client";

import Link from "next/link";
import { use, useMemo } from "react";

import { PlaceRow } from "@/components/blocks/place-row";
import { Button } from "@/components/ui/button";
import type { listMyVisitsResponse } from "@/http/activity/activity";
import { formatVisitDate } from "@/types/profile";
import { formatWaitingDays } from "@/utils/formatters/format-waiting-days";
import { mapVisitPlaceToMarker } from "@/utils/mappers/place-mapper";

interface VisitsContentProps {
  promises: {
    visitsPromise: Promise<listMyVisitsResponse>;
  };
}

const monthNames = [
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

/**
 * Timeline agrupada por mês do histórico de visitas do explorador logado via React.use() + useMemo().
 */
export function VisitsContent({ promises }: VisitsContentProps) {
  const visitsResponse = use(promises.visitsPromise);

  const { groups, resumo } = useMemo(() => {
    const items =
      visitsResponse.status === 200 ? (visitsResponse.data.items ?? []) : [];

    const groupedMap = new Map<string, typeof items>();

    for (const item of items) {
      const visitDate = new Date(item.visitedOn);
      const monthLabel = `${monthNames[visitDate.getUTCMonth()]} de ${visitDate.getUTCFullYear()}`;
      const existingList = groupedMap.get(monthLabel) ?? [];
      existingList.push(item);
      groupedMap.set(monthLabel, existingList);
    }

    const mappedGroups = Array.from(groupedMap.entries()).map(
      ([rotulo, visitas]) => ({
        rotulo,
        visitas: visitas.map((visit) => ({
          id: visit.id,
          marker: mapVisitPlaceToMarker(visit.place),
          data: visit.visitedOn,
          daysAgo: Math.max(
            0,
            Math.floor(
              (Date.now() - new Date(visit.visitedOn).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          ),
        })),
      }),
    );

    const uniquePlacesCount = new Set(items.map((visit) => visit.place.id)).size;
    const uniqueNeighborhoodsCount = new Set(
      items.map((visit) => visit.place.neighborhood),
    ).size;
    const uniqueCategoriesCount = new Set(
      items.map((visit) => visit.place.category?.name).filter(Boolean),
    ).size;

    return {
      groups: mappedGroups,
      resumo: {
        visitas: items.length,
        lugares: uniquePlacesCount,
        bairros: uniqueNeighborhoodsCount,
        categorias: uniqueCategoriesCount,
      },
    };
  }, [visitsResponse]);

  if (groups.length === 0)
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

  return (
    <div className="flex flex-col gap-8">
      {/* summary counters - section */}
      <p className="text-muted-foreground text-sm">
        {resumo.visitas} visitas · {resumo.lugares} lugares · {resumo.bairros}{" "}
        bairros · {resumo.categorias} categorias
      </p>

      {/* monthly timeline - section */}
      {groups.map((group) => (
        <section key={group.rotulo} className="flex flex-col gap-3">
          <h2 className="font-semibold text-lg capitalize">{group.rotulo}</h2>

          {group.visitas.map((visita) => (
            <PlaceRow
              key={`${visita.id}-${visita.data}`}
              marker={visita.marker}
              trailing={
                <div className="flex flex-col items-end gap-1">
                  <span className="text-muted-foreground text-xs">
                    {formatVisitDate(visita.data)} ·{" "}
                    {formatWaitingDays(visita.daysAgo)}
                  </span>
                </div>
              }
            />
          ))}
        </section>
      ))}
    </div>
  );
}
