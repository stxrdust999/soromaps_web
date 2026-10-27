"use client";

import { FlameIcon, GemIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { use, useMemo } from "react";

import { PageSection } from "@/components/blocks/page-section";
import { PlaceCard } from "@/components/blocks/place-card";
import { PlaceRail } from "@/components/blocks/place-rail";
import { SiteFooter } from "@/components/blocks/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { listPlacesResponse } from "@/http/places/places";
import { mapPlaceSummaryToMarker } from "@/utils/mappers/place-mapper";

import { CategoryChips } from "./category-chips";
import { DiscoverHero } from "./discover-hero";
import { DiscoverSearch } from "./discover-search";
import { NearbyList } from "./nearby-list";
import { RecentlyAddedRail } from "./recently-added-rail";
import { TopRatedList } from "./top-rated-list";
import { useDiscover } from "./use-discover";
import { VibeChips } from "./vibe-chips";

const CONTENT_WIDTH = "mx-auto flex w-full max-w-6xl flex-col gap-10";

interface DiscoverExplorerProps {
  promises: {
    placesPromise: Promise<listPlacesResponse>;
  };
}

/**
 * Superfície interativa da tela Descobrir resolvida via React.use() + useMemo().
 */
export function DiscoverExplorer({ promises }: DiscoverExplorerProps) {
  const placesResponse = use(promises.placesPromise);

  const markers = useMemo(() => {
    const places =
      placesResponse.status === 200 ? (placesResponse.data.items ?? []) : [];
    return places.map(mapPlaceSummaryToMarker);
  }, [placesResponse]);

  const {
    filter,
    setFilter,
    vibe,
    setVibe,
    search,
    setSearch,
    counts,
    hasResults,
    isLocatingUser,
    locationStatus,
    requestUserLocation,
    rails,
  } = useDiscover(markers);

  return (
    <main className="flex flex-1 flex-col">
      <PageSection
        title="Descobrir"
        description="O que você tá a fim de encontrar hoje?"
        className="gap-8"
        actions={
          <Button asChild>
            <Link href="/places/new">
              <PlusIcon />
              Adicionar ponto
            </Link>
          </Button>
        }
        subitems={
          <div className="mt-4 flex flex-col gap-3">
            {/* search and filters - section */}
            <DiscoverSearch search={search} onSearchChange={setSearch} />

            <CategoryChips
              active={filter}
              onChange={setFilter}
              counts={counts}
              total={markers.length}
            />

            <VibeChips active={vibe} onChange={setVibe} />
          </div>
        }
      >
        <div className={CONTENT_WIDTH}>
          {!hasResults ? (
            <p className="py-12 text-center text-muted-foreground text-sm">
              Nenhum lugar encontrado com esses filtros.
            </p>
          ) : (
            <>
              {/* hero - section */}
              <DiscoverHero places={rails.featured} />

              {/* trending - section */}
              <section className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="flex items-center gap-1.5 font-semibold text-lg">
                    <FlameIcon className="size-4 text-orange-500" />
                    Em alta agora
                  </h2>
                  <span className="text-muted-foreground text-xs">
                    onde a cidade mais avaliou
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rails.trending.map(({ marker, details }) => (
                    <PlaceCard
                      key={marker.id}
                      marker={marker}
                      size="featured"
                      showTags
                      badge={
                        <Badge className="bg-orange-500 text-white">
                          <FlameIcon className="size-3" />
                          {details.totalAvaliacoes} avaliações
                        </Badge>
                      }
                    />
                  ))}
                </div>
              </section>

              {/* rankings - section */}
              <div className="grid gap-6 lg:grid-cols-2">
                <NearbyList
                  places={rails.nearby}
                  isLocatingUser={isLocatingUser}
                  locationStatus={locationStatus}
                  onRequestLocation={requestUserLocation}
                />
                <TopRatedList places={rails.topRated} />
              </div>

              {/* hidden gems - section */}
              {rails.hiddenGems.length > 0 && (
                <PlaceRail
                  title="Joias escondidas"
                  icon={<GemIcon className="size-4 text-teal-500" />}
                  hint="nota alta, pouca gente conhece"
                >
                  {rails.hiddenGems.map(({ marker, details }) => (
                    <PlaceCard
                      key={marker.id}
                      marker={marker}
                      badge={
                        <Badge className="bg-teal-600 text-white">
                          só {details.totalAvaliacoes} avaliações
                        </Badge>
                      }
                    />
                  ))}
                </PlaceRail>
              )}

              {/* recent - section */}
              <RecentlyAddedRail places={rails.recent} />
            </>
          )}
        </div>
      </PageSection>

      <SiteFooter />
    </main>
  );
}
