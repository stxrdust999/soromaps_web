import { Loader2Icon, NavigationIcon } from "lucide-react";

import { PlaceRow } from "@/components/blocks/place-row";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "@/utils/formatters/format-distance";

import type { DiscoverPlace, UserLocationStatus } from "./use-discover";

interface NearbyListProps {
  places: DiscoverPlace[];
  isLocatingUser?: boolean;
  locationStatus?: UserLocationStatus;
  onRequestLocation?: () => void;
}

/**
 * Os mais próximos, em lista.
 *
 * Era trilha de cards e virou lista: proximidade é para **comparar** — cinco
 * distâncias alinhadas na mesma coluna se leem de um golpe, o que carrossel de
 * foto não entrega.
 */
export function NearbyList({
  places,
  isLocatingUser = false,
  locationStatus = "idle",
  onRequestLocation,
}: NearbyListProps) {
  if (places.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {/* header and geolocation status - section */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <NavigationIcon className="size-4 text-blue-500" />
          <h2 className="font-semibold text-sm">Perto de você</h2>
        </div>

        {isLocatingUser ? (
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Loader2Icon className="size-3 animate-spin text-blue-500" />
            Localizando você...
          </span>
        ) : locationStatus === "granted" ? (
          <Badge variant="secondary" className="font-normal text-[11px]">
            Sua localização atual
          </Badge>
        ) : locationStatus === "denied" ? (
          <button
            type="button"
            onClick={onRequestLocation}
            className="text-muted-foreground text-xs underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Usar minha localização
          </button>
        ) : null}
      </div>

      {/* nearby places list - section */}
      <div className="flex flex-col gap-2">
        {places.map(({ marker, details }) => (
          <PlaceRow
            key={marker.id}
            marker={marker}
            trailing={
              <span className="font-medium text-muted-foreground tabular-nums">
                {formatDistance(details.distancia)}
              </span>
            }
          />
        ))}
      </div>
    </section>
  );
}
