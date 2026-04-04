import Image from "next/image";
import Link from "next/link";

type ProjectCardProps = {
  src: string;
  title: string;
  description: string;
  slug: string;
  locale: string;
  ctaLabel?: string;
};

export const ProjectCard = ({
  src,
  title,
  description,
  slug,
  locale,
  ctaLabel = "View details →",
}: ProjectCardProps) => {
  return (
    <Link
      href={`/${locale}/projects/${slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#2A0E61] shadow-lg transition-colors duration-300 hover:border-purple-500/50"
    >
      <Image
        src={src}
        alt={title}
        width={1000}
        height={1000}
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
        className="h-auto w-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
      />

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-xl font-semibold text-white sm:text-2xl">{title}</h3>
        <p className="mt-2 text-gray-300 line-clamp-3">{description}</p>
        <span className="mt-4 inline-block text-sm text-purple-400 transition-colors group-hover:text-purple-300">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
};
