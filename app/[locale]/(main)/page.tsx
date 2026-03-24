import { getTranslations } from "next-intl/server";

import { getProjects } from "@/lib/data";
import { Encryption } from "@/components/main/encryption";
import { Hero } from "@/components/main/hero";
import { HomeStars } from "@/components/main/home-stars";
import { Skills } from "@/components/main/skills";
import { ProjectsCarousel } from "@/components/sub/projects-carousel";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function Home({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "tr" ? "tr" : "en";
  const projects = getProjects();
  const t = await getTranslations({ locale, namespace: "projects" });

  return (
    <>
      <HomeStars />
      <main className="h-full w-full">
        <div className="flex flex-col gap-20">
          <Hero locale={locale} />
          <Skills />
          <Encryption />
          <section
            id="projects"
            className="flex flex-col items-center justify-center py-20"
          >
            <h1 className="text-[40px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-20">
              {t("heading")}
            </h1>
            <div className="h-full w-full px-10">
              <ProjectsCarousel projects={projects} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
