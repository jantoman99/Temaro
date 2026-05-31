import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Temaro",
    short_name: "Temaro",
    description: "Rezervační systém pro služby, klienty a provoz.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#F7F4EF",
    theme_color: "#4F46E5",
    categories: ["business", "productivity"],
    lang: "cs",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/brand/temaro-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
