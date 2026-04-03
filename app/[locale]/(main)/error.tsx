"use client";

import { useLocale, useTranslations } from "next-intl";

import { BrandedErrorState } from "@/components/sub/branded-error-state";
import { resolveLocalizedHref } from "@/lib/public-links";

export default function MainSegmentError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("errorPage");

  return (
    <BrandedErrorState
      title={t("title")}
      description={t("description")}
      retryLabel={t("retry")}
      homeHref={resolveLocalizedHref(locale, "/")}
      homeLabel={t("home")}
      contactHref={resolveLocalizedHref(locale, "/contact")}
      contactLabel={t("contact")}
      onRetry={reset}
    />
  );
}
