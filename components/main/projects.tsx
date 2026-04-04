import { getTranslations } from "next-intl/server";
import { ProjectsCarousel } from "@/components/sub/projects-carousel";
import { getPublicProjects } from "@/lib/public-data";

export const Projects = async () => {
  const projects = await getPublicProjects();
  const t = await getTranslations("projects");

  return (
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
  );
};
