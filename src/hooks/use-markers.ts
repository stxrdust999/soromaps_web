"use client";

import { useEffect, useState } from "react";

import { useMap } from "@/components/ui/map";
import type { PlaceSummaryDto } from "@/http/api.schemas";
import type { MarkerResource } from "@/types/marker";

/**
 * Converte PlaceSummaryDto retornado pela API para o formato de marcador do mapa.
 */
function mapPlaceToMarker(place: PlaceSummaryDto): MarkerResource {
  return {
    id: place.id,
    nome: place.name,
    lat: typeof place.latitude === "string" ? parseFloat(place.latitude) : place.latitude,
    lng: typeof place.longitude === "string" ? parseFloat(place.longitude) : place.longitude,
    category: place.category,
    ratingAverage:
      typeof place.ratingAverage === "string"
        ? parseFloat(place.ratingAverage)
        : place.ratingAverage,
    reviewsCount:
      typeof place.reviewsCount === "string"
        ? parseInt(place.reviewsCount, 10)
        : place.reviewsCount,
    coverPhotoUrl: place.coverPhotoUrl,
  };
}

/**
 * Carrega os markers da API enquanto o zoom estiver em `minZoom` ou acima, e
 * busca os locais dentro do bounding box atual do viewport do MapLibre.
 */
export function useMarkers({ minZoom = 13 }: { minZoom?: number } = {}) {
  const { map } = useMap();
  const [isAboveMinZoom, setIsAboveMinZoom] = useState(false);
  const [markers, setMarkers] = useState<MarkerResource[]>([]);

  useEffect(() => {
    if (!map) return;

    const handleMoveEnd = () => {
      const zoom = map.getZoom();
      const meetsZoom = zoom >= minZoom;
      setIsAboveMinZoom(meetsZoom);

      if (!meetsZoom) {
        setMarkers([]);
        return;
      }

      const bounds = map.getBounds();
      if (!bounds) return;

      const minLon = bounds.getWest();
      const minLat = bounds.getSouth();
      const maxLon = bounds.getEast();
      const maxLat = bounds.getNorth();
      const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

      const controller = new AbortController();

      fetch(`/api/proxy/places?bbox=${encodeURIComponent(bbox)}&pageSize=100`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!data) return;
          const items: PlaceSummaryDto[] = Array.isArray(data)
            ? data
            : data.items || [];
          setMarkers(items.map(mapPlaceToMarker));
        })
        .catch((error: Error) => {
          if (error.name !== "AbortError") {
            console.error("Erro ao buscar locais no viewport:", error);
          }
        });
    };

    handleMoveEnd();
    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, minZoom]);

  return { markers, isAboveMinZoom };
}
