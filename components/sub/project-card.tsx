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
      className="group relative overflow-hidden rounded-lg shadow-lg border border-[#2A0E61] cursor-pointer hover:border-purple-500/50 transition-colors duration-300"
    >
      <Image
        src={src}
        alt={title}
        width={1000}
        height={1000}
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
        className="h-auto w-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
      />

      <div className="relative p-4">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-gray-300 line-clamp-3">{description}</p>
        <span className="inline-block mt-3 text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
};
