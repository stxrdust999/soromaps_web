import { NavigationIcon } from "lucide-react";

import { PlaceCard } from "@/components/blocks/place-card";
import { PlaceRail } from "@/components/blocks/place-rail";
import type { MarkerResource } from "@/types/marker";

const NEARBY_LIMIT = 6;

interface FeedNearbySectionProps {
  markers: MarkerResource[];
}

/**
 * Trilho horizontal dos locais mais próximos ao centro do mapa na página inicial.
 */
export function FeedNearbySection({ markers }: FeedNearbySectionProps) {
  const nearby = [...markers]
    .sort((first, second) => (first.distanceKm ?? 0) - (second.distanceKm ?? 0))
    .slice(0, NEARBY_LIMIT);

  if (nearby.length === 0)
    return null;

  return (
    <PlaceRail
      title="Perto de você"
      icon={<NavigationIcon className="size-4 text-blue-500" />}
    >
      {nearby.map((marker) => (
        <PlaceCard key={marker.id} marker={marker} />
      ))}
    </PlaceRail>
  );
}
