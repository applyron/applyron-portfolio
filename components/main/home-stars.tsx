"use client";

import dynamic from "next/dynamic";

const StarsCanvas = dynamic(
  () =>
    import("@/components/main/star-background").then(
      (module) => module.StarsCanvas,
    ),
  { ssr: false },
);

export function HomeStars() {
  return <StarsCanvas />;
}
