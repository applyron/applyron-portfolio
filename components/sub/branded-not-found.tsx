import Link from "next/link";

type BrandedNotFoundProps = {
  code?: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function BrandedNotFound({
  code = "404",
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: BrandedNotFoundProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-28 text-center sm:px-6 sm:pt-32">
      <div className="max-w-2xl rounded-[32px] border border-white/10 bg-[#0a0020]/80 px-6 py-10 shadow-[0_20px_100px_rgba(14,6,61,0.35)] backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
          {code}
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-300 sm:text-lg">
          {description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-purple-500 hover:to-cyan-500"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-purple-400/60 hover:bg-purple-500/10"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
