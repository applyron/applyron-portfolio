import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { HomeStars } from "@/components/main/home-stars";
import { ContactForm } from "@/components/sub/contact-form";
import { getIcon } from "@/lib/icons";
import {
  getPublicLinks,
  getPublicSiteData,
  getPublicSocials,
} from "@/lib/public-data";
import { buildPublicMetadata, normalizePublicLocale } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizePublicLocale(rawLocale);
  const [site, t] = await Promise.all([
    getPublicSiteData(),
    getTranslations({ locale, namespace: "contactPage" }),
  ]);

  return buildPublicMetadata({
    locale,
    pathname: "/contact",
    title: t("metaTitle"),
    description: t("metaDescription"),
    siteName: site.name,
    imagePath: `/${locale}/social-image`,
    twitterImagePath: `/${locale}/social-image`,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = normalizePublicLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "contactPage" });
  const [socials, links] = await Promise.all([
    getPublicSocials(),
    getPublicLinks(),
  ]);

  const channels = [
    ...socials.navbar.map((item) => ({
      id: `social-${item.id}`,
      name: item.name,
      href: item.link,
      icon: item.icon,
    })),
    ...links.map((item) => ({
      id: `link-${item.id}`,
      name: item.name,
      href: item.url,
      icon: item.icon,
    })),
  ];

  return (
    <>
      <HomeStars />
      <main className="relative overflow-hidden">
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <ContactForm />

            <aside className="rounded-[28px] border border-white/10 bg-[rgba(6,10,24,0.72)] p-6 shadow-[0_18px_60px_rgba(4,10,24,0.28)] backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-white">
                {t("panelTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-300/85">
                {t("panelDescription")}
              </p>

              <p className="mt-5 rounded-2xl border border-white/10 bg-[rgba(4,8,20,0.78)] px-4 py-4 text-sm leading-7 text-gray-300/85">
                {t("responseNote")}
              </p>

              <div className="mt-6 space-y-3">
                {channels.map((channel) => {
                  const Icon = getIcon(channel.icon);
                  return (
                    <Link
                      key={channel.id}
                      href={channel.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(4,8,20,0.78)] px-4 py-3 text-gray-100 transition hover:border-cyan-400/40 hover:bg-white/5"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200">
                        {Icon ? (
                          <Icon className="h-5 w-5" />
                        ) : (
                          <span>{channel.name.charAt(0)}</span>
                        )}
                      </span>
                      <span className="text-sm font-medium">{channel.name}</span>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
