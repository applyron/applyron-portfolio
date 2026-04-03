import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { Encryption } from "@/components/main/encryption";
import { Hero } from "@/components/main/hero";
import { HomeStars } from "@/components/main/home-stars";
import { Skills } from "@/components/main/skills";
import { ProjectsCarousel } from "@/components/sub/projects-carousel";
import {
  getPublicAbout,
  getPublicProjects,
  getPublicSiteData,
} from "@/lib/public-data";
import { buildPublicMetadata, normalizePublicLocale } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizePublicLocale(rawLocale);
  const [site, about] = await Promise.all([
    getPublicSiteData(),
    getPublicAbout(),
  ]);
  const description =
    about.description[locale] || about.description.en || site.description;

  return buildPublicMetadata({
    locale,
    title: site.title,
    description,
    siteName: site.name,
    imagePath: `/${locale}/social-image`,
    twitterImagePath: `/${locale}/social-image`,
  });
}

export default async function Home({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = normalizePublicLocale(rawLocale);
  const projects = await getPublicProjects();
  const t = await getTranslations({ locale, namespace: "projects" });

  return (
    <>
      <HomeStars />
      <main className="w-full">
        <div className="flex flex-col gap-16 sm:gap-20">
          <Hero locale={locale} />
          <Skills />
          <Encryption />
          <section
            id="projects"
            className="flex flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-20"
          >
            <h2 className="py-12 text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 sm:py-20 sm:text-[40px]">
              {t("heading")}
            </h2>
            <div className="h-full w-full max-w-6xl px-0 sm:px-2 lg:px-4">
              <ProjectsCarousel projects={projects} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
