import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";

export default async function ProjectNotFound() {
  const t = await getTranslations("projects");
  const locale = await getLocale();
  return (
    <main className="min-h-screen pt-[65px] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 mb-4">
        404
      </h1>
      <p className="text-xl text-gray-300 mb-8">{t("notFound")}</p>
      <Link
        href={`/${locale}#projects`}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[rgba(112,66,248,0.5)] bg-[rgba(112,66,248,0.1)] text-white hover:bg-purple-600/30 transition-all duration-200"
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
        {t("backToHome")}
      </Link>
    </main>
  );
}
