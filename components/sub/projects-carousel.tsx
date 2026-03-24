"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProjectCard } from "@/components/sub/project-card";
import type { Project } from "@/lib/data";

const CARDS_PER_PAGE = 3;

type Props = {
  projects: Project[];
};

export const ProjectsCarousel = ({ projects }: Props) => {
  const t = useTranslations("projects");
  const locale = useLocale() as "en" | "tr";
  const [startIndex, setStartIndex] = useState(0);
  const useCarousel = projects.length > CARDS_PER_PAGE;

  const visible = useCarousel
    ? projects.slice(startIndex, startIndex + CARDS_PER_PAGE)
    : projects;

  const canPrev = startIndex > 0;
  const canNext = startIndex + CARDS_PER_PAGE < projects.length;

  const prev = () => setStartIndex((i) => Math.max(0, i - 1));
  const next = () =>
    setStartIndex((i) => Math.min(projects.length - CARDS_PER_PAGE, i + 1));

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="relative w-full flex items-center gap-4">
        {useCarousel && (
          <button
            onClick={prev}
            disabled={!canPrev}
            aria-label={t("previousProjects")}
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-[rgba(112,66,248,0.5)] bg-[rgba(3,0,20,0.5)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-purple-600/30 hover:enabled:border-purple-500 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-10">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              src={project.image}
              title={project.title[locale] || project.title.en}
              description={project.description[locale] || project.description.en}
              slug={project.slug}
              locale={locale}
              ctaLabel={t("viewDetails")}
            />
          ))}
        </div>

        {useCarousel && (
          <button
            onClick={next}
            disabled={!canNext}
            aria-label={t("nextProjects")}
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-[rgba(112,66,248,0.5)] bg-[rgba(3,0,20,0.5)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-purple-600/30 hover:enabled:border-purple-500 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {useCarousel && (
        <div className="flex items-center gap-2">
          {Array.from({ length: projects.length - CARDS_PER_PAGE + 1 }).map(
            (_, i) => (
              <button
                key={i}
                onClick={() => setStartIndex(i)}
                aria-label={t("goToPosition", { position: i + 1 })}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === startIndex
                    ? "bg-purple-500 w-4"
                    : "bg-gray-600 hover:bg-gray-400"
                }`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};
