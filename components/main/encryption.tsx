"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { slideInFromTop } from "@/lib/motion";

export const Encryption = () => {
  const t = useTranslations("encryption");

  return (
    <div className="flex flex-row relative items-center justify-center min-h-screen w-full h-full -z-20">
      <div className="absolute w-auto h-auto top-0 z-[5]">
        <motion.div
          variants={slideInFromTop}
          className="text-[40px] font-medium text-center text-gray-200"
        >
          {t("headingBefore")}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
            {" & "}
          </span>
          {t("headingAfter")}
        </motion.div>
      </div>

      <div className="flex flex-col items-center justify-center translate-y-[-50px] absolute z-[20] w-auto h-auto">
        <div className="flex flex-col items-center group cursor-pointer w-auto h-auto">
          <div className="relative h-[50px] w-[50px] translate-y-5 transition-all duration-200 group-hover:translate-y-11">
            <Image
              src="/lock-top.png"
              alt="Lock top"
              fill
              sizes="50px"
              className="object-contain"
            />
          </div>
          <div className="relative h-[70px] w-[70px] z-10">
            <Image
              src="/lock-main.png"
              alt="Lock main"
              fill
              sizes="70px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="Welcome-box px-[15px] py-[4px] z-[20] border my-[20px] border-[#7042F88B] opacity-[0.9]">
          <h1 className="Welcome-text text-[12px]">{t("badge")}</h1>
        </div>
      </div>

      <div className="absolute z-[20] bottom-[10px] px-[5px]">
        <div className="cursive text-[20px] font-medium text-center text-gray-300">
          {t("description")}
        </div>
      </div>

      <div className="w-full flex items-start justify-center absolute">
        <video
          loop
          muted
          autoPlay
          playsInline
          preload="none"
          className="w-full h-auto"
        >
          <source src="/videos/encryption-bg.webm" type="video/webm" />
        </video>
      </div>
    </div>
  );
};
