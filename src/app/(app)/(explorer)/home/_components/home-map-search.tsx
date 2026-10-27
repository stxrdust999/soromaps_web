"use client";

import { useCallback } from "react";

import { MapAddressSearch, type SelectedLocation } from "@/components/blocks/map-address-search";
import { useMapDrawerLayout } from "@/components/blocks/map-drawer-layout";
import { useMap } from "@/components/ui/map";
import { cn } from "@/lib/utils";

/**
 * Barra de busca com GooeyInput flutuando sobre o mapa da página inicial,
 * centralizando o mapa no local selecionado e sincronizando visibilidade com o drawer.
 */
export function HomeMapSearch() {
  const { map } = useMap();
  const { isExpanded } = useMapDrawerLayout();

  const handleSelectLocation = useCallback(
    (location: SelectedLocation) => {
      if (!map) return;

      map.flyTo({
        center: [location.lng, location.lat],
        zoom: 17,
        essential: true,
      });
    },
    [map],
  );

  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-4 left-4 right-16 z-20 max-w-lg sm:max-w-xl md:max-w-2xl transition-all duration-300",
        isExpanded && "pointer-events-none -translate-y-2 opacity-0",
      )}
    >
      <MapAddressSearch onSelectLocation={handleSelectLocation} />
    </div>
  );
}
