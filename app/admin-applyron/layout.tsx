import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { getAdminRequestLocale, getAdminRequestMessages } from "@/lib/admin-i18n-server";
import { AdminI18nProvider } from "./components/AdminI18nProvider";

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
    <AdminI18nProvider initialLocale={locale}>
      {children}
    </AdminI18nProvider>
  );
}
