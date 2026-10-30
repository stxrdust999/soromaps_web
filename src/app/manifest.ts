import type { MetadataRoute } from "next";

/**
 * Generates the Progressive Web App (PWA) manifest specifying branding and display modes.
 *
 * @returns Web application manifest descriptor.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Soromaps — Guia Colaborativo de Sorocaba",
    short_name: "Soromaps",
    description: "Descubra, avalie e compartilhe experiências autênticas em Sorocaba.",
    start_url: "/home",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#3A04FF",
    lang: "pt-BR",
    icons: [
      {
        src: "/logo/logoipsum-emblem.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
    ],
  };
}
