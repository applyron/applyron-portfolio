import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ProjectBackButton } from "@/components/sub/project-back-button";
import { getPublicProjects } from "@/lib/public-data";
import { buildPublicMetadata, normalizePublicLocale } from "@/lib/seo";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-static";

export async function generateStaticParams() {
  const projects = await getPublicProjects();

  return routing.locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const loc = normalizePublicLocale(rawLocale);
  setRequestLocale(loc);
  const projects = await getPublicProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project Not Found" };

  const title = project.title[loc] || project.title.en;
  const description = project.description[loc] || project.description.en;

  return buildPublicMetadata({
    locale: loc,
    title,
    description,
    pathname: `/projects/${slug}`,
    imagePath: project.image,
    imageAlt: title,
    type: "article",
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug, locale: rawLocale } = await params;
  const projects = await getPublicProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  const locale = normalizePublicLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "projects" });

  const title = project.title[locale] || project.title.en;
  const description = project.description[locale] || project.description.en;
  const longDescription =
    project.longDescription[locale] || project.longDescription.en;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-20">
      <div className="mb-6 mt-4 sm:mb-8 sm:mt-10">
        <ProjectBackButton
          fallbackHref={`/${locale}#projects`}
          label={t("backToProjects")}
        />
      </div>

      <div className="flex flex-col gap-8 sm:gap-10">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[#2A0E61] shadow-2xl shadow-purple-900/20">
          <Image
            src={project.image}
            alt={title}
            width={1200}
            height={630}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="h-auto w-full object-contain bg-[#030014]"
            priority
          />
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 sm:text-4xl md:text-5xl">
            {title}
          </h1>

          <p className="text-base leading-relaxed text-gray-300 sm:text-lg">{description}</p>

          {longDescription && (
            <p className="text-base text-gray-400 leading-relaxed">
              {longDescription}
            </p>
          )}

          {project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm rounded-full border border-[rgba(112,66,248,0.4)] bg-[rgba(112,66,248,0.1)] text-purple-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(112,66,248,0.5)] bg-[rgba(112,66,248,0.1)] px-6 py-2.5 font-medium text-white transition-all duration-200 hover:border-purple-500 hover:bg-purple-600/30 sm:w-auto"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {t("viewOnGitHub")}
              </Link>
            )}

            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-purple-900/30 transition-all duration-200 hover:from-purple-500 hover:to-cyan-500 sm:w-auto"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {t("liveDemo")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
