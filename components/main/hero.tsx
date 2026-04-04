import { HeroContent } from "@/components/sub/hero-content";
import { AmbientVideo } from "@/components/sub/ambient-video";
import { getPublicAbout } from "@/lib/public-data";

type Props = {
  locale: "en" | "tr";
};

export const Hero = async ({ locale }: Props) => {
  const about = await getPublicAbout();

  return (
    <section
      id="about-me"
      className="relative flex min-h-screen w-full scroll-mt-28 flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(112,66,248,0.22),transparent_42%),linear-gradient(180deg,rgba(3,0,20,0.15),rgba(3,0,20,0.85))]"
      />
      <AmbientVideo
        src="/videos/blackhole.webm"
        type="video/webm"
        sources={[
          { src: "/videos/blackhole.webm", type: "video/webm" },
          { src: "/videos/blackhole.mp4", type: "video/mp4" },
        ]}
        eager
        allowOnCoarsePointer
        wrapperClassName="pointer-events-none absolute left-0 top-[-100px] -z-10 h-full w-full sm:top-[-240px] lg:top-[-340px]"
        className="h-full w-full rotate-180 object-cover"
      />

      <HeroContent about={about} locale={locale} />
    </section>
  );
};
