import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";
import { getAdminRequestLocale, getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { cn } from "@/lib/utils";
import { AdminI18nProvider } from "./components/AdminI18nProvider";

import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#030014",
};

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getAdminRequestMessages();

  return {
    title: messages.meta.title,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children }: PropsWithChildren) {
  const locale = await getAdminRequestLocale();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body
        className={cn(
          "bg-[#030014] overflow-y-scroll overflow-x-hidden",
          inter.className,
        )}
      >
        <AdminI18nProvider initialLocale={locale}>
          {children}
        </AdminI18nProvider>
      </body>
    </html>
  );
}
