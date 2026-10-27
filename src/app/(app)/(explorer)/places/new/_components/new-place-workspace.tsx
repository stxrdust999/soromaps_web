"use client";

import { CheckIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  MapAddressSearch,
  type SelectedLocation,
} from "@/components/blocks/map-address-search";
import { MapPickPin } from "@/components/blocks/map-pick-pin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Map as MapCanvas,
  MapControls,
  MapMarker,
  type MapRef,
  type MapViewport,
  MarkerContent,
} from "@/components/ui/map";
import { SOROCABA_VIEWPORT } from "@/constants/map";
import type { listCategoriesResponse } from "@/http/categories/categories";

import { CreateMarkerForm } from "./create-marker-form";

type Stage = "picking" | "form";

const [initialLng, initialLat] = SOROCABA_VIEWPORT.center ?? [0, 0];

interface NewPlaceWorkspaceProps {
  promises: {
    categoriesPromise: Promise<listCategoriesResponse>;
  };
}

/**
 * Superfície interativa em dois estágios para escolha de coordenadas no mapa e preenchimento do novo local.
 */
export function NewPlaceWorkspace({ promises }: NewPlaceWorkspaceProps) {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("picking");
  const [hasVisitedForm, setHasVisitedForm] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [resolvedDistrict, setResolvedDistrict] = useState<string | undefined>(
    undefined,
  );
  const [draftCoords, setDraftCoords] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  const mapRef = useRef<MapRef | null>(null);
  const pendingUserCoordsRef = useRef<{ lng: number; lat: number } | null>(null);

  /** Centraliza o mapa e o pin na posição GPS atual do usuário se disponível via flyTo suave. */
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDraftCoords(userCoords);
        setIsLocatingUser(false);

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [userCoords.lng, userCoords.lat],
            zoom: 16,
            essential: true,
          });
        } else pendingUserCoordsRef.current = userCoords;
      },
      () => {
        setIsLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }, []);

  const handleMapRef = useCallback((mapInstance: MapRef | null) => {
    mapRef.current = mapInstance;

    if (mapInstance && pendingUserCoordsRef.current) {
      const coords = pendingUserCoordsRef.current;
      pendingUserCoordsRef.current = null;
      mapInstance.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 16,
        essential: true,
      });
    }
  }, []);

  const handleViewportChange = useCallback(
    (viewport: MapViewport) => {
      if (stage === "picking" && viewport.center) {
        setDraftCoords({
          lng: viewport.center[0],
          lat: viewport.center[1],
        });
      }
    },
    [stage],
  );

  const handleSelectAddress = useCallback((location: SelectedLocation) => {
    const targetCoords = {
      lng: location.lng,
      lat: location.lat,
    };

    setDraftCoords(targetCoords);
    if (location.district) setResolvedDistrict(location.district);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [targetCoords.lng, targetCoords.lat],
        zoom: 17,
        essential: true,
      });
    }
  }, []);

  const handleAdvanceToForm = useCallback(() => {
    setHasVisitedForm(true);
    setStage("form");
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* address search - section */}
      {stage === "picking" && (
        <div className="absolute top-4 left-4 right-16 z-20 max-w-lg sm:max-w-xl md:max-w-2xl">
          <MapAddressSearch onSelectLocation={handleSelectAddress} />
        </div>
      )}

      {/* locating user feedback - section */}
      {isLocatingUser && (
        <div className="pointer-events-none absolute top-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-background/95 px-4 py-2 font-medium text-foreground text-xs shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <Loader2Icon className="size-3.5 animate-spin text-primary" />
          <span>Buscando sua localização atual...</span>
        </div>
      )}

      {/* map canvas - section */}
      <MapCanvas
        ref={handleMapRef}
        center={SOROCABA_VIEWPORT.center}
        zoom={SOROCABA_VIEWPORT.zoom}
        onViewportChange={handleViewportChange}
      >
        <MapControls
          position="top-right"
          showLocate
          showCompass
          onLocate={(coords) => {
            setDraftCoords({
              lng: coords.longitude,
              lat: coords.latitude,
            });
          }}
        />

        {stage === "form" && (
          <MapMarker longitude={draftCoords.lng} latitude={draftCoords.lat}>
            <MarkerContent>
              <div className="animate-in fade-in zoom-in-75 duration-200">
                <MapPickPin />
              </div>
            </MarkerContent>
          </MapMarker>
        )}
      </MapCanvas>

      {/* center crosshair - section */}
      {stage === "picking" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <MapPickPin />
        </div>
      )}

      {/* bottom card - section */}
      <div className="absolute bottom-4 left-1/2 z-10 w-full max-w-md -translate-x-1/2 px-4 md:bottom-8">
        <Card className="gap-4 bg-background/95 p-5 shadow-2xl backdrop-blur-md">
          <div>
            <h1 className="font-bold text-lg">
              {stage === "picking" ? "Adicionar novo local" : "Sobre o local"}
            </h1>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {stage === "picking"
                ? "Mova o mapa para posicionar o pin no local desejado."
                : "Conta pra gente o que tem de bom nesse lugar."}
            </p>
          </div>

          {stage === "picking" && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/home")}
              >
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleAdvanceToForm}>
                <CheckIcon className="size-4" />
                Confirmar local
              </Button>
            </div>
          )}

          {(stage === "form" || hasVisitedForm) && (
            <div className={stage !== "form" ? "hidden" : undefined}>
              <CreateMarkerForm
                coords={draftCoords}
                defaultDistrict={resolvedDistrict}
                promises={promises}
                onChangeLocation={() => setStage("picking")}
                onSuccess={() => router.push("/home")}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
