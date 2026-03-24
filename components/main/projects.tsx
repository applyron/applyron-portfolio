import { getTranslations } from "next-intl/server";
import { getProjects } from "@/lib/data";
import { ProjectsCarousel } from "@/components/sub/projects-carousel";

export const Projects = async () => {
  const projects = getProjects();
  const t = await getTranslations("projects");

  return (
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
  );
};
