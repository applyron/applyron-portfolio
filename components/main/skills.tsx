import { getTranslations } from "next-intl/server";
import { SkillDataProvider } from "@/components/sub/skill-data-provider";
import { SkillText } from "@/components/sub/skill-text";
import { AmbientVideo } from "@/components/sub/ambient-video";
import { getPublicSkills } from "@/lib/public-data";

export const Skills = async () => {
  const t = await getTranslations("skills.categories");
  const skills = await getPublicSkills();
  const groups = [
    { id: "core", label: t("core"), items: skills.core },
    { id: "frontend", label: t("frontend"), items: skills.frontend },
    { id: "backend", label: t("backend"), items: skills.backend },
    { id: "fullstack", label: t("fullstack"), items: skills.fullstack },
    { id: "other", label: t("other"), items: skills.other },
  ] as const;

  return (
    <section
      id="skills"
      className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="flex w-full max-w-6xl flex-col items-center gap-4">
        <SkillText />

        <div className="mt-4 flex w-full flex-col gap-8">
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col items-center gap-4">
              <div className="flex w-full items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/35 to-transparent" />
                <h3 className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/85 sm:text-base">
                  {group.label}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/35 to-transparent" />
              </div>

              <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-5">
                {group.items.map((skill, index) => (
                  <SkillDataProvider
                    key={`${group.id}-${skill.id}`}
                    src={skill.image}
                    name={skill.name}
                    width={skill.width}
                    height={skill.height}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-full absolute">
        <div
          aria-hidden
          className="absolute inset-0 z-[-11] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_55%),linear-gradient(180deg,rgba(3,0,20,0.3),rgba(3,0,20,0.9))]"
        />
        <div className="absolute inset-0 z-[-10] flex items-center justify-center overflow-hidden opacity-30">
          <AmbientVideo
            src="/videos/skills-bg.webm"
            type="video/webm"
            sources={[
              { src: "/videos/skills-bg.webm", type: "video/webm" },
              { src: "/videos/skills-bg.mp4", type: "video/mp4" },
            ]}
            allowOnCoarsePointer
            className="absolute left-1/2 top-1/2 h-full min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
            wrapperClassName="relative h-full w-full"
          />
        </div>
      </div>
    </section>
  );
};
