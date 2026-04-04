"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProjectCard } from "@/components/sub/project-card";
import type { Project } from "@/lib/data";

type Props = {
  projects: Project[];
};

const getCardsPerPage = (width: number) => {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
};

export const ProjectsCarousel = ({ projects }: Props) => {
  const t = useTranslations("projects");
  const locale = useLocale() as "en" | "tr";
  const [startIndex, setStartIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(1);
  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);
  const mobileCardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const updateCardsPerPage = () => {
      setCardsPerPage(getCardsPerPage(window.innerWidth));
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  useEffect(() => {
    if (cardsPerPage !== 1) {
      return;
    }

    const scroller = mobileScrollerRef.current;
    if (!scroller) {
      return;
    }

    const updateMobileIndex = () => {
      let nextIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      mobileCardRefs.current.forEach((card, index) => {
        if (!card) return;

        const distance = Math.abs(card.offsetLeft - scroller.scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          nextIndex = index;
        }
      });

      setMobileIndex(nextIndex);
    };

    updateMobileIndex();
    scroller.addEventListener("scroll", updateMobileIndex, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", updateMobileIndex);
    };
  }, [cardsPerPage, projects.length]);

  const useCarousel = projects.length > cardsPerPage;
  const maxStartIndex = Math.max(0, projects.length - cardsPerPage);
  const effectiveStartIndex = Math.min(startIndex, maxStartIndex);
  const isMobile = cardsPerPage === 1;

  const visible = useCarousel
    ? projects.slice(effectiveStartIndex, effectiveStartIndex + cardsPerPage)
    : projects;

  const canPrev = effectiveStartIndex > 0;
  const canNext = effectiveStartIndex + cardsPerPage < projects.length;
  const pageCount = Math.max(1, projects.length - cardsPerPage + 1);

  const prev = () => setStartIndex(Math.max(0, effectiveStartIndex - 1));
  const next = () => setStartIndex(Math.min(maxStartIndex, effectiveStartIndex + 1));
  const scrollToMobileProject = (index: number) => {
    mobileCardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div
      className="flex w-full flex-col items-center gap-6"
      role="region"
      aria-label={t("carouselRegion")}
      tabIndex={!isMobile && useCarousel ? 0 : -1}
      onKeyDown={(event) => {
        if (isMobile || !useCarousel) {
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          prev();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }
      }}
    >
      <div className="w-full sm:hidden">
        <div
          ref={mobileScrollerRef}
          className="scrollbar-hidden -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
        >
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={(element) => {
                mobileCardRefs.current[index] = element;
              }}
              className="basis-[88%] shrink-0 snap-center"
            >
              <ProjectCard
                src={project.image}
                title={project.title[locale] || project.title.en}
                description={project.description[locale] || project.description.en}
                slug={project.slug}
                locale={locale}
                ctaLabel={t("viewDetails")}
              />
            </div>
          ))}
        </div>

        {projects.length > 1 && (
          <>
            <p className="mt-3 text-center text-xs uppercase tracking-[0.28em] text-gray-500">
              {t("swipeHint")}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => scrollToMobileProject(index)}
                  aria-label={t("goToPosition", { position: index + 1 })}
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <span
                    className={`rounded-full transition-all duration-200 ${
                      index === mobileIndex
                        ? "h-2.5 w-4 bg-purple-500"
                        : "h-2.5 w-2.5 bg-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hidden w-full sm:block">
        {useCarousel && (
          <div className="mb-6 flex w-full items-center justify-between gap-3 sm:justify-end">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              aria-label={t("previousProjects")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(112,66,248,0.5)] bg-[rgba(3,0,20,0.5)] text-white transition disabled:cursor-not-allowed disabled:opacity-30 hover:enabled:border-purple-500 hover:enabled:bg-purple-600/30"
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

            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label={t("nextProjects")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(112,66,248,0.5)] bg-[rgba(3,0,20,0.5)] text-white transition disabled:cursor-not-allowed disabled:opacity-30 hover:enabled:border-purple-500 hover:enabled:bg-purple-600/30"
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
          </div>
        )}

        <div className="grid w-full grid-cols-2 gap-6 lg:grid-cols-3 xl:gap-8">
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
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStartIndex(i)}
                aria-label={t("goToPosition", { position: i + 1 })}
                className="flex h-11 w-11 items-center justify-center rounded-full"
              >
                <span
                  className={`rounded-full transition-all duration-200 ${
                    i === effectiveStartIndex
                      ? "h-2.5 w-4 bg-purple-500"
                      : "h-2.5 w-2.5 bg-gray-600 hover:bg-gray-400"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
