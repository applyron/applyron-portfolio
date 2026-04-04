import type { MetadataRoute } from "next";

import { getSiteData } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteData();

  return {
    name: site.title,
    short_name: site.name,
    description: site.description,
    start_url: "/en",
    display: "standalone",
    background_color: "#030014",
    theme_color: "#030014",
    icons: [
      {
        src: "/icon1.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon2.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
