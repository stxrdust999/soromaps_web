"use client";

import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { MapPickPin } from "@/components/blocks/map-pick-pin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Map as MapCanvas,
  MapControls,
  MapMarker,
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
  const [viewport, setViewport] = useState<Partial<MapViewport>>(SOROCABA_VIEWPORT);
  const [draftCoords, setDraftCoords] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  /** Centraliza o mapa e o pin na posição GPS atual do usuário se disponível. */
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDraftCoords(userCoords);
        setViewport({
          ...SOROCABA_VIEWPORT,
          center: [userCoords.lng, userCoords.lat],
          zoom: 16,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000 },
    );
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

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* map canvas - section */}
      <MapCanvas
        viewport={viewport}
        onViewportChange={handleViewportChange}
      >
        <MapControls position="top-right" showLocate showCompass />

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

          {stage === "picking" ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/home")}
              >
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => setStage("form")}>
                <CheckIcon className="size-4" />
                Confirmar local
              </Button>
            </div>
          ) : (
            <CreateMarkerForm
              coords={draftCoords}
              promises={promises}
              onChangeLocation={() => setStage("picking")}
              onSuccess={() => router.push("/home")}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
