import type { MetadataRoute } from "next";

import { getAbsolutePublicUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin-applyron"],
      },
    ],
    ...(getAbsolutePublicUrl("/sitemap.xml")
      ? { sitemap: getAbsolutePublicUrl("/sitemap.xml") ?? undefined }
      : {}),
    ...(getAbsolutePublicUrl("/")
      ? { host: getAbsolutePublicUrl("/")?.replace(/\/$/, "") }
      : {}),
  };
}
