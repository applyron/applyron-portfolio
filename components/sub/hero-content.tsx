"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
} from "@/lib/motion";
import { resolveLocalizedHref } from "@/lib/public-links";
import type { AboutData } from "@/lib/data";

type Props = { about: AboutData; locale: "en" | "tr" };

export const HeroContent = ({ about, locale }: Props) => {
  const t = useTranslations("hero");
  const badge = about.badge[locale] || about.badge.en;
  const heroTitle = about.heroTitle[locale] || about.heroTitle.en;
  const heroHighlight = (about.heroHighlight[locale] || about.heroHighlight.en)?.trim() ?? "";
  const description = about.description[locale] || about.description.en;
  const ctaText = about.ctaText[locale] || about.ctaText.en;

  const hasHighlight = heroHighlight.length > 0 && heroTitle.includes(heroHighlight);
  const parts = hasHighlight ? heroTitle.split(heroHighlight) : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="z-[20] mx-auto flex min-h-[calc(100svh-5.5rem)] w-full max-w-7xl flex-col justify-center gap-10 px-4 pb-12 pt-28 sm:min-h-[calc(100svh-6rem)] sm:px-6 sm:pb-16 sm:pt-32 lg:min-h-[calc(100svh-7rem)] lg:px-10 xl:min-h-[calc(100svh-8rem)] xl:flex-row xl:items-center xl:justify-between xl:gap-12 xl:pt-36"
    >
      <div className="flex h-full w-full max-w-2xl flex-col gap-5 rounded-[28px] border border-white/10 bg-[#030014]/60 px-5 py-6 text-center shadow-[0_20px_80px_rgba(3,0,20,0.35)] backdrop-blur-sm sm:px-8 sm:py-8 xl:mx-0 xl:border-transparent xl:bg-transparent xl:px-0 xl:py-0 xl:text-left xl:shadow-none xl:backdrop-blur-0">
        <motion.div
          variants={slideInFromTop}
          className="Welcome-box self-center border border-[#7042f88b] px-[7px] py-[8px] opacity-[0.9] xl:self-start"
        >
          <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
          <p className="Welcome-text text-[13px]">{badge}</p>
        </motion.div>

        <motion.h1
          variants={slideInFromLeft(0.5)}
          className="mt-4 flex flex-col gap-4 text-4xl font-bold leading-tight text-white sm:mt-6 sm:text-5xl lg:text-6xl"
        >
          <span>
            {parts ? (
              <>
                {parts[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
                  {heroHighlight}
                </span>
                {parts[1]}
              </>
            ) : (
              heroTitle
            )}
          </span>
        </motion.h1>

        <motion.p
          variants={slideInFromLeft(0.8)}
          className="my-3 max-w-2xl text-base leading-7 text-gray-200/85 sm:my-5 sm:text-lg"
        >
          {description}
        </motion.p>

        <motion.a
          href={resolveLocalizedHref(locale, about.ctaLink)}
          variants={slideInFromLeft(1)}
          className="button-primary w-full max-w-[220px] self-center rounded-lg py-3 text-center text-white xl:self-start"
        >
          {ctaText}
        </motion.a>
      </div>

      <motion.div
        variants={slideInFromRight(0.8)}
        className="flex w-full justify-center xl:justify-end"
      >
        <div className="relative aspect-square w-full max-w-[260px] sm:max-w-[340px] md:max-w-[420px] xl:max-w-[650px]">
          <Image
            src={about.heroImage}
            alt={t("imageAlt")}
            fill
            loading="eager"
            sizes="(min-width: 1280px) 650px, (min-width: 768px) 45vw, 80vw"
            draggable={false}
            className="select-none object-contain"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
