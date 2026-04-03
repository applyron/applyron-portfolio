import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

import { routing } from "@/i18n/routing";
import { normalizePublicLocale } from "@/lib/seo";
import { cn } from "@/lib/utils";

import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

type Props = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export const viewport: Viewport = {
  themeColor: "#030014",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: rawLocale } = await params;

  if (!routing.locales.includes(rawLocale as "en" | "tr")) {
    notFound();
  }

  const locale = normalizePublicLocale(rawLocale);

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body
        className={cn(
          "bg-[#030014] overflow-y-scroll overflow-x-hidden",
          inter.className,
        )}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
