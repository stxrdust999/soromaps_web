"use client";

import { ArrowRightIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
import type { MarkerResource } from "@/types/marker";

interface LocationMarkerProps {
  marker: MarkerResource;
}

/**
 * Marcador de um local no mapa. Só exibe: editar e excluir moram em
 * `/places/[id]`.
 *
 * O tooltip (hover) é uma isca de uma linha porque o `MarkerTooltip` é
 * `pointer-events-none` e some no `mouseleave` — nada dentro dele é clicável,
 * e no touch ele nunca aparece. O que precisa de clique fica no popup.
 */
export default function LocationMarker({ marker }: LocationMarkerProps) {
  const categoryName = marker.category?.name ?? "Local";
  const coverUrl =
    marker.coverPhotoUrl ||
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80";
  const rating = marker.ratingAverage ? marker.ratingAverage.toFixed(1) : null;

  return (
    <MapMarker longitude={marker.lng} latitude={marker.lat}>
      <MarkerContent>
        <div className="size-4 cursor-pointer rounded-full border-2 border-white bg-primary shadow-lg" />
      </MarkerContent>

      <MarkerTooltip>
        {marker.nome} · {categoryName}
      </MarkerTooltip>

      <MarkerPopup className="p-0">
        <div className="w-56">
          <div className="relative h-28 w-full overflow-hidden rounded-t-md bg-muted">
            <Image
              src={coverUrl}
              alt={`Foto de ${marker.nome}`}
              fill
              sizes="224px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-2 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="truncate font-semibold text-sm">
                {marker.nome}
              </span>
              <span className="text-muted-foreground text-xs">
                {categoryName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <Badge variant="secondary">{categoryName}</Badge>

              {rating && (
                <Badge variant="secondary">
                  <StarIcon className="size-3 fill-yellow-500 text-yellow-500" />
                  {rating}
                </Badge>
              )}
            </div>

            <Button asChild size="sm" className="w-full">
              <Link href={`/places/${marker.id}`}>
                Ver detalhes
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}
