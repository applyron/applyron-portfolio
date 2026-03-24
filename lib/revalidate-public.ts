import { revalidatePath } from "next/cache";

import { routing } from "@/i18n/routing";
import type { Project } from "@/lib/data";

export function revalidatePublicLayout(): void {
  revalidatePath("/", "layout");

  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
  }
}

export function revalidateHomePages(): void {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "page");
  }
}

export function revalidateProjectPages(
  projects: Pick<Project, "slug">[],
): void {
  const slugs = new Set(
    projects
      .map((project) => project.slug.trim())
      .filter((slug) => slug.length > 0),
  );
  const uniqueSlugs = Array.from(slugs);

  for (const locale of routing.locales) {
    for (const slug of uniqueSlugs) {
      revalidatePath(`/${locale}/projects/${slug}`, "page");
    }
  }
}
