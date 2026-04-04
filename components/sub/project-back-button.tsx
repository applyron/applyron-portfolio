"use client";

import { useRouter } from "next/navigation";

type ProjectBackButtonProps = {
  fallbackHref: string;
  label: string;
};

export function ProjectBackButton({
  fallbackHref,
  label,
}: ProjectBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window === "undefined") {
      router.push(fallbackHref);
      return;
    }

    if (window.history.length > 1 && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.origin === window.location.origin) {
          router.back();
          return;
        }
      } catch {
      }
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-purple-400"
    >
      <svg
        className="w-4 h-4"
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
      {label}
    </button>
  );
}
