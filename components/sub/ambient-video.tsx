"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

type AmbientVideoProps = {
  src: string;
  type: string;
  className: string;
  wrapperClassName?: string;
  eager?: boolean;
  allowOnCoarsePointer?: boolean;
  fallback?: ReactNode;
  sources?: Array<{
    src: string;
    type: string;
  }>;
};

function resolveAmbientVideoSource(src: string) {
  if (src.startsWith("/videos/")) {
    return `/media${src}`;
  }

  return src;
}

function resolveSources(
  src: string,
  type: string,
  sources?: Array<{ src: string; type: string }>,
  preferMp4 = false,
) {
  const sourceList = sources && sources.length > 0 ? sources : [{ src, type }];
  const resolved = sourceList.map((source) => ({
    ...source,
    src: resolveAmbientVideoSource(source.src),
  }));

  if (!preferMp4) {
    return resolved;
  }

  return [...resolved].sort((left, right) => {
    const leftScore = left.type === "video/mp4" ? 0 : 1;
    const rightScore = right.type === "video/mp4" ? 0 : 1;
    return leftScore - rightScore;
  });
}

function subscribe(
  mediaQuery: MediaQueryList,
  listener: () => void,
): () => void {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
}

export function AmbientVideo({
  src,
  type,
  className,
  wrapperClassName,
  eager = false,
  allowOnCoarsePointer = false,
  fallback = null,
  sources,
}: AmbientVideoProps) {
  const preferMp4 =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });
  const [motionAllowed, setMotionAllowed] = useState(false);
  const resolvedSources = resolveSources(src, type, sources, preferMp4);
  const [playbackSupported] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }

    const probe = document.createElement("video");
    return resolvedSources.some((source) => {
      const supportState = probe.canPlayType(source.type);
      return supportState === "probably" || supportState === "maybe";
    });
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const updateMotionPreference = () => {
      setMotionAllowed(
        !reducedMotion.matches &&
          (allowOnCoarsePointer || !coarsePointer.matches),
      );
    };

    updateMotionPreference();

    const unsubscribeReducedMotion = subscribe(
      reducedMotion,
      updateMotionPreference,
    );
    const unsubscribeCoarsePointer = subscribe(
      coarsePointer,
      updateMotionPreference,
    );

    return () => {
      unsubscribeReducedMotion();
      unsubscribeCoarsePointer();
    };
  }, [allowOnCoarsePointer]);

  const shouldRenderVideo =
    playbackSupported && motionAllowed && (eager || inView);

  return (
    <div ref={ref} className={wrapperClassName}>
      {shouldRenderVideo ? (
        <video
          loop
          muted
          autoPlay
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noplaybackrate noremoteplayback"
          preload={eager ? "metadata" : "none"}
          className={className}
        >
          {resolvedSources.map((source) => (
            <source key={`${source.type}-${source.src}`} src={source.src} type={source.type} />
          ))}
        </video>
      ) : (
        fallback
      )}
    </div>
  );
}
