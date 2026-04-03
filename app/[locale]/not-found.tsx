import { getLocale, getTranslations } from "next-intl/server";

import { BrandedNotFound } from "@/components/sub/branded-not-found";
import { resolveLocalizedHref } from "@/lib/public-links";

export default async function LocalizedNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFoundPage" });

  return (
    <BrandedNotFound
      title={t("title")}
      description={t("description")}
      primaryHref={resolveLocalizedHref(locale, "/")}
      primaryLabel={t("primaryCta")}
      secondaryHref={resolveLocalizedHref(locale, "/contact")}
      secondaryLabel={t("secondaryCta")}
    />
  );
}
