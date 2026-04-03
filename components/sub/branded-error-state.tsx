"use client";

import Link from "next/link";

type BrandedErrorStateProps = {
  title: string;
  description: string;
  retryLabel: string;
  homeHref: string;
  homeLabel: string;
  contactHref: string;
  contactLabel: string;
  onRetry: () => void;
};

export function BrandedErrorState({
  title,
  description,
  retryLabel,
  homeHref,
  homeLabel,
  contactHref,
  contactLabel,
  onRetry,
}: BrandedErrorStateProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-28 text-center sm:px-6 sm:pt-32">
      <div className="max-w-2xl rounded-[32px] border border-white/10 bg-[#0a0020]/80 px-6 py-10 shadow-[0_20px_100px_rgba(14,6,61,0.35)] backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
          Error
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-300 sm:text-lg">
          {description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-purple-500 hover:to-cyan-500"
          >
            {retryLabel}
          </button>
          <Link
            href={homeHref}
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-purple-400/60 hover:bg-purple-500/10"
          >
            {homeLabel}
          </Link>
          <Link
            href={contactHref}
            className="inline-flex items-center justify-center rounded-full border border-cyan-400/20 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/10"
          >
            {contactLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
