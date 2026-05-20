import { ImageResponse } from "next/og";

import { getPublicAbout, getPublicSiteData } from "@/lib/public-data";
import { normalizePublicLocale } from "@/lib/seo";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  const { locale: rawLocale } = await params;
  const locale = normalizePublicLocale(rawLocale);
  const [site, about] = await Promise.all([
    getPublicSiteData(),
    getPublicAbout(),
  ]);
  const title = about.heroTitle[locale] || about.heroTitle.en || site.title;
  const description =
    about.description[locale] || about.description.en || site.description;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(34,211,238,0.22), transparent 32%), radial-gradient(circle at top right, rgba(112,66,248,0.3), transparent 38%), linear-gradient(180deg, #030014 0%, #120035 100%)",
          color: "#ffffff",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            opacity: 0.86,
          }}
        >
          <span>{site.name}</span>
          <span>{locale.toUpperCase()}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              maxWidth: 940,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 920,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            fontSize: 24,
            color: "#67e8f9",
          }}
        >
          <span>Multilingual websites</span>
          <span style={{ color: "rgba(255,255,255,0.45)" }}>•</span>
          <span>Launch-ready experiences</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
