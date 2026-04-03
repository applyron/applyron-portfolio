import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/data";
import { getAbsolutePublicUrl, getLocalizedPath } from "@/lib/seo";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!getAbsolutePublicUrl("/")) {
    return [];
  }

  const projects = await getProjects();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: getAbsolutePublicUrl(getLocalizedPath(locale))!,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: getAbsolutePublicUrl(getLocalizedPath("en"))!,
          tr: getAbsolutePublicUrl(getLocalizedPath("tr"))!,
        },
      },
    });

    for (const project of projects) {
      const localizedPath = getLocalizedPath(locale, `/projects/${project.slug}`);

      entries.push({
        url: getAbsolutePublicUrl(localizedPath)!,
        lastModified: new Date(),
        alternates: {
          languages: {
            en: getAbsolutePublicUrl(
              getLocalizedPath("en", `/projects/${project.slug}`),
            )!,
            tr: getAbsolutePublicUrl(
              getLocalizedPath("tr", `/projects/${project.slug}`),
            )!,
          },
        },
      });
    }
  }

  return entries;
}
