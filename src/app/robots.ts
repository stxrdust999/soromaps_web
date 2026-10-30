import type { MetadataRoute } from "next";

import { getAppUrl } from "@/config/env";

/**
 * Generates search engine crawler instructions and indexation boundaries via robots.txt.
 *
 * @returns Fully configured robots metadata descriptor.
 */
export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/home",
        "/discover",
        "/feed",
        "/community",
        "/places/",
        "/pautas/",
        "/login",
        "/register",
      ],
      disallow: [
        "/admin/",
        "/api/",
        "/profile/",
        "/visits",
        "/favorites",
        "/stats",
        "/achievements",
        "/places/new",
        "/community/new-story",
        "/community/nova-pauta",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
