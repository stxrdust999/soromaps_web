import { FlameIcon } from "lucide-react";

import { PlaceCard } from "@/components/blocks/place-card";
import { PlaceRail } from "@/components/blocks/place-rail";
import { Badge } from "@/components/ui/badge";
import type { MarkerResource } from "@/types/marker";

const TRENDING_LIMIT = 4;

interface FeedTrendingSectionProps {
  markers: MarkerResource[];
}

/**
 * Trilho horizontal dos locais mais bem avaliados na página inicial do mapa.
 */
export function FeedTrendingSection({ markers }: FeedTrendingSectionProps) {
  const trending = [...markers]
    .sort(
      (first, second) =>
        (second.ratingAverage ?? 0) - (first.ratingAverage ?? 0),
    )
    .slice(0, TRENDING_LIMIT);

  if (trending.length === 0)
    return null;

  return (
    <PlaceRail
      title="Em alta"
      icon={<FlameIcon className="size-4 text-orange-500" />}
      seeAllHref="/discover"
    >
      {trending.map((marker) => (
        <PlaceCard
          key={marker.id}
          marker={marker}
          badge={
            <Badge className="bg-orange-500 text-white">
              <FlameIcon className="size-3" />
              Em alta
            </Badge>
          }
        />
      ))}
    </PlaceRail>
  );
}
