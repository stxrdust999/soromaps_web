"use client";

import Link from "next/link";
import { use, useMemo } from "react";

import { PlaceCard } from "@/components/blocks/place-card";
import { Button } from "@/components/ui/button";
import type { listMyFavoritesResponse } from "@/http/activity/activity";
import { mapFavoriteToMarker } from "@/utils/mappers/place-mapper";

interface FavoritesContentProps {
  promises: {
    favoritesPromise: Promise<listMyFavoritesResponse>;
  };
}

/**
 * Grade de locais favoritados pelo explorador autenticado resolvida via React.use() + useMemo().
 */
export function FavoritesContent({ promises }: FavoritesContentProps) {
  const favoritesResponse = use(promises.favoritesPromise);

  const favoriteMarkers = useMemo(() => {
    const items =
      favoritesResponse.status === 200
        ? (favoritesResponse.data.items ?? [])
        : [];
    return items.map((favorite) => mapFavoriteToMarker(favorite));
  }, [favoritesResponse]);

  if (favoriteMarkers.length === 0)
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Explore o mapa e salve os lugares que você quer revisitar.
        </p>

        <Button asChild>
          <Link href="/discover">Descobrir lugares</Link>
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        {favoriteMarkers.length} lugares salvos
      </p>

      {/* favorites grid - section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteMarkers.map((marker) => (
          <PlaceCard
            key={marker.id}
            size="featured"
            showTags
            marker={marker}
          />
        ))}
      </div>
    </div>
  );
}
