"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
} from "@/lib/motion";

export const SkillText = () => {
  const t = useTranslations("skills");

  return (
    <div className="flex h-auto w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        variants={slideInFromTop}
        className="Welcome-box border border-[#7042f88b] px-[7px] py-[8px] opacity-[0.9]"
      >
        <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
        <p className="Welcome-text text-[13px]">{t("badge")}</p>
      </motion.div>

      <motion.h2
        variants={slideInFromLeft(0.5)}
        className="mb-[15px] mt-[10px] text-2xl font-medium text-white sm:text-[30px]"
      >
        {t("heading")}
      </motion.h2>

      <motion.p
        variants={slideInFromRight(0.5)}
        className="cursive mb-8 mt-[10px] max-w-2xl text-base text-gray-200 sm:mb-10 sm:text-[20px]"
      >
        {t("subheading")}
      </motion.p>
    </div>
  );
};
