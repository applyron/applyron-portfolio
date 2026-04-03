import { getLocale, getTranslations } from "next-intl/server";

import { BrandedNotFound } from "@/components/sub/branded-not-found";
import { resolveLocalizedHref } from "@/lib/public-links";

export default async function ProjectNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFoundPage" });

  return (
    <BrandedNotFound
      title={t("projectTitle")}
      description={t("projectDescription")}
      primaryHref={`/${locale}#projects`}
      primaryLabel={t("primaryCta")}
      secondaryHref={resolveLocalizedHref(locale, "/contact")}
      secondaryLabel={t("secondaryCta")}
    />
  );
}
