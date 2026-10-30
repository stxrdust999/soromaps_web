import type { Metadata } from "next";
import { Suspense } from "react";

import {
  MapDrawerExpanded,
  MapDrawerLayout,
} from "@/components/blocks/map-drawer-layout";
import { SiteFooter } from "@/components/blocks/site-footer";
import { PLACES_LIST_TAG } from "@/constants/places";
import { listPlaces } from "@/http/places/places";

import { HomeFeedContent } from "./_components/home-feed-content";
import { HomeFeedSkeleton } from "./_components/home-feed-skeleton";
import { HomeMapLayers } from "./_components/home-map-layers";
import { HomeMapSearch } from "./_components/home-map-search";
import { HomePanelHeader } from "./_components/home-panel-header";

export const metadata: Metadata = {
  title: "Mapa Interativo",
  description:
    "Explore o mapa de Sorocaba e descubra locais autenticados por exploradores.",
};

interface HomePageProps {
  searchParams?: Promise<{
    lat?: string;
    lng?: string;
    placeId?: string;
  }>;
}

/**
 * Página inicial do explorador com mapa interativo e trilhas em streaming via Suspense.
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const query = searchParams ? await searchParams : {};
  const lat = query.lat ? Number.parseFloat(query.lat) : undefined;
  const lng = query.lng ? Number.parseFloat(query.lng) : undefined;

  const initialViewport =
    lat !== undefined && lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng)
      ? { center: [lng, lat] as [number, number], zoom: 17 }
      : undefined;

  const promises = {
    placesPromise: listPlaces(
      { PageSize: 50 },
      { next: { tags: [PLACES_LIST_TAG] } },
    ),
  };

  return (
    <MapDrawerLayout
      map={
        <>
          <HomeMapLayers />
          <HomeMapSearch />
        </>
      }
      initialViewport={initialViewport}
    >
      <HomePanelHeader />

      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeedContent promises={promises} />
      </Suspense>

      <MapDrawerExpanded>
        <SiteFooter />
      </MapDrawerExpanded>
    </MapDrawerLayout>
  );
}
