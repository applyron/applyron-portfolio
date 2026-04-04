import { routing } from "@/i18n/routing";
import { normalizePublicLocale } from "@/lib/seo";

const EXTERNAL_PROTOCOL_PATTERN = /^(https?:\/\/|mailto:|tel:)/i;

export function isExternalHref(href: string): boolean {
  return EXTERNAL_PROTOCOL_PATTERN.test(href.trim());
}

function hasLocalePrefix(href: string): boolean {
  return routing.locales.some(
    (locale) => href === `/${locale}` || href.startsWith(`/${locale}/`),
  );
}

export function resolveLocalizedHref(
  locale: string,
  href: string,
): string {
  const normalizedLocale = normalizePublicLocale(locale);
  const trimmed = href.trim();

  if (!trimmed) {
    return `/${normalizedLocale}`;
  }

  if (
    trimmed.startsWith("#") ||
    isExternalHref(trimmed) ||
    hasLocalePrefix(trimmed)
  ) {
    return trimmed;
  }

  if (trimmed === "/") {
    return `/${normalizedLocale}`;
  }

  if (trimmed.startsWith("/")) {
    return `/${normalizedLocale}${trimmed}`;
  }

  return trimmed;
}
