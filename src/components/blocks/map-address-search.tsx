"use client";

import { MapPinIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { GooeyInput } from "@/components/ui/gooey-input";
import { cn } from "@/lib/utils";

interface PhotonFeatureGeometry {
  coordinates: [number, number];
  type: string;
}

interface PhotonFeatureProperties {
  osm_id?: number | string;
  name?: string;
  street?: string;
  housenumber?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface PhotonFeature {
  geometry: PhotonFeatureGeometry;
  properties: PhotonFeatureProperties;
}

interface PhotonResponse {
  type: "FeatureCollection";
  features: PhotonFeature[];
}

export interface SelectedLocation {
  lng: number;
  lat: number;
  label: string;
  district?: string;
}

interface MapAddressSearchProps {
  className?: string;
  onSelectLocation: (location: SelectedLocation) => void;
}

/**
 * Constrói o título descritivo do logradouro ou ponto encontrado.
 */
function buildMainAddressLabel(properties: PhotonFeatureProperties): string {
  if (properties.name) return properties.name;

  const streetAndNumber = [properties.street, properties.housenumber]
    .filter(Boolean)
    .join(", ");

  if (streetAndNumber) return streetAndNumber;

  return "Local em Sorocaba";
}

/**
 * Constrói o subtítulo complementar (bairro, cidade, estado).
 */
function buildSecondaryAddressLabel(properties: PhotonFeatureProperties): string {
  const parts = [properties.district, properties.city, properties.state]
    .filter(Boolean);

  return parts.join(" - ");
}

/**
 * Barra de busca de endereço por autocompletar e geocodificação focada na região de Sorocaba via Photon.
 */
export function MapAddressSearch({
  className,
  onSelectLocation,
}: MapAddressSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /** Fecha a lista suspensa ao clicar fora do componente. */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /** Realiza a busca no Photon com debounce ao alterar o termo de pesquisa. */
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (trimmed.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);

      try {
        const queryUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          trimmed,
        )}&bbox=-47.58,-23.58,-47.33,-23.42&limit=5`;

        const response = await fetch(queryUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as PhotonResponse;
        setResults(data.features ?? []);
        setIsOpen(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

  const handleSelectFeature = useCallback(
    (feature: PhotonFeature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const mainLabel = buildMainAddressLabel(feature.properties);

      setSearchTerm(mainLabel);
      setIsOpen(false);

      onSelectLocation({
        lng: longitude,
        lat: latitude,
        label: mainLabel,
        district: feature.properties.district,
      });
    },
    [onSelectLocation],
  );

  const handleClear = useCallback(() => {
    setSearchTerm("");
    setResults([]);
    setIsOpen(false);
  }, []);

  const expandedOffset = 48;
  const expandedWidth = 520;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-lg sm:max-w-xl md:max-w-2xl", className)}
    >
      {/* gooey search input - component */}
      <GooeyInput
        collapsedWidth={290}
        expandedWidth={expandedWidth}
        expandedOffset={expandedOffset}
        placeholder="Buscar endereço ou ponto..."
        value={searchTerm}
        onValueChange={setSearchTerm}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        isLoading={isLoading}
        onClear={handleClear}
        surfaceClassName="bg-background/80 dark:bg-black/60 text-foreground dark:text-neutral-100 backdrop-blur-md shadow-lg border border-border/40 dark:border-white/15"
        className="justify-start"
      />

      {/* autocomplete results dropdown - section */}
      {isOpen && results.length > 0 && (
        <div
          style={{ left: expandedOffset, width: expandedWidth }}
          className="absolute top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border/40 dark:border-white/15 bg-background/80 dark:bg-black/75 p-1 text-foreground dark:text-neutral-100 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          <ul className="flex flex-col gap-0.5">
            {results.map((feature, index) => {
              const mainLabel = buildMainAddressLabel(feature.properties);
              const secondaryLabel = buildSecondaryAddressLabel(
                feature.properties,
              );
              const uniqueKey = `${feature.properties.osm_id ?? index}-${feature.geometry.coordinates.join(",")}`;

              return (
                <li key={uniqueKey}>
                  <button
                    type="button"
                    onClick={() => handleSelectFeature(feature)}
                    className="flex w-full items-start gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                  >
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {mainLabel}
                      </p>
                      {secondaryLabel && (
                        <p className="truncate text-muted-foreground text-xs">
                          {secondaryLabel}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
