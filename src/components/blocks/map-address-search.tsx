"use client";

import { Loader2Icon, MapPinIcon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
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

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-sm sm:max-w-md", className)}
    >
      <div className="relative flex items-center">
        <SearchIcon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />

        <Input
          type="text"
          value={searchTerm}
          placeholder="Buscar endereço ou ponto em Sorocaba..."
          className="h-10 bg-background/90 pr-16 pl-9 shadow-md backdrop-blur-md transition-all focus-visible:ring-primary"
          onChange={(event) => setSearchTerm(event.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading && (
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          )}

          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar busca"
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg border bg-background/95 p-1 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
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
