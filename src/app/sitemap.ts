import type { MetadataRoute } from "next";

import { getAppUrl } from "@/config/env";
import { PLACES_LIST_TAG } from "@/constants/places";
import { STORIES_LIST_TAG } from "@/constants/reports";
import { listPlaces } from "@/http/places/places";
import { listStories } from "@/http/stories/stories";

/**
 * Builds canonical application sitemap including high-priority static views and dynamic entities.
 *
 * @returns Fully resolved sitemap entries array.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = getAppUrl();
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}/home`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${appUrl}/discover`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${appUrl}/feed`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/community`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${appUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${appUrl}/register`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const [placesSettledResult, storiesSettledResult] = await Promise.allSettled([
      listPlaces(
        { PageSize: 100 },
        { next: { tags: [PLACES_LIST_TAG] } },
      ),
      listStories(
        { PageSize: 50, status: "published" },
        { next: { tags: [STORIES_LIST_TAG] } },
      ),
    ]);

    const dynamicPlaceEntries: MetadataRoute.Sitemap =
      placesSettledResult.status === "fulfilled" && placesSettledResult.value.status === 200
        ? (placesSettledResult.value.data.items ?? []).map((place) => ({
            url: `${appUrl}/places/${place.id}`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))
        : [];

    const dynamicStoryEntries: MetadataRoute.Sitemap =
      storiesSettledResult.status === "fulfilled" && storiesSettledResult.value.status === 200
        ? (storiesSettledResult.value.data.items ?? []).map((story) => ({
            url: `${appUrl}/pautas/${encodeURIComponent(story.slug)}`,
            lastModified: story.publishedAt ? new Date(story.publishedAt) : currentDate,
            changeFrequency: "monthly" as const,
            priority: 0.7,
          }))
        : [];

    return [...staticRoutes, ...dynamicPlaceEntries, ...dynamicStoryEntries];
  } catch {
    return staticRoutes;
  }
}
