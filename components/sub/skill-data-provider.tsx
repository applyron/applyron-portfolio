"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

type SkillDataProviderProps = {
  src: string;
  name: string;
  width: number;
  height: number;
  index: number;
};

export const SkillDataProvider = ({
  src,
  name,
  width,
  height,
  index,
}: SkillDataProviderProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  const imageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const animationDelay = 0.1;
  const responsiveWidth = `clamp(${Math.max(40, Math.round(width * 0.5))}px, 14vw, ${width}px)`;
  const responsiveHeight = `clamp(${Math.max(40, Math.round(height * 0.5))}px, 14vw, ${height}px)`;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      variants={imageVariants}
      animate={inView ? "visible" : "hidden"}
      custom={index}
      transition={{ delay: index * animationDelay }}
    >
      <div
        className="relative shrink-0"
        style={{ width: responsiveWidth, height: responsiveHeight }}
      >
        <Image
          src={`/skills/${src}`}
          alt={name}
          fill
          sizes="(min-width: 1024px) 96px, (min-width: 640px) 72px, 56px"
          className="object-contain"
          draggable={false}
        />
      </div>
    </motion.div>
  );
};
