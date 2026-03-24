import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";

import { getSiteData } from "@/lib/data";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#030014",
};

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteData();
  const publicUrl = process.env.APP_PUBLIC_URL?.trim();

  return {
    ...(publicUrl ? { metadataBase: new URL(publicUrl) } : {}),
    title: site.title,
    description: site.description,
  };
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang={routing.defaultLocale} data-scroll-behavior="smooth">
      <body
        className={cn(
          "bg-[#030014] overflow-y-scroll overflow-x-hidden",
          inter.className
        )}
      >
        {children}
      </body>
    </html>
  );
}
