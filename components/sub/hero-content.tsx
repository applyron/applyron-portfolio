"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Image from "next/image";

import {
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
} from "@/lib/motion";
import type { AboutData } from "@/lib/data";

type Props = { about: AboutData; locale: "en" | "tr" };

export const HeroContent = ({ about, locale }: Props) => {
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
      className="flex flex-row items-center justify-center px-20 mt-40 w-full z-[20]"
    >
      <div className="h-full w-full flex flex-col gap-5 justify-center m-auto text-start">
        <motion.div
          variants={slideInFromTop}
          className="Welcome-box py-[8px] px-[7px] border border-[#7042f88b] opacity-[0.9]]"
        >
          <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
          <h1 className="Welcome-text text-[13px]">{badge}</h1>
        </motion.div>

        <motion.div
          variants={slideInFromLeft(0.5)}
          className="flex flex-col gap-6 mt-6 text-6xl text-bold text-white max-w-[600px] w-auto h-auto"
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
        </motion.div>

        <motion.p
          variants={slideInFromLeft(0.8)}
          className="text-lg text-gray-400 my-5 max-w-[600px]"
        >
          {description}
        </motion.p>

        <motion.a
          href={about.ctaLink}
          variants={slideInFromLeft(1)}
          className="py-2 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px]"
        >
          {ctaText}
        </motion.a>
      </div>

      <motion.div
        variants={slideInFromRight(0.8)}
        className="w-full h-full flex justify-center items-center"
      >
        <div className="relative aspect-square w-full max-w-[650px]">
          <Image
            src={about.heroImage}
            alt="work icons"
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
