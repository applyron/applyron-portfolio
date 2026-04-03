import type { Metadata } from "next";

import { routing } from "@/i18n/routing";

export type PublicLocale = (typeof routing.locales)[number];

const OPEN_GRAPH_LOCALE: Record<PublicLocale, string> = {
  en: "en_US",
  tr: "tr_TR",
};

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizePathname(pathname = ""): string {
  if (!pathname || pathname === "/") {
    return "";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function normalizePublicLocale(locale: string | undefined): PublicLocale {
  return locale === "tr" ? "tr" : "en";
}

export function getPublicBaseUrl(): URL | null {
  const raw = process.env.APP_PUBLIC_URL?.trim();
  if (!raw) {
    return null;
  }

  try {
    return new URL(`${trimTrailingSlash(raw)}/`);
  } catch {
    return null;
  }
}

export function getLocalizedPath(
  locale: PublicLocale,
  pathname = "",
): string {
  return `/${locale}${normalizePathname(pathname)}`;
}

export function getAbsolutePublicUrl(pathname: string): string | null {
  const base = getPublicBaseUrl();
  if (!base) {
    return null;
  }

  return new URL(pathname, base).toString();
}

type BuildPublicMetadataInput = {
  locale: PublicLocale;
  title: string;
  description: string;
  pathname?: string;
  siteName?: string;
  imagePath?: string;
  twitterImagePath?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

export function buildPublicMetadata({
  locale,
  title,
  description,
  pathname = "",
  siteName,
  imagePath,
  twitterImagePath,
  imageAlt,
  type = "website",
}: BuildPublicMetadataInput): Metadata {
  const metadataBase = getPublicBaseUrl();
  const localizedPath = getLocalizedPath(locale, pathname);
  const alternates = metadataBase
    ? {
        canonical: localizedPath,
        languages: {
          en: getLocalizedPath("en", pathname),
          tr: getLocalizedPath("tr", pathname),
          "x-default": getLocalizedPath(routing.defaultLocale, pathname),
        },
      }
    : undefined;

  const effectiveTwitterImagePath = twitterImagePath ?? imagePath;
  const openGraphImages = metadataBase && imagePath
    ? [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ]
    : undefined;
  const twitterImages =
    metadataBase && effectiveTwitterImagePath
      ? [effectiveTwitterImagePath]
      : undefined;

  return {
    ...(metadataBase ? { metadataBase } : {}),
    title,
    description,
    alternates,
    openGraph: {
      type,
      title,
      description,
      siteName,
      locale: OPEN_GRAPH_LOCALE[locale],
      ...(metadataBase ? { url: localizedPath } : {}),
      ...(openGraphImages ? { images: openGraphImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
  };
}
